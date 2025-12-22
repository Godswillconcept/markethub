import { useUser } from "./useUser.js";
import { Navigate, useLocation } from "react-router-dom";
import { FiLoader } from "react-icons/fi";

export default function ProtectedRoute({ children, requiredRole = null }) {
  // isLoading will be false if we have initialData from localStorage
  const { user, isLoading, isAuthenticated } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <FiLoader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
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
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
