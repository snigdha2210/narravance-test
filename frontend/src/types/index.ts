export interface Order {
  id: number;
  task_id: number;
  source: string;
  order_id: string;
  order_date: string;
  product_name: string;
  product_category: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  customer_id: string;
  customer_country: string;
  source_specific_data: string;
}
export interface EcommerceSale {
  id: string;
  orderId: string;
  platform: "Etsy" | "Shopify";
  productName: string;
  category: string;
  price: number;
  quantity: number;
  totalAmount: number;
  date: string;
  customerCountry: string;
  status: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  sourceAOrders: number;
  sourceBOrders: number;
  totalSourceA: number;
  totalSourceB: number;
  averageOrderValue: number;
  topCategories: Array<{ category: string; total: number; count: number }>;
  topCountries: Array<{ country: string; total: number; count: number }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  completed_at: string;
  date_from: string;
  date_to: string;
  source_a_enabled: boolean;
  source_b_enabled: boolean;
  source_a_filters: {
    categories: string[];
    min_price?: number;
    max_price?: number;
  };
  source_b_filters: {
    categories: string[];
    min_price?: number;
    max_price?: number;
  };
}

export interface TaskFormData {
  title: string;
  description: string;
  date_from: Date | null;
  date_to: Date | null;
  source_a_enabled: boolean;
  source_b_enabled: boolean;
  source_a_filters: {
    categories: string[];
    min_price?: number;
    max_price?: number;
  };
  source_b_filters: {
    categories: string[];
    min_price?: number;
    max_price?: number;
  };
}
export type TaskResponse = Order[];
export interface TopCategory {
  category: string;
  orderCount: number;
  totalSales: number;
}

export interface TopCountry {
  country: string;
  orderCount: number;
  totalSales: number;
}

// frontend/src/types/charts.ts
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
  sources: string[];
}

export interface CategoryFilters {
  source: string;
  sortBy: "amount" | "count";
}

export interface DistributionFilters {
  metric: "orders" | "amount";
  source: string;
}

export interface GlobalFilters {
  dateRange: "all" | "30days" | "custom";
  source: string;
  category: string;
  startDate: Date | null;
  endDate: Date | null;
}
