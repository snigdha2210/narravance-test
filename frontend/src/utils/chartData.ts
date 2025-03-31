import { Order } from "../types";
import {
  CategoryFilters,
  DistributionFilters,
  TimeSeriesFilters,
  D3ChartData,
} from "../types/charts";

export const prepareTimeSeriesData = (
  orders: Order[],
  filters: TimeSeriesFilters,
): D3ChartData[] => {
  const filteredOrders = orders.filter((order) => {
    if (filters.source === "all") return true;
    return order.source === filters.source;
  });

  const dataByDate: Record<string, D3ChartData> = {};

  filteredOrders.forEach((order) => {
    const date = order.order_date.split("T")[0];
    if (!dataByDate[date]) {
      dataByDate[date] = {
        date,
        source_a: 0,
        source_b: 0,
      };
    }
    if (order.source === "source_a") {
      dataByDate[date].source_a += order.total_amount;
    } else if (order.source === "source_b") {
      dataByDate[date].source_b += order.total_amount;
    }
  });

  return Object.values(dataByDate).sort((a, b) => a.date.localeCompare(b.date));
};

export const prepareCategoryData = (
  orders: Order[],
  filters: CategoryFilters,
) => {
  const sourceFilter = filters.source;
  const filteredOrders =
    sourceFilter === "all"
      ? orders
      : orders.filter((order) => order.source === sourceFilter);

  const categories = Array.from(
    new Set(orders.map((order) => order.product_category)),
  );

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
      filters.sortBy === "amount" ? b.amount - a.amount : b.count - a.count,
    );
};

export const prepareDistributionData = (
  orders: Order[],
  filters: DistributionFilters,
) => {
  const sourceFilter = filters.source;
  const filteredOrders =
    sourceFilter === "all"
      ? orders
      : orders.filter((order) => order.source === sourceFilter);

  const categories = Array.from(
    new Set(orders.map((order) => order.product_category)),
  );

  if (filters.metric === "count") {
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
};
