import React from "react";
import { List, ListItem, ListItemText, Divider } from "@mui/material";
import { TopCountry } from "../types";

interface TopCountriesChartProps {
  countries: TopCountry[];
}

export default function TopCountriesChart({
  countries,
}: TopCountriesChartProps) {
  return (
    <List>
      {countries.map((country, index) => (
        <React.Fragment key={country.country}>
          <ListItem>
            <ListItemText
              primary={country.country}
              secondary={`${
                country.orderCount
              } orders - $${country.totalSales.toFixed(2)}`}
            />
          </ListItem>
          {index < countries.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}
