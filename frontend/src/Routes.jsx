import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from 'components/ScrollToTop';
import ErrorBoundary from 'components/ErrorBoundary';
import NotFound from 'pages/NotFound';
import authService from './services/auth';

// Pages Art'Beau-Pointage
import LoginPage from './pages/LoginPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';

// Composant de protection des routes
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    // Si l'utilisateur n'a pas le bon rôle, rediriger vers sa page appropriée
    if (user?.role === 'supervisor') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/timetracking" replace />;
    }
  }

  return children;
};

// Composant pour rediriger selon le rôle
const RoleBasedRedirect = () => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'supervisor' || user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/timetracking" replace />;
  }
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Route racine - redirection basée sur le rôle */}
          <Route path="/" element={<RoleBasedRedirect />} />
          
          {/* Page de connexion */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Page employés - pointage */}
          <Route 
            path="/timetracking" 
            element={
              <ProtectedRoute requiredRole="employee">
                <TimeTrackingPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Dashboard superviseurs */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="supervisor">
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Page des rapports */}
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute requiredRole="supervisor">
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Alias pour le dashboard */}
          <Route path="/supervisor" element={<Navigate to="/dashboard" replace />} />
          
          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
