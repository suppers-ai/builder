/**
 * SessionHandlingExample Component
 *
 * Example component demonstrating how to properly integrate session expired handling
 * This shows the correct pattern for handling API errors that may be session-related.
 */

import { useState } from "preact/hooks";
import { SessionExpiredModal } from "../action/session-expired-modal/SessionExpiredModal.tsx";
import { useSessionExpiredHandler } from "../../hooks/useSessionExpiredHandler.ts";
import { Button } from "../action/button/Button.tsx";

interface ApiResponse {
  data?: any;
  error?: string;
}

// Mock API client for demonstration
class MockApiClient {
  static async getData(): Promise<ApiResponse> {
    // Simulate a session expired error
    const shouldSimulateExpiredSession = Math.random() > 0.7;

    if (shouldSimulateExpiredSession) {
      return { error: "Invalid or expired token. Please log in again." };
    }

    return { data: { message: "Data loaded successfully" } };
  }

  static async updateData(data: any): Promise<ApiResponse> {
    // Simulate different types of errors
    const rand = Math.random();

    if (rand > 0.8) {
      throw new Error("Invalid or expired token. Please log in again.");
    } else if (rand > 0.6) {
      return { error: "Validation failed: missing required field" };
    }

    return { data: { message: "Data updated successfully" } };
  }
}

export default function SessionHandlingExample() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session expired handler
  const sessionHandler = useSessionExpiredHandler({
    onLogin: () => {
      console.log("🔑 User chose to login");
      // In a real app, redirect to login or show login modal
      globalThis.location.href = "/auth/login";
    },
    onSignOut: () => {
      console.log("🚪 User signed out due to expired session");
      // In a real app, clear auth state and redirect
      globalThis.location.href = "/";
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await MockApiClient.getData();

      if (response.error) {
        // ✅ CORRECT: Check for session expired error first
        if (sessionHandler.handleApiResponseError(response.error)) {
          // Session expired - clear error state, modal will handle it
          setError(null);
          setData(null);
        } else {
          // Normal error - show it to user
          setError(response.error);
          setData(null);
        }
      } else {
        setData(response.data);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to load data:", err);

      // ✅ CORRECT: Use handleWithSessionCheck for thrown errors
      sessionHandler.handleWithSessionCheck(
        err,
        () => {
          // Session expired callback
          setError(null);
          setData(null);
        },
        (error) => {
          // Normal error callback
          const errorMessage = error instanceof Error ? error.message : "Failed to load data";
          setError(errorMessage);
          setData(null);
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const updateData = async () => {
    try {
      setLoading(true);

      const response = await MockApiClient.updateData({ test: "data" });

      if (response.error) {
        // Check for session expired error first
        if (!sessionHandler.handleApiResponseError(response.error)) {
          // Not a session error, show normal error
          setError(response.error);
        }
      } else {
        setData(response.data);
        console.log("✅ Data updated successfully");
      }
    } catch (err) {
      console.error("Failed to update data:", err);

      // Handle both session and normal errors
      sessionHandler.handleWithSessionCheck(
        err,
        () => setError(null), // Session expired - clear error
        (error) => setError(error instanceof Error ? error.message : "Failed to update data"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="p-6 max-w-md mx-auto bg-base-100 rounded-lg shadow-lg">
      <h2 class="text-xl font-bold mb-4">Session Handling Example</h2>

      <div class="space-y-4">
        <div class="flex gap-2">
          <Button
            onClick={loadData}
            loading={loading}
            color="primary"
            size="sm"
          >
            Load Data
          </Button>

          <Button
            onClick={updateData}
            loading={loading}
            color="secondary"
            size="sm"
          >
            Update Data
          </Button>
        </div>

        {error && (
          <div class="alert alert-error">
            <span class="text-sm">{error}</span>
          </div>
        )}

        {data && (
          <div class="alert alert-success">
            <span class="text-sm">{data.message}</span>
          </div>
        )}

        <div class="text-sm text-base-content/70">
          <p>This example demonstrates:</p>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li>✅ Proper session error detection</li>
            <li>✅ Modal instead of toast for session errors</li>
            <li>✅ Automatic error state clearing</li>
            <li>✅ Normal error handling for other errors</li>
          </ul>
        </div>
      </div>

      {/* ✅ IMPORTANT: Include the SessionExpiredModal */}
      <SessionExpiredModal
        open={sessionHandler.isSessionExpiredModalOpen}
        onLogin={sessionHandler.handleLogin}
        onSignOut={sessionHandler.handleSignOut}
        onClose={sessionHandler.hideSessionExpiredModal}
      />
    </div>
  );
}
