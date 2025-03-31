import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  SelectChangeEvent,
} from "@mui/material";
import axios from "axios";

interface TaskFormData {
  name: string;
  etsy_params: {
    start_date: string;
    end_date: string;
    categories: string[];
  };
  shopify_params: {
    start_date: string;
    end_date: string;
    categories: string[];
  };
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
}

const PRODUCT_CATEGORIES = [
  "Jewelry",
  "Clothing",
  "Accessories",
  "Home & Living",
  "Art",
  "Craft Supplies",
  "Vintage",
];

const TaskCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TaskFormData>({
    name: "",
    etsy_params: {
      start_date: "",
      end_date: "",
      categories: [],
    },
    shopify_params: {
      start_date: "",
      end_date: "",
      categories: [],
    },
    title: "",
    description: "",
    status: "pending",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/tasks/", formData);
      navigate("/");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData((prev) => ({ ...prev, title: value }));
    } else if (name === "description") {
      setFormData((prev) => ({ ...prev, description: value }));
    }
  };

  const handleCategoryChange =
    (source: "etsy" | "shopify") =>
    (e: React.ChangeEvent<{ value: unknown }>) => {
      const params =
        source === "etsy" ? formData.etsy_params : formData.shopify_params;
      setFormData((prev) => ({
        ...prev,
        [`${source}_params`]: {
          ...params,
          categories: e.target.value as string[],
        },
      }));
    };

  const handleStatusChange = (e: SelectChangeEvent<TaskFormData["status"]>) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value as TaskFormData["status"],
    }));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Create New Task
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label='Title'
            name='title'
            value={formData.title}
            onChange={handleTextChange}
            margin='normal'
            required
          />
          <TextField
            fullWidth
            label='Description'
            name='description'
            value={formData.description}
            onChange={handleTextChange}
            margin='normal'
            multiline
            rows={4}
            required
          />
          <FormControl fullWidth margin='normal'>
            <InputLabel>Status</InputLabel>
            <Select
              name='status'
              value={formData.status}
              onChange={handleStatusChange}
              label='Status'
            >
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='in_progress'>In Progress</MenuItem>
              <MenuItem value='completed'>Completed</MenuItem>
            </Select>
          </FormControl>
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
        </form>
      </Paper>
    </Box>
  );
};

export default TaskCreate;
