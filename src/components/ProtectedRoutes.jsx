import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);

    // Check expiry
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      return <Navigate to="/login" />;
    }

    // Check role
    if (!allowedRoles.includes(decoded.role)) {
      return <Navigate to="/" />;
    }

    return children;

  } catch (error) {
    localStorage.clear();
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;