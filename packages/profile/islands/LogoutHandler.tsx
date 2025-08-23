import { useEffect, useState } from "preact/hooks";
import { Alert, Button, Card, Loading } from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";

// Get the singleton auth client
const authClient = getAuthClient();

export default function LogoutHandler() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if this is a popup logout
  const isPopup = typeof globalThis.window !== "undefined" &&
    new URLSearchParams(globalThis.window.location.search).get("popup") === "true";

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await authClient.signOut();
        setSuccess("Successfully logged out!");

        if (isPopup) {
          // Send success message to parent window and close popup
          if (globalThis.window.opener) {
            globalThis.window.opener.postMessage({
              type: "OAUTH_LOGOUT_SUCCESS",
            }, "*");
          }

          setTimeout(() => {
            globalThis.window.close();
          }, 1000);
        } else {
          // Redirect to home after a short delay for normal logout
          setTimeout(() => {
            globalThis.location.href = "/";
          }, 1500);
        }
      } catch (err) {
        console.error("Logout error:", err);
        setError(err instanceof Error ? err.message : "Logout failed");
      } finally {
        setLoading(false);
      }
    };

    handleLogout();
  }, [isPopup]);

  if (loading) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center">
        <Card class="w-full max-w-md mx-4">
          <div class="text-center p-8">
            <div class="mb-6">
              <Loading size="lg" />
            </div>
            <h2 class="text-xl font-semibold mb-2">Signing Out</h2>
            <p class="text-base-content/70">Please wait while we sign you out...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center">
        <Card class="w-full max-w-md mx-4">
          <div class="text-center p-8">
            <div class="text-red-500 text-6xl mb-4">❌</div>
            <h2 class="text-xl font-semibold mb-4">Logout Failed</h2>

            <Alert color="error" class="mb-6">
              {error}
            </Alert>

            <div class="space-y-3">
              <Button
                as="a"
                href="/profile"
                color="primary"
                class="w-full"
              >
                Back to Profile
              </Button>
              <Button
                as="a"
                href="/"
                variant="outline"
                class="w-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center">
        <Card class="w-full max-w-md mx-4">
          <div class="text-center p-8">
            <div class="text-green-500 text-6xl mb-4">👋</div>
            <h2 class="text-xl font-semibold mb-4">Goodbye!</h2>

            <Alert color="success" class="mb-6">
              {success}
            </Alert>

            {!isPopup && (
              <>
                <div class="mb-4">
                  <Loading size="sm" />
                </div>
                <p class="text-base-content/70">
                  You will be redirected to the home page...
                </p>
              </>
            )}

            {isPopup && (
              <p class="text-base-content/70">
                This window will close automatically...
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
