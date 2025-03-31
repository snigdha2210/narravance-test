from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()

class TaskStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    created_at = Column(DateTime)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationship with orders
    orders = relationship("Order", back_populates="task")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    order_id = Column(String)  # Original order ID from the source
    product_name = Column(String)
    category = Column(String)
    quantity = Column(Integer)
    price_per_unit = Column(Float)
    total_price = Column(Float)
    order_date = Column(DateTime)
    customer_country = Column(String)
    source = Column(String)  # 'etsy' or 'shopify'
    
    # Relationship with task
    task = relationship("Task", back_populates="orders") 