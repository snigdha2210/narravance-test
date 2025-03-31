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

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topCategories: TopCategory[];
  topCountries: TopCountry[];
  dateRange: {
    start: Date;
    end: Date;
  };
}
