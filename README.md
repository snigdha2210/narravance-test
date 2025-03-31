# E-commerce Data Visualization App

A full-stack web application for analyzing e-commerce sales data from multiple sources. The application allows users to create tasks for fetching and processing sales data, visualize the results through interactive charts, and export data for further analysis.

## Features

- **Task Management**

  - Create tasks with custom date ranges and source selection
  - Real-time task status monitoring
  - Support for multiple data sources (Source A and Source B)
  - Category-based filtering

- **Data Visualization**

  - Interactive charts showing sales trends using D3.js
  - Category-wise sales breakdown
  - Geographic distribution of sales
  - Time-based analysis
  - Customizable date ranges
  - Responsive and dynamic visualizations

- **Data Export**
  - CSV export functionality
  - Detailed data tables
  - Filtered data views

## Tech Stack

### Frontend

- React with TypeScript
- Material-UI for components
- D3.js for data visualization
- Axios for API communication

### Backend

- FastAPI (Python)
- SQLAlchemy ORM
- SQLite database
- Asynchronous task processing

## Project Structure

```
.
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── package.json
│
└── backend/                 # FastAPI backend application
    ├── app/
    │   ├── models/         # Database models
    │   ├── routes/         # API routes
    │   ├── services/       # Business logic
    │   └── utils/          # Utility functions
    └── requirements.txt
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

The backend server will start at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend application will start at `http://localhost:3000`

## API Endpoints

### Tasks

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/{task_id}` - Get a specific task
- `GET /api/tasks/{task_id}/orders` - Get orders for a specific task
- `POST /api/tasks/{task_id}/process` - Process a task

### Orders

- `GET /api/orders` - List all orders
- `GET /api/orders/{order_id}` - Get a specific order

## Usage

1. Open the application in your browser at `http://localhost:3000`
2. Create a new task by specifying:
   - Task title and description
   - Date range for data analysis
   - Data sources to include
   - Category filters (optional)
3. Monitor the task status in real-time
4. View the processed data through interactive visualizations
5. Export data as needed
