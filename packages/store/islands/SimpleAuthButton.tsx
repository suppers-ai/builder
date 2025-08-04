import { useEffect, useState } from "preact/hooks";
import { StoreAuthHelpers } from "../lib/auth-helpers.ts";
import type { StoredUser } from "../lib/auth-helpers.ts";
import { LogOut, User } from "lucide-preact";
import { Button, Loading } from "@suppers/ui-lib";
import { profileSyncManager, crossAppAuthHelpers } from "@suppers/shared/utils";

export default function SimpleAuthButton() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 SimpleAuthButton: Checking authentication...");
        const currentUser = await StoreAuthHelpers.getCurrentUser();
        console.log("🔍 SimpleAuthButton: Auth check result:", {
          user: !!currentUser,
          email: currentUser?.email,
        });
        
        if (currentUser) {
          // Set user in cross-app auth helpers for sync
          crossAppAuthHelpers.setCurrentUser({
            id: currentUser.id,
            email: currentUser.email,
            displayName: currentUser.display_name || currentUser.user_metadata?.full_name,
            firstName: currentUser.first_name || currentUser.user_metadata?.first_name,
            lastName: currentUser.last_name || currentUser.user_metadata?.last_name,
            avatarUrl: currentUser.avatar_url || currentUser.user_metadata?.avatar_url,
            theme: currentUser.theme_id,
          });
        }
        
        setUser(currentUser);
      } catch (err) {
        console.error("❌ SimpleAuthButton: Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to profile changes from other applications
    const unsubscribe = profileSyncManager.subscribeToProfileChanges((event) => {
      console.log("🔄 SimpleAuthButton: Received profile change event:", event);
      
      switch (event.type) {
        case "theme":
          if (event.data.theme && user) {
            const updatedUser = { ...user, theme_id: event.data.theme };
            setUser(updatedUser);
            StoreAuthHelpers.updateStoredUserData(updatedUser);
            // Apply theme using UI lib
            import("@suppers/ui-lib").then(({ setGlobalTheme }) => {
              setGlobalTheme(event.data.theme);
            });
          }
          break;
          
        case "avatar":
          if (event.data.avatarUrl && user) {
            const updatedUser = {
              ...user,
              avatar_url: event.data.avatarUrl,
              user_metadata: {
                ...user.user_metadata,
                avatar_url: event.data.avatarUrl,
              }
            };
            setUser(updatedUser);
            StoreAuthHelpers.updateStoredUserData(updatedUser);
          }
          break;
          
        case "displayName":
          if (user) {
            const updatedUser = {
              ...user,
              display_name: event.data.displayName,
              first_name: event.data.firstName,
              last_name: event.data.lastName,
              user_metadata: {
                ...user.user_metadata,
                full_name: event.data.displayName,
                first_name: event.data.firstName,
                last_name: event.data.lastName,
              }
            };
            setUser(updatedUser);
            StoreAuthHelpers.updateStoredUserData(updatedUser);
          }
          break;
          
        case "profile":
          if (event.data.user && user) {
            const updatedUser = {
              ...user,
              ...event.data.user,
              user_metadata: {
                ...user.user_metadata,
                ...event.data.user,
              }
            };
            setUser(updatedUser);
            StoreAuthHelpers.updateStoredUserData(updatedUser);
          }
          break;
          
        case "signOut":
          setUser(null);
          StoreAuthHelpers.clearStoredTokens();
          break;
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    console.log("🔵 SSO Login clicked!");
    const profilePackageUrl = "http://localhost:8001";
    const loginUrl = `${profilePackageUrl}/login?external_app=store&origin=${
      encodeURIComponent(globalThis.location?.origin || "")
    }`;

    const popup = globalThis.window?.open(
      loginUrl,
      "sso-login",
      "width=500,height=700,scrollbars=yes,resizable=yes",
    );

    if (!popup) {
      alert("Popup was blocked. Please allow popups for this site and try again.");
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== profilePackageUrl) return;

      if (event.data?.type === "SSO_SUCCESS") {
        const { accessToken, refreshToken, user, expiresIn } = event.data;
        if (accessToken && user) {
          StoreAuthHelpers.storeSession(accessToken, refreshToken || "", user, expiresIn);
          setUser(user);
          console.log("✅ User logged in via message:", user.email);
          popup?.close();
        }
      } else if (event.data?.type === "SSO_ERROR") {
        console.error("❌ SSO Error:", event.data.error);
        popup?.close();
      }
    };

    globalThis.window?.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        globalThis.window?.removeEventListener("message", handleMessage);
      }
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      // Use cross-app auth helpers to sign out across all applications
      crossAppAuthHelpers.clearSessionAcrossApps();
      await StoreAuthHelpers.signOut();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center">
        <Loading size="sm" />
      </div>
    );
  }

  if (user) {
    // User is authenticated - show user dropdown
    return (
      <div class="dropdown dropdown-end">
        <div tabIndex={0} role="button" class="btn btn-ghost btn-sm gap-2">
          <div class="avatar">
            <div class="w-6 rounded-full">
              {user.user_metadata?.avatar_url
                ? (
                  <img
                    alt="User avatar"
                    src={user.user_metadata.avatar_url}
                  />
                )
                : (
                  <div class="bg-neutral text-neutral-content rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
            </div>
          </div>
          <span class="text-sm font-medium">
            {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
          </span>
        </div>
        <ul
          tabIndex={0}
          class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg mt-2"
        >
          <li>
            <button
              onClick={() => {
                // Use ProfileSyncManager to open popup-based profile interface
                const handle = profileSyncManager.openProfilePopup({
                  origin: "http://localhost:8001",
                  appName: "store",
                  dimensions: { width: 600, height: 700 },
                  position: "center"
                }, {
                  onFallback: (reason) => {
                    console.log("Profile popup fallback:", reason);
                    if (reason === "blocked") {
                      alert("Popup was blocked. Opening profile in new tab instead.");
                      globalThis.window?.open("http://localhost:8001/profile", "_blank");
                    }
                  },
                  showNotification: true,
                  openInNewTab: true
                });

                // Handle profile updates from popup
                const cleanup = handle.onMessage((event) => {
                  if (event.data?.type === "PROFILE_UPDATED") {
                    console.log("Profile updated in popup:", event.data);
                    // The profile sync system will handle the updates automatically
                  } else if (event.data?.type === "POPUP_CLOSE") {
                    handle.close();
                    cleanup();
                  }
                });
              }}
              class="flex items-center gap-2"
            >
              <User class="w-4 h-4" />
              View Profile
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              class="flex items-center gap-2"
            >
              <LogOut class="w-4 h-4" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    );
  }

  // User is not authenticated - show login button
  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      size="sm"
    >
      Sign In
    </Button>
  );
}
