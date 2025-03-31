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
import { Order } from "../types";

interface SalesTableProps {
  orders: Order[];
}

export default function SalesTable({ orders }: SalesTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell align='right'>Unit Price</TableCell>
            <TableCell align='right'>Total Amount</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Country</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.order_id}</TableCell>
              <TableCell>{order.source}</TableCell>
              <TableCell>
                {new Date(order.order_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{order.product_name}</TableCell>
              <TableCell>{order.product_category}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell align='right'>
                ${order.unit_price.toFixed(2)}
              </TableCell>
              <TableCell align='right'>
                ${order.total_amount.toFixed(2)}
              </TableCell>
              <TableCell>{order.customer_id}</TableCell>
              <TableCell>{order.customer_country}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
