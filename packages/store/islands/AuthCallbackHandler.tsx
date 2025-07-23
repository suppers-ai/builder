import { useEffect, useState } from "preact/hooks";
import { Alert, Button, Card, Loading } from "@suppers/ui-lib";
import { AuthHelpers } from "../lib/auth-helpers.ts";

interface AuthCallbackHandlerProps {
  url: string;
}

export function AuthCallbackHandler({ url }: AuthCallbackHandlerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;
        const hashParams = new URLSearchParams(urlObj.hash.substring(1));

        // Check for errors in callback
        const error = searchParams.get("error") || hashParams.get("error");
        const errorDescription = searchParams.get("error_description") ||
          hashParams.get("error_description");

        if (error) {
          throw new Error(errorDescription || error);
        }

        // Check for auth tokens in URL
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken) {
          // OAuth callback with tokens
          setSuccess("Authentication successful! Redirecting...");

          // Get redirect URL
          const redirectTo = searchParams.get("redirect_to") || "/profile";

          // Small delay to show success message
          setTimeout(() => {
            globalThis.location.href = redirectTo;
          }, 1500);
        } else {
          // Check for session
          const session = await AuthHelpers.getCurrentSession();

          if (session) {
            setSuccess("Authentication successful! Redirecting...");

            // Get redirect URL
            const redirectTo = searchParams.get("redirect_to") || "/profile";

            // Small delay to show success message
            setTimeout(() => {
              globalThis.location.href = redirectTo;
            }, 1500);
          } else {
            throw new Error("No authentication session found");
          }
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [url]);

  if (loading) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center">
        <Card class="w-full max-w-md mx-4">
          <div class="text-center p-8">
            <div class="mb-6">
              <Loading size="lg" />
            </div>
            <h2 class="text-xl font-semibold mb-2">Processing Authentication</h2>
            <p class="text-base-content/70">Please wait while we complete your login...</p>
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
            <h2 class="text-xl font-semibold mb-4">Authentication Failed</h2>

            <Alert type="error" class="mb-6">
              {error}
            </Alert>

            <div class="space-y-3">
              <Button
                as="a"
                href="/login"
                color="primary"
                class="w-full"
              >
                Try Again
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
            <div class="text-green-500 text-6xl mb-4">✅</div>
            <h2 class="text-xl font-semibold mb-4">Authentication Successful!</h2>

            <Alert type="success" class="mb-6">
              {success}
            </Alert>

            <div class="mb-4">
              <Loading size="sm" />
            </div>

            <p class="text-base-content/70">
              You will be redirected automatically...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
