import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { EcommerceSale } from "../services/dataService";

interface SalesTableProps {
  sales: EcommerceSale[];
}

const SalesTable: React.FC<SalesTableProps> = ({ sales }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Platform</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align='right'>Price</TableCell>
            <TableCell align='right'>Quantity</TableCell>
            <TableCell align='right'>Total</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.orderId}</TableCell>
              <TableCell>
                <Chip
                  label={sale.platform}
                  color={sale.platform === "Etsy" ? "primary" : "secondary"}
                  size='small'
                />
              </TableCell>
              <TableCell>{sale.productName}</TableCell>
              <TableCell>{sale.category}</TableCell>
              <TableCell align='right'>${sale.price.toFixed(2)}</TableCell>
              <TableCell align='right'>{sale.quantity}</TableCell>
              <TableCell align='right'>
                ${sale.totalAmount.toFixed(2)}
              </TableCell>
              <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
              <TableCell>{sale.customerCountry}</TableCell>
              <TableCell>
                <Chip
                  label={sale.status}
                  color={
                    sale.status === "Completed"
                      ? "success"
                      : sale.status === "Processing"
                      ? "warning"
                      : "info"
                  }
                  size='small'
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SalesTable;
