import React from "react";
import { Order } from "../types";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

interface CategorySummaryProps {
  orders: Order[];
}

const CategorySummary: React.FC<CategorySummaryProps> = ({ orders }) => {
  const categoryStats = orders.reduce((acc, order) => {
    const category = order.product_category;
    if (!acc[category]) {
      acc[category] = {
        count: 0,
        total: 0,
        products: new Set(),
      };
    }
    acc[category].count += order.quantity;
    acc[category].total += order.total_amount;
    acc[category].products.add(order.product_name);
    return acc;
  }, {} as Record<string, { count: number; total: number; products: Set<string> }>);

  const sortedCategories = Object.entries(categoryStats).sort(
    ([, a], [, b]) => b.total - a.total,
  );

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant='h6' gutterBottom>
        Category Summary
      </Typography>
      <List>
        {sortedCategories.map(([category, stats], index) => (
          <React.Fragment key={category}>
            <ListItem>
              <ListItemText
                primary={category}
                secondary={`${stats.products.size} unique products, ${stats.count} items sold`}
              />
              <Typography variant='body2' color='text.secondary'>
                ${stats.total.toFixed(2)}
              </Typography>
            </ListItem>
            {index < sortedCategories.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default CategorySummary;
