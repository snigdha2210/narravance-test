import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  completed_at: string | null;
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/tasks/${id}`,
        );
        setTask(response.data);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Failed to fetch task details");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const getStatusColor = (
    status: Task["status"],
  ): "primary" | "warning" | "success" => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      default:
        return "primary";
    }
  };

  if (loading) {
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

  if (error || !task) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <Typography color='error'>{error || "Task not found"}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Typography variant='h4'>{task.title}</Typography>
              <Chip
                label={task.status.replace("_", " ")}
                color={getStatusColor(task.status)}
                size='medium'
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' paragraph>
              {task.description}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body2' color='text.secondary'>
              Created: {new Date(task.created_at).toLocaleDateString()}
            </Typography>
            {task.completed_at && (
              <Typography variant='body2' color='text.secondary'>
                Completed: {new Date(task.completed_at).toLocaleDateString()}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button
              variant='contained'
              color='primary'
              onClick={() => navigate("/tasks")}
            >
              Back to Tasks
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TaskDetail;
