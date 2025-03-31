import React from "react";
import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
} from "@mui/material";
import { Order } from "../../types";

interface SourcePerformanceProps {
  orders: Order[];
  sourceTableSort: {
    field: string;
    order: "asc" | "desc";
  };
  onSourceTableSort: (field: string) => void;
}

interface SourceData {
  source: string;
  total: number;
  orders: number;
  averageOrderValue: number;
}

const SourcePerformance: React.FC<SourcePerformanceProps> = ({
  orders,
  sourceTableSort,
  onSourceTableSort,
}) => {
  const prepareSourceData = (orders: Order[]): SourceData[] => {
    const sourceData = orders.reduce((acc, order) => {
      const source = order.source;
      if (!acc[source]) {
        acc[source] = {
          source,
          total: 0,
          orders: 0,
          averageOrderValue: 0,
        };
      }
      acc[source].total += order.total_amount;
      acc[source].orders += 1;
      acc[source].averageOrderValue = acc[source].total / acc[source].orders;
      return acc;
    }, {} as Record<string, SourceData>);

    return Object.values(sourceData);
  };

  const sortSourceData = (data: SourceData[]): SourceData[] => {
    return [...data].sort((a, b) => {
      const aValue = a[sourceTableSort.field as keyof SourceData];
      const bValue = b[sourceTableSort.field as keyof SourceData];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sourceTableSort.order === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sourceTableSort.order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Source Performance
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sourceTableSort.field === "source"}
                  direction={sourceTableSort.order}
                  onClick={() => onSourceTableSort("source")}
                >
                  Source
                </TableSortLabel>
              </TableCell>
              <TableCell align='right'>
                <TableSortLabel
                  active={sourceTableSort.field === "total"}
                  direction={sourceTableSort.order}
                  onClick={() => onSourceTableSort("total")}
                >
                  Total Sales ($)
                </TableSortLabel>
              </TableCell>
              <TableCell align='right'>
                <TableSortLabel
                  active={sourceTableSort.field === "orders"}
                  direction={sourceTableSort.order}
                  onClick={() => onSourceTableSort("orders")}
                >
                  Orders
                </TableSortLabel>
              </TableCell>
              <TableCell align='right'>
                <TableSortLabel
                  active={sourceTableSort.field === "averageOrderValue"}
                  direction={sourceTableSort.order}
                  onClick={() => onSourceTableSort("averageOrderValue")}
                >
                  Avg. Order Value ($)
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortSourceData(prepareSourceData(orders)).map((source) => (
              <TableRow key={source.source}>
                <TableCell>
                  {source.source === "source_a" ? "Shopify" : "Etsy"}
                </TableCell>
                <TableCell align='right'>{source.total.toFixed(2)}</TableCell>
                <TableCell align='right'>{source.orders}</TableCell>
                <TableCell align='right'>
                  {source.averageOrderValue.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default SourcePerformance;
