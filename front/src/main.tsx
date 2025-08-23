import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { AuthProvider } from "./state/AuthContext";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0e1420",
      paper: "rgba(255,255,255,.04)",
    },
  },
  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 14,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { border: "1px solid rgba(255,255,255,.08)" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { color: "rgba(231,236,255,0.92)" },
        head: {
          fontWeight: 700,
          color: "#E7ECFF",
          backgroundColor: "rgba(255,255,255,.06)",
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        // blur + darker overlay behind dialogs
        slotProps: {
          backdrop: {
            sx: {
              backgroundColor: "rgba(8,12,20,.65)",
              backdropFilter: "blur(6px)",
            },
          },
        },
      },
      styleOverrides: {
        paper: {
          backgroundColor: "rgba(18,22,28,.98)",
          border: "1px solid rgba(255,255,255,.08)",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
