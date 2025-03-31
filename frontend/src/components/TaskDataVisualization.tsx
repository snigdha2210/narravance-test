import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  useTheme,
  Stack,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Order } from "../types";
import { styled as muiStyled, alpha } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface TaskDataVisualizationProps {
  taskId: number;
  orders: Order[];
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&.source-a": {
    "backgroundColor": alpha(theme.palette.sourceA.main, 0.1),
    "&:hover": {
      backgroundColor: theme.palette.sourceA.light,
    },
  },
  "&.source-b": {
    "backgroundColor": alpha(theme.palette.sourceB.main, 0.1),
    "&:hover": {
      backgroundColor: theme.palette.sourceB.light,
    },
  },
}));

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  "maxHeight": 400,
  "overflow": "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.grey[100],
  },
  "&::-webkit-scrollbar-thumb": {
    "backgroundColor": theme.palette.grey[400],
    "borderRadius": "4px",
    "&:hover": {
      backgroundColor: theme.palette.grey[500],
    },
  },
}));

const TaskDataVisualization: React.FC<TaskDataVisualizationProps> = ({
  taskId,
  orders,
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    dateRange: "custom" as "all" | "30days" | "custom",
    source: "all",
    category: "all",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const filterData = (data: Order[]) => {
    const filtered = data.filter((order) => {
      const orderDate = new Date(order.order_date);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      let dateMatch = true;
      if (filters.dateRange === "30days") {
        dateMatch = orderDate >= thirtyDaysAgo;
      } else if (
        filters.dateRange === "custom" &&
        filters.startDate &&
        filters.endDate
      ) {
        dateMatch =
          orderDate >= filters.startDate && orderDate <= filters.endDate;
      }

      const sourceMatch =
        filters.source === "all" || order.source === filters.source;

      const categoryMatch =
        filters.category === "all" ||
        order.product_category === filters.category;

      return dateMatch && sourceMatch && categoryMatch;
    });
    return filtered;
  };

  const prepareTimeSeriesData = (orders: Order[]) => {
    const timeSeriesData = orders.map((order) => ({
      date: new Date(order.order_date),
      amount: order.total_amount,
      source: order.source,
    }));

    // Sort by date
    timeSeriesData.sort((a, b) => a.date.getTime() - b.date.getTime());
    console.log("Time series data before grouping:", timeSeriesData);

    // Group by date and source
    const groupedData = timeSeriesData.reduce((acc, curr) => {
      const date = curr.date.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          source_a: 0,
          source_b: 0,
        };
      }
      if (curr.source === "source_a") {
        acc[date].source_a += curr.amount;
      } else if (curr.source === "source_b") {
        acc[date].source_b += curr.amount;
      }
      return acc;
    }, {} as Record<string, { date: string; source_a: number; source_b: number }>);

    const result = Object.values(groupedData);
    console.log("Time series data after grouping:", result);
    return result;
  };

  const prepareCategoryData = (orders: Order[]) => {
    const categoryData = orders.reduce((acc, order) => {
      const category = order.product_category;
      if (!acc[category]) {
        acc[category] = {
          category,
          source_a: 0,
          source_b: 0,
        };
      }
      if (order.source === "source_a") {
        acc[category].source_a += order.total_amount;
      } else if (order.source === "source_b") {
        acc[category].source_b += order.total_amount;
      }
      return acc;
    }, {} as Record<string, { category: string; source_a: number; source_b: number }>);

    return Object.values(categoryData);
  };

  const prepareSourceData = (orders: Order[]) => {
    const sourceData = orders.reduce((acc, order) => {
      const source = order.source;
      if (!acc[source]) {
        acc[source] = {
          source,
          total: 0,
          orders: 0,
          averageOrderValue: 0,
        };
      }
      acc[source].total += order.total_amount;
      acc[source].orders += 1;
      acc[source].averageOrderValue = acc[source].total / acc[source].orders;
      return acc;
    }, {} as Record<string, { source: string; total: number; orders: number; averageOrderValue: number }>);

    return Object.values(sourceData);
  };

  const prepareDetailedTableData = (orders: Order[]) => {
    return orders.map((order) => ({
      ...order,
      source_specific_data: JSON.parse(order.source_specific_data),
    }));
  };

  const filteredOrders = filterData(orders);
  const timeSeriesData = prepareTimeSeriesData(filteredOrders);
  const categoryData = prepareCategoryData(filteredOrders);
  const sourceData = prepareSourceData(filteredOrders);
  const detailedTableData = prepareDetailedTableData(filteredOrders);

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.dateRange}
                onChange={(e) => {
                  const newDateRange = e.target
                    .value as typeof filters.dateRange;
                  setFilters({
                    ...filters,
                    dateRange: newDateRange,
                    startDate:
                      newDateRange === "custom" ? filters.startDate : null,
                    endDate: newDateRange === "custom" ? filters.endDate : null,
                  });
                }}
                label='Date Range'
              >
                <MenuItem value='all'>All Time</MenuItem>
                <MenuItem value='30days'>Last 30 Days</MenuItem>
                <MenuItem value='custom'>Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {filters.dateRange === "custom" && (
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Stack spacing={2}>
                  <DatePicker
                    label='Start Date'
                    value={filters.startDate}
                    onChange={(newValue) => {
                      setFilters({
                        ...filters,
                        startDate: newValue,
                      });
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                  <DatePicker
                    label='End Date'
                    value={filters.endDate}
                    onChange={(newValue) => {
                      setFilters({
                        ...filters,
                        endDate: newValue,
                      });
                    }}
                    minDate={filters.startDate || undefined}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                </Stack>
              </LocalizationProvider>
            </Grid>
          )}

          <Grid item xs={12} md={filters.dateRange === "custom" ? 4 : 4}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={filters.source}
                onChange={(e) =>
                  setFilters({ ...filters, source: e.target.value })
                }
                label='Source'
              >
                <MenuItem value='all'>All Sources</MenuItem>
                <MenuItem value='source_a'>Shopify</MenuItem>
                <MenuItem value='source_b'>Etsy</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={filters.dateRange === "custom" ? 12 : 4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                label='Category'
              >
                <MenuItem value='all'>All Categories</MenuItem>
                {Array.from(new Set(orders.map((o) => o.product_category))).map(
                  (category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Time Series Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Sales Over Time
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='source_a'
                  stroke={theme.palette.sourceA.main}
                  name='Shopify Sales ($)'
                />
                <Line
                  type='monotone'
                  dataKey='source_b'
                  stroke={theme.palette.sourceB.main}
                  name='Etsy Sales ($)'
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Sales by Category
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='category' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey='source_a'
                  fill={theme.palette.sourceA.main}
                  name='Shopify Sales ($)'
                />
                <Bar
                  dataKey='source_b'
                  fill={theme.palette.sourceB.main}
                  name='Etsy Sales ($)'
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Source Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Source Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell align='right'>Total Sales ($)</TableCell>
                    <TableCell align='right'>Orders</TableCell>
                    <TableCell align='right'>Avg. Order Value ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sourceData.map((source) => (
                    <TableRow key={source.source}>
                      <TableCell>
                        {source.source === "source_a" ? "Shopify" : "Etsy"}
                      </TableCell>
                      <TableCell align='right'>
                        {source.total.toFixed(2)}
                      </TableCell>
                      <TableCell align='right'>{source.orders}</TableCell>
                      <TableCell align='right'>
                        {source.averageOrderValue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Detailed Data Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableHeaderCell>Order ID</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Date</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Amount</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Category</StyledTableHeaderCell>
                  <StyledTableHeaderCell>Source</StyledTableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterData(orders).map((order) => (
                  <StyledTableRow
                    key={order.order_id}
                    className={
                      order.source === "source_a" ? "source-a" : "source-b"
                    }
                  >
                    <TableCell>{order.order_id}</TableCell>
                    <TableCell>
                      {new Date(order.order_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{order.product_category}</TableCell>
                    <TableCell>
                      {order.source === "source_a" ? "Shopify" : "Etsy"}
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskDataVisualization;
