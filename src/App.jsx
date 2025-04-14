import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';

// Auth Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/driver/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AddTrip from './pages/driver/AddTrip';
import DailyCNG from './pages/driver/DailyCNG';
import Complaints from './pages/driver/Complaints';
import Repayments from './pages/driver/Repayments';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  }
}));

function App() {
  const classes = useStyles();

  return (
    <AuthProvider>
      <Container className={classes.root}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/driver" element={<PrivateRoute role="driver"><Layout /></PrivateRoute>}>
            <Route index element={<DriverDashboard />} />
            <Route path="add-trip" element={<AddTrip />} />
            <Route path="daily-cng" element={<DailyCNG />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="repayments" element={<Repayments />} />
          </Route>

          <Route path="/admin" element={<PrivateRoute role="admin"><Layout /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Container>
    </AuthProvider>
  );
}

export default App;