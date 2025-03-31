import React, { useState } from "react";
import { Box, Paper } from "@mui/material";
import { ChartControls } from "./ChartControls.tsx";
import { ChartModal } from "./ChartModal.tsx";
import { CategoryChartProps, ChartType } from "../../types/charts.ts";
import { prepareCategoryData } from "../../utils/chartData.ts";
import D3Chart from "../D3Chart.tsx";

export const CategoryChart: React.FC<CategoryChartProps> = ({
  data,
  filters,
  title,
  onFiltersChange,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartType, setChartType] = useState<ChartType>("bar");

  const processedData = prepareCategoryData(data, filters);

  const chart = (
    <D3Chart
      data={processedData}
      type={chartType}
      width={isFullscreen ? window.innerWidth * 0.8 : 400}
      height={isFullscreen ? window.innerHeight * 0.7 : 300}
      title={title}
      xKey='category'
      yKey={filters.sortBy === "amount" ? "amount" : "count"}
    />
  );

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <ChartControls
        title={title}
        filters={filters}
        chartType={chartType}
        onFiltersChange={onFiltersChange}
        onChartTypeChange={(type: ChartType) => setChartType(type)}
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
