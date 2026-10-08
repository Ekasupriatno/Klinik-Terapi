import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireTherapist = false,
  requireParent = false,
  allowedRoles = null,
}) => {
  const { isAuthenticated, user, isAdmin, isTherapist, isParent, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireTherapist && !isTherapist && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireParent && !isParent && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
