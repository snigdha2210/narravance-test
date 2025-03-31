import React, { useState, useMemo } from "react";
import { Box, Button } from "@mui/material";

import { Order } from "../types";
import PrintIcon from "@mui/icons-material/Print";

import GlobalFilters from "./visualization/GlobalFilters.tsx";
import TimeSeriesChart from "./visualization/TimeSeriesChart.tsx";
import CategoryChart from "./visualization/CategoryChart.tsx";
import DistributionChart from "./visualization/DistributionChart.tsx";
import SourcePerformance from "./visualization/SourcePerformance.tsx";
import DetailedDataTable from "./visualization/DetailedDataTable.tsx";

interface TaskDataVisualizationProps {
  taskId: number;
  orders: Order[];
  taskStartDate?: string | null;
  taskEndDate?: string | null;
}

// Add type for sort order
type SortOrder = "asc" | "desc";

// Add interface for table sorting
interface TableSortConfig {
  field: keyof Order;
  order: SortOrder;
}

// Add new interfaces for chart features

const TaskDataVisualization: React.FC<TaskDataVisualizationProps> = ({
  taskId,
  orders,
  taskStartDate,
  taskEndDate,
}) => {
  // Global filters state
  const [filters, setFilters] = useState({
    dateRange: "all" as "all" | "30days" | "custom",
    source: "all",
    category: "all",
    startDate: taskStartDate ? new Date(taskStartDate) : null,
    endDate: taskEndDate ? new Date(taskEndDate) : null,
  });

  // Chart-specific states
  const [sortConfig, setSortConfig] = useState<TableSortConfig>({
    field: "order_date",
    order: "desc",
  });
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [sourceTableSort, setSourceTableSort] = useState<{
    field: string;
    order: SortOrder;
  }>({
    field: "total",
    order: "desc",
  });
  const [chartConfig, setChartConfig] = useState<{
    type: "line" | "area" | "bar";
  }>({
    type: "line",
  });
  const [timeSeriesFilters, setTimeSeriesFilters] = useState({
    sources: ["source_a", "source_b"],
  });
  const [categoryFilters, setCategoryFilters] = useState({
    source: "all",
    sortBy: "amount" as "amount" | "count",
  });
  const [distributionFilters, setDistributionFilters] = useState({
    metric: "orders" as "orders" | "amount",
    source: "all",
  });

  // Memoized filtered data
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

  const categories = useMemo(
    () => Array.from(new Set(orders.map((order) => order.product_category))),
    [orders],
  );

  // Add CSV export functionality
  const handleExportCSV = () => {
    const headers = ["Order ID", "Date", "Amount", "Category", "Source"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((order) =>
        [
          order.order_id,
          new Date(order.order_date).toISOString(),
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
    a.download = `sales_data_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Add print functionality
  const handlePrint = () => {
    window.print();
  };

  const handleCategoryFiltersChange = (filters: {
    source?: string;
    sortBy?: "amount" | "count";
  }) => {
    setCategoryFilters((prev) => ({
      ...prev,
      ...filters,
    }));
  };

  const handleDistributionFiltersChange = (filters: {
    metric?: "orders" | "amount";
    source?: string;
  }) => {
    setDistributionFilters((prev) => ({
      ...prev,
      ...filters,
    }));
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

      <GlobalFilters
        filters={filters}
        categories={categories}
        taskStartDate={taskStartDate}
        taskEndDate={taskEndDate}
        onFiltersChange={setFilters}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TimeSeriesChart
          orders={filteredData}
          timeSeriesFilters={timeSeriesFilters}
          chartConfig={chartConfig}
          dateRange={{
            start: filters.startDate || new Date("2015-01-01"),
            end: filters.endDate || new Date("2025-03-31"),
          }}
          expandedChart={expandedChart}
          onTimeSeriesFiltersChange={setTimeSeriesFilters}
          onChartConfigChange={setChartConfig}
          onExpandedChartChange={setExpandedChart}
        />

        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <CategoryChart
              orders={filteredData}
              categories={categories}
              categoryFilters={categoryFilters}
              expandedChart={expandedChart}
              onCategoryFiltersChange={handleCategoryFiltersChange}
              onExpandedChartChange={setExpandedChart}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <DistributionChart
              orders={filteredData}
              categories={categories}
              distributionFilters={distributionFilters}
              expandedChart={expandedChart}
              onDistributionFiltersChange={handleDistributionFiltersChange}
              onExpandedChartChange={setExpandedChart}
            />
          </Box>
        </Box>

        <SourcePerformance
          orders={filteredData}
          sourceTableSort={sourceTableSort}
          onSourceTableSort={(field) =>
            setSourceTableSort({
              field,
              order:
                sourceTableSort.field === field &&
                sourceTableSort.order === "asc"
                  ? "desc"
                  : "asc",
            })
          }
        />

        <DetailedDataTable
          orders={filteredData}
          sortConfig={sortConfig}
          onSort={(field) =>
            setSortConfig({
              field,
              order:
                sortConfig.field === field && sortConfig.order === "asc"
                  ? "desc"
                  : "asc",
            })
          }
          onExportCSV={handleExportCSV}
        />
      </Box>
    </Box>
  );
};

export default TaskDataVisualization;
