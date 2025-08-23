import { useEffect, useState } from "preact/hooks";
import { type User } from "@suppers/auth-client";
import { getAuthClient } from "../lib/auth.ts";
import AdminDashboardIsland from "./AdminDashboardIsland.tsx";

export default function AdminHomePageIsland() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the auth client
  const authClient = getAuthClient();

  useEffect(() => {
    // Initialize auth client
    const initAuth = async () => {
      try {
        console.log("🔍 AdminHomePageIsland: Initializing auth client");
        await authClient.initialize();
        const currentUser = await authClient.getUser();
        console.log("🔍 AdminHomePageIsland: Auth client initialized, user:", currentUser);
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setError("Failed to initialize authentication");
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth events
    const handleAuthEvent = async (event: string, data: any) => {
      console.log("🔍 AdminHomePageIsland: Auth event received:", event, data);
      if (event === "login") {
        const user = data?.user || await authClient.getUser();
        console.log("🔍 AdminHomePageIsland: Setting user after login:", user);
        setUser(user);
      } else if (event === "logout") {
        console.log("🔍 AdminHomePageIsland: Clearing user after logout");
        setUser(null);
      }
    };

    authClient.addEventListener("login", handleAuthEvent);
    authClient.addEventListener("logout", handleAuthEvent);

    return () => {
      authClient.removeEventListener("login", handleAuthEvent);
      authClient.removeEventListener("logout", handleAuthEvent);
    };
  }, []);

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="loading loading-lg"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <h1 class="text-2xl font-bold mb-4">Authentication Required</h1>
          <p class="text-base-content/70 mb-6">
            Please sign in to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboardIsland />;
}
