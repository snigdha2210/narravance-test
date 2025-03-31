from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, SessionLocal
from .models import models
from .routes import task_routes, order_routes
from .services.task_processor import TaskProcessor
import asyncio

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ecommerce Data API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize task processor
@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    processor = TaskProcessor(db)
    loop = asyncio.get_event_loop()
    loop.create_task(processor.start_processing())

# Include routers
app.include_router(task_routes.router, prefix="/api")
app.include_router(order_routes.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Ecommerce Sales Data API"} 