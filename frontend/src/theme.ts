import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
    },
    sourceA: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
      background: "rgba(156, 39, 176, 0.08)",
    },
    sourceB: {
      main: "#f57c00",
      light: "#ff9800",
      dark: "#ef6c00",
      background: "rgba(245, 124, 0, 0.08)",
    },
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            fontWeight: "bold",
          },
        },
      },
    },
  },
});

export default theme;
