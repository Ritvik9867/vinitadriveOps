import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children, role }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentUser.role !== role) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }

  if (currentUser.role === 'driver' && !currentUser.verified) {
    return <Navigate to="/driver/verification" replace />;
  }

  return children;
}

export default PrivateRoute;