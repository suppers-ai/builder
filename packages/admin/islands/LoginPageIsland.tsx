import { useEffect } from "preact/hooks";
import { getAuthClient } from "../lib/auth.ts";

export default function LoginPageIsland() {
  const authClient = getAuthClient();

  useEffect(() => {
    // Check if already authenticated
    if (authClient.isAuthenticated()) {
      globalThis.location.href = "/";
      return;
    }

    // Initialize the auth client
    authClient.initialize();

    // Listen for authentication events
    const handleAuthSuccess = () => {
      globalThis.location.href = "/";
    };

    authClient.addEventListener("login", handleAuthSuccess);

    // Clean up event listener on unmount
    return () => {
      authClient.removeEventListener("login", handleAuthSuccess);
    };
  }, []);

  const handleLogin = () => {
    authClient.showLoginModal();
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body text-center">
          <h2 class="card-title justify-center mb-4">Admin Login</h2>
          <p class="mb-6">Please sign in to access the admin interface</p>
          <div class="card-actions justify-center">
            <button 
              class="btn btn-primary"
              onClick={handleLogin}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}