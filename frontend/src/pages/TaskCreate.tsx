import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import axios from "axios";
import { TaskFormData } from "../types";

const SOURCE_A_CATEGORIES = [
  "Jewelry",
  "Clothing",
  "Accessories",
  "Home & Living",
  "Art",
  "Craft Supplies",
  "Vintage",
];

const SOURCE_B_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Sports",
  "Books",
];

const TaskCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    date_from: null,
    date_to: null,
    source_a_enabled: true,
    source_b_enabled: true,
    source_a_filters: {
      categories: [],
    },
    source_b_filters: {
      categories: [],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/tasks/", {
        ...formData,
        date_from: formData.date_from?.toISOString(),
        date_to: formData.date_to?.toISOString(),
      });
      navigate("/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSourceToggle = (source: "source_a" | "source_b") => {
    setFormData((prev) => ({
      ...prev,
      [`${source}_enabled`]: !prev[`${source}_enabled`],
    }));
  };

  const handleCategoryChange = (
    source: "source_a" | "source_b",
    categories: string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [`${source}_filters`]: {
        ...prev[`${source}_filters`],
        categories,
      },
    }));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Create New Task
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Title'
                name='title'
                value={formData.title}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                name='description'
                value={formData.description}
                onChange={handleTextChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label='Date From'
                value={formData.date_from}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, date_from: date }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label='Date To'
                value={formData.date_to}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, date_to: date }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant='h6' gutterBottom>
                Data Sources
              </Typography>
            </Grid>

            {/* Source A Configuration */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.source_a_enabled}
                        onChange={() => handleSourceToggle("source_a")}
                      />
                    }
                    label='Enable Source A (Etsy)'
                  />
                </FormGroup>
                {formData.source_a_enabled && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Categories</InputLabel>
                    <Select
                      multiple
                      value={formData.source_a_filters.categories}
                      onChange={(e) =>
                        handleCategoryChange(
                          "source_a",
                          e.target.value as string[],
                        )
                      }
                      label='Categories'
                    >
                      {SOURCE_A_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Paper>
            </Grid>

            {/* Source B Configuration */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.source_b_enabled}
                        onChange={() => handleSourceToggle("source_b")}
                      />
                    }
                    label='Enable Source B (Shopify)'
                  />
                </FormGroup>
                {formData.source_b_enabled && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Categories</InputLabel>
                    <Select
                      multiple
                      value={formData.source_b_filters.categories}
                      onChange={(e) =>
                        handleCategoryChange(
                          "source_b",
                          e.target.value as string[],
                        )
                      }
                      label='Categories'
                    >
                      {SOURCE_B_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  size='large'
                >
                  Create Task
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  size='large'
                  onClick={() => navigate("/tasks")}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskCreate;
