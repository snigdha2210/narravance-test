import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import theme from "./theme.ts";
import Dashboard from "./pages/Dashboard.tsx";
import TaskList from "./pages/TaskList.tsx";
import TaskDetail from "./pages/TaskDetail.tsx";
import TaskCreate from "./pages/TaskCreate.tsx";
import { AppBar, Button, Container, Toolbar, Typography } from "@mui/material";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Router>
          <Container>
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
          </Container>

          <Container sx={{ mt: 4 }}>
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/tasks' element={<TaskList />} />
              <Route path='/tasks/:id' element={<TaskDetail />} />
              <Route path='/create' element={<TaskCreate />} />
            </Routes>
          </Container>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
