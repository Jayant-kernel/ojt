from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
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
async def get_forecast_products(db: AsyncSession = Depends(get_db)):
    """Distinct products that have sales history — used by the forecast selector."""
    try:
        result = await db.execute(text("""
            SELECT DISTINCT
                p.id,
                p.sku,
                p.name,
                COALESCE(c.name, 'Uncategorized') AS category
            FROM sales_history sh
            JOIN products p ON p.sku = sh.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            ORDER BY p.name ASC
        """))
        rows = result.fetchall()

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


# ── GET /forecasts/dataset ────────────────────────────────────────────────────
@router.get("/dataset")
async def get_dataset(db: AsyncSession = Depends(get_db)):
    """All active products with category name — used by the Dataset View tab."""
    try:
        result = await db.execute(text("""
            SELECT
                p.id,
                p.sku,
                p.name,
                COALESCE(c.name, 'Uncategorized') AS category,
                CAST(p.selling_price  AS FLOAT) AS selling_price,
                CAST(p.cost_price     AS FLOAT) AS cost_price,
                p.current_stock,
                p.reorder_point,
                p.reorder_quantity,
                p.max_stock
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.is_active = true
            ORDER BY p.name ASC
        """))
        rows = result.fetchall()

        return [
            {
                "id":               str(row.id),
                "sku":              row.sku,
                "name":             row.name,
                "category":         row.category,
                "selling_price":    row.selling_price,
                "cost_price":       row.cost_price,
                "current_stock":    row.current_stock,
                "reorder_point":    row.reorder_point,
                "reorder_quantity": row.reorder_quantity,
                "max_stock":        row.max_stock,
            }
            for row in rows
        ]
    except Exception as e:
        logger.error("get_dataset failed:\n%s", traceback.format_exc())
        raise HTTPException(status_code=500, detail=traceback.format_exc())


# ── POST /forecasts/generate ──────────────────────────────────────────────────
@router.post("/generate")
async def generate_forecast(body: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    product_id = body.get("product_id")
    horizon    = int(body.get("horizon_days", 90))

    if not product_id:
        raise HTTPException(status_code=400, detail="product_id is required")

    try:
        result = await db.execute(text("""
            SELECT sku, name FROM products WHERE id = :pid
        """), {"pid": product_id})
        product = result.fetchone()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        result = await db.execute(text("""
            SELECT week_start_date AS ds, sales AS y
            FROM sales_history
            WHERE product_id = :sku
            ORDER BY week_start_date ASC
        """), {"sku": product.sku})
        rows = result.fetchall()

        if not rows:
            raise HTTPException(
                status_code=404,
                detail=f"No sales history found for product: {product.name}"
            )

        df = pd.DataFrame([{"ds": row.ds, "y": float(row.y)} for row in rows])
        df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)
        df.dropna(inplace=True)
        df.sort_values("ds", inplace=True)
        df.reset_index(drop=True, inplace=True)
        df["y"] = df["y"].clip(lower=0.01)

        if len(df) < 2:
            raise HTTPException(
                status_code=400,
                detail="Not enough data points to generate a forecast (need at least 2 weeks)"
            )

        logger.info("Fitting Prophet for product_id=%s with %d rows", product_id, len(df))

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode="multiplicative",
        )
        model.fit(df)

        future   = model.make_future_dataframe(periods=horizon, freq="D")
        forecast = model.predict(future)

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


# ── GET /forecasts/sales-history/{product_id} ────────────────────────────────
@router.get("/sales-history/{product_id}")
async def get_sales_history(product_id: str, db: AsyncSession = Depends(get_db)):
    """Weekly sales history for a product SKU — used by the modal chart."""
    try:
        result = await db.execute(text("""
            SELECT year_week AS week, sales
            FROM sales_history
            WHERE product_id = :pid
            ORDER BY week_start_date ASC
        """), {"pid": product_id})
        rows = result.fetchall()

        return [{"week": row.week, "sales": row.sales} for row in rows]
    except Exception as e:
        logger.error("get_sales_history failed for product_id=%s:\n%s", product_id, traceback.format_exc())
        raise HTTPException(status_code=500, detail=traceback.format_exc())