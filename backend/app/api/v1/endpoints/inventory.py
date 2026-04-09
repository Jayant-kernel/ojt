import csv
import os
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/inventory", tags=["Inventory Dataset"])

CSV_PATH = Path(__file__).parent.parent.parent.parent.parent / "inventory.csv"

@router.get("/dataset", response_model=List[Dict[str, Any]])
def get_inventory_dataset():
    """
    Read and parse the inventory.csv file from the backend directory.
    Maps columns to Product arguments for frontend visualization.
    """
    if not os.path.exists(CSV_PATH):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory CSV not found at {CSV_PATH}"
        )

    dataset = []
    try:
        with open(CSV_PATH, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            # Headers: Product_ID,Product_Name,Catagory,Supplier_ID,Supplier_Name,Stock_Quantity,Reorder_Level,Reorder_Quantity,Unit_Price,...
            for row in reader:
                try:
                    # Clean the price string: remove '$', ',', and whitespace
                    price_raw = row.get("Unit_Price", "0").replace("$", "").replace(",", "").strip()
                    price = float(price_raw) if price_raw else 0.0
                    
                    item = {
                        "sku": row.get("Product_ID"),
                        "name": row.get("Product_Name"),
                        "category": row.get("Catagory"),
                        "current_stock": int(row.get("Stock_Quantity", 0)),
                        "selling_price": price,
                        "reorder_point": int(row.get("Reorder_Level", 0)),
                        "reorder_quantity": int(row.get("Reorder_Quantity", 0)),
                        "status": row.get("Status")
                    }
                    dataset.append(item)
                except (ValueError, TypeError):
                    continue
                
                # Limit to 100 items for frontend performance
                if len(dataset) >= 100:
                    break
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading CSV: {str(e)}"
        )

    return dataset
