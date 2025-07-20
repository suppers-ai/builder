import { createContext, ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { AuthClient } from "@packages/auth-client";
import type { AuthUser, AuthSession } from "@packages/auth-client";

export interface AuthClientContextType {
  authClient: AuthClient;
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  login: (redirectUri?: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

// Create context
const AuthClientContext = createContext<AuthClientContextType | null>(null);

// Global signals for auth state
const userSignal = signal<AuthUser | null>(null);
const sessionSignal = signal<AuthSession | null>(null);
const loadingSignal = signal<boolean>(true);
const errorSignal = signal<string | null>(null);

export interface AuthClientProviderProps {
  children: ComponentChildren;
  storeUrl: string;
  clientId?: string;
  redirectUri?: string;
  scopes?: string[];
}

export function AuthClientProvider({
  children,
  storeUrl,
  clientId = "default",
  redirectUri,
  scopes = ["openid", "email", "profile"],
}: AuthClientProviderProps) {
  const [authClient] = useState(() => new AuthClient({
    storeUrl,
    clientId,
    redirectUri,
    scopes,
  }));

  useEffect(() => {
    // Initialize auth client
    const initializeAuth = async () => {
      try {
        await authClient.initialize();
        
        // Get current state
        const user = authClient.getUser();
        const session = authClient.getSession();
        
        userSignal.value = user;
        sessionSignal.value = session;
        loadingSignal.value = false;
      } catch (error) {
        console.error("Auth initialization error:", error);
        errorSignal.value = error instanceof Error ? error.message : "Authentication failed";
        loadingSignal.value = false;
      }
    };

    initializeAuth();

    // Set up event listeners
    const handleLogin = (event: any, session: AuthSession) => {
      userSignal.value = session.user;
      sessionSignal.value = session;
      errorSignal.value = null;
    };

    const handleLogout = () => {
      userSignal.value = null;
      sessionSignal.value = null;
      errorSignal.value = null;
    };

    const handleTokenRefresh = (event: any, session: AuthSession) => {
      userSignal.value = session.user;
      sessionSignal.value = session;
    };

    const handleError = (event: any, error: any) => {
      errorSignal.value = error instanceof Error ? error.message : "Authentication error";
    };

    authClient.addEventListener("login", handleLogin);
    authClient.addEventListener("logout", handleLogout);
    authClient.addEventListener("token_refresh", handleTokenRefresh);
    authClient.addEventListener("error", handleError);

    return () => {
      authClient.removeEventListener("login", handleLogin);
      authClient.removeEventListener("logout", handleLogout);
      authClient.removeEventListener("token_refresh", handleTokenRefresh);
      authClient.removeEventListener("error", handleError);
    };
  }, [authClient]);

  const login = (customRedirectUri?: string) => {
    authClient.login({
      redirectUri: customRedirectUri || redirectUri,
    });
  };

  const logout = async () => {
    try {
      await authClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
      errorSignal.value = error instanceof Error ? error.message : "Logout failed";
    }
  };

  const isAuthenticated = () => {
    return authClient.isAuthenticated();
  };

  const contextValue: AuthClientContextType = {
    authClient,
    user: userSignal.value,
    session: sessionSignal.value,
    loading: loadingSignal.value,
    error: errorSignal.value,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthClientContext.Provider value={contextValue}>
      {children}
    </AuthClientContext.Provider>
  );
}

// Hook to use auth client context
export function useAuthClient(): AuthClientContextType {
  const context = useContext(AuthClientContext);
  if (!context) {
    throw new Error("useAuthClient must be used within an AuthClientProvider");
  }
  return context;
}

// Hook to use auth client signals (for reactive updates)
export function useAuthSignals() {
  return {
    user: userSignal,
    session: sessionSignal,
    loading: loadingSignal,
    error: errorSignal,
  };
}