import { useEffect, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { getAuthClient } from "../lib/auth.ts";

interface AuthGuardProps {
  children: ComponentChildren;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authClient = getAuthClient();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authenticated = authClient.isAuthenticated();
      
      if (!authenticated) {
        // Redirect to login page
        globalThis.location.href = "/auth/login";
        return;
      }

      // Check if we can get user data
      const user = await authClient.getUser();
      if (!user) {
        globalThis.location.href = "/auth/login";
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error("Authentication check failed:", error);
      globalThis.location.href = "/auth/login";
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="text-center">
          <div class="loading loading-spinner loading-lg mb-4"></div>
          <p class="text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="text-center">
          <p class="text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}