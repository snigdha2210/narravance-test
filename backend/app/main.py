from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import models
from .routes import task_routes

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

# Include routers
app.include_router(task_routes.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Ecommerce Sales Data API"} 