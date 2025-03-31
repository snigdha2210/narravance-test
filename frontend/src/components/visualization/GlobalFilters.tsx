import React from "react";
import {
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { formatDateOnlyToEST } from "../../utils/dateUtils.ts";

interface GlobalFiltersProps {
  filters: {
    dateRange: "all" | "30days" | "custom";
    source: string;
    category: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  categories: string[];
  taskStartDate?: string | null;
  taskEndDate?: string | null;
  onFiltersChange: (filters: any) => void;
}

const GlobalFilters: React.FC<GlobalFiltersProps> = ({
  filters,
  categories,
  taskStartDate,
  taskEndDate,
  onFiltersChange,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={filters.dateRange}
              onChange={(e) => {
                const newDateRange = e.target.value as typeof filters.dateRange;
                onFiltersChange({
                  ...filters,
                  dateRange: newDateRange,
                  startDate:
                    newDateRange === "custom" ? filters.startDate : null,
                  endDate: newDateRange === "custom" ? filters.endDate : null,
                });
              }}
              label='Date Range'
            >
              <MenuItem value='all'>All Time</MenuItem>
              <MenuItem value='30days'>Last 30 Days</MenuItem>
              <MenuItem value='custom'>Custom Range</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {filters.dateRange === "custom" && (
          <Grid item xs={12} md={8}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack spacing={2}>
                <Box>
                  <DatePicker
                    label='Start Date'
                    value={filters.startDate}
                    onChange={(newValue) => {
                      onFiltersChange({
                        ...filters,
                        startDate: newValue,
                      });
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                  {taskStartDate && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ ml: 1 }}
                    >
                      Task Selected start date:{" "}
                      {formatDateOnlyToEST(taskStartDate)}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <DatePicker
                    label='End Date'
                    value={filters.endDate}
                    onChange={(newValue) => {
                      onFiltersChange({
                        ...filters,
                        endDate: newValue,
                      });
                    }}
                    minDate={filters.startDate || undefined}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                  {taskEndDate && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ ml: 1 }}
                    >
                      Task Selected end date: {formatDateOnlyToEST(taskEndDate)}
                    </Typography>
                  )}
                </Box>
                {!taskStartDate && !taskEndDate && (
                  <Typography variant='caption' color='text.secondary'>
                    No date range was specified when creating this task
                  </Typography>
                )}
              </Stack>
            </LocalizationProvider>
          </Grid>
        )}

        <Grid item xs={12} md={filters.dateRange === "custom" ? 4 : 4}>
          <FormControl fullWidth>
            <InputLabel>Source</InputLabel>
            <Select
              value={filters.source}
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
        </Grid>

        <Grid item xs={12} md={filters.dateRange === "custom" ? 12 : 4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) =>
                onFiltersChange({ ...filters, category: e.target.value })
              }
              label='Category'
            >
              <MenuItem value='all'>All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GlobalFilters;
