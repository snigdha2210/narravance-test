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
  Container,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TaskDataVisualization from "../components/TaskDataVisualization.tsx";
import { formatDate } from "../utils/dateUtils.ts";
import { Task } from "../types.ts";
import TaskProgress, { TaskStatus } from "../components/TaskProgress.tsx";

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
        minHeight='100vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return (
      <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color='error' gutterBottom>
            {error || "Task not found"}
          </Typography>
          <Button
            component={RouterLink}
            to='/tasks'
            variant='contained'
            sx={{ mt: 2 }}
          >
            Back to Tasks
          </Button>
        </Paper>
      </Container>
    );
  }

  console.log("Task status:", task.status);
  console.log("Task completed_at:", task.completed_at);
  console.log("Categories:", task.source_a_filters.categories);
  console.log("Categories:", task.source_b_filters.categories);

  return (
    <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          component={RouterLink}
          to='/tasks'
          variant='outlined'
          sx={{ mb: 2 }}
        >
          Back to Tasks
        </Button>

        <Paper sx={{ p: 4 }}>
          <Typography variant='h4' gutterBottom>
            {task.title}
          </Typography>

          <Box sx={{ my: 4 }}>
            <TaskProgress
              status={task.status.toLowerCase() as TaskStatus}
              size='large'
            />
          </Box>

          <Typography variant='body1' color='text.secondary' paragraph>
            {task.description}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              Created: {new Date(task.created_at).toLocaleString()}
            </Typography>
            {task.completed_at && (
              <Typography variant='subtitle2' color='text.secondary'>
                Completed: {new Date(task.completed_at).toLocaleString()}
              </Typography>
            )}
            {task.date_from && task.date_to && (
              <Typography variant='subtitle2' color='text.secondary'>
                Date Range: {new Date(task.date_from).toLocaleDateString()} -{" "}
                {new Date(task.date_to).toLocaleDateString()}
              </Typography>
            )}
            {(task.source_a_filters?.categories?.length > 0 ||
              task.source_b_filters?.categories?.length > 0) && (
              <Typography variant='subtitle2' color='text.secondary'>
                Categories:{" "}
                {[
                  ...(task.source_a_filters?.categories || []),
                  ...(task.source_b_filters?.categories || []),
                ].join(", ")}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      <TaskDataVisualization taskId={task.id} />
    </Container>
  );
};

export default TaskDetail;
