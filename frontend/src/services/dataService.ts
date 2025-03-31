import axios from "axios";

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

export const fetchAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await axios.get("http://localhost:8000/api/orders/");
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

export const calculateDashboardStats = (orders: Order[]): DashboardStats => {
  const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const sourceAOrders = orders.filter((order) => order.source === "source_a");
  const sourceBOrders = orders.filter((order) => order.source === "source_b");
  const totalSourceA = sourceAOrders.reduce(
    (sum, order) => sum + order.total_amount,
    0,
  );
  const totalSourceB = sourceBOrders.reduce(
    (sum, order) => sum + order.total_amount,
    0,
  );

  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Calculate date range
  const dates = orders.map((order) => new Date(order.order_date));
  const dateRange = {
    start: new Date(Math.min(...dates.map((d) => d.getTime())))
      .toISOString()
      .split("T")[0],
    end: new Date(Math.max(...dates.map((d) => d.getTime())))
      .toISOString()
      .split("T")[0],
  };

  // Calculate top categories
  const categoryStats = orders.reduce((acc, order) => {
    if (!acc[order.product_category]) {
      acc[order.product_category] = { total: 0, count: 0 };
    }
    acc[order.product_category].total += order.total_amount;
    acc[order.product_category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const topCategories = Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Calculate top countries
  const countryStats = orders.reduce((acc, order) => {
    if (!acc[order.customer_country]) {
      acc[order.customer_country] = { total: 0, count: 0 };
    }
    acc[order.customer_country].total += order.total_amount;
    acc[order.customer_country].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const topCountries = Object.entries(countryStats)
    .map(([country, stats]) => ({
      country,
      total: stats.total,
      count: stats.count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    totalSales,
    totalOrders,
    sourceAOrders: sourceAOrders.length,
    sourceBOrders: sourceBOrders.length,
    totalSourceA,
    totalSourceB,
    averageOrderValue,
    topCategories,
    topCountries,
    dateRange,
  };
};
