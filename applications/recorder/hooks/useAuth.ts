import { useState, useEffect } from "preact/hooks";
import { getAuthClient } from "../lib/auth.ts";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authClient = getAuthClient();
    setIsAuthenticated(authClient.isAuthenticated());

    // Listen for auth changes
    const handleLogin = () => setIsAuthenticated(true);
    const handleLogout = () => setIsAuthenticated(false);

    authClient.addEventListener('login', handleLogin);
    authClient.addEventListener('logout', handleLogout);

    return () => {
      authClient.removeEventListener('login', handleLogin);
      authClient.removeEventListener('logout', handleLogout);
    };
  }, []);

  const signIn = () => {
    const authClient = getAuthClient();
    authClient.signIn();
  };

  const signOut = () => {
    const authClient = getAuthClient();
    authClient.signOut();
  };

  return {
    isAuthenticated,
    signIn,
    signOut,
  };
}