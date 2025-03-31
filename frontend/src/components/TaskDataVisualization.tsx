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
  TableSortLabel,
  styled,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { Order as OrderData } from "../types";
import { styled as muiStyled, alpha } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

interface TaskDataVisualizationProps {
  taskId: number;
  orders: OrderData[];
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

// Add type for sort order
type SortOrder = "asc" | "desc";

// Add interface for table sorting
interface TableSortConfig {
  field: keyof OrderData;
  order: SortOrder;
}

const TaskDataVisualization: React.FC<TaskDataVisualizationProps> = ({
  taskId,
  orders,
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    dateRange: "all" as "all" | "30days" | "custom",
    source: "all",
    category: "all",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  // Add states for sorting and interactivity
  const [sortConfig, setSortConfig] = useState<TableSortConfig>({
    field: "order_date",
    order: "desc",
  });
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);

  // Add new state for source table sorting
  const [sourceTableSort, setSourceTableSort] = useState<{
    field: string;
    order: SortOrder;
  }>({
    field: "total",
    order: "desc",
  });

  const filterData = (data: OrderData[]) => {
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

  const prepareTimeSeriesData = (orders: OrderData[]) => {
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

  const prepareCategoryData = (orders: OrderData[]) => {
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

  const prepareSourceData = (orders: OrderData[]) => {
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

  const prepareDetailedTableData = (orders: OrderData[]) => {
    return orders.map((order) => ({
      ...order,
      source_specific_data: JSON.parse(order.source_specific_data),
    }));
  };

  // Add sorting function
  const handleSort = (field: keyof OrderData) => {
    setSortConfig({
      field,
      order:
        sortConfig.field === field && sortConfig.order === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Add sorting function for source table
  const handleSourceTableSort = (field: string) => {
    setSourceTableSort({
      field,
      order:
        sourceTableSort.field === field && sourceTableSort.order === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Add sorting logic to filterData
  const filterAndSortData = (data: OrderData[]) => {
    const filtered = filterData(data);
    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.order === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Handle dates by converting to timestamps
      if (sortConfig.field === "order_date") {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortConfig.order === "asc" ? aDate - bDate : bDate - aDate;
      }

      return 0;
    });
  };

  // Add sorting logic for source data
  const sortSourceData = (
    data: Array<{
      source: string;
      total: number;
      orders: number;
      averageOrderValue: number;
    }>,
  ) => {
    return [...data].sort((a, b) => {
      const aValue = a[sourceTableSort.field as keyof typeof a];
      const bValue = b[sourceTableSort.field as keyof typeof b];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sourceTableSort.order === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sourceTableSort.order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  };

  // Add custom tooltip component for charts
  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
          <Typography variant='body2' color='textSecondary'>
            Date: {new Date(label || "").toLocaleDateString()}
          </Typography>
          {payload.map((entry) => (
            <Typography
              key={entry.name}
              variant='body2'
              color='textPrimary'
              sx={{ color: entry.color }}
            >
              {entry.name}: ${entry.value.toFixed(2)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Modify the detailed data table to include sorting
  const renderDetailedDataTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableHeaderCell>
              <TableSortLabel
                active={sortConfig.field === "order_id"}
                direction={
                  sortConfig.field === "order_id" ? sortConfig.order : "asc"
                }
                onClick={() => handleSort("order_id")}
              >
                Order ID
              </TableSortLabel>
            </StyledTableHeaderCell>
            <StyledTableHeaderCell>
              <TableSortLabel
                active={sortConfig.field === "order_date"}
                direction={
                  sortConfig.field === "order_date" ? sortConfig.order : "asc"
                }
                onClick={() => handleSort("order_date")}
              >
                Date
              </TableSortLabel>
            </StyledTableHeaderCell>
            <StyledTableHeaderCell>
              <TableSortLabel
                active={sortConfig.field === "total_amount"}
                direction={
                  sortConfig.field === "total_amount" ? sortConfig.order : "asc"
                }
                onClick={() => handleSort("total_amount")}
              >
                Amount
              </TableSortLabel>
            </StyledTableHeaderCell>
            <StyledTableHeaderCell>
              <TableSortLabel
                active={sortConfig.field === "product_category"}
                direction={
                  sortConfig.field === "product_category"
                    ? sortConfig.order
                    : "asc"
                }
                onClick={() => handleSort("product_category")}
              >
                Category
              </TableSortLabel>
            </StyledTableHeaderCell>
            <StyledTableHeaderCell>
              <TableSortLabel
                active={sortConfig.field === "source"}
                direction={
                  sortConfig.field === "source" ? sortConfig.order : "asc"
                }
                onClick={() => handleSort("source")}
              >
                Source
              </TableSortLabel>
            </StyledTableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filterAndSortData(orders).map((order) => (
            <StyledTableRow
              key={order.order_id}
              className={order.source === "source_a" ? "source-a" : "source-b"}
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
  );

  // Modify the time series chart to be more interactive
  const renderTimeSeriesChart = () => {
    const data = prepareTimeSeriesData(filterData(orders));
    return (
      <Paper sx={{ p: 2, position: "relative" }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Sales Over Time</Typography>
          <Tooltip
            title={
              expandedChart === "timeSeries"
                ? "Exit Fullscreen"
                : "Enter Fullscreen"
            }
          >
            <IconButton
              onClick={() =>
                setExpandedChart(
                  expandedChart === "timeSeries" ? null : "timeSeries",
                )
              }
            >
              {expandedChart === "timeSeries" ? (
                <FullscreenExitIcon />
              ) : (
                <FullscreenIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        <ResponsiveContainer
          width='100%'
          height={expandedChart === "timeSeries" ? 600 : 300}
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            {selectedDataPoint && (
              <ReferenceLine
                x={selectedDataPoint.date}
                stroke={theme.palette.primary.main}
                strokeDasharray='3 3'
              />
            )}
            <Line
              type='monotone'
              dataKey='source_a'
              stroke={theme.palette.sourceA.main}
              name='Shopify Sales ($)'
              dot={{ r: 4 }}
              activeDot={{
                r: 8,
                onClick: (data) => setSelectedDataPoint(data.payload),
              }}
            />
            <Line
              type='monotone'
              dataKey='source_b'
              stroke={theme.palette.sourceB.main}
              name='Etsy Sales ($)'
              dot={{ r: 4 }}
              activeDot={{
                r: 8,
                onClick: (data) => setSelectedDataPoint(data.payload),
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    );
  };

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
          {renderTimeSeriesChart()}
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Sales by Category
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={prepareCategoryData(orders)}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='category' />
                <YAxis />
                <RechartsTooltip content={<CustomTooltip />} />
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
                    <TableCell>
                      <TableSortLabel
                        active={sourceTableSort.field === "source"}
                        direction={
                          sourceTableSort.field === "source"
                            ? sourceTableSort.order
                            : "asc"
                        }
                        onClick={() => handleSourceTableSort("source")}
                      >
                        Source
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align='right'>
                      <TableSortLabel
                        active={sourceTableSort.field === "total"}
                        direction={
                          sourceTableSort.field === "total"
                            ? sourceTableSort.order
                            : "asc"
                        }
                        onClick={() => handleSourceTableSort("total")}
                      >
                        Total Sales ($)
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align='right'>
                      <TableSortLabel
                        active={sourceTableSort.field === "orders"}
                        direction={
                          sourceTableSort.field === "orders"
                            ? sourceTableSort.order
                            : "asc"
                        }
                        onClick={() => handleSourceTableSort("orders")}
                      >
                        Orders
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align='right'>
                      <TableSortLabel
                        active={sourceTableSort.field === "averageOrderValue"}
                        direction={
                          sourceTableSort.field === "averageOrderValue"
                            ? sourceTableSort.order
                            : "asc"
                        }
                        onClick={() =>
                          handleSourceTableSort("averageOrderValue")
                        }
                      >
                        Avg. Order Value ($)
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortSourceData(prepareSourceData(orders)).map((source) => (
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
          {renderDetailedDataTable()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskDataVisualization;
