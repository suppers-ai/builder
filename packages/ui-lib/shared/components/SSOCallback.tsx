import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../providers/AuthProvider.tsx";
import { LoaderSpinner } from "./LoaderSpinner.tsx";

interface SSOCallbackProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successRedirect?: string;
  errorRedirect?: string;
}

export function SSOCallback({
  onSuccess,
  onError,
  successRedirect = "/dashboard",
  errorRedirect = "/auth/login",
}: SSOCallbackProps) {
  const { user, loading } = useAuth();
  const [processingCallback, setProcessingCallback] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          return;
        }

        // Get the current URL to check for auth fragments
        const url = new URL(globalThis.location.href);
        const hashFragment = url.hash;

        // Check for error in URL
        if (hashFragment.includes("error=")) {
          const errorParam = new URLSearchParams(hashFragment.replace("#", ""));
          const errorMessage = errorParam.get("error_description") || "Authentication failed";
          throw new Error(errorMessage);
        }

        // Check for access token in URL (indicates successful auth)
        if (hashFragment.includes("access_token=")) {
          // Supabase should handle this automatically through the auth state listener
          // Just wait for the auth state to update

          // Add a timeout to prevent infinite waiting
          const timeout = setTimeout(() => {
            if (!user) {
              setError("Authentication timed out. Please try again.");
              setProcessingCallback(false);
            }
          }, 10000); // 10 second timeout

          // Clear timeout if user is authenticated
          if (user) {
            clearTimeout(timeout);
          }

          return () => clearTimeout(timeout);
        }

        // If no auth-related fragments, this might not be a callback
        setProcessingCallback(false);
      } catch (err) {
        console.error("SSO callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setProcessingCallback(false);
        onError?.(err instanceof Error ? err : new Error("Authentication failed"));
      }
    };

    handleCallback();
  }, [user, onError]);

  // Handle successful authentication
  useEffect(() => {
    if (user && processingCallback) {
      setProcessingCallback(false);
      onSuccess?.();

      // Redirect to success page
      if (typeof window !== "undefined" && successRedirect) {
        globalThis.location.href = successRedirect;
      }
    }
  }, [user, processingCallback, onSuccess, successRedirect]);

  // Handle errors
  useEffect(() => {
    if (error && !processingCallback) {
      // Redirect to error page after a delay
      if (typeof window !== "undefined" && errorRedirect) {
        setTimeout(() => {
          globalThis.location.href = `${errorRedirect}?error=${encodeURIComponent(error)}`;
        }, 3000);
      }
    }
  }, [error, processingCallback, errorRedirect]);

  if (loading || processingCallback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoaderSpinner size="large" />
          <p className="mt-4 text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to login page in a few seconds...
          </p>
          <a
            href={errorRedirect}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
          <p className="text-gray-600 mb-4">You have been successfully authenticated.</p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to dashboard...
          </p>
          <a
            href={successRedirect}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Status Unknown</h1>
        <p className="text-gray-600 mb-4">Unable to determine authentication status.</p>
        <a
          href="/auth/login"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}

export default SSOCallback;
