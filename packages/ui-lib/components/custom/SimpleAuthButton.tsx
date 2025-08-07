import { useState, useEffect } from "preact/hooks";
import { Loading } from "../feedback/loading/Loading.tsx";
import { DirectAuthClient, OAuthAuthClient } from "@suppers/auth-client";
import type { AuthUser } from "@suppers/shared";
import { LogIn, LogOut, User } from "lucide-preact";
import { Button } from "@suppers/ui-lib";
import config from "../../../../config.ts";

type AnyAuthClient = DirectAuthClient | OAuthAuthClient;

interface SimpleAuthButtonProps {
  position?: "top" | "bottom";
  authClient: AnyAuthClient;
}

export default function SimpleAuthButton(
  { position = "bottom", authClient }: SimpleAuthButtonProps,
) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth client
    const initAuth = async () => {
      try {
        await authClient.initialize();
        // For all auth clients, set initial user state
        const initialUser = await authClient.getUser();
        console.log("🔍 Initial user from auth client:", initialUser);
        setUser(initialUser);
        setLoading(false);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth events
    const handleAuthEvent = async (event: string, data: any) => {
      console.log("🔍 Auth event received:", event, data);

      if (event === "login") {
        // For all auth clients, update local user state
        const newUser = data?.user || await authClient.getUser();
        console.log("🔍 Setting user from login event:", newUser);
        setUser(newUser);
      } else if (event === "logout") {
        console.log("🔍 Logout event received");
        setUser(null);
      } else if (event === "profile_change") {
        const newUser = data || await authClient.getUser();
        console.log("🔍 Setting user from profile_change event:", newUser);
        setUser(newUser);
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
      window.location.href = "/auth/login";
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
  };

  const handleProfileClick = () => {
    // Open profile page in popup window
    const profileUrl = new URL("/profile", config.profileUrl);
    
    console.log("🔍 Opening profile popup:", profileUrl.toString());
    
    const popup = window.open(
      profileUrl.toString(),
      'profile-popup',
      'width=800,height=600,scrollbars=yes,resizable=yes,status=yes'
    );
    
    if (!popup) {
      console.error("Failed to open profile popup - might be blocked by popup blocker");
      // Fallback: navigate to profile page in same window
      window.location.href = profileUrl.toString();
    }
  };

  const getDisplayName = (): string => {
    if (!user) return "User";

    if (user.display_name) return user.display_name;
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.email) return user.email.split("@")[0];
    return "User";
  };

  const getInitials = (): string => {
    if (!user) return "U";

    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  };

  // Loading state
  if (loading) {
    return (
      <div class="flex items-center justify-center w-full">
        <Loading size="sm" />
      </div>
    );
  }

  // User is authenticated
  if (user) {
    return (
      <div class="w-full">
        <div
          class={`dropdown ${position === "top" ? "dropdown-top dropdown-start" : "dropdown-end "}`}
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
                      {getInitials()}
                    </div>
                  )}
              </div>
            </div>
            <span class="text-sm font-medium">
              {getDisplayName()}
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
                <User class="w-4 h-4" />
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
    );
  }

  // User is not authenticated - show simple login button
  return (
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
  );
}
