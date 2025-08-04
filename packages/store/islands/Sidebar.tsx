import { useEffect, useState } from "preact/hooks";
import { StoreAuthHelpers } from "../lib/auth-helpers.ts";
import type { StoredUser } from "../lib/auth-helpers.ts";
import { FileText, Home, LogOut, Package, Plus, Settings, Store, User } from "lucide-preact";
import { Button, Loading } from "@suppers/ui-lib";

interface SidebarProps {
  currentPath?: string;
}

export default function Sidebar({ currentPath = "/" }: SidebarProps) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Sidebar: Checking authentication...");

        // Add timeout to prevent hanging
        const authPromise = StoreAuthHelpers.getCurrentUser();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timeout")), 5000)
        );

        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        console.log("🔍 Sidebar: Auth check result:", {
          user: !!currentUser,
          email: currentUser?.email,
        });
        setUser(currentUser);
      } catch (err) {
        console.error("❌ Sidebar: Auth check failed:", err);
        setUser(null);
      } finally {
        console.log("🔍 Sidebar: Setting loading to false");
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes with error handling
    try {
      const authListener = StoreAuthHelpers.onAuthStateChange((event, session) => {
        console.log("🔍 Sidebar: Auth state change:", { event, user: !!session?.user });
        setUser(session?.user || null);
      });

      return () => {
        if (authListener?.data?.subscription?.unsubscribe) {
          authListener.data.subscription.unsubscribe();
        }
      };
    } catch (err) {
      console.error("❌ Sidebar: Failed to set up auth state listener:", err);
    }
  }, []);

  const handleLogin = () => {
    console.log("🔵 SSO Login clicked!");
    const profilePackageUrl = "http://localhost:8001";

    // For cross-origin SSO, we'll use a special parameter to indicate this is for external app
    const loginUrl = `${profilePackageUrl}/login?external_app=store&origin=${
      encodeURIComponent(globalThis.location?.origin || "")
    }`;

    console.log("🔵 Opening popup to:", loginUrl);

    const popup = globalThis.window?.open(
      loginUrl,
      "sso-login",
      "width=500,height=700,scrollbars=yes,resizable=yes",
    );

    if (!popup) {
      console.error("❌ Failed to open popup - popup blocked?");
      alert("Popup was blocked. Please allow popups for this site and try again.");
      return;
    }

    console.log("✅ Popup opened successfully");

    // Listen for messages from the popup
    const handleMessage = (event: MessageEvent) => {
      console.log("🔍 Received message from popup:", event);
      console.log("🔍 Message origin:", event.origin);
      console.log("🔍 Expected origin:", profilePackageUrl);
      console.log("🔍 Message data:", event.data);

      // Only accept messages from profile package
      if (event.origin !== profilePackageUrl) {
        console.warn(
          "⚠️ Ignoring message from unknown origin:",
          event.origin,
          "expected:",
          profilePackageUrl,
        );
        return;
      }

      if (event.data?.type === "SSO_SUCCESS") {
        console.log("✅ SSO Success message received:", event.data);

        // Extract tokens and user data from message
        const { accessToken, refreshToken, user, expiresIn } = event.data;

        console.log("🔍 Message contents:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasUser: !!user,
          userEmail: user?.email,
          expiresIn: expiresIn,
        });

        if (accessToken && user) {
          // Store the session
          StoreAuthHelpers.storeSession(accessToken, refreshToken || "", user, expiresIn);

          // Update UI
          setUser(user);
          console.log("✅ User logged in via message:", user.email);

          // Close popup
          popup?.close();
        } else {
          console.error("❌ Invalid SSO success message - missing tokens or user");
          console.error("❌ Details:", { accessToken: !!accessToken, user: !!user });
        }
      } else if (event.data?.type === "SSO_ERROR") {
        console.error("❌ SSO Error:", event.data.error);
        popup?.close();
      } else {
        console.log("🔍 Received unknown message type:", event.data?.type);
      }
    };

    // Add message listener
    globalThis.window?.addEventListener("message", handleMessage);

    // Fallback: also check if popup closes without message
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        globalThis.window?.removeEventListener("message", handleMessage);
        console.log("🔵 Popup closed without message");
      }
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      console.log("logout");
      await StoreAuthHelpers.signOut();
      setUser(null);
      // globalThis.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const menuItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      active: currentPath === "/",
    },
    {
      label: "Templates",
      href: "/templates",
      icon: FileText,
      active: currentPath === "/templates",
    },
    {
      label: "Create App",
      href: "/create",
      icon: Plus,
      active: currentPath === "/create",
      requiresAuth: true,
    },
    {
      label: "My Apps",
      href: "/apps",
      icon: Package,
      active: currentPath.startsWith("/apps"),
      requiresAuth: true,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      active: currentPath === "/settings",
      requiresAuth: true,
    },
  ];

  const dropdownItems = [
    {
      label: "View Profile",
      onClick: () => {
        globalThis.window?.open("http://localhost:8001/profile", "_blank");
      },
      icon: User,
    },
    {
      label: "Logout",
      onClick: () => handleLogout(),
      icon: LogOut,
    },
  ];

  return (
    <div className="drawer-side z-40">
      <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
      <aside className="min-h-full w-64 bg-base-200 flex flex-col">
        {/* Logo Section */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold text-base-content">Suppers Store</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="menu space-y-1">
            {menuItems.map((item) => {
              // Hide auth-required items if user is not authenticated
              if (item.requiresAuth && !user && !loading) {
                return null;
              }

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      item.active
                        ? "bg-primary text-primary-content"
                        : "hover:bg-base-300 text-base-content"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Auth Section at Bottom */}
        <div className="p-4 border-t border-base-300">
          {loading
            ? (
              <div className="flex items-center justify-center p-4">
                <Loading size="sm" />
              </div>
            )
            : user
            ? (
              // Authenticated - Show User Profile
              <div className="dropdown dropdown-top dropdown-end w-full">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost w-full justify-start gap-3 p-2"
                >
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      {user.user_metadata?.avatar_url
                        ? (
                          <img
                            alt="User avatar"
                            src={user.user_metadata.avatar_url}
                          />
                        )
                        : (
                          <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center text-sm">
                            {user.email?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium truncate">
                      {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                    </div>
                    <div className="text-xs text-base-content/70 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg mb-2"
                >
                  {dropdownItems.map((item, index) => (
                    <li key={index}>
                      <Button
                        onClick={item.onClick}
                        className="flex items-center gap-2 bg-transparent border-none"
                        variant="ghost"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )
            : (
              // Not Authenticated - Show Login Button
              <div className="space-y-2">
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </div>
            )}
        </div>
      </aside>
    </div>
  );
}
