import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import TaskProgress from "../components/TaskProgress.tsx";
import TaskDataVisualization from "../components/TaskDataVisualization.tsx";
import { Task, Order } from "../types.ts";
import { fetchTask, fetchOrdersByTaskId } from "../services/dataService.ts";

const TaskDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const taskData = await fetchTask(parseInt(id));
        setTask(taskData);

        if (taskData.status === "completed") {
          const ordersData = await fetchOrdersByTaskId(parseInt(id));
          setOrders(ordersData);
        }

        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch task details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box display='flex' justifyContent='center' my={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (!task) {
      return (
        <Typography color='error' align='center'>
          Task not found
        </Typography>
      );
    }

    if (task.status !== "completed") {
      return (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant='h6' gutterBottom>
            Task is {task.status === "pending" ? "Pending" : "In Progress"}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {task.status === "pending"
              ? "Your task is queued and will start processing soon."
              : "Your task is currently being processed. Please wait for it to complete."}
          </Typography>
          <Box mt={3}>
            <TaskProgress
              status={task.status as "pending" | "in_progress" | "completed"}
              size='large'
            />
          </Box>
        </Paper>
      );
    }

    if (error) {
      return (
        <Typography color='error' align='center'>
          {error}
        </Typography>
      );
    }

    if (!orders || orders.length === 0) {
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

    return (
      <>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Task Information
          </Typography>
          <Typography>
            Status: <strong>{task.status}</strong>
          </Typography>
          <Typography>
            Created: {new Date(task.created_at).toLocaleString()}
          </Typography>
          {task.completed_at && (
            <Typography>
              Completed: {new Date(task.completed_at).toLocaleString()}
            </Typography>
          )}
        </Paper>

        <TaskDataVisualization taskId={task.id} orders={orders} />
      </>
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
        <Typography variant='h4'>
          Task Details {task && `- ${task.title}`}
        </Typography>
        <Button
          variant='outlined'
          color='primary'
          onClick={() => navigate("/tasks")}
        >
          Back to Tasks
        </Button>
      </Box>
      {renderContent()}
    </Container>
  );
};

export default TaskDetail;
