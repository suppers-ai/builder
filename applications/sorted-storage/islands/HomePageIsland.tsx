import { useEffect, useState } from "preact/hooks";
import { getAuthClient } from "../lib/auth.ts";

export default function HomePageIsland() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authClient = getAuthClient();
        const authenticated = await authClient.isAuthenticated();

        if (authenticated) {
          // Redirect to dashboard if already authenticated
          globalThis.location.href = "/dashboard";
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div class="flex justify-center items-center py-8">
        <div class="loading loading-spinner loading-lg"></div>
        <span class="ml-2 text-base-content/70">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div class="flex justify-center items-center py-8">
        <div class="loading loading-spinner loading-lg"></div>
        <span class="ml-2 text-base-content/70">Redirecting to dashboard...</span>
      </div>
    );
  }

  return (
    <div class="card bg-base-200 shadow-xl max-w-md mx-auto">
      <div class="card-body">
        <h2 class="card-title">Welcome!</h2>
        <p>Please sign in to access your storage.</p>
        <div class="card-actions justify-end">
          <p class="text-sm text-base-content/60">
            Use the sign in button in the top right corner
          </p>
        </div>
      </div>
    </div>
  );
}
