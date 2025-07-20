import type { ComponentChildren } from "preact";
import { useAuthClient } from "../providers/AuthClientProvider.tsx";
import { LoaderSpinner } from "./LoaderSpinner.tsx";

interface ProtectedClientRouteProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
  requireAuth?: boolean;
  loginUrl?: string;
  redirectUri?: string;
}

export function ProtectedClientRoute({
  children,
  fallback,
  requireAuth = true,
  loginUrl = "/auth/login",
  redirectUri,
}: ProtectedClientRouteProps) {
  const { user, loading, login, isAuthenticated } = useAuthClient();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  // If auth is required but user is not logged in
  if (requireAuth && !isAuthenticated()) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <button
            onClick={() => login(redirectUri)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated
  return <>{children}</>;
}

export default ProtectedClientRoute;