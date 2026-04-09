from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import csv
import os
from pathlib import Path

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

# Path resolution consistent with inventory.py
BASE_DIR = Path(__file__).parent.parent.parent.parent.parent # backend/
POSSIBLE_PATHS = [
    BASE_DIR / "inventory.csv",
    Path(os.getcwd()) / "inventory.csv",
    Path(os.getcwd()) / "backend" / "inventory.csv",
]

@router.get("/products")
async def get_forecast_products():
    """
    Returns a list of products available for forecasting, 
    sourced from the master inventory CSV.
    """
    csv_path = None
    for p in POSSIBLE_PATHS:
        if p.exists():
            csv_path = p
            break
    
    if not csv_path:
        return []

    products = []
    try:
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            # Map columns to a format suitable for the frontend dropdown
            for row in reader:
                sku = row.get("Product_ID")
                if sku:
                    products.append({
                        "id": sku, 
                        "name": row.get("Product_Name", "Unknown Product"),
                        "sku": sku,
                        "category": row.get("Catagory", "Uncategorized")
                    })
    except Exception:
        return []
    
    return products

@router.post("/generate")
async def generate_forecast(body: Dict[str, Any]):
    # Mock implementation of the generate endpoint called by the frontend
    return {"status": "success", "message": "Forecast generation started"}
