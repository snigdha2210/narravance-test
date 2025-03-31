import axios from "axios";
import { Task, TaskResponse } from "../types";
import { DashboardStats } from "../types";
import { Order } from "../types";

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

  // Calculate date range with proper validation
  let dateRange = {
    start: "N/A",
    end: "N/A",
  };

  if (orders.length > 0) {
    const validDates = orders
      .map((order) => {
        try {
          const date = new Date(order.order_date);
          return isNaN(date.getTime()) ? null : date;
        } catch {
          return null;
        }
      })
      .filter((date): date is Date => date !== null);

    if (validDates.length > 0) {
      const minDate = new Date(Math.min(...validDates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...validDates.map((d) => d.getTime())));

      dateRange = {
        start: minDate.toISOString().split("T")[0],
        end: maxDate.toISOString().split("T")[0],
      };
    }
  }

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

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch("http://localhost:8000/api/tasks/");
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const fetchOrdersByTaskId = async (taskId: number): Promise<Order[]> => {
  try {
    const response = await axios.get<TaskResponse>(
      `http://localhost:8000/api/tasks/${taskId}/data`,
    );
    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return []; // Return empty array for 404 errors
    }
    console.error("Error fetching task data:", error);
    throw error;
  }
};
