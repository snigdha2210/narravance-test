import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
} from "@mui/material";
import TaskDataVisualization from "../components/TaskDataVisualization.tsx";
import { formatDate } from "../utils/dateUtils.ts";
import { Task } from "../types.ts";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "in_progress":
      return "warning";
    case "pending":
      return "info";
    default:
      return "default";
  }
};

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        console.log("Fetching task with ID:", id);
        const response = await fetch(`http://localhost:8000/api/tasks/${id}`);
        if (!response.ok) {
          throw new Error("Task not found");
        }
        const data = await response.json();
        console.log("Fetched task data:", data);
        setTask(data);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='200px'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color='error'>{error || "Task not found"}</Typography>
      </Box>
    );
  }

  console.log("Task status:", task.status);
  console.log("Task completed_at:", task.completed_at);

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
              mb={2}
            >
              <Typography variant='h5' component='h1'>
                {task.title}
              </Typography>
              <Chip
                label={task.status}
                color={getStatusColor(task.status)}
                size='medium'
              />
            </Box>
            <Typography variant='body1' paragraph>
              {task.description}
            </Typography>
            <Box mt={2}>
              <Typography variant='subtitle2' color='text.secondary'>
                Created: {formatDate(task.created_at, true)}
              </Typography>
              {task.date_from && (
                <Typography variant='subtitle2' color='text.secondary'>
                  Date Range: {formatDate(task.date_from)} -{" "}
                  {formatDate(task.date_to)}
                </Typography>
              )}
              {task.completed_at && (
                <Typography variant='subtitle2' color='text.secondary'>
                  Completed: {formatDate(task.completed_at, true)}
                </Typography>
              )}
            </Box>
            <Box mt={2} display='flex' gap={2}>
              <Button variant='outlined' color='primary' href='/tasks'>
                Back to Tasks
              </Button>
            </Box>
          </Paper>
        </Grid>

        {task.status.toLowerCase() === "completed" && (
          <Grid item xs={12}>
            <Typography variant='h6' gutterBottom>
              Task Data Visualization
            </Typography>
            <TaskDataVisualization taskId={parseInt(id!, 10)} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TaskDetail;
