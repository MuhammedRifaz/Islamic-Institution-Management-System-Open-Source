import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-[var(--color-primary)] font-bold animate-pulse">Loading Portal...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user doesn't have the required role, redirect to unauthorized or dashboard
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p>You do not have permission to view this portal area.</p>
        <a href="/portal" className="text-[var(--color-primary)] underline mt-4 inline-block">Return to Dashboard</a>
      </div>
    );
  }

  return children;
}
