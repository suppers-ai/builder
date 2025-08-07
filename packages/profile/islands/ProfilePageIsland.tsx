import { useEffect, useState } from "preact/hooks";
import { type AuthUser } from "@suppers/auth-client";
import { getAuthClient } from "../lib/auth.ts";

// Get the profile auth client (direct Supabase connection)
const authClient = getAuthClient();

export default function ProfilePageIsland() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth client
    const initAuth = async () => {
      try {
        console.log("🔍 ProfilePageIsland: Initializing auth client");
        await authClient.initialize();
        const currentUser = authClient.getUser();
        console.log("🔍 ProfilePageIsland: Auth client initialized, user:", currentUser);
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth events
    const handleAuthEvent = (event: string, data: any) => {
      console.log("🔍 ProfilePageIsland: Auth event received:", event, data);
      if (event === "login") {
        const user = data?.user || authClient.getUser();
        console.log("🔍 ProfilePageIsland: Setting user after login:", user);
        setUser(user);
      } else if (event === "logout") {
        console.log("🔍 ProfilePageIsland: Clearing user after logout");
        setUser(null);
      } else if (event === "profile_change") {
        console.log("🔍 ProfilePageIsland: Profile changed, updating user:", data);
        setUser(data || authClient.getUser());
      }
    };

    authClient.addEventListener("login", handleAuthEvent);
    authClient.addEventListener("logout", handleAuthEvent);
    authClient.addEventListener("profile_change", handleAuthEvent);

    return () => {
      authClient.removeEventListener("login", handleAuthEvent);
      authClient.removeEventListener("logout", handleAuthEvent);
      authClient.removeEventListener("profile_change", handleAuthEvent);
    };
  }, []);

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
          <a href="/auth/login" class="btn btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div class="container mx-auto p-4">
      <div class="max-w-md mx-auto bg-base-100 rounded-xl shadow-xl border border-base-200">
        <div class="p-6">
          <div class="text-center">
            <div class="avatar mb-4">
              <div class="w-16 rounded-full">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="Avatar" />
                  : (
                    <div class="bg-neutral text-neutral-content rounded-full w-16 h-16 flex items-center justify-center text-2xl">
                      {user.first_name?.[0] || user.email?.[0] || "U"}
                    </div>
                  )}
              </div>
            </div>
            <h1 class="text-2xl font-bold mb-2">
              {user.display_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                "User"}
            </h1>
            <p class="text-base-content/60 mb-6">{user.email}</p>

            <div class="space-y-4">
              <button
                class="btn btn-primary w-full"
                onClick={async () => {
                  // Simple profile update demo - in real app this would be a form
                  const newDisplayName = prompt("Enter new display name:", user.display_name || "");
                  if (newDisplayName && newDisplayName !== user.display_name) {
                    try {
                      const result = await authClient.updateUser({
                        displayName: newDisplayName,
                      });

                      if (result.error) {
                        alert("Error updating profile: " + result.error);
                      } else {
                        alert("Profile updated successfully!");
                        // The profile_change event will automatically update the UI
                      }
                    } catch (error) {
                      alert(
                        "Error updating profile: " +
                          (error instanceof Error ? error.message : "Unknown error"),
                      );
                    }
                  }
                }}
              >
                Edit Profile
              </button>

              <button
                class="btn btn-outline w-full"
                onClick={async () => {
                  await authClient.signOut();
                  // Redirect after logout
                  if (window.opener) {
                    window.close();
                  } else {
                    window.location.href = "/";
                  }
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
