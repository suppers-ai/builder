import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { UserPage } from "@suppers/ui-lib";
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
          window.location.href = "/login?redirect_to=/profile";
        }
      } catch (err) {
        console.log("No authenticated user");
        window.location.href = "/login?redirect_to=/profile";
      } finally {
        authLoadingSignal.value = false;
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = AuthHelpers.onAuthStateChange(
      (event, session) => {
        userSignal.value = session?.user ?? null;
        if (!session?.user) {
          window.location.href = "/login?redirect_to=/profile";
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdateProfile = async (data: {
    firstName?: string;
    middleNames?: string;
    lastName?: string;
    displayName?: string;
    avatarUrl?: string;
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
      const avatarUrl = await AuthHelpers.uploadAvatar(file, userSignal.value.id);
      await AuthHelpers.updateUser({ avatarUrl });

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
    try {
      await AuthHelpers.signOut();
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
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
    <UserPage
      user={userSignal.value}
      authLoading={authLoadingSignal.value}
      isLoading={isLoading}
      error={error}
      success={success}
      onUpdateProfile={handleUpdateProfile}
      onUploadAvatar={handleUploadAvatar}
      onChangePassword={handleChangePassword}
      onSignOut={handleSignOut}
      appName="Suppers Store"
      appIcon="🚀"
      showBackToHome={true}
      homeUrl="/"
    />
  );
}
