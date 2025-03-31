from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Order
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class OrderResponse(BaseModel):
    id: int
    task_id: int
    source: str
    order_id: str
    order_date: datetime
    product_name: str
    product_category: str
    quantity: int
    unit_price: float
    total_amount: float
    customer_id: str
    customer_country: str
    source_specific_data: str

    class Config:
        from_attributes = True

@router.get("/orders/", response_model=List[OrderResponse])
async def get_all_orders(db: Session = Depends(get_db)):
    """Get all orders from the database."""
    orders = db.query(Order).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found")
    return orders