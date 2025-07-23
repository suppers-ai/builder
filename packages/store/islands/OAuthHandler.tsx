import { useEffect, useState } from "preact/hooks";
import { Alert, Button, Card, Loading } from "@suppers/ui-lib";
import { AuthHelpers } from "../lib/auth-helpers.ts";
import type { OAuthProvider } from "../types/auth.ts";

interface OAuthHandlerProps {
  url: string;
}

export function OAuthHandler({ url }: OAuthHandlerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        const urlObj = new URL(url);
        const provider = urlObj.searchParams.get("provider") as OAuthProvider;
        const redirectTo = urlObj.searchParams.get("redirect_to") || "/profile";
        const state = urlObj.searchParams.get("state");

        if (!provider) {
          throw new Error("Missing OAuth provider");
        }

        if (!["google", "github", "discord", "twitter"].includes(provider)) {
          throw new Error("Unsupported OAuth provider");
        }

        // Build callback URL
        const callbackUrl = new URL("/auth/callback", globalThis.location.origin);
        callbackUrl.searchParams.set("redirect_to", redirectTo);
        if (state) {
          callbackUrl.searchParams.set("state", state);
        }

        // Initiate OAuth flow
        await AuthHelpers.signInWithOAuth(provider, callbackUrl.toString());
      } catch (err) {
        console.error("OAuth error:", err);
        setError(err instanceof Error ? err.message : "OAuth initialization failed");
        setLoading(false);
      }
    };

    handleOAuth();
  }, [url]);

  if (loading) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center">
        <Card class="w-full max-w-md mx-4">
          <div class="text-center p-8">
            <div class="mb-6">
              <Loading size="lg" />
            </div>
            <h2 class="text-xl font-semibold mb-2">Connecting...</h2>
            <p class="text-base-content/70">
              Redirecting to OAuth provider...
            </p>
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
            <h2 class="text-xl font-semibold mb-4">OAuth Failed</h2>

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

  return null;
}
