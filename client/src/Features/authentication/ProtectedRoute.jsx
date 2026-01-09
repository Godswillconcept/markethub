import { useAuth } from "./AuthContext.jsx";
import { useUser } from "./useUser.js";
import { Navigate, useLocation } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { isTokenExpired } from "../../services/axios.js";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isLoading, isAuthenticated, isSessionValid } = useAuth();
  const { isRefreshing } = useUser();
  const location = useLocation();

  // Check for valid session even if user data is loading
  const token = localStorage.getItem("token");
  const sessionId = localStorage.getItem("session_id");
  const sessionActivity = localStorage.getItem("session_activity");
  const hasValidSession = !!(token && sessionId);
  const tokenExpired = isTokenExpired();

  console.log('[ProtectedRoute] Authentication state:', {
    path: location.pathname,
    isLoading,
    isRefreshing,
    isAuthenticated,
    isSessionValid,
    hasToken: !!token,
    hasSessionId: !!sessionId,
    hasSessionActivity: !!sessionActivity,
    tokenExpired,
    hasValidSession
  });

  if (isLoading || isRefreshing) {
    // Show loading state while checking authentication or refreshing token
    // Don't redirect immediately as this could be during initial load or token refresh
    console.log('[ProtectedRoute] Authentication loading or refreshing, showing spinner');
    return (
      <div className="flex h-screen items-center justify-center">
        <FiLoader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Check if user is authenticated and session is valid
  // Only redirect when both isLoading and isRefreshing are false
  if (!isAuthenticated || !isSessionValid) {
    // If context says not authenticated, but we have a valid token in localStorage,
    // it might be a race condition where context hasn't updated its state yet.
    // In this case, we show the loader instead of redirecting.
    if (hasValidSession && !tokenExpired) {
      console.log('[ProtectedRoute] Context not updated yet, but localStorage has valid session. Waiting...');
      return (
        <div className="flex h-screen items-center justify-center">
          <FiLoader className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    console.log('[ProtectedRoute] Authentication failed:', {
      isAuthenticated,
      isSessionValid,
      isRefreshing,
      hasToken: !!token,
      hasSessionId: !!sessionId,
      tokenExpired,
      path: location.pathname
    });
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role requirement
  if (requiredRole) {
    // Handle both nested user structure and flat structure, just in case
    // And handle roles as objects ({name: 'admin'}) or strings ('admin')
    const roles = user?.user?.roles || user?.roles || [];
    
    const hasRequiredRole = roles.some(role => {
      const roleName = typeof role === 'object' ? role.name : role;
      return roleName === requiredRole;
    });

    if (!hasRequiredRole) {
      console.log('[ProtectedRoute] Role requirement failed:', { requiredRole, roles });
      return <Navigate to="/" replace />;
    }
  }

  console.log('[ProtectedRoute] Authentication successful, rendering children');
  return children;
}
