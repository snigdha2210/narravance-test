import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { DashboardStats } from "../types";

interface SummaryCardsProps {
  stats: DashboardStats;
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6'>Total Sales</Typography>
          <Typography variant='h4'>${stats.totalSales.toFixed(2)}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {stats.totalOrders} orders
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6'>Average Order Value</Typography>
          <Typography variant='h4'>
            ${stats.averageOrderValue.toFixed(2)}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6'>Top Category</Typography>
          <Typography variant='h4'>
            {stats.topCategories[0]?.category || "N/A"}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            ${stats.topCategories[0]?.totalSales.toFixed(2) || "0.00"} in sales
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6'>Top Country</Typography>
          <Typography variant='h4'>
            {stats.topCountries[0]?.country || "N/A"}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            ${stats.topCountries[0]?.totalSales.toFixed(2) || "0.00"} in sales
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
