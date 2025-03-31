import { Order } from ".";
import React from "react";

export type ChartType = "line" | "area" | "bar" | "pie";
export type SortOrder = "asc" | "desc";

export interface ChartConfig {
  type: ChartType;
}

export interface TableSortConfig {
  field: keyof Order;
  order: SortOrder;
}

export interface TimeSeriesFilters {
  source: "all" | "source_a" | "source_b";
}

export interface CategoryFilters {
  source: "all" | "source_a" | "source_b";
  sortBy: "count" | "amount";
  sortOrder: SortOrder;
}

export interface DistributionFilters {
  source: "all" | "source_a" | "source_b";
  metric: "count" | "amount";
}

export interface GlobalFilters {
  timeSeries: TimeSeriesFilters;
  category: CategoryFilters;
  distribution: DistributionFilters;
}

export interface ChartControlsProps {
  title: string;
  filters: TimeSeriesFilters | CategoryFilters | DistributionFilters;
  chartType?: ChartType;
  onFiltersChange: (filters: any) => void;
  onChartTypeChange?: (type: ChartType) => void;
  onFullscreenToggle: () => void;
}

export interface ChartModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  chart: React.ReactNode;
}

export interface TimeSeriesChartProps {
  data: Order[];
  filters: TimeSeriesFilters;
  title: string;
  onFiltersChange: (filters: TimeSeriesFilters) => void;
}

export interface CategoryChartProps {
  data: Order[];
  filters: CategoryFilters;
  title: string;
  onFiltersChange: (filters: CategoryFilters) => void;
}

export interface DistributionChartProps {
  data: Order[];
  filters: DistributionFilters;
  title: string;
  onFiltersChange: (filters: DistributionFilters) => void;
}

export interface D3ChartData {
  date: string;
  source_a: number;
  source_b: number;
  [key: string]: string | number;
}

export interface D3ChartProps {
  data: any[];
  type: ChartType;
  width: number;
  height: number;
  title?: string;
  xKey?: string;
  yKey?: string;
}
