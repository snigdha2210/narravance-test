import asyncio
from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from ..models.models import Task, Order, TaskStatus
from .task_processor import TaskProcessor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaskService:
    _processor_task = None
    _processor = None

    def __init__(self, db: Session):
        self.db = db
        self._ensure_processor_running()
        logger.info("TaskService initialized")

    def _ensure_processor_running(self):
        """Ensure the task processor is running"""
        if TaskService._processor is None:
            logger.info("Creating new task processor")
            TaskService._processor = TaskProcessor(self.db)
            
        if TaskService._processor_task is None or TaskService._processor_task.done():
            logger.info("Starting task processor")
            loop = asyncio.get_event_loop()
            TaskService._processor_task = loop.create_task(TaskService._processor.start_processing())
            logger.info("Task processor started successfully")

    async def create_task(
        self,
        title: str,
        description: str,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        source_a_enabled: bool = True,
        source_b_enabled: bool = True,
        source_a_filters: Dict = None,
        source_b_filters: Dict = None,
    ) -> Task:
        logger.info(f"Creating new task: {title}")
        logger.info(f"Task parameters - Date range: {date_from} to {date_to}")
        logger.info(f"Sources enabled - A: {source_a_enabled}, B: {source_b_enabled}")
        
        task = Task(
            title=title,
            description=description,
            status=TaskStatus.PENDING,
            created_at=datetime.utcnow(),
            date_from=date_from,
            date_to=date_to,
            source_a_enabled=source_a_enabled,
            source_b_enabled=source_b_enabled,
            source_a_filters=source_a_filters,
            source_b_filters=source_b_filters,
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        
        logger.info(f"Task {task.id} created successfully")
        
        # Add task to processor queue
        await TaskService._processor.add_task(task.id)
        logger.info(f"Task {task.id} added to processor queue")
        
        return task

    async def get_task_status(self, task_id: int) -> Task:
        logger.info(f"Fetching status for task {task_id}")
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if task:
            logger.info(f"Task {task_id} status: {task.status}")
        else:
            logger.warning(f"Task {task_id} not found")
        return task

    async def get_all_tasks(self) -> List[Task]:
        logger.info("Fetching all tasks")
        tasks = self.db.query(Task).all()
        logger.info(f"Retrieved {len(tasks)} tasks")
        return tasks

    async def get_task_data(self, task_id: int) -> List[Order]:
        logger.info(f"Fetching data for task {task_id}")
        orders = self.db.query(Order).filter(Order.task_id == task_id).all()
        logger.info(f"Retrieved {len(orders)} orders for task {task_id}")
        return orders 