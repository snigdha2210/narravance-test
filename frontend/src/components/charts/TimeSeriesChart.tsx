import React, { useState } from "react";
import { Box, Paper } from "@mui/material";
import { ChartControls } from "./ChartControls.tsx";
import { ChartModal } from "./ChartModal.tsx";
import { TimeSeriesChartProps, ChartType } from "../../types/charts.ts";
import { prepareTimeSeriesData } from "../../utils/chartData.ts";
import D3Chart from "../D3Chart.tsx";

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  filters,
  title,
  onFiltersChange,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line");

  const processedData = prepareTimeSeriesData(data, filters);

  const chart = (
    <D3Chart
      data={processedData}
      type={chartType}
      width={isFullscreen ? window.innerWidth * 0.8 : 400}
      height={isFullscreen ? window.innerHeight * 0.7 : 300}
      title={title}
      xKey='date'
      yKey='value'
    />
  );

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <ChartControls
        title={title}
        filters={filters}
        chartType={chartType}
        onFiltersChange={onFiltersChange}
        onChartTypeChange={(type: ChartType) => {
          if (type === "line" || type === "area" || type === "bar") {
            setChartType(type);
          }
        }}
        onFullscreenToggle={() => setIsFullscreen(true)}
      />
      <Box sx={{ mt: 2 }}>{chart}</Box>
      <ChartModal
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={title}
        chart={chart}
      />
    </Paper>
  );
};
