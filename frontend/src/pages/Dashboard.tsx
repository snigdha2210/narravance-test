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
} from "@mui/material";
import {
  Order,
  fetchAllOrders,
  calculateDashboardStats,
} from "../services/dataService.ts";
import SalesTable from "../components/SalesTable.tsx";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllOrders();
        setOrders(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes("404")) {
          setError(null); // Don't show error for no orders
        } else {
          setError("Failed to fetch sales data");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (orders.length === 0) {
    return (
      <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant='h5' gutterBottom>
            No Orders Available
          </Typography>
          <Typography variant='body1' color='text.secondary' paragraph>
            There are no orders to display at the moment. Create a task to fetch
            and process orders from the data sources.
          </Typography>
          <Button
            variant='contained'
            color='primary'
            onClick={() => navigate("/tasks")}
            sx={{ mt: 2 }}
          >
            Create New Task
          </Button>
        </Paper>
      </Container>
    );
  }

  const stats = calculateDashboardStats(orders);

  return (
    <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4'>E-commerce Sales Dashboard</Typography>
        <Chip
          label={`${stats.dateRange.start} to ${stats.dateRange.end}`}
          color='primary'
          variant='outlined'
        />
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Total Sales</Typography>
            <Typography variant='h4'>${stats.totalSales.toFixed(2)}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {stats.totalOrders} orders
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Average Order Value</Typography>
            <Typography variant='h4'>
              ${stats.averageOrderValue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Source A Sales</Typography>
            <Typography variant='h4'>
              ${stats.totalSourceA.toFixed(2)}
            </Typography>
            <Typography variant='body2'>
              {stats.sourceAOrders} orders
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Source B Sales</Typography>
            <Typography variant='h4'>
              ${stats.totalSourceB.toFixed(2)}
            </Typography>
            <Typography variant='body2'>
              {stats.sourceBOrders} orders
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
              {stats.topCategories.map((category, index) => (
                <React.Fragment key={category.category}>
                  <ListItem>
                    <ListItemText
                      primary={category.category}
                      secondary={`${
                        category.count
                      } orders - $${category.total.toFixed(2)}`}
                    />
                  </ListItem>
                  {index < stats.topCategories.length - 1 && <Divider />}
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
              {stats.topCountries.map((country, index) => (
                <React.Fragment key={country.country}>
                  <ListItem>
                    <ListItemText
                      primary={country.country}
                      secondary={`${
                        country.count
                      } orders - $${country.total.toFixed(2)}`}
                    />
                  </ListItem>
                  {index < stats.topCountries.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Sales Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              All Orders ({stats.totalOrders})
            </Typography>
            <SalesTable orders={orders} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
