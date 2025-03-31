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

interface TopCountriesProps {
  stats: DashboardStats;
}

const TopCountries: React.FC<TopCountriesProps> = ({ stats }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Top Countries
      </Typography>
      <List>
        {stats?.topCountries.map((country, index) => (
          <React.Fragment key={country.country}>
            <ListItem>
              <ListItemText
                primary={country.country}
                secondary={`${country.count} orders - $${country.total.toFixed(
                  2,
                )}`}
              />
            </ListItem>
            {index < stats?.topCountries.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default TopCountries;
