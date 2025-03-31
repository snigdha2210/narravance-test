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
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TaskProgress, { TaskStatus } from "../components/TaskProgress.tsx";
import { Task } from "../types";
import config from "../config.ts";
import { formatDateToEST } from "../utils/dateUtils.ts";
import SearchIcon from "@mui/icons-material/Search";

const POLLING_INTERVAL = 5000; // Poll every 5 seconds

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: "bold",
  whiteSpace: "nowrap",
  padding: "16px",
}));

const StyledTableCell = styled(TableCell)({
  "minWidth": "100px",
  "padding": "16px",
  "&.title-cell": {
    width: "20%",
    minWidth: "200px",
    maxWidth: "300px",
  },
  "&.description-cell": {
    width: "20%",
    minWidth: "200px",
    maxWidth: "300px",
  },
  "&.status-cell": {
    width: "120px",
    minWidth: "120px",
    padding: "8px",
  },
  "&.date-cell": {
    width: "120px",
    minWidth: "120px",
    whiteSpace: "nowrap",
    padding: "8px 16px",
  },
  "&.actions-cell": {
    "width": "100px",
    "minWidth": "100px",
    "whiteSpace": "nowrap",
    "padding": "8px",
    "& .MuiButton-root": {
      minWidth: "90px",
    },
  },
});

const TruncatedText = styled(Typography)({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  display: "block",
});

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = async () => {
    if (!loading) setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/tasks`, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies if using session-based auth
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch tasks");
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
      console.error("Error fetching tasks:", err);
      // Only set error if we don't have any tasks yet
      if (tasks.length === 0) {
        setError(err instanceof Error ? err.message : "Failed to fetch tasks");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Set up polling
    const pollInterval = setInterval(fetchTasks, POLLING_INTERVAL);

    // Cleanup polling on component unmount
    return () => clearInterval(pollInterval);
  }, []); // Empty dependency array means this effect runs once on mount

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Add search filter function
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 4 }}>
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

      {/* Add search field */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Search tasks by title...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: "400px" }}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          "width": "100%",
          "overflowX": "auto",
          "& .MuiTable-root": {
            // minWidth: "1500px", // Increased minimum width
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>Title</StyledTableHeaderCell>
              <StyledTableHeaderCell>Description</StyledTableHeaderCell>
              <StyledTableHeaderCell align='center'>
                Status
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>Created At</StyledTableHeaderCell>
              <StyledTableHeaderCell>Actions</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task) => (
                <TableRow key={task.id}>
                  <StyledTableCell className='title-cell'>
                    <Tooltip title={task.title} placement='top'>
                      <TruncatedText>{task.title}</TruncatedText>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell className='description-cell'>
                    <Tooltip title={task.description} placement='top'>
                      <TruncatedText>{task.description}</TruncatedText>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell className='status-cell' align='center'>
                    <Box display='flex' justifyContent='center'>
                      <TaskProgress
                        status={task.status.toLowerCase() as TaskStatus}
                        size='small'
                      />
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell className='date-cell'>
                    {formatDateToEST(task.created_at)}
                  </StyledTableCell>
                  <StyledTableCell className='actions-cell'>
                    <Button
                      component={RouterLink}
                      to={`/tasks/${task.id}`}
                      variant='outlined'
                      size='small'
                    >
                      View Details
                    </Button>
                  </StyledTableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={filteredTasks.length}
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
