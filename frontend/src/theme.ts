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
      main: "#8884d8", // Purple for Source A (used in charts)
      light: "#a4a1e4",
      background: "rgba(136, 132, 216, 0.1)", // Light purple background
    },
    sourceB: {
      main: "#82ca9d", // Green for Source B (used in charts)
      light: "#a1dbb6",
      background: "rgba(130, 202, 157, 0.1)", // Light green background
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
