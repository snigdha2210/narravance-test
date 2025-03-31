import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    sourceA: {
      main: string;
      light: string;
      background: string;
    };
    sourceB: {
      main: string;
      light: string;
      background: string;
    };
  }
  interface PaletteOptions {
    sourceA: {
      main: string;
      light: string;
      background: string;
    };
    sourceB: {
      main: string;
      light: string;
      background: string;
    };
  }
}

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
      main: "#1976d2",
      light: "#42a5f5",
      background: "rgba(25, 118, 210, 0.08)",
    },
    sourceB: {
      main: "#2e7d32",
      light: "#4caf50",
      background: "rgba(46, 125, 50, 0.08)",
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
