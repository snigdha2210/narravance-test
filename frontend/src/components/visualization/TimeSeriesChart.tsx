import React from "react";
import {
  Paper,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Button,
  IconButton,
  Tooltip,
  Modal,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { Order } from "../../types/index.ts";
import D3Chart from "../D3Chart.tsx";

interface TimeSeriesChartProps {
  orders: Order[];
  timeSeriesFilters: {
    sources: string[];
  };
  chartConfig: {
    type: "line" | "area" | "bar";
  };
  dateRange: {
    start: Date;
    end: Date;
  };
  expandedChart: string | null;
  onTimeSeriesFiltersChange: (filters: { sources: string[] }) => void;
  onChartConfigChange: (config: { type: "line" | "area" | "bar" }) => void;
  onExpandedChartChange: (chartId: string | null) => void;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  orders,
  timeSeriesFilters,
  chartConfig,
  dateRange,
  expandedChart,
  onTimeSeriesFiltersChange,
  onChartConfigChange,
  onExpandedChartChange,
}) => {
  const prepareTimeSeriesData = (orders: Order[]) => {
    const timeSeriesData = orders.map((order) => ({
      date: new Date(order.order_date),
      amount: order.total_amount,
      source: order.source,
    }));

    timeSeriesData.sort((a, b) => a.date.getTime() - b.date.getTime());

    const groupedData = timeSeriesData.reduce((acc, curr) => {
      const date = curr.date.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          source_a: 0,
          source_b: 0,
        };
      }
      if (curr.source === "source_a") {
        acc[date].source_a += curr.amount;
      } else if (curr.source === "source_b") {
        acc[date].source_b += curr.amount;
      }
      return acc;
    }, {} as Record<string, { date: string; source_a: number; source_b: number }>);

    return Object.values(groupedData);
  };

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

  const data = prepareTimeSeriesData(orders);

  return (
    <>
      <Paper sx={{ p: 2, position: "relative" }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h6'>Sales Over Time</Typography>
          <Box display='flex' gap={2} alignItems='center'>
            <FormControl size='small' sx={{ width: 120, height: 32 }}>
              <InputLabel>Source</InputLabel>
              <Select
                value={
                  timeSeriesFilters.sources.length === 2
                    ? "all"
                    : timeSeriesFilters.sources[0]
                }
                onChange={(e) => {
                  const value = e.target.value;
                  onTimeSeriesFiltersChange({
                    sources:
                      value === "all"
                        ? ["source_a", "source_b"]
                        : [value as string],
                  });
                }}
                label='Source'
              >
                <MenuItem value='all'>All Sources</MenuItem>
                <MenuItem value='source_a'>Shopify</MenuItem>
                <MenuItem value='source_b'>Etsy</MenuItem>
              </Select>
            </FormControl>
            <ButtonGroup size='small'>
              <Button
                onClick={() => onChartConfigChange({ type: "line" })}
                variant={chartConfig.type === "line" ? "contained" : "outlined"}
              >
                Line
              </Button>
              <Button
                onClick={() => onChartConfigChange({ type: "area" })}
                variant={chartConfig.type === "area" ? "contained" : "outlined"}
              >
                Area
              </Button>
              <Button
                onClick={() => onChartConfigChange({ type: "bar" })}
                variant={chartConfig.type === "bar" ? "contained" : "outlined"}
              >
                Bar
              </Button>
            </ButtonGroup>
            <Tooltip title='Enter Fullscreen'>
              <IconButton onClick={() => onExpandedChartChange("timeSeries")}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <D3Chart
          data={data}
          title='Sales Over Time'
          type={chartConfig.type}
          xKey='date'
          yKey={timeSeriesFilters.sources}
          width={800}
          height={400}
          dateRange={dateRange}
        />
      </Paper>

      <Modal
        open={expandedChart === "timeSeries"}
        onClose={() => onExpandedChartChange(null)}
        aria-labelledby='modal-sales-over-time'
      >
        <Box sx={modalStyle}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
          >
            <Typography variant='h5'>Sales Over Time</Typography>
            <IconButton
              onClick={() => onExpandedChartChange(null)}
              size='large'
            >
              <FullscreenExitIcon />
            </IconButton>
          </Box>
          <Box flex={1}>
            <D3Chart
              data={data}
              title='Sales Over Time'
              type={chartConfig.type}
              xKey='date'
              yKey={timeSeriesFilters.sources}
              width={window.innerWidth * 0.85}
              height={window.innerHeight * 0.75}
              dateRange={dateRange}
            />
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default TimeSeriesChart;
