import React from 'react';
import { Navigate } from 'react-router-dom';

// Private Route HOC component for protected routes
const PrivateRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('marsogramUser') !== null;
  
  // If user is authenticated, render the component
  // Otherwise, redirect to the login page
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default PrivateRoute;