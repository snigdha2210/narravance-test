import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  fetchTasks,
  fetchOrdersByTaskId,
  calculateDashboardStats,
} from "../services/dataService.ts";
import SalesTable from "../components/SalesTable.tsx";
import { useNavigate } from "react-router-dom";
import { Order, Task } from "../types.ts";
import CategorySummary from "../components/CategorySummary.tsx";
import TaskProgress, { TaskStatus } from "../components/TaskProgress.tsx";
import config from "../config.ts";

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
        // Filter out tasks that are not completed
        const completedTasks = tasksData.filter(
          (task) => task.status === "completed",
        );
        setTasks(tasksData);
        if (tasksData.length > 0) {
          if (!selectedTaskId) {
            setSelectedTaskId(tasksData[0].id);
          }
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
        console.log("data");
        console.log(data);
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
            <TaskProgress
              status={
                selectedTask.status as "pending" | "in_progress" | "completed"
              }
              size='large'
            />
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
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Total Sales</Typography>
            <Typography variant='h4'>
              ${stats?.totalSales.toFixed(2)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {stats?.totalOrders} orders
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Average Order Value</Typography>
            <Typography variant='h4'>
              ${stats?.averageOrderValue.toFixed(2)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {stats?.totalOrders} orders
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Source A Sales</Typography>
            <Typography variant='h4'>
              ${stats?.totalSourceA.toFixed(2)}
            </Typography>
            <Typography variant='body2'>
              {stats?.sourceAOrders} orders
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Source B Sales</Typography>
            <Typography variant='h4'>
              ${stats?.totalSourceB.toFixed(2)}
            </Typography>
            <Typography variant='body2'>
              {stats?.sourceBOrders} orders
            </Typography>
          </Paper>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Top Categories
            </Typography>
            <List>
              {stats?.topCategories.map((category, index) => (
                <React.Fragment key={category.category}>
                  <ListItem>
                    <ListItemText
                      primary={category.category}
                      secondary={`${
                        category.count
                      } orders - $${category.total.toFixed(2)}`}
                    />
                  </ListItem>
                  {index < stats?.topCategories.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Top Countries */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Top Countries
            </Typography>
            <List>
              {stats?.topCountries.map((country, index) => (
                <React.Fragment key={country.country}>
                  <ListItem>
                    <ListItemText
                      primary={country.country}
                      secondary={`${
                        country.count
                      } orders - $${country.total.toFixed(2)}`}
                    />
                  </ListItem>
                  {index < stats?.topCountries.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Add Category Summary before the orders table */}
        <Grid item xs={12}>
          <CategorySummary orders={orders} />
        </Grid>

        {/* Orders table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              All Orders ({orders.length})
            </Typography>
            <SalesTable orders={orders} />
          </Paper>
        </Grid>
      </Grid>
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
                  {task.title} ({task.status})
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
