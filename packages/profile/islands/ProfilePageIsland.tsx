import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { ProfileCard } from "@suppers/ui-lib";
import { AuthHelpers } from "../lib/auth-helpers.ts";
import type { User } from "@supabase/supabase-js";

// Signals for reactive state
const userSignal = signal<User | null>(null);
const authLoadingSignal = signal(true);

export default function ProfilePageIsland() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthHelpers.getCurrentUser();
        userSignal.value = user;

        if (!user) {
          // Redirect to login if not authenticated
          globalThis.location.href = "/login?redirect_to=/profile";
        } else {
          // Apply user's theme preference if available
          if (user.user_metadata?.theme) {
            document.documentElement.setAttribute('data-theme', user.user_metadata.theme);
            localStorage.setItem('theme', user.user_metadata.theme);
          }

          // Check if we need to prompt for password update (from recovery flow)
          const urlParams = new URLSearchParams(globalThis.location?.search || "");
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
        globalThis.location.href = "/login?redirect_to=/profile";
      } finally {
        authLoadingSignal.value = false;
      }
    };

    checkAuth();

    // Listen for auth state changes using Supabase client
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

    setupAuthListener().then((cleanup) => {
      // Store cleanup function for effect cleanup
      return cleanup;
    });
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
    <div class="min-h-screen bg-base-200 py-8">
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
