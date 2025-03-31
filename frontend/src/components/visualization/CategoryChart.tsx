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

interface CategoryChartProps {
  orders: Order[];
  categories: string[];
  categoryFilters: {
    source: string;
    sortBy: "amount" | "count";
  };
  expandedChart: string | null;
  onCategoryFiltersChange: (filters: {
    source?: string;
    sortBy?: "amount" | "count";
  }) => void;
  onExpandedChartChange: (chartId: string | null) => void;
}

const CategoryChart: React.FC<CategoryChartProps> = ({
  orders,
  categories,
  categoryFilters,
  expandedChart,
  onCategoryFiltersChange,
  onExpandedChartChange,
}) => {
  const categoryData = useMemo(() => {
    const sourceFilter = categoryFilters.source;
    const filteredOrders =
      sourceFilter === "all"
        ? orders
        : orders.filter((order) => order.source === sourceFilter);

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
        categoryFilters.sortBy === "amount"
          ? b.amount - a.amount
          : b.count - a.count,
      );
  }, [orders, categoryFilters, categories]);

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
          minHeight={40}
          height={56}
        >
          <Box minHeight={32} display='flex' alignItems='center' minWidth={200}>
            <Typography variant='h6'>Sales by Category</Typography>
          </Box>
          <Box display='flex' gap={2}>
            <FormControl size='small' sx={{ width: 120, height: 32 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={categoryFilters.sortBy}
                onChange={(e) =>
                  onCategoryFiltersChange({
                    sortBy: e.target.value as "amount" | "count",
                  })
                }
                label='Sort By'
              >
                <MenuItem value='amount'>Sales Amount</MenuItem>
                <MenuItem value='count'>Order Count</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small' sx={{ width: 120, height: 32 }}>
              <InputLabel>Source</InputLabel>
              <Select
                value={categoryFilters.source}
                onChange={(e) =>
                  onCategoryFiltersChange({
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
              <IconButton onClick={() => onExpandedChartChange("category")}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <D3Chart
          data={categoryData}
          title={`${
            categoryFilters.sortBy === "count" ? "Order Count" : "Sales Amount"
          } by Category`}
          type='bar'
          xKey='category'
          yKey={categoryFilters.sortBy === "amount" ? "amount" : "count"}
          height={400}
        />
      </Paper>

      <Modal
        open={expandedChart === "category"}
        onClose={() => onExpandedChartChange(null)}
        aria-labelledby='modal-sales-by-category'
      >
        <Box sx={modalStyle}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
          >
            <Typography variant='h5'>Sales by Category</Typography>
            <IconButton
              onClick={() => onExpandedChartChange(null)}
              size='large'
            >
              <FullscreenExitIcon />
            </IconButton>
          </Box>
          <Box flex={1}>
            <D3Chart
              data={categoryData}
              title={`${
                categoryFilters.sortBy === "count"
                  ? "Order Count"
                  : "Sales Amount"
              } by Category`}
              type='bar'
              xKey='category'
              yKey={categoryFilters.sortBy === "amount" ? "amount" : "count"}
              width={window.innerWidth * 0.85}
              height={window.innerHeight * 0.75}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default CategoryChart;
