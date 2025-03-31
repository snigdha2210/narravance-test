import React from "react";
import {
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
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { ChartControlsProps } from "../../types/charts";

export const ChartControls: React.FC<ChartControlsProps> = ({
  title,
  filters,
  chartType,
  onFiltersChange,
  onChartTypeChange,
  onFullscreenToggle,
}) => {
  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      mb={2}
    >
      <Typography variant='h6'>{title}</Typography>
      <Box display='flex' gap={2}>
        {filters && (
          <FormControl size='small'>
            <InputLabel>Source</InputLabel>
            <Select
              value={filters.source || "all"}
              onChange={(e) =>
                onFiltersChange({ ...filters, source: e.target.value })
              }
              label='Source'
            >
              <MenuItem value='all'>All Sources</MenuItem>
              <MenuItem value='source_a'>Shopify</MenuItem>
              <MenuItem value='source_b'>Etsy</MenuItem>
            </Select>
          </FormControl>
        )}
        {onChartTypeChange && (
          <ButtonGroup size='small'>
            <Button
              onClick={() => onChartTypeChange("line")}
              variant={chartType === "line" ? "contained" : "outlined"}
            >
              Line
            </Button>
            <Button
              onClick={() => onChartTypeChange("area")}
              variant={chartType === "area" ? "contained" : "outlined"}
            >
              Area
            </Button>
            <Button
              onClick={() => onChartTypeChange("bar")}
              variant={chartType === "bar" ? "contained" : "outlined"}
            >
              Bar
            </Button>
          </ButtonGroup>
        )}
        <Tooltip title='Enter Fullscreen'>
          <IconButton onClick={onFullscreenToggle}>
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
