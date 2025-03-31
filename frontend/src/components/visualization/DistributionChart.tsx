import React, { useMemo } from "react";
import {
  Paper,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Modal,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { Order } from "../../types/index.ts";
import D3Chart from "../D3Chart.tsx";

interface DistributionChartProps {
  orders: Order[];
  categories: string[];
  distributionFilters: {
    metric: "orders" | "amount";
    source: string;
  };
  expandedChart: string | null;
  onDistributionFiltersChange: (filters: {
    metric?: "orders" | "amount";
    source?: string;
  }) => void;
  onExpandedChartChange: (chartId: string | null) => void;
}

const DistributionChart: React.FC<DistributionChartProps> = ({
  orders,
  categories,
  distributionFilters,
  expandedChart,
  onDistributionFiltersChange,
  onExpandedChartChange,
}) => {
  const distributionData = useMemo(() => {
    const sourceFilter = distributionFilters.source;
    const filteredOrders =
      sourceFilter === "all"
        ? orders
        : orders.filter((order) => order.source === sourceFilter);

    if (distributionFilters.metric === "orders") {
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
  }, [orders, distributionFilters, categories]);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90vw",
    height: "90vh",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Sales Distribution</Typography>
          <Box display='flex' gap={2}>
            <FormControl size='small'>
              <InputLabel>Metric</InputLabel>
              <Select
                value={distributionFilters.metric}
                onChange={(e) =>
                  onDistributionFiltersChange({
                    metric: e.target.value as "orders" | "amount",
                  })
                }
                label='Metric'
              >
                <MenuItem value='orders'>Order Count</MenuItem>
                <MenuItem value='amount'>Sales Amount</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small'>
              <InputLabel>Source</InputLabel>
              <Select
                value={distributionFilters.source}
                onChange={(e) =>
                  onDistributionFiltersChange({
                    source: e.target.value as string,
                  })
                }
                label='Source'
              >
                <MenuItem value='all'>All Sources</MenuItem>
                <MenuItem value='source_a'>Shopify</MenuItem>
                <MenuItem value='source_b'>Etsy</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title='Enter Fullscreen'>
              <IconButton onClick={() => onExpandedChartChange("distribution")}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <D3Chart
          data={distributionData}
          title={`${
            distributionFilters.metric === "orders"
              ? "Order Count"
              : "Sales Amount"
          } by Category`}
          type='pie'
          xKey='category'
          yKey='value'
          height={400}
        />
      </Paper>

      <Modal
        open={expandedChart === "distribution"}
        onClose={() => onExpandedChartChange(null)}
        aria-labelledby='modal-sales-distribution'
      >
        <Box sx={modalStyle}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
          >
            <Typography variant='h5'>Sales Distribution</Typography>
            <IconButton
              onClick={() => onExpandedChartChange(null)}
              size='large'
            >
              <FullscreenExitIcon />
            </IconButton>
          </Box>
          <Box flex={1}>
            <D3Chart
              data={distributionData}
              title={`${
                distributionFilters.metric === "orders"
                  ? "Order Count"
                  : "Sales Amount"
              } by Category`}
              type='pie'
              xKey='category'
              yKey='value'
              width={window.innerWidth * 0.85}
              height={window.innerHeight * 0.75}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default DistributionChart;
