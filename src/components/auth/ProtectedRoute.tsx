import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated but has no profile, redirect to profile setup
  // except if they're already on the profile setup page
  if (!userProfile && location.pathname !== '/profile/setup') {
    return <Navigate to="/profile/setup" replace />;
  }

  // If user has a profile but tries to access profile setup or signin, redirect to dashboard
  if (userProfile && (location.pathname === '/profile/setup' || location.pathname === '/signin')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
