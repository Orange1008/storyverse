import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const ProtectRoute = () => {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    // If user is not logged in, redirect them to the landing page instead of a missing login route.
    return <Navigate to="/" replace />;
  }

  // Otherwise allow them to access the wrapped routes.
  return <Outlet />;
};

export default ProtectRoute;
