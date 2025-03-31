import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
} from "@mui/material";
import { Order } from "../types";

interface SalesTableProps {
  orders: Order[];
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
  return (
    <Paper>
      <StyledTableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>Order ID</StyledTableHeaderCell>
              <StyledTableHeaderCell>Source</StyledTableHeaderCell>
              <StyledTableHeaderCell>Date</StyledTableHeaderCell>
              <StyledTableHeaderCell>Product</StyledTableHeaderCell>
              <StyledTableHeaderCell>Category</StyledTableHeaderCell>
              <StyledTableHeaderCell>Quantity</StyledTableHeaderCell>
              <StyledTableHeaderCell>Unit Price</StyledTableHeaderCell>
              <StyledTableHeaderCell>Total Amount</StyledTableHeaderCell>
              <StyledTableHeaderCell>Customer</StyledTableHeaderCell>
              <StyledTableHeaderCell>Country</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <StyledTableRow
                key={`${order.source}-${order.order_id}`}
                source={order.source}
              >
                <TableCell>{order.order_id}</TableCell>
                <TableCell>
                  {order.source === "source_a" ? "Source A" : "Source B"}
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
