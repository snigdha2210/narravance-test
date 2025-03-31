import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { DashboardStats as Stats } from "../types";

interface DashboardStatsProps {
  stats: Stats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
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
          <Typography variant='body2' color='text.secondary'>
            {stats.totalOrders} orders
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6'>Source A Sales</Typography>
          <Typography variant='h4'>${stats.totalSourceA.toFixed(2)}</Typography>
          <Typography variant='body2'>{stats.sourceAOrders} orders</Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6'>Source B Sales</Typography>
          <Typography variant='h4'>${stats.totalSourceB.toFixed(2)}</Typography>
          <Typography variant='body2'>{stats.sourceBOrders} orders</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};
