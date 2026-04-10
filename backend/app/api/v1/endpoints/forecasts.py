from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
import pandas as pd
from prophet import Prophet
import traceback
import logging

from app.api.deps import get_db

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

logger = logging.getLogger(__name__)


# ── GET /forecasts/products ───────────────────────────────────────────────────
@router.get("/products")
async def get_forecast_products(db: Session = Depends(get_db)):
    """Distinct product IDs from sales_history joined with products table."""
    try:
        rows = db.execute(text("""
            SELECT DISTINCT
                p.id,
                p.sku,
                p.name,
                COALESCE(c.name, 'Uncategorized') AS category
            FROM sales_history sh
            JOIN products p ON p.sku = sh.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            ORDER BY p.name ASC
        """)).fetchall()

        return [
            {
                "id":       str(row.id),
                "sku":      row.sku,
                "name":     row.name,
                "category": row.category,
            }
            for row in rows
        ]
    except Exception as e:
        logger.error("get_forecast_products failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=traceback.format_exc())


# ── POST /forecasts/generate ──────────────────────────────────────────────────
@router.post("/generate")
async def generate_forecast(body: Dict[str, Any], db: Session = Depends(get_db)):
    product_id = body.get("product_id")  # this is the UUID from products.id
    horizon    = int(body.get("horizon_days", 90))

    if not product_id:
        raise HTTPException(status_code=400, detail="product_id is required")

    try:
        # Look up the SKU for this product UUID
        product = db.execute(text("""
            SELECT sku, name FROM products WHERE id = :pid
        """), {"pid": product_id}).fetchone()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Fetch weekly sales from sales_history using SKU
        rows = db.execute(text("""
            SELECT week_start_date AS ds, sales AS y
            FROM sales_history
            WHERE product_id = :sku
            ORDER BY week_start_date ASC
        """), {"sku": product.sku}).fetchall()

        if not rows:
            raise HTTPException(
                status_code=404,
                detail=f"No sales history found for product: {product.name}"
            )

        # Build dataframe
        df = pd.DataFrame([{"ds": row.ds, "y": float(row.y)} for row in rows])

        # Strip timezone if present
        df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)

        df.dropna(inplace=True)
        df.sort_values("ds", inplace=True)
        df.reset_index(drop=True, inplace=True)

        # Replace zeros to avoid multiplicative seasonality crash
        df["y"] = df["y"].clip(lower=0.01)

        if len(df) < 2:
            raise HTTPException(
                status_code=400,
                detail="Not enough data points to generate a forecast (need at least 2 weeks)"
            )

        logger.info("Fitting Prophet for product_id=%s with %d rows", product_id, len(df))

        # Fit Prophet
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode="multiplicative",
        )
        model.fit(df)

        future   = model.make_future_dataframe(periods=horizon, freq="D")
        forecast = model.predict(future)

        # Only return future predictions (beyond training data)
        future_only = forecast[forecast["ds"] > df["ds"].max()]

        predictions = [
            {
                "ds":         row["ds"].strftime("%Y-%m-%d"),
                "yhat":       round(max(0, row["yhat"]), 2),
                "yhat_lower": round(max(0, row["yhat_lower"]), 2),
                "yhat_upper": round(max(0, row["yhat_upper"]), 2),
            }
            for _, row in future_only.iterrows()
        ]

        # Compute metrics on historical fit
        hist   = forecast[forecast["ds"] <= df["ds"].max()].copy()
        merged = df.merge(hist[["ds", "yhat"]], on="ds", how="inner")
        mae  = float((merged["y"] - merged["yhat"]).abs().mean())
        rmse = float(((merged["y"] - merged["yhat"]) ** 2).mean() ** 0.5)
        mape = float(
            ((merged["y"] - merged["yhat"]).abs() / merged["y"].replace(0, 1)).mean() * 100
        )

        logger.info(
            "Forecast complete for product_id=%s | MAE=%.4f RMSE=%.4f MAPE=%.4f",
            product_id, mae, rmse, mape
        )

        return {
            "status":        "completed",
            "model_name":    "prophet",
            "horizon_days":  horizon,
            "forecast_from": predictions[0]["ds"]  if predictions else None,
            "forecast_to":   predictions[-1]["ds"] if predictions else None,
            "mae":           round(mae, 4),
            "rmse":          round(rmse, 4),
            "mape":          round(mape, 4),
            "predictions":   predictions,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("generate_forecast failed for product_id=%s:\n%s", product_id, traceback.format_exc())
        raise HTTPException(status_code=500, detail=traceback.format_exc())


# ── GET /forecasts/sales-history/{product_id} ─────────────────────────────────
@router.get("/sales-history/{product_id}")
async def get_sales_history(product_id: str, db: Session = Depends(get_db)):
    """Weekly sales history for a product SKU — used by the modal chart."""
    try:
        rows = db.execute(text("""
            SELECT year_week AS week, sales
            FROM sales_history
            WHERE product_id = :pid
            ORDER BY week_start_date ASC
        """), {"pid": product_id}).fetchall()

        return [{"week": row.week, "sales": row.sales} for row in rows]
    except Exception as e:
        logger.error("get_sales_history failed for product_id=%s:\n%s", product_id, traceback.format_exc())
        raise HTTPException(status_code=500, detail=traceback.format_exc())