import type { ComponentChildren } from "preact";
import { useAuth } from "../providers/AuthProvider.tsx";
import { LoaderSpinner } from "./LoaderSpinner.tsx";

interface ProtectedRouteProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
  requireAuth?: boolean;
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  requireAuth = true,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading, dbUser } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  // If auth is required but user is not logged in
  if (requireAuth && !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <a
            href="/auth/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  // If specific role is required
  if (requiredRole && dbUser) {
    // This would need to be implemented based on your role system
    // For now, we'll just check if dbUser exists
    if (!dbUser) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <a
              href="/dashboard"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
}

export default ProtectedRoute;
