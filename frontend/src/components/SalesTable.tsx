import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Order } from "../types";

const StyledTableRow = styled(TableRow)<{ source: string }>(
  ({ theme, source }) => ({
    "backgroundColor":
      source === "source_a"
        ? alpha("#8884d8", 0.1) // Shopify green with opacity
        : source === "source_b"
        ? alpha("#82ca9d", 0.1) // Etsy pink with opacity
        : "inherit",
    "&:hover": {
      backgroundColor:
        source === "source_a"
          ? alpha("#8884d8", 0.2)
          : source === "source_b"
          ? alpha("#82ca9d", 0.2)
          : theme.palette.action.hover,
    },
  }),
);

interface SalesTableProps {
  orders: Order[];
}
const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: "bold",
}));

const SalesTable: React.FC<SalesTableProps> = ({ orders }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableHeaderCell>Source</StyledTableHeaderCell>
            <StyledTableHeaderCell>Order ID</StyledTableHeaderCell>
            <StyledTableHeaderCell>Date</StyledTableHeaderCell>
            <StyledTableHeaderCell>Product</StyledTableHeaderCell>
            <StyledTableHeaderCell>Category</StyledTableHeaderCell>
            <StyledTableHeaderCell align='right'>
              Quantity
            </StyledTableHeaderCell>
            <StyledTableHeaderCell align='right'>
              Unit Price
            </StyledTableHeaderCell>
            <StyledTableHeaderCell align='right'>Total</StyledTableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <StyledTableRow key={order.id} source={order.source}>
              <TableCell>
                {order.source === "source_a" ? "Shopify" : "Etsy"}
              </TableCell>
              <TableCell>{order.order_id}</TableCell>
              <TableCell>
                {new Date(order.order_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{order.product_name}</TableCell>
              <TableCell>{order.product_category}</TableCell>
              <TableCell align='right'>{order.quantity}</TableCell>
              <TableCell align='right'>
                ${order.unit_price.toFixed(2)}
              </TableCell>
              <TableCell align='right'>
                ${order.total_amount.toFixed(2)}
              </TableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SalesTable;
