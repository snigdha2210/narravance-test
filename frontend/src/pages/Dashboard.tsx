import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  EcommerceSale,
  fetchEtsyData,
  fetchShopifyData,
} from "../services/dataService.ts";
import SalesTable from "../components/SalesTable.tsx";

const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<EcommerceSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [etsyData, shopifyData] = await Promise.all([
          fetchEtsyData(),
          fetchShopifyData(),
        ]);
        setSales([...etsyData, ...shopifyData]);
      } catch (err) {
        setError("Failed to fetch sales data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStats = () => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalOrders = sales.length;
    const etsySales = sales.filter((sale) => sale.platform === "Etsy");
    const shopifySales = sales.filter((sale) => sale.platform === "Shopify");
    const totalEtsy = etsySales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );
    const totalShopify = shopifySales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0,
    );

    return {
      totalSales,
      totalOrders,
      etsyOrders: etsySales.length,
      shopifyOrders: shopifySales.length,
      totalEtsy,
      totalShopify,
    };
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <Typography color='error'>{error}</Typography>
      </Box>
    );
  }

  const stats = calculateStats();

  return (
    <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
      <Typography variant='h4' gutterBottom>
        E-commerce Sales Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Total Sales</Typography>
            <Typography variant='h4'>${stats.totalSales.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Total Orders</Typography>
            <Typography variant='h4'>{stats.totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Etsy Sales</Typography>
            <Typography variant='h4'>${stats.totalEtsy.toFixed(2)}</Typography>
            <Typography variant='body2'>{stats.etsyOrders} orders</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6'>Shopify Sales</Typography>
            <Typography variant='h4'>
              ${stats.totalShopify.toFixed(2)}
            </Typography>
            <Typography variant='body2'>
              {stats.shopifyOrders} orders
            </Typography>
          </Paper>
        </Grid>

        {/* Sales Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Sales Details
            </Typography>
            <SalesTable sales={sales} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
