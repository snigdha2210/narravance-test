import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Dashboard from "./pages/Dashboard.tsx";
import TaskList from "./pages/TaskList.tsx";
import TaskCreate from "./pages/TaskCreate.tsx";
import TaskDetail from "./pages/TaskDetail.tsx";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Router>
          <AppBar position='static'>
            <Toolbar>
              <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                E-commerce Analytics
              </Typography>
              <Button color='inherit' component={Link} to='/'>
                Dashboard
              </Button>
              <Button color='inherit' component={Link} to='/tasks'>
                Tasks
              </Button>
              <Button color='inherit' component={Link} to='/create'>
                Create Task
              </Button>
            </Toolbar>
          </AppBar>
          <Container>
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/tasks' element={<TaskList />} />
              <Route path='/create' element={<TaskCreate />} />
              <Route path='/task/:id' element={<TaskDetail />} />
            </Routes>
          </Container>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
