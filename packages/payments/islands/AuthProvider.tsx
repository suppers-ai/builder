import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { OAuthAuthClient } from "@suppers/auth-client";

interface AuthProviderProps {
  children: preact.ComponentChildren;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: "user" | "admin";
}

export function AuthProvider({ children }: AuthProviderProps) {
  const user = useSignal<User | null>(null);
  const loading = useSignal(true);
  const authClient = useSignal<OAuthAuthClient | null>(null);

  useEffect(() => {
    // Initialize auth client
    const client = new OAuthAuthClient(
      "http://localhost:8001",
      "payments",
    );
    authClient.value = client;

    // Check for existing session
    const checkAuth = async () => {
      try {
        const currentUser = await client.getUser();
        if (currentUser) {
          // Convert to our User format
          user.value = {
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.display_name ||
              `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim(),
            avatar_url: currentUser.avatar_url || undefined,
            role: currentUser.role || "user",
          };
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        loading.value = false;
      }
    };

    checkAuth();

    // Set up auth event listeners
    const handleLogin = (event: string, data: any) => {
      if (data?.userId) {
        checkAuth(); // Refresh user data
      }
    };

    const handleLogout = () => {
      user.value = null;
    };

    client.addEventListener("login", handleLogin);
    client.addEventListener("logout", handleLogout);

    return () => {
      // Note: OAuthAuthClient doesn't have removeEventListener, but that's okay for this use case
    };
  }, []);

  const signIn = async () => {
    if (authClient.value) {
      await authClient.value.signIn();
    }
  };

  const signOut = async () => {
    if (authClient.value) {
      await authClient.value.signOut();
    }
  };

  // Provide auth context to children
  const authContext = {
    user: user.value,
    loading: loading.value,
    signIn,
    signOut,
    isAuthenticated: !!user.value,
    isAdmin: user.value?.role === "admin",
  };

  return (
    <div class="auth-provider">
      {children}
    </div>
  );
}
