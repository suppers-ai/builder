import { useEffect, useState } from "preact/hooks";
import { getAuthClient } from "../auth.ts";
import { User } from "@suppers/shared";

/**
 * Hook to get the current authenticated user and auth state for developer portal
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authClient] = useState(() => getAuthClient());

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authClient.initialize();
        const currentUser = await authClient.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setLoading(false);
      }
    };

    // Set up event listeners for auth state changes
    const handleAuthEvent = async (event: string, data?: any) => {
      switch (event) {
        case "login":
          setUser(data?.user || await authClient.getUser());
          break;
        case "logout":
          setUser(null);
          break;
          // case "profile_change":
          //   setUser(data || await authClient.getUser());
          //   break;
      }
    };

    authClient.addEventListener("login", handleAuthEvent);
    authClient.addEventListener("logout", handleAuthEvent);
    // authClient.addEventListener("profile_change", handleAuthEvent);

    initializeAuth();

    // Cleanup function
    return () => {
      authClient.removeEventListener("login", handleAuthEvent);
      authClient.removeEventListener("logout", handleAuthEvent);
      // authClient.removeEventListener("profile_change", handleAuthEvent);
    };
  }, [authClient]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn: () => authClient.signIn(),
    signOut: () => authClient.signOut(),
    authClient,
  };
}

/**
 * Hook to get just the current user (assumes auth is already initialized)
 */
export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(async () => {
    const authClient = getAuthClient();
    return await authClient.getUser();
  });

  useEffect(() => {
    const authClient = getAuthClient();

    const handleAuthEvent = (event: string, data?: any) => {
      switch (event) {
        case "login":
          setUser(data?.user || authClient.getUser());
          break;
        case "logout":
          setUser(null);
          break;
          // case "profile_change":
          //   setUser(data || authClient.getUser());
          //   break;
      }
    };

    authClient.addEventListener("login", handleAuthEvent);
    authClient.addEventListener("logout", handleAuthEvent);
    // authClient.addEventListener("profile_change", handleAuthEvent);

    return () => {
      authClient.removeEventListener("login", handleAuthEvent);
      authClient.removeEventListener("logout", handleAuthEvent);
      // authClient.removeEventListener("profile_change", handleAuthEvent);
    };
  }, []);

  return user;
}
