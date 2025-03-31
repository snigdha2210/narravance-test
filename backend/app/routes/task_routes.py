from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..services.task_service import TaskService
from ..models.models import Task, Order
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class TaskCreate(BaseModel):
    title: str
    description: str
    status: str = "pending"

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_id: str
    product_name: str
    category: str
    quantity: int
    price_per_unit: float
    total_price: float
    order_date: datetime
    customer_country: str
    source: str

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
        status=task.status
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