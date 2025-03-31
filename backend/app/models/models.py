from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Boolean
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
    
    # Filter parameters
    date_from = Column(DateTime)
    date_to = Column(DateTime)
    source_a_enabled = Column(Boolean, default=True)
    source_b_enabled = Column(Boolean, default=True)
    source_a_filters = Column(JSON)  # For Etsy-specific filters
    source_b_filters = Column(JSON)  # For Shopify-specific filters
    
    # Relationship with orders
    orders = relationship("Order", back_populates="task")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    source = Column(String)  # 'source_a' or 'source_b'
    
    # Common fields across all sources
    order_id = Column(String, index=True)
    order_date = Column(DateTime, index=True)
    total_amount = Column(Float)
    
    # Product details
    product_name = Column(String)
    product_category = Column(String)
    quantity = Column(Integer)
    unit_price = Column(Float)
    
    # Customer information
    customer_id = Column(String)
    customer_country = Column(String)
    
    # Source-specific data stored as JSON
    source_specific_data = Column(JSON)
    
    # Relationship with task
    task = relationship("Task", back_populates="orders") 