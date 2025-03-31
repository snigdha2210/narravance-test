import React, { useState } from "react";
import { Grid } from "@mui/material";
import {
  TimeSeriesChart,
  CategoryChart,
  DistributionChart,
} from "./charts/index.ts";
import { Order } from "../types/index.ts";
import { GlobalFilters } from "../types/charts.ts";

interface DashboardChartsProps {
  orders: Order[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ orders }) => {
  const [filters, setFilters] = useState<GlobalFilters>({
    timeSeries: { source: "all" },
    category: { source: "all", sortBy: "amount", sortOrder: "desc" },
    distribution: { source: "all", metric: "amount" },
  });

  return (
    <Grid container spacing={3}>
      {/* Time Series Chart */}
      <Grid item xs={12} md={6}>
        <TimeSeriesChart
          data={orders}
          filters={filters.timeSeries}
          title='Sales Over Time'
          onFiltersChange={(newFilters) =>
            setFilters((prev) => ({ ...prev, timeSeries: newFilters }))
          }
        />
      </Grid>

      {/* Category Chart */}
      <Grid item xs={12} md={6}>
        <CategoryChart
          data={orders}
          filters={filters.category}
          title='Sales by Category'
          onFiltersChange={(newFilters) =>
            setFilters((prev) => ({ ...prev, category: newFilters }))
          }
        />
      </Grid>

      {/* Distribution Chart */}
      <Grid item xs={12} md={6}>
        <DistributionChart
          data={orders}
          filters={filters.distribution}
          title='Order Distribution'
          onFiltersChange={(newFilters) =>
            setFilters((prev) => ({ ...prev, distribution: newFilters }))
          }
        />
      </Grid>
    </Grid>
  );
};
