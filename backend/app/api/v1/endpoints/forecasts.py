from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import csv
import os
import pandas as pd
from prophet import Prophet
from pathlib import Path

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

BASE_DIR = Path(__file__).parent.parent.parent.parent.parent
POSSIBLE_CSV_PATHS = [
    BASE_DIR / "sales_data_weekly.csv",
    Path(os.getcwd()) / "sales_data_weekly.csv",
    Path(os.getcwd()) / "backend" / "sales_data_weekly.csv",
]

INVENTORY_PATHS = [
    BASE_DIR / "inventory.csv",
    Path(os.getcwd()) / "inventory.csv",
    Path(os.getcwd()) / "backend" / "inventory.csv",
]


def get_csv_path(paths):
    for p in paths:
        if p.exists():
            return p
    return None


def parse_year_week(yw: str) -> pd.Timestamp:
    year, week = yw.split("-")
    week_num = max(1, int(week))  # treat week 00 as week 1
    return pd.Timestamp.fromisocalendar(int(year), week_num, 1)


# ── GET /forecasts/products ───────────────────────────────────────────────────
@router.get("/products")
async def get_forecast_products():
    """Distinct product names from sales_data_weekly.csv for the dropdown."""
    csv_path = get_csv_path(POSSIBLE_CSV_PATHS)
    if not csv_path:
        # fallback to inventory.csv if sales csv not found
        csv_path = get_csv_path(INVENTORY_PATHS)
        if not csv_path:
            return []
        products = []
        with open(csv_path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                sku = row.get("Product_ID")
                if sku:
                    products.append({
                        "id": sku,
                        "name": row.get("Product_Name", sku),
                        "sku": sku,
                        "category": row.get("Catagory", "Uncategorized"),
                    })
        return products

    try:
        # Build a robust name mapping from inventory.csv using Pandas
        name_map = {}
        inv_path = get_csv_path(INVENTORY_PATHS)
        if inv_path:
            try:
                inv_df = pd.read_csv(inv_path)
                # Map SKU (Product_ID) to Name (Product_Name)
                if "Product_ID" in inv_df.columns and "Product_Name" in inv_df.columns:
                    name_map = {
                        str(sku).strip(): str(name).strip()
                        for sku, name in zip(inv_df["Product_ID"], inv_df["Product_Name"])
                        if pd.notna(sku)
                    }
            except Exception:
                pass # Fallback to empty map if inventory.csv fails

        df = pd.read_csv(csv_path)
        skus = sorted(df["product_name"].dropna().unique().tolist())
        return [
            {
                "id": str(sku).strip(), 
                "name": name_map.get(str(sku).strip(), str(sku).strip()), 
                "sku": str(sku).strip(), 
                "category": ""
            } for sku in skus
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /forecasts/generate ──────────────────────────────────────────────────
@router.post("/generate")
async def generate_forecast(body: Dict[str, Any]):
    product_id = body.get("product_id")
    horizon    = int(body.get("horizon_days", 90))

    if not product_id:
        raise HTTPException(status_code=400, detail="product_id is required")

    csv_path = get_csv_path(POSSIBLE_CSV_PATHS)
    if not csv_path:
        raise HTTPException(status_code=404, detail="sales_data_weekly.csv not found")

    try:
        df = pd.read_csv(csv_path)
        df_filtered = df[df["product_name"] == product_id][["year_week", "sales"]].rename(
            columns={"year_week": "ds", "sales": "y"}
        )

        if df_filtered.empty:
            raise HTTPException(status_code=404, detail=f"No data for: {product_id}")

        df_filtered["ds"] = df_filtered["ds"].apply(parse_year_week)
        df_filtered["y"]  = pd.to_numeric(df_filtered["y"], errors="coerce")
        df_filtered.dropna(inplace=True)
        df_filtered.sort_values("ds", inplace=True)

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode="multiplicative",
        )
        model.fit(df_filtered)

        future   = model.make_future_dataframe(periods=horizon, freq="D")
        forecast = model.predict(future)

        future_only = forecast[forecast["ds"] > df_filtered["ds"].max()]

        predictions = [
            {
                "ds":         row["ds"].strftime("%Y-%m-%d"),
                "yhat":       round(max(0, row["yhat"]), 2),
                "yhat_lower": round(max(0, row["yhat_lower"]), 2),
                "yhat_upper": round(max(0, row["yhat_upper"]), 2),
            }
            for _, row in future_only.iterrows()
        ]

        # Metrics on historical fit
        hist   = forecast[forecast["ds"] <= df_filtered["ds"].max()].copy()
        merged = df_filtered.merge(hist[["ds", "yhat"]], on="ds", how="inner")
        mae    = float((merged["y"] - merged["yhat"]).abs().mean())
        rmse   = float(((merged["y"] - merged["yhat"]) ** 2).mean() ** 0.5)
        mape   = float(
            ((merged["y"] - merged["yhat"]).abs() / merged["y"].replace(0, 1)).mean() * 100
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
        raise HTTPException(status_code=500, detail=str(e))