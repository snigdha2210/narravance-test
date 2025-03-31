import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  TableSortLabel,
  Button,
  Box,
} from "@mui/material";
import { Order } from "../types";
import DownloadIcon from "@mui/icons-material/Download";

interface SalesTableProps {
  orders: Order[];
}

// Add type for sort order
type SortOrder = "asc" | "desc";

// Add interface for table sorting
interface TableSortConfig {
  field: keyof Order;
  order: SortOrder;
}

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: "bold",
  // Make header sticky
  position: "sticky",
  top: 0,
  zIndex: 1,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  "maxHeight": 400,
  "overflow": "auto",
  // Add shadow to indicate scrollable content
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.grey[100],
  },
  "&::-webkit-scrollbar-thumb": {
    "backgroundColor": theme.palette.grey[400],
    "borderRadius": "4px",
    "&:hover": {
      backgroundColor: theme.palette.grey[500],
    },
  },
}));

const StyledTableRow = styled(TableRow)<{ source: string }>(
  ({ theme, source }) => ({
    "backgroundColor":
      source === "source_a"
        ? theme.palette.sourceA.background
        : theme.palette.sourceB.background,
    "&:hover": {
      backgroundColor:
        source === "source_a"
          ? theme.palette.sourceA.light
          : theme.palette.sourceB.light,
      opacity: 0.9,
    },
  }),
);

const SalesTable: React.FC<SalesTableProps> = ({ orders }) => {
  // Add state for sorting
  const [sortConfig, setSortConfig] = useState<TableSortConfig>({
    field: "order_date",
    order: "desc",
  });

  // Add sorting function
  const handleSort = (field: keyof Order) => {
    setSortConfig({
      field,
      order:
        sortConfig.field === field && sortConfig.order === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Add sorting logic
  const sortedOrders = [...orders].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.order === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle dates
    if (sortConfig.field === "order_date") {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      return sortConfig.order === "asc" ? aDate - bDate : bDate - aDate;
    }

    return 0;
  });

  // Add CSV export function
  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Order ID",
      "Source",
      "Date",
      "Product",
      "Category",
      "Quantity",
      "Unit Price",
      "Total Amount",
      "Customer",
      "Country",
    ];

    // Convert orders to CSV rows
    const csvRows = sortedOrders.map((order) => [
      order.order_id,
      order.source === "source_a" ? "Shopify" : "Etsy",
      new Date(order.order_date).toLocaleString(),
      order.product_name,
      order.product_category,
      order.quantity,
      order.unit_price.toFixed(2),
      order.total_amount.toFixed(2),
      order.customer_id,
      order.customer_country,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales_data_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper>
      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant='contained'
          startIcon={<DownloadIcon />}
          onClick={exportToCSV}
          color='primary'
        >
          Export to CSV
        </Button>
      </Box>
      <StyledTableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "order_id"}
                  direction={
                    sortConfig.field === "order_id" ? sortConfig.order : "asc"
                  }
                  onClick={() => handleSort("order_id")}
                >
                  Order ID
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "source"}
                  direction={
                    sortConfig.field === "source" ? sortConfig.order : "asc"
                  }
                  onClick={() => handleSort("source")}
                >
                  Source
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "order_date"}
                  direction={
                    sortConfig.field === "order_date" ? sortConfig.order : "asc"
                  }
                  onClick={() => handleSort("order_date")}
                >
                  Date
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "product_name"}
                  direction={
                    sortConfig.field === "product_name"
                      ? sortConfig.order
                      : "asc"
                  }
                  onClick={() => handleSort("product_name")}
                >
                  Product
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "product_category"}
                  direction={
                    sortConfig.field === "product_category"
                      ? sortConfig.order
                      : "asc"
                  }
                  onClick={() => handleSort("product_category")}
                >
                  Category
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "quantity"}
                  direction={
                    sortConfig.field === "quantity" ? sortConfig.order : "asc"
                  }
                  onClick={() => handleSort("quantity")}
                >
                  Quantity
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "unit_price"}
                  direction={
                    sortConfig.field === "unit_price" ? sortConfig.order : "asc"
                  }
                  onClick={() => handleSort("unit_price")}
                >
                  Unit Price
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "total_amount"}
                  direction={
                    sortConfig.field === "total_amount"
                      ? sortConfig.order
                      : "asc"
                  }
                  onClick={() => handleSort("total_amount")}
                >
                  Total Amount
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "customer_id"}
                  direction={
                    sortConfig.field === "customer_id"
                      ? sortConfig.order
                      : "asc"
                  }
                  onClick={() => handleSort("customer_id")}
                >
                  Customer
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "customer_country"}
                  direction={
                    sortConfig.field === "customer_country"
                      ? sortConfig.order
                      : "asc"
                  }
                  onClick={() => handleSort("customer_country")}
                >
                  Country
                </TableSortLabel>
              </StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedOrders.map((order) => (
              <StyledTableRow
                key={`${order.source}-${order.order_id}`}
                source={order.source}
              >
                <TableCell>{order.order_id}</TableCell>
                <TableCell>
                  {order.source === "source_a" ? "Shopify" : "Etsy"}
                </TableCell>
                <TableCell>
                  {new Date(order.order_date).toLocaleString()}
                </TableCell>
                <TableCell>{order.product_name}</TableCell>
                <TableCell>{order.product_category}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>${order.unit_price.toFixed(2)}</TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>{order.customer_id}</TableCell>
                <TableCell>{order.customer_country}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Paper>
  );
};

export default SalesTable;
