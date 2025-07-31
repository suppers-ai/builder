import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { ProfileCard } from "@suppers/ui-lib";
import { AuthHelpers } from "../lib/auth-helpers.ts";
import type { User } from "../lib/api-client.ts";

// Signals for reactive state
const userSignal = signal<User | null>(null);
const authLoadingSignal = signal(true);

export default function ProfilePageIsland() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check auth state on mount
  useEffect(() => {
    // Check if this is an external SSO request in a popup
    const isPopup = globalThis.window?.opener && globalThis.window?.opener !== globalThis.window;
    const urlParams = new URLSearchParams(globalThis.location?.search || "");
    const externalApp = urlParams.get("external_app");
    const origin = urlParams.get("origin");

    const checkAuth = async () => {
      try {

        console.log("🔵 Profile page: Auth check", { isPopup, externalApp, origin });
        console.log("🔵 Profile page: Current URL:", globalThis.location?.href);
        console.log("🔵 Profile page: URL params:", globalThis.location?.search);

        const user = await AuthHelpers.getCurrentUser();
        userSignal.value = user;
        console.log("🔵 Profile page: User found:", !!user, user?.email);

        // Handle external SSO request if user is already logged in
        console.log("🔵 Profile page: Checking external SSO conditions:", {
          isPopup: !!isPopup,
          externalApp: !!externalApp,
          origin: !!origin,
          user: !!user
        });
        
        if (isPopup && externalApp && origin && user) {
          console.log("🔵 Profile page: Handling external SSO for logged-in user");
          
          try {
            let session;
            console.log("🔵 Profile page: About to call getCurrentSession...");
            try {
              session = await AuthHelpers.getCurrentSession();
              console.log("🔵 Profile page: getCurrentSession success:", !!session);
              
              // If API call succeeded but returned null session, use localStorage fallback
              if (!session) {
                console.log("🔵 Profile page: getCurrentSession returned null, trying localStorage fallback...");
                throw new Error("Session is null, using localStorage fallback");
              }
            } catch (sessionError) {
              console.warn("🔵 Profile page: getCurrentSession failed, trying localStorage fallback:", sessionError);
              // Fallback: construct session from localStorage if API fails
              const accessToken = globalThis.localStorage?.getItem("access_token");
              const refreshToken = globalThis.localStorage?.getItem("refresh_token");
              const expiresAt = globalThis.localStorage?.getItem("expires_at");
              
              console.log("🔵 Profile page: localStorage tokens:", {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                hasExpiresAt: !!expiresAt,
                hasUser: !!user
              });
              
              if (accessToken && user) {
                session = {
                  access_token: accessToken,
                  refresh_token: refreshToken || "",
                  expires_in: expiresAt ? Math.floor((parseInt(expiresAt) - Date.now()) / 1000) : 3600,
                  expires_at: expiresAt ? parseInt(expiresAt) : undefined,
                  token_type: "bearer",
                  user: user
                };
                console.log("🔵 Profile page: Using localStorage session fallback");
              } else {
                console.warn("🔵 Profile page: Cannot create fallback session - missing accessToken or user");
              }
            }
            
            if (session) {
              const message = {
                type: "SSO_SUCCESS",
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                user: session.user,
                expiresIn: session.expires_in
              };
              
              console.log("🔵 Profile page: Sending SSO success message to parent:", message);
              console.log("🔵 Profile page: Target origin for message:", origin);
              console.log("🔵 Profile page: Window opener exists:", !!globalThis.window?.opener);
              globalThis.window?.opener?.postMessage(message, origin);
              
              // Close popup
              setTimeout(() => {
                console.log("🔵 Profile page: Closing SSO popup");
                globalThis.window?.close();
              }, 500);
              return; // Don't continue with normal profile page logic
            }
          } catch (error) {
            console.error("❌ Profile page: Error handling external SSO:", error);
            const errorMessage = {
              type: "SSO_ERROR",
              error: error instanceof Error ? error.message : "Unknown error"
            };
            globalThis.window?.opener?.postMessage(errorMessage, origin);
            globalThis.window?.close();
            return;
          }
        }

        if (!user) {
          // Redirect to login if not authenticated, preserving external SSO params
          const loginUrl = externalApp && origin ? 
            `/login?external_app=${externalApp}&origin=${encodeURIComponent(origin)}` :
            "/login?redirect_to=/profile";
          globalThis.location.href = loginUrl;
        } else {
          // Apply user's theme preference if available
          if (user.user_metadata?.theme) {
            document.documentElement.setAttribute('data-theme', user.user_metadata.theme);
            localStorage.setItem('theme', user.user_metadata.theme);
          }

          // Check if we need to prompt for password update (from recovery flow)
          if (urlParams.get("update_password") === "true") {
            setSuccess("Please set your new password below.");
            // Remove the parameter from URL
            const newUrl = new URL(globalThis.location?.href || "");
            newUrl.searchParams.delete("update_password");
            globalThis.history?.replaceState({}, "", newUrl.toString());
          }
        }
      } catch (err) {
        console.log("No authenticated user");
        // Preserve external SSO params when redirecting to login
        const urlParams = new URLSearchParams(globalThis.location?.search || "");
        const externalApp = urlParams.get("external_app");
        const origin = urlParams.get("origin");
        const loginUrl = externalApp && origin ? 
          `/login?external_app=${externalApp}&origin=${encodeURIComponent(origin)}` :
          "/login?redirect_to=/profile";
        globalThis.location.href = loginUrl;
      } finally {
        authLoadingSignal.value = false;
      }
    };

    checkAuth();

    // Listen for auth state changes using Supabase client
    // Do this after external SSO handling to avoid interfering
    const setupAuthListener = async () => {
      try {
        const subscription = await AuthHelpers.onAuthStateChange(
          (event, session) => {
            userSignal.value = session?.user ?? null;
            if (!session?.user && event === "SIGNED_OUT") {
              globalThis.location.href = "/login?redirect_to=/profile";
            }
          },
        );

        return () => subscription.data.subscription.unsubscribe();
      } catch (error) {
        console.error("Failed to setup auth listener:", error);
        return () => {}; // Return empty cleanup function
      }
    };

    // Only setup auth listener if not handling external SSO
    const isHandlingExternalSSO = isPopup && externalApp && origin && userSignal.value;
    if (!isHandlingExternalSSO) {
      setupAuthListener().then((cleanup) => {
        // Store cleanup function for effect cleanup
        return cleanup;
      });
    }
  }, []);

  const handleUpdateProfile = async (data: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    theme?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await AuthHelpers.updateUser(data);
      setSuccess("Profile updated successfully!");

      // Refresh user data
      const updatedUser = await AuthHelpers.getCurrentUser();
      userSignal.value = updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    if (!userSignal.value) return;

    setIsLoading(true);
    setError(null);

    try {
      await AuthHelpers.uploadAvatar(file, userSignal.value.id);
      setSuccess("Avatar updated successfully!");

      // Refresh user data
      const updatedUser = await AuthHelpers.getCurrentUser();
      userSignal.value = updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setIsLoading(false);
    }
  };


  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First verify current password by attempting to sign in
      if (!userSignal.value?.email) {
        throw new Error("User email not available");
      }

      await AuthHelpers.signIn({
        email: userSignal.value.email,
        password: currentPassword,
      });

      // If successful, update the password
      await AuthHelpers.updatePassword(newPassword);
      setSuccess("Password updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await AuthHelpers.signOut();
      globalThis.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoadingSignal.value) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!userSignal.value) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="text-red-500 text-6xl mb-4">🔒</div>
          <h1 class="text-2xl font-bold mb-4">Access Denied</h1>
          <p class="text-gray-600 mb-4">Please log in to access your profile.</p>
          <a href="/login" class="btn btn-primary">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-base-100 p-4">
      <ProfileCard
        user={userSignal.value}
        isLoading={authLoadingSignal.value || isLoading}
        error={error}
        success={success}
        onUpdateProfile={handleUpdateProfile}
        onUploadAvatar={handleUploadAvatar}
        onSignOut={handleSignOut}
        onChangePassword={handleChangePassword}
      />
    </div>
  );
}
