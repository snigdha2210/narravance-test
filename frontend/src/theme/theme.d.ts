import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    sourceA: {
      main: string;
      light: string;
      dark: string;
      background: string;
    };
    sourceB: {
      main: string;
      light: string;
      dark: string;
      background: string;
    };
  }
  interface PaletteOptions {
    sourceA: {
      main: string;
      light: string;
      dark: string;
      background: string;
    };
    sourceB: {
      main: string;
      light: string;
      dark: string;
      background: string;
    };
  }
}
