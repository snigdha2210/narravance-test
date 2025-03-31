import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/dateUtils.ts";
import { Task } from "../types.ts";
import TaskProgress, { TaskStatus } from "../components/TaskProgress.tsx";
import { Link as RouterLink } from "react-router-dom";

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

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/tasks/");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        console.log("Fetched tasks:", data); // Debug log
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color='error'>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4'>Tasks</Typography>
        <Button
          variant='contained'
          color='primary'
          onClick={() => navigate("/create")}
        >
          Create Task
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => {
              console.log("Task dates:", {
                created_at: task.created_at,
                date_from: task.date_from,
                date_to: task.date_to,
              }); // Debug log
              return (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    <TaskProgress
                      status={task.status.toLowerCase() as TaskStatus}
                      size='small'
                    />
                  </TableCell>
                  <TableCell>
                    {task.date_from
                      ? `${formatDate(task.date_from)} - ${formatDate(
                          task.date_to,
                        )}`
                      : "No date range"}
                  </TableCell>
                  <TableCell>{formatDate(task.created_at, true)}</TableCell>
                  <TableCell>
                    <Button
                      component={RouterLink}
                      to={`/task/${task.id}`}
                      variant='outlined'
                      size='small'
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TaskList;
