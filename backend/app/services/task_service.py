import asyncio
from datetime import datetime
from typing import List, Dict
import json
import pandas as pd
from sqlalchemy.orm import Session
from ..models.models import Task, Order, TaskStatus

class TaskService:
    def __init__(self, db: Session):
        self.db = db
        self.task_queue = asyncio.Queue()

    async def create_task(self, title: str, description: str, status: str = "pending") -> Task:
        task = Task(
            title=title,
            description=description,
            status=TaskStatus[status.upper()],
            created_at=datetime.utcnow()
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        
        # Add task to queue
        await self.task_queue.put(task.id)
        return task

    async def process_task(self, task_id: int):
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return

        # Update status to in progress
        task.status = TaskStatus.IN_PROGRESS
        self.db.commit()

        # Simulate processing delay
        await asyncio.sleep(5)

        try:
            # Process Etsy data
            etsy_data = await self._process_etsy_data(task.etsy_params)
            for record in etsy_data:
                order = Order(
                    task_id=task.id,
                    order_id=record['order_id'],
                    product_name=record['product_name'],
                    category=record['category'],
                    quantity=record['quantity'],
                    price_per_unit=float(record['price_per_unit']),
                    total_price=float(record['total_price']),
                    order_date=datetime.strptime(record['order_date'], '%Y-%m-%d'),
                    customer_country=record['customer_country'],
                    source='etsy'
                )
                self.db.add(order)

            # Process Shopify data
            shopify_data = await self._process_shopify_data(task.shopify_params)
            for record in shopify_data:
                order = Order(
                    task_id=task.id,
                    order_id=record['order_id'],
                    product_name=record['product_name'],
                    category=record['category'],
                    quantity=record['quantity'],
                    price_per_unit=float(record['price_per_unit']),
                    total_price=float(record['total_price']),
                    order_date=datetime.strptime(record['order_date'], '%Y-%m-%d'),
                    customer_country=record['customer_country'],
                    source='shopify'
                )
                self.db.add(order)

            # Update task status to completed
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            self.db.commit()

        except Exception as e:
            print(f"Error processing task {task_id}: {str(e)}")
            task.status = TaskStatus.PENDING
            self.db.commit()

    async def _process_etsy_data(self, params: str) -> List[Dict]:
        # TODO: Implement actual Etsy API integration
        # This is a mock implementation
        return [
            {
                "order_id": "ETSY123",
                "product_name": "Handmade Necklace",
                "category": "Jewelry",
                "quantity": 1,
                "price_per_unit": 29.99,
                "total_price": 29.99,
                "order_date": "2024-01-01",
                "customer_country": "USA"
            },
            {
                "order_id": "ETSY124",
                "product_name": "Custom T-Shirt",
                "category": "Clothing",
                "quantity": 2,
                "price_per_unit": 24.99,
                "total_price": 49.98,
                "order_date": "2024-01-02",
                "customer_country": "Canada"
            }
        ]

    async def _process_shopify_data(self, params: str) -> List[Dict]:
        # TODO: Implement actual Shopify API integration
        # This is a mock implementation
        return [
            {
                "order_id": "SHOP123",
                "product_name": "Vintage Watch",
                "category": "Accessories",
                "quantity": 1,
                "price_per_unit": 199.99,
                "total_price": 199.99,
                "order_date": "2024-01-01",
                "customer_country": "UK"
            },
            {
                "order_id": "SHOP124",
                "product_name": "Leather Wallet",
                "category": "Accessories",
                "quantity": 3,
                "price_per_unit": 49.99,
                "total_price": 149.97,
                "order_date": "2024-01-02",
                "customer_country": "USA"
            }
        ]

    async def get_task_status(self, task_id: int) -> Task:
        return self.db.query(Task).filter(Task.id == task_id).first()

    async def get_all_tasks(self) -> List[Task]:
        return self.db.query(Task).all()

    async def get_task_data(self, task_id: int) -> List[Order]:
        return self.db.query(Order).filter(Order.task_id == task_id).all() 