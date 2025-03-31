import asyncio
from datetime import datetime, timedelta
import random
import json
import csv
import logging
import os
from typing import List, Dict
from ..models.models import Task, Order, TaskStatus
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaskProcessor:
    def __init__(self, db: Session):
        self.db = db
        self.queue = asyncio.Queue()
        self.is_processing = False
        logger.info("TaskProcessor initialized")

    async def start_processing(self):
        """Start processing tasks from the queue"""
        self.is_processing = True
        logger.info("Task processor started")
        while self.is_processing:
            try:
                task_id = await self.queue.get()
                logger.info(f"Processing task {task_id}")
                await self.process_task(task_id)
                self.queue.task_done()
            except Exception as e:
                logger.error(f"Error processing task {task_id}: {str(e)}")

    async def stop_processing(self):
        """Stop processing tasks"""
        self.is_processing = False
        logger.info("Task processor stopped")

    async def add_task(self, task_id: int):
        """Add a task to the processing queue"""
        logger.info(f"Adding task {task_id} to queue")
        await self.queue.put(task_id)

    async def process_task(self, task_id: int):
        """Process a single task"""
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            logger.error(f"Task {task_id} not found")
            return

        logger.info(f"Starting to process task {task_id}: {task.title}")
        logger.info(f"Task filters - Source A: {task.source_a_enabled}, Source B: {task.source_b_enabled}")

        # Update status to in progress
        task.status = TaskStatus.IN_PROGRESS
        self.db.commit()
        logger.info(f"Task {task_id} status updated to IN_PROGRESS")

        # Simulate initial processing delay (5-10 seconds)
        delay = random.uniform(5, 10)
        logger.info(f"Simulating initial processing delay of {delay:.1f} seconds")
        await asyncio.sleep(delay)

        try:
            # Fetch data from source A if enabled
            if task.source_a_enabled:
                logger.info(f"Fetching data from Source A for task {task_id}")
                # Simulate API delay for source A
                await asyncio.sleep(random.uniform(2, 4))
                orders = await self._fetch_source_a_data(task)
                logger.info(f"Retrieved {len(orders)} orders from Source A")
                for order_data in orders:
                    order = Order(
                        task_id=task.id,
                        **order_data
                    )
                    self.db.add(order)
                logger.info(f"Added {len(orders)} orders from Source A to database")

            # Fetch data from source B if enabled
            if task.source_b_enabled:
                logger.info(f"Fetching data from Source B for task {task_id}")
                # Simulate API delay for source B
                await asyncio.sleep(random.uniform(2, 4))
                orders = await self._fetch_source_b_data(task)
                logger.info(f"Retrieved {len(orders)} orders from Source B")
                for order_data in orders:
                    order = Order(
                        task_id=task.id,
                        **order_data
                    )
                    self.db.add(order)
                logger.info(f"Added {len(orders)} orders from Source B to database")

            # Simulate final processing delay (3-5 seconds)
            delay = random.uniform(3, 5)
            logger.info(f"Simulating final processing delay of {delay:.1f} seconds")
            await asyncio.sleep(delay)

            # Update task status to completed
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            self.db.commit()
            logger.info(f"Task {task_id} completed successfully")

        except Exception as e:
            logger.error(f"Error processing task {task_id}: {str(e)}")
            task.status = TaskStatus.PENDING
            self.db.commit()
            logger.error(f"Task {task_id} status reverted to PENDING due to error")

    async def _fetch_source_a_data(self, task: Task) -> List[Dict]:
        """Fetch data from source A JSON file with simulated API delay"""
        logger.info("Reading Source A data from JSON file")
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        source_a_file = os.path.join(data_dir, "source_a_orders.json")
        
        try:
            # Simulate API connection delay
            await asyncio.sleep(random.uniform(1, 2))
            
            with open(source_a_file, 'r') as f:
                orders = json.load(f)
            
            # Filter orders based on task parameters
            filtered_orders = []
            start_date = task.date_from or datetime.utcnow() - timedelta(days=30)
            end_date = task.date_to or datetime.utcnow()
            
            # Handle filters
            filters = task.source_a_filters
            if isinstance(filters, str):
                try:
                    filters = json.loads(filters)
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON in source_a_filters: {filters}")
                    filters = {}
            
            categories = filters.get('categories', []) if filters else []
            
            # Simulate data processing delay
            await asyncio.sleep(random.uniform(1, 2))
            
            for order in orders:
                # Convert string date to datetime object
                order_date = datetime.fromisoformat(order['order_date'].replace('Z', '+00:00'))
                
                # Apply date filter
                if not (start_date <= order_date <= end_date):
                    continue
                
                # Apply category filter
                if categories and order['product_category'] not in categories:
                    continue
                
                # Convert numeric fields to proper types
                order['quantity'] = int(order['quantity'])
                order['unit_price'] = float(order['unit_price'])
                order['total_amount'] = float(order['total_amount'])
                
                # Update the order_date in the order dict
                order['order_date'] = order_date
                
                filtered_orders.append(order)
            
            logger.info(f"Filtered {len(filtered_orders)} orders from Source A")
            return filtered_orders
            
        except Exception as e:
            logger.error(f"Error reading Source A data: {str(e)}")
            return []

    async def _fetch_source_b_data(self, task: Task) -> List[Dict]:
        """Fetch data from source B CSV file with simulated API delay"""
        logger.info("Reading Source B data from CSV file")
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        source_b_file = os.path.join(data_dir, "source_b_orders.csv")
        
        try:
            # Simulate API connection delay
            await asyncio.sleep(random.uniform(1, 2))
            
            orders = []
            with open(source_b_file, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Convert string date to datetime object
                    order_date = datetime.fromisoformat(row['order_date'].replace('Z', '+00:00'))
                    
                    # Convert numeric fields to proper types
                    row['quantity'] = int(row['quantity'])
                    row['unit_price'] = float(row['unit_price'])
                    row['total_amount'] = float(row['total_amount'])
                    
                    # Update the order_date in the row
                    row['order_date'] = order_date
                    
                    orders.append(row)
            
            # Filter orders based on task parameters
            filtered_orders = []
            start_date = task.date_from or datetime.utcnow() - timedelta(days=30)
            end_date = task.date_to or datetime.utcnow()
            
            # Handle filters
            filters = task.source_b_filters
            if isinstance(filters, str):
                try:
                    filters = json.loads(filters)
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON in source_b_filters: {filters}")
                    filters = {}
            
            categories = filters.get('categories', []) if filters else []
            
            # Simulate data processing delay
            await asyncio.sleep(random.uniform(1, 2))
            
            for order in orders:
                order_date = order['order_date']
                
                # Apply date filter
                if not (start_date <= order_date <= end_date):
                    continue
                
                # Apply category filter
                if categories and order['product_category'] not in categories:
                    continue
                
                filtered_orders.append(order)
            
            logger.info(f"Filtered {len(filtered_orders)} orders from Source B")
            return filtered_orders
            
        except Exception as e:
            logger.error(f"Error reading Source B data: {str(e)}")
            return [] 