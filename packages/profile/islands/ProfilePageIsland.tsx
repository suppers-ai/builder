import { useEffect, useState } from "preact/hooks";
import type { UpdateUserData } from "../lib/auth-client/types.ts";
import type { User } from "@suppers/shared/utils/type-mappers.ts";
import { Button, ProfileCard } from "@suppers/ui-lib";
import { applyTheme, getCurrentTheme } from "@suppers/shared/utils";
import { getAuthClient } from "../lib/auth.ts";

// Get the profile auth client (direct Supabase connection)
const authClient = getAuthClient();

export default function ProfilePageIsland() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth client
    const initAuth = async () => {
      try {
        console.log("🔍 ProfilePageIsland: Initializing auth client");
        await authClient.initialize();
        const currentUser = await authClient.getUser();
        console.log("🔍 ProfilePageIsland: Auth client initialized, user:", currentUser);
        setUser(currentUser);

        // Apply user's theme if available
        if (currentUser) {
          const userTheme = getCurrentTheme(currentUser);
          applyTheme(userTheme);
        }

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
      console.log("🔍 ProfilePageIsland: Auth event received:", event, data);
      if (event === "login") {
        const user = data?.user || await authClient.getUser();
        console.log("🔍 ProfilePageIsland: Setting user after login:", user);
        setUser(user);

        // Apply user's theme
        if (user) {
          const userTheme = getCurrentTheme(user);
          applyTheme(userTheme);
        }
      } else if (event === "logout") {
        console.log("🔍 ProfilePageIsland: Clearing user after logout");
        setUser(null);

        // Reset to system/default theme when logged out
        const defaultTheme = getCurrentTheme(null);
        applyTheme(defaultTheme);
      }
      // else if (event === "profile_change") {
      //   console.log("🔍 ProfilePageIsland: Profile changed, updating user:", data);
      //   const updatedUser = data || await authClient.getUser();
      //   setUser(updatedUser);

      //   // Apply updated user theme
      //   if (updatedUser) {
      //     const userTheme = getCurrentTheme(updatedUser);
      //     applyTheme(userTheme);
      //   }
      // }
    };

    authClient.addEventListener("login", handleAuthEvent);
    authClient.addEventListener("logout", handleAuthEvent);
    // authClient.addEventListener("profile_change", handleAuthEvent);

    // Listen for postMessage events from other applications (cross-origin profile updates)
    const handlePostMessage = async (event: MessageEvent) => {
      console.log(
        "🎯 ProfilePageIsland: Received postMessage:",
        event.data,
        "from origin:",
        event.origin,
      );

      if (event.data.type === "SUPPERS_PROFILE_UPDATED") {
        console.log(
          "🎯 ProfilePageIsland: Profile was updated in another application, refreshing...",
        );

        // Fetch fresh user data from database to stay in sync
        try {
          const refreshedUser = await authClient.getUser();
          if (refreshedUser) {
            console.log("🎯 ProfilePageIsland: Setting refreshed user data:", refreshedUser);
            setUser(refreshedUser);

            // Apply theme if it changed
            const userTheme = getCurrentTheme(refreshedUser);
            applyTheme(userTheme);
          }
        } catch (error) {
          console.error("🎯 ProfilePageIsland: Failed to refresh user data:", error);
        }
      }
    };

    // Add postMessage listener
    globalThis.addEventListener("message", handlePostMessage);

    return () => {
      authClient.removeEventListener("login", handleAuthEvent);
      authClient.removeEventListener("logout", handleAuthEvent);
      // authClient.removeEventListener("profile_change", handleAuthEvent);
      globalThis.removeEventListener("message", handlePostMessage);
    };
  }, []);

  // Handle profile update
  const handleUpdateProfile = async (data: UpdateUserData) => {
    try {
      setError(null);
      setSuccess(null);

      const result = await authClient.updateUser(data);

      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      } else {
        setSuccess("Profile updated successfully!");

        // Fetch fresh user data from database after successful update
        const refreshedUser = await authClient.getUser();
        if (refreshedUser) {
          console.log(
            "🎯 ProfilePageIsland: Profile updated, setting fresh user data:",
            refreshedUser,
          );
          setUser(refreshedUser);

          // Apply theme if it changed
          const userTheme = getCurrentTheme(refreshedUser);
          applyTheme(userTheme);

          // Notify other applications about the profile update via postMessage
          // This will reach any parent windows or popups that opened this profile page
          try {
            const message = {
              type: "SUPPERS_PROFILE_UPDATED",
              data: { user: refreshedUser },
            };

            // Send to parent window if this is an iframe/popup
            if (globalThis.parent && globalThis.parent !== window) {
              globalThis.parent.postMessage(message, "*");
              console.log("🎯 ProfilePageIsland: Sent profile update to parent window");
            }

            // Send to opener window if this was opened as a popup
            if (globalThis.opener) {
              globalThis.opener.postMessage(message, "*");
              console.log("🎯 ProfilePageIsland: Sent profile update to opener window");
            }
          } catch (error) {
            console.error("🎯 ProfilePageIsland: Failed to send profile update message:", error);
          }
        }

        return { success: true };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Handle avatar upload
  const handleUploadAvatar = async (file: File) => {
    try {
      setError(null);
      setSuccess(null);

      // Create a form data object for file upload
      const formData = new FormData();
      formData.append("file", file);

      // For now, just show that upload is triggered
      // In a real implementation, you'd upload to your storage provider
      console.log("Avatar upload triggered for file:", file.name);
      throw new Error("Avatar upload not yet implemented");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload avatar";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Handle password change
  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      setSuccess(null);

      // Password change would typically use Supabase auth
      // For now, show not implemented
      console.log("Password change triggered");
      throw new Error("Password change not yet implemented");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change password";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      // Redirect after logout
      if (globalThis.opener) {
        globalThis.close();
      } else {
        globalThis.location.href = "/";
      }
    } catch (err) {
      console.error("Sign out error:", err);
      setError("Failed to sign out");
    }
  };

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
            Please sign in to access your profile settings.
          </p>
          <a href="/" class="btn btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div class="container mx-auto p-4">
      <div class="max-w-md mx-auto space-y-6">
        <ProfileCard
          user={user as any} // Type conversion for compatibility
          isLoading={loading}
          error={error}
          success={success}
          onUpdateProfile={handleUpdateProfile}
          onUploadAvatar={handleUploadAvatar}
          onChangePassword={handleChangePassword}
          // Detect if we're in popup mode
          isPopupMode={!!globalThis.opener}
          parentOrigin={(() => {
            if (!globalThis.opener) return undefined;
            const referrer = document.referrer;
            const origin = referrer ? new URL(referrer).origin : "*";
            console.log(
              "🎨 ProfilePageIsland: Popup mode detected, referrer:",
              referrer,
              "origin:",
              origin,
            );
            return origin;
          })()}
          onPopupClose={() => {
            if (globalThis.opener) {
              globalThis.close();
            }
          }}
          onSignOut={handleSignOut}
        />
      </div>
    </div>
  );
}
