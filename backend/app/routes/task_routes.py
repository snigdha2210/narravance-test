from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from ..database import get_db
from ..services.task_service import TaskService
from ..models.models import Task, Order, TaskStatus
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class TaskCreate(BaseModel):
    title: str
    description: str
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    source_a_enabled: bool = True
    source_b_enabled: bool = True
    source_a_filters: Optional[Dict] = None
    source_b_filters: Optional[Dict] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    source_a_enabled: bool
    source_b_enabled: bool
    source_a_filters: Optional[Dict] = None
    source_b_filters: Optional[Dict] = None

    class Config:
        from_attributes = True

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

@router.get("/tasks/", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    task_service = TaskService(db)
    return await task_service.get_all_tasks()

@router.post("/tasks/", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    task_service = TaskService(db)
    return await task_service.create_task(
        title=task.title,
        description=task.description,
        date_from=task.date_from,
        date_to=task.date_to,
        source_a_enabled=task.source_a_enabled,
        source_b_enabled=task.source_b_enabled,
        source_a_filters=task.source_a_filters,
        source_b_filters=task.source_b_filters,
    )

@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: int, db: Session = Depends(get_db)):
    task_service = TaskService(db)
    task = await task_service.get_task_status(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/tasks/{task_id}/data", response_model=List[OrderResponse])
async def get_task_data(task_id: int, db: Session = Depends(get_db)):
    task_service = TaskService(db)
    data = await task_service.get_task_data(task_id)
    if not data:
        raise HTTPException(status_code=404, detail="No data found for task")
    return data 