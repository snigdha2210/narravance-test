import React, { useState, useMemo } from "react";
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
  Button,
  ButtonGroup,
  TextField,
} from "@mui/material";

import { Order as OrderData } from "../types";
import { formatDateToEST, formatDateOnlyToEST } from "../utils/dateUtils.ts";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import D3Chart from "./D3Chart.tsx";

interface TaskDataVisualizationProps {
  taskId: number;
  orders: OrderData[];
  taskStartDate?: string | null;
  taskEndDate?: string | null;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&.source-a": {
    "backgroundColor": theme.palette.sourceA.background,
    "&:hover": {
      backgroundColor: theme.palette.sourceA.light,
    },
  },
  "&.source-b": {
    "backgroundColor": theme.palette.sourceB.background,
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

// Add type for sort order
type SortOrder = "asc" | "desc";

// Add interface for table sorting
interface TableSortConfig {
  field: keyof OrderData;
  order: SortOrder;
}

// Add new interfaces for chart features
interface ChartAnnotation {
  x: string;
  y: number;
  text: string;
  color: string;
}

type ChartType = "line" | "area" | "bar" | "pie";

interface ChartConfig {
  type: ChartType;
}

const TaskDataVisualization: React.FC<TaskDataVisualizationProps> = ({
  taskId,
  orders,
  taskStartDate,
  taskEndDate,
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    dateRange: "all" as "all" | "30days" | "custom",
    source: "all",
    category: "all",
    startDate: taskStartDate ? new Date(taskStartDate) : null,
    endDate: taskEndDate ? new Date(taskEndDate) : null,
  });

  // Add states for sorting and interactivity
  const [sortConfig, setSortConfig] = useState<TableSortConfig>({
    field: "order_date",
    order: "desc",
  });
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Add new state for source table sorting
  const [sourceTableSort, setSourceTableSort] = useState<{
    field: string;
    order: SortOrder;
  }>({
    field: "total",
    order: "desc",
  });

  // Add new state for chart configuration
  const [chartConfig, setChartConfig] = useState<ChartConfig>({ type: "line" });
  const [categoryChartConfig, setCategoryChartConfig] = useState<ChartConfig>({
    type: "bar",
  });

  // Add new state for individual chart filters
  const [timeSeriesFilters, setTimeSeriesFilters] = useState({
    sources: ["source_a", "source_b"],
  });

  const [categoryFilters, setCategoryFilters] = useState({
    source: "all",
    sortBy: "amount" as "amount" | "count",
  });

  // Add new state for additional chart
  const [distributionFilters, setDistributionFilters] = useState({
    metric: "orders" as "orders" | "amount",
    source: "all",
  });

  // Memoize filtered data
  const filteredData = useMemo(() => {
    return orders.filter((order) => {
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
  }, [
    orders,
    filters.dateRange,
    filters.startDate,
    filters.endDate,
    filters.source,
    filters.category,
  ]);

  // Get unique sources and categories for filters
  const sources = useMemo(
    () => Array.from(new Set(orders.map((order) => order.source))),
    [orders],
  );
  const categories = useMemo(
    () => Array.from(new Set(orders.map((order) => order.product_category))),
    [orders],
  );

  // Calculate aggregated data for charts
  const salesByCategory = useMemo(() => {
    const categoryData = filteredData.reduce((acc, order) => {
      acc[order.product_category] =
        (acc[order.product_category] || 0) + order.total_amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryData).map(([category, total]) => ({
      product_category: category,
      total_amount: total,
    }));
  }, [filteredData]);

  const salesByDate = useMemo(() => {
    const dateData = filteredData.reduce((acc, order) => {
      const date = formatDateOnlyToEST(new Date(order.order_date));
      acc[date] = (acc[date] || 0) + order.total_amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dateData).map(([date, total]) => ({
      order_date: date,
      total_amount: total,
    }));
  }, [filteredData]);

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
            {label
              ? label.includes("-")
                ? formatDateOnlyToEST(label)
                : label
              : ""}
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

  // Remove the handleAddAnnotation function since we're not using annotations
  const handleAddAnnotation = (data: any) => {
    if (!data) return;

    // Get the value based on which source is being displayed
    const value =
      data.source_a !== undefined
        ? data.source_a
        : data.source_b !== undefined
        ? data.source_b
        : data.amount;

    if (value !== undefined && value !== null) {
      setChartConfig((prev) => ({
        ...prev,
        type: prev.type,
      }));
    }
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
              <TableCell>{formatDateToEST(order.order_date)}</TableCell>
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

  // Update renderTimeSeriesChart to use consistent source selector UI
  const renderTimeSeriesChart = () => {
    const data = prepareTimeSeriesData(filteredData);
    const dateRange = {
      start: filters.startDate || new Date("2015-01-01"),
      end: filters.endDate || new Date("2025-03-31"),
    };

    return (
      <Paper sx={{ p: 2, position: "relative" }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Sales Over Time</Typography>
          <Box display='flex' gap={2} alignItems='center'>
            <FormControl size='small'>
              <InputLabel>Source</InputLabel>
              <Select
                value={
                  timeSeriesFilters.sources.length === 2
                    ? "all"
                    : timeSeriesFilters.sources[0]
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setTimeSeriesFilters({
                    ...timeSeriesFilters,
                    sources:
                      value === "all"
                        ? ["source_a", "source_b"]
                        : [value as string],
                  });
                }}
                label='Source'
              >
                <MenuItem value='all'>All Sources</MenuItem>
                <MenuItem value='source_a'>Shopify</MenuItem>
                <MenuItem value='source_b'>Etsy</MenuItem>
              </Select>
            </FormControl>
            <ButtonGroup size='small'>
              <Button
                onClick={() =>
                  setChartConfig((prev) => ({ ...prev, type: "line" }))
                }
                variant={chartConfig.type === "line" ? "contained" : "outlined"}
              >
                Line
              </Button>
              <Button
                onClick={() =>
                  setChartConfig((prev) => ({ ...prev, type: "area" }))
                }
                variant={chartConfig.type === "area" ? "contained" : "outlined"}
              >
                Area
              </Button>
              <Button
                onClick={() =>
                  setChartConfig((prev) => ({ ...prev, type: "bar" }))
                }
                variant={chartConfig.type === "bar" ? "contained" : "outlined"}
              >
                Bar
              </Button>
            </ButtonGroup>
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
        </Box>
        <D3Chart
          data={data}
          title='Sales Over Time'
          type={chartConfig.type}
          xKey='date'
          yKey={timeSeriesFilters.sources}
          width={expandedChart === "timeSeries" ? 1200 : 800}
          height={expandedChart === "timeSeries" ? 600 : 400}
          dateRange={dateRange}
        />
      </Paper>
    );
  };

  // Add memoized data for distribution chart
  const distributionData = useMemo(() => {
    const sourceFilter = distributionFilters.source;
    const filteredOrders =
      sourceFilter === "all"
        ? filteredData
        : filteredData.filter((order) => order.source === sourceFilter);

    if (distributionFilters.metric === "orders") {
      return categories.map((category) => ({
        category,
        value: filteredOrders.filter(
          (order) => order.product_category === category,
        ).length,
      }));
    } else {
      return categories.map((category) => ({
        category,
        value: filteredOrders
          .filter((order) => order.product_category === category)
          .reduce((sum, order) => sum + order.total_amount, 0),
      }));
    }
  }, [filteredData, distributionFilters, categories]);

  // Add memoized data for category chart
  const categoryData = useMemo(() => {
    const sourceFilter = categoryFilters.source;
    const filteredOrders =
      sourceFilter === "all"
        ? filteredData
        : filteredData.filter((order) => order.source === sourceFilter);

    return categories
      .map((category) => {
        const categoryOrders = filteredOrders.filter(
          (order) => order.product_category === category,
        );
        return {
          category,
          amount: categoryOrders.reduce(
            (sum, order) => sum + order.total_amount,
            0,
          ),
          count: categoryOrders.length,
        };
      })
      .sort((a, b) =>
        categoryFilters.sortBy === "amount"
          ? b.amount - a.amount
          : b.count - a.count,
      );
  }, [filteredData, categoryFilters, categories]);

  // Update renderSalesDistribution to use memoized data
  const renderSalesDistribution = () => {
    return (
      <Paper sx={{ p: 2 }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Sales Distribution</Typography>
          <Box display='flex' gap={2}>
            <FormControl size='small'>
              <InputLabel>Metric</InputLabel>
              <Select
                value={distributionFilters.metric}
                onChange={(e) =>
                  setDistributionFilters({
                    ...distributionFilters,
                    metric: e.target.value as "orders" | "amount",
                  })
                }
                label='Metric'
              >
                <MenuItem value='orders'>Order Count</MenuItem>
                <MenuItem value='amount'>Sales Amount</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small'>
              <InputLabel>Source</InputLabel>
              <Select
                value={distributionFilters.source}
                onChange={(e) =>
                  setDistributionFilters({
                    ...distributionFilters,
                    source: e.target.value as string,
                  })
                }
                label='Source'
              >
                <MenuItem value='all'>All Sources</MenuItem>
                <MenuItem value='source_a'>Shopify</MenuItem>
                <MenuItem value='source_b'>Etsy</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <D3Chart
          data={distributionData}
          title={`${
            distributionFilters.metric === "orders"
              ? "Order Count"
              : "Sales Amount"
          } by Category`}
          type='pie'
          xKey='category'
          yKey='value'
          height={400}
        />
      </Paper>
    );
  };

  // Update renderCategoryChart to use memoized data
  const renderCategoryChart = () => {
    return (
      <Paper sx={{ p: 2 }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Sales by Category</Typography>
          <Box display='flex' gap={2}>
            <FormControl size='small'>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={categoryFilters.sortBy}
                onChange={(e) =>
                  setCategoryFilters({
                    ...categoryFilters,
                    sortBy: e.target.value as "amount" | "count",
                  })
                }
                label='Sort By'
              >
                <MenuItem value='amount'>Sales Amount</MenuItem>
                <MenuItem value='count'>Order Count</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small'>
              <InputLabel>Source</InputLabel>
              <Select
                value={categoryFilters.source}
                onChange={(e) =>
                  setCategoryFilters({
                    ...categoryFilters,
                    source: e.target.value as string,
                  })
                }
                label='Source'
              >
                <MenuItem value='all'>All Sources</MenuItem>
                <MenuItem value='source_a'>Shopify</MenuItem>
                <MenuItem value='source_b'>Etsy</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <D3Chart
          data={categoryData}
          title={`${
            categoryFilters.sortBy === "count" ? "Order Count" : "Sales Amount"
          } by Category`}
          type='bar'
          xKey='category'
          yKey={categoryFilters.sortBy === "amount" ? "amount" : "count"}
          height={400}
        />
      </Paper>
    );
  };

  // Add CSV export functionality
  const handleExportCSV = () => {
    const headers = ["Order ID", "Date", "Amount", "Category", "Source"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((order) =>
        [
          order.order_id,
          formatDateToEST(new Date(order.order_date)),
          order.total_amount,
          order.product_category,
          order.source,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_data_${formatDateToEST(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Add print functionality
  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant='contained'
          onClick={handlePrint}
          startIcon={<PrintIcon />}
        >
          Print Report
        </Button>
      </Box>
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
            <Grid item xs={12} md={8}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Stack spacing={2}>
                  <Box>
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
                    {taskStartDate && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ ml: 1 }}
                      >
                        Task Selected start date:{" "}
                        {formatDateOnlyToEST(taskStartDate)}
                      </Typography>
                    )}
                  </Box>
                  <Box>
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
                    {taskEndDate && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ ml: 1 }}
                      >
                        Task Selected end date:{" "}
                        {formatDateOnlyToEST(taskEndDate)}
                      </Typography>
                    )}
                  </Box>
                  {!taskStartDate && !taskEndDate && (
                    <Typography variant='caption' color='text.secondary'>
                      No date range was specified when creating this task
                    </Typography>
                  )}
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
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
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

        {/* Category Chart */}
        <Grid item xs={12} md={6}>
          {renderCategoryChart()}
        </Grid>

        {/* Distribution Chart */}
        <Grid item xs={12} md={6}>
          {renderSalesDistribution()}
        </Grid>

        {/* Source Performance */}
        <Grid item xs={12}>
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
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant='contained'
              onClick={handleExportCSV}
              startIcon={<FileDownloadIcon />}
            >
              Export CSV
            </Button>
          </Box>
          {renderDetailedDataTable()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskDataVisualization;
