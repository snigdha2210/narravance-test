import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  TablePagination,
  styled,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TaskProgress, { TaskStatus } from "../components/TaskProgress.tsx";
import { Task } from "../types";

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        // Sort tasks by creation date in descending order (latest first)
        const sortedTasks = data.sort(
          (a: Task, b: Task) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setTasks(sortedTasks);
        setError(null);
      } catch (err) {
        setError("Failed to fetch tasks");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  if (error) {
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

  const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
  }));

  return (
    <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4'>Tasks</Typography>
        <Button
          component={RouterLink}
          to='/create'
          variant='contained'
          color='primary'
        >
          Create New Task
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>Title</StyledTableHeaderCell>
              <StyledTableHeaderCell>Description</StyledTableHeaderCell>
              <StyledTableHeaderCell>Status</StyledTableHeaderCell>
              <StyledTableHeaderCell>Created At</StyledTableHeaderCell>
              <StyledTableHeaderCell>Actions</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task) => (
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
                    {new Date(task.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      component={RouterLink}
                      to={`/tasks/${task.id}`}
                      variant='outlined'
                      size='small'
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={tasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
};

export default TaskList;
