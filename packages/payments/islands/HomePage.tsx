import { useEffect, useState } from "preact/hooks";
import { Button } from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authClient = getAuthClient();
        await authClient.initialize();
        const currentUser = await authClient.getUser();

        if (currentUser) {
          // User is authenticated, redirect to dashboard
          globalThis.location.href = "/dashboard";
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    const authClient = getAuthClient();
    if ("showLoginModal" in authClient && typeof authClient.showLoginModal === "function") {
      authClient.showLoginModal();
    } else {
      // Fallback to redirect
      globalThis.location.href = "/auth/login";
    }
  };

  if (loading) {
    return (
      <div class="min-h-screen bg-base-100 flex items-center justify-center">
        <div class="text-center">
          <div class="loading loading-spinner loading-lg mb-4"></div>
          <p class="text-base-content/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-base-100 flex items-center justify-center">
      <div class="text-center max-w-md px-6">
        <h1 class="text-4xl font-bold text-base-content mb-6">
          Payments System
        </h1>
        <p class="text-base-content/70 mb-8 text-lg">
          Manage your digital products and payments
        </p>
        <Button
          onClick={handleLogin}
          variant="primary"
          size="lg"
          class="w-full"
        >
          Sign In to Continue
        </Button>
      </div>
    </div>
  );
}
