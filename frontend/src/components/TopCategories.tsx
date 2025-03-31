import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { DashboardStats } from "../types";

interface TopCategoriesProps {
  stats: DashboardStats;
}

const TopCategories: React.FC<TopCategoriesProps> = ({ stats }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Top Categories
      </Typography>
      <List>
        {stats?.topCategories.map((category, index) => (
          <React.Fragment key={category.category}>
            <ListItem>
              <ListItemText
                primary={category.category}
                secondary={`${
                  category.count
                } orders - $${category.total.toFixed(2)}`}
              />
            </ListItem>
            {index < stats?.topCategories.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default TopCategories;
