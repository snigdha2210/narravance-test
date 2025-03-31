import React from "react";
import { List, ListItem, ListItemText, Divider } from "@mui/material";
import { TopCategory } from "../types";

interface TopCategoriesChartProps {
  categories: TopCategory[];
}

export default function TopCategoriesChart({
  categories,
}: TopCategoriesChartProps) {
  return (
    <List>
      {categories.map((category, index) => (
        <React.Fragment key={category.category}>
          <ListItem>
            <ListItemText
              primary={category.category}
              secondary={`${
                category.orderCount
              } orders - $${category.totalSales.toFixed(2)}`}
            />
          </ListItem>
          {index < categories.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}
