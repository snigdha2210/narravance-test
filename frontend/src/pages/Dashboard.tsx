import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Grid,
} from "@mui/material";
import {
  fetchTasks,
  fetchOrdersByTaskId,
  calculateDashboardStats,
} from "../services/dataService.ts";
import { useNavigate } from "react-router-dom";
import { Order, Task } from "../types/index.ts";
import { DashboardStats } from "../components/DashboardStats.tsx";
import CategorySummary from "../components/CategorySummary.tsx";
import SalesTable from "../components/SalesTable.tsx";
import TaskProgress from "../components/TaskProgress.tsx";
import TopCategories from "../components/TopCategories.tsx";
import TopCountries from "../components/TopCountries.tsx";

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        const tasksData = await fetchTasks();
        setTasks(tasksData);
        if (tasksData.length > 0 && !selectedTaskId) {
          setSelectedTaskId(tasksData[0].id);
        }
      } catch (err) {
        setError("Failed to fetch tasks");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksData();
  }, []);

  useEffect(() => {
    const fetchOrdersData = async () => {
      if (!selectedTaskId) return;

      setLoading(true);
      try {
        const data = await fetchOrdersByTaskId(selectedTaskId);
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, [selectedTaskId]);

  const handleTaskChange = (event: any) => {
    setSelectedTaskId(Number(event.target.value));
  };

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  const renderContent = () => {
    if (loading && tasks.length === 0) {
      return (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='100vh'
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error && tasks.length === 0) {
      return (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='100vh'
        >
          <Typography color='error'>{error}</Typography>
        </Box>
      );
    }

    if (tasks.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant='h5' gutterBottom>
            No Tasks Available
          </Typography>
          <Typography variant='body1' color='text.secondary' paragraph>
            There are no tasks available. Create a new task to fetch and process
            orders from the data sources.
          </Typography>
          <Button
            variant='contained'
            color='primary'
            onClick={() => navigate("/create")}
            sx={{ mt: 2 }}
          >
            Create New Task
          </Button>
        </Paper>
      );
    }

    if (!selectedTask) {
      return (
        <Typography color='error' align='center'>
          Selected task not found
        </Typography>
      );
    }

    if (selectedTask.status !== "completed") {
      return (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant='h6' gutterBottom>
            Task is{" "}
            {selectedTask.status === "pending" ? "Pending" : "In Progress"}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {selectedTask.status === "pending"
              ? "Your task is queued and will start processing soon."
              : "Your task is currently being processed. Please wait for it to complete."}
          </Typography>
          <Box mt={3}>
            <TaskProgress status={selectedTask.status} size='large' />
          </Box>
        </Paper>
      );
    }

    if (orders.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant='h6' gutterBottom>
            No Orders Found
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            This task has completed but no orders were found matching your
            criteria.
          </Typography>
        </Paper>
      );
    }

    const stats = calculateDashboardStats(orders);

    return (
      <Box display='flex' flexDirection='column' gap={3}>
        <DashboardStats stats={stats} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TopCategories stats={stats} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopCountries stats={stats} />
          </Grid>
        </Grid>

        <CategorySummary orders={orders} />
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' gutterBottom>
            All Orders ({orders.length})
          </Typography>
          <SalesTable orders={orders} />
        </Paper>
      </Box>
    );
  };

  return (
    <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4'>E-commerce Sales Dashboard</Typography>
        <Box display='flex' alignItems='center' gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Task</InputLabel>
            <Select
              value={selectedTaskId || ""}
              label='Select Task'
              onChange={handleTaskChange}
            >
              {tasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  <Typography
                    sx={{
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.title} ({task.status})
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      {renderContent()}
    </Container>
  );
};

export default Dashboard;
