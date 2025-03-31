import React from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  styled,
  Box,
  Button,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Order } from "../../types/index.ts";
import { formatDateToEST } from "../../utils/dateUtils.ts";

interface DetailedDataTableProps {
  orders: Order[];
  sortConfig: {
    field: keyof Order;
    order: "asc" | "desc";
  };
  onSort: (field: keyof Order) => void;
  onExportCSV: () => void;
}

interface StyledTableRowProps {
  source: "source_a" | "source_b";
}

const StyledTableRow = styled(TableRow)<StyledTableRowProps>(
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

const StyledTableHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: "bold",
}));

const DetailedDataTable: React.FC<DetailedDataTableProps> = ({
  orders,
  sortConfig,
  onSort,
  onExportCSV,
}) => {
  const sortData = (data: Order[]) => {
    return [...data].sort((a, b) => {
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

      if (sortConfig.field === "order_date") {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortConfig.order === "asc" ? aDate - bDate : bDate - aDate;
      }

      return 0;
    });
  };

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant='contained'
          onClick={onExportCSV}
          startIcon={<FileDownloadIcon />}
        >
          Export CSV
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "order_id"}
                  direction={sortConfig.order}
                  onClick={() => onSort("order_id")}
                >
                  Order ID
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "order_date"}
                  direction={sortConfig.order}
                  onClick={() => onSort("order_date")}
                >
                  Date
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "total_amount"}
                  direction={sortConfig.order}
                  onClick={() => onSort("total_amount")}
                >
                  Amount
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "product_category"}
                  direction={sortConfig.order}
                  onClick={() => onSort("product_category")}
                >
                  Category
                </TableSortLabel>
              </StyledTableHeaderCell>
              <StyledTableHeaderCell>
                <TableSortLabel
                  active={sortConfig.field === "source"}
                  direction={sortConfig.order}
                  onClick={() => onSort("source")}
                >
                  Source
                </TableSortLabel>
              </StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortData(orders).map((order) => (
              <StyledTableRow
                key={order.order_id}
                source={order.source === "source_a" ? "source_a" : "source_b"}
              >
                <TableCell>{order.order_id}</TableCell>
                <TableCell>{formatDateToEST(order.order_date)}</TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>{order.product_category}</TableCell>
                <TableCell>
                  {order.source === "source_a" ? "Shopify" : "Etsy"}
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DetailedDataTable;
