import { useAuth } from "../providers/AuthProvider.tsx";

/**
 * Common authentication patterns for pages
 */
export interface PageAuthOptions {
  // Optional auth override for testing
  auth?: {
    user?: any;
    dbUser?: any;
    loading?: boolean;
    [key: string]: any;
  };
  // Redirect URL after login
  redirectTo?: string;
  // Whether to redirect authenticated users
  redirectIfAuthenticated?: boolean;
  // Whether to redirect unauthenticated users
  redirectIfNotAuthenticated?: boolean;
}

export function usePageAuth(options: PageAuthOptions = {}) {
  const {
    auth,
    redirectTo = "/my-applications",
    redirectIfAuthenticated = false,
    redirectIfNotAuthenticated = false,
  } = options;

  // SSR safety check
  const isBrowser = typeof document !== "undefined";

  // Use provided auth or fall back to useAuth hook (only in browser)
  const contextAuth = auth ? null : (isBrowser ? useAuth() : null);
  const authContext = auth || contextAuth;

  // Handle different auth shapes (some pages use 'user', others use 'dbUser')
  const user = authContext?.user || authContext?.dbUser;
  const loading = authContext?.loading || false;

  // Redirect logic (only in browser)
  const shouldRedirect = () => {
    if (!isBrowser || loading) return false;

    if (redirectIfAuthenticated && user) {
      return redirectTo;
    }

    if (redirectIfNotAuthenticated && !user) {
      return "/login";
    }

    return false;
  };

  const redirectUrl = shouldRedirect();

  return {
    user,
    loading,
    authContext: authContext || {},
    redirectUrl,
    isAuthenticated: !!user,
  };
}
