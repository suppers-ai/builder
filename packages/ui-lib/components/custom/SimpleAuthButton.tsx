import { useEffect, useState } from "preact/hooks";
import { Loading } from "../feedback/loading/Loading.tsx";
import { DirectAuthClient, OAuthAuthClient } from "@suppers/auth-client";
import type { User } from "@suppers/shared/utils/type-mappers.ts";
import { LogIn, LogOut, User as UserIcon } from "lucide-preact";
import { Button } from "@suppers/ui-lib";
import { applyTheme, getCurrentTheme, TypeMappers } from "@suppers/shared/utils";
import { SessionExpiredModal } from "../action/session-expired-modal/SessionExpiredModal.tsx";
import { useSessionExpiredHandler } from "../../hooks/useSessionExpiredHandler.ts";
import config from "../../../../config.ts";

type AnyAuthClient = DirectAuthClient | OAuthAuthClient;

interface SimpleAuthButtonProps {
  position?: "top" | "bottom";
  authClient: AnyAuthClient;
}

export default function SimpleAuthButton(
  { position = "bottom", authClient }: SimpleAuthButtonProps,
) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = () => {
    // Use the auth client's appropriate login method
    if ("showLoginModal" in authClient && typeof authClient.showLoginModal === "function") {
      // SSO client - show popup
      authClient.showLoginModal();
    } else if ("signIn" in authClient) {
      // Direct client - redirect
      authClient.signIn({ email: "", password: "" });
    } else {
      // Fallback - redirect to login page
      globalThis.location.href = "/auth/login";
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
  };

  // Session expired modal handler
  const sessionHandler = useSessionExpiredHandler({
    onLogin: handleLogin,
    onSignOut: handleLogout,
  });

  useEffect(() => {
    // Initialize auth client
    const initAuth = async () => {
      try {
        await authClient.initialize();
        // Fetch user data if authenticated
        const initialUser = await authClient.getUser();
        console.log("🔍 Initial user from auth client:", initialUser);
        setUser(initialUser);

        // Apply user's theme if available
        if (initialUser) {
          const userTheme = getCurrentTheme(initialUser);
          applyTheme(userTheme);
        }

        setLoading(false);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        // Check if this is a session expired error
        if (!sessionHandler.handleSessionExpiredError(error)) {
          // If not a session error, just log and continue
          console.error("Non-session auth error:", error);
        }
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth events
    const handleAuthEvent = async (event: string, data: any) => {
      console.log("🔍 Auth event received:", event, data);

      if (event === "login") {
        // Fetch fresh user data from database
        const newUser = await authClient.getUser();
        console.log("🔍 Setting user from login event:", newUser);
        setUser(newUser);

        // Apply user's theme
        if (newUser) {
          const userTheme = getCurrentTheme(newUser);
          applyTheme(userTheme);
        }
      } else if (event === "logout") {
        console.log("🔍 Logout event received");
        setUser(null);

        // Reset to system/default theme when logged out
        const defaultTheme = getCurrentTheme(null);
        applyTheme(defaultTheme);
      }
    };

    // Listen for postMessage events from profile popup
    const handlePopupMessage = (event: MessageEvent) => {
      console.log(
        "🎯 SimpleAuthButton: Received postMessage:",
        event.data,
        "from origin:",
        event.origin,
      );

      // Accept messages from the profile URL origin (cross-origin communication)
      // Profile is on http://localhost:8001, docs is on http://localhost:8002
      if (event.origin !== config.profileUrl) {
        console.log(
          "🎯 SimpleAuthButton: Ignoring message from unknown origin:",
          event.origin,
          "expected:",
          config.profileUrl,
        );
        return;
      }

      switch (event.data.type) {
        case "SUPPERS_PROFILE_UPDATED":
          const updatedUser = event.data.data.user;
          if (updatedUser) {
            // Update local state with the updated user data
            setUser(updatedUser);

            // If using OAuth auth client, update its stored user data too
            if (
              authClient && "saveUserDataToStorage" in authClient &&
              typeof authClient.saveUserDataToStorage === "function"
            ) {
              (authClient as any).saveUserDataToStorage(updatedUser);
            }

            // Apply theme if it changed
            if (updatedUser.theme_id) {
              applyTheme(updatedUser.theme_id);
            }
          }
          break;
        case "popup-closing":
          console.log("🎯 SimpleAuthButton: Profile popup is closing");
          break;

        default:
          console.log("🎯 SimpleAuthButton: Unknown message type from popup:", event.data.type);
      }
    };

    authClient.addEventListener("login", handleAuthEvent);
    authClient.addEventListener("logout", handleAuthEvent);
    // authClient.addEventListener("profile_change", handleAuthEvent);

    // Add postMessage listener for popup communication
    globalThis.addEventListener("message", handlePopupMessage);

    return () => {
      authClient.removeEventListener("login", handleAuthEvent);
      authClient.removeEventListener("logout", handleAuthEvent);
      // authClient.removeEventListener("profile_change", handleAuthEvent);
      globalThis.removeEventListener("message", handlePopupMessage);
    };
  }, []);

  const handleProfileClick = () => {
    // Open profile page in popup window
    const profileUrl = new URL("/profile", config.profileUrl);

    console.log("🔍 Opening profile popup:", profileUrl.toString());

    const popup = globalThis.open(
      profileUrl.toString(),
      "profile-popup",
      "width=800,height=600,scrollbars=yes,resizable=yes,status=yes",
    );

    if (!popup) {
      console.error("Failed to open profile popup - might be blocked by popup blocker");
      // Fallback: navigate to profile page in same window
      globalThis.location.href = profileUrl.toString();
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <div class="flex items-center justify-center w-full">
          <Loading size="sm" />
        </div>

        {/* Session Expired Modal */}
        <SessionExpiredModal
          open={sessionHandler.isSessionExpiredModalOpen}
          onLogin={sessionHandler.handleLogin}
          onSignOut={sessionHandler.handleSignOut}
          onClose={sessionHandler.hideSessionExpiredModal}
        />
      </>
    );
  }

  // User is authenticated
  if (user) {
    return (
      <>
        <div class="w-full">
          <div
            class={`dropdown ${
              position === "top" ? "dropdown-top dropdown-start" : "dropdown-end "
            }`}
          >
            <div tabIndex={0} role="button" class="btn btn-ghost btn-sm gap-2">
              <div class="avatar">
                <div class="w-6 rounded-full">
                  {user.avatar_url
                    ? (
                      <img
                        alt="User avatar"
                        src={user.avatar_url}
                        loading="lazy"
                      />
                    )
                    : (
                      <div class="bg-neutral text-neutral-content rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {TypeMappers.getInitials(user)}
                      </div>
                    )}
                </div>
              </div>
              <span class="text-sm font-medium">
                {TypeMappers.getDisplayName(user)}
              </span>
            </div>
            <ul
              tabIndex={0}
              class={`dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg ${
                position === "top" ? "mb-2" : "mt-2"
              }`}
            >
              <li>
                <button
                  onClick={handleProfileClick}
                  class="flex items-center gap-2"
                >
                  <UserIcon class="w-4 h-4" />
                  Profile Settings
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  class="flex items-center gap-2"
                >
                  <LogOut class="w-4 h-4" />
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Session Expired Modal */}
        <SessionExpiredModal
          open={sessionHandler.isSessionExpiredModalOpen}
          onLogin={sessionHandler.handleLogin}
          onSignOut={sessionHandler.handleSignOut}
          onClose={sessionHandler.hideSessionExpiredModal}
        />
      </>
    );
  }

  // User is not authenticated - show simple login button
  return (
    <>
      <div class="w-full">
        <Button
          onClick={handleLogin}
          color="primary"
          size="sm"
          class="flex items-center gap-2 w-full"
        >
          <LogIn size={16} />
          Sign In
        </Button>
      </div>

      {/* Session Expired Modal */}
      <SessionExpiredModal
        open={sessionHandler.isSessionExpiredModalOpen}
        onLogin={sessionHandler.handleLogin}
        onSignOut={sessionHandler.handleSignOut}
        onClose={sessionHandler.hideSessionExpiredModal}
      />
    </>
  );
}
