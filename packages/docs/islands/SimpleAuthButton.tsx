import { useEffect, useState } from "preact/hooks";
import { DocsAuthHelpers } from "../lib/auth-helpers.ts";
import type { StoredUser } from "../lib/auth-helpers.ts";
import { User, LogIn, LogOut } from "lucide-preact";

export default function SimpleAuthButton() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 SimpleAuthButton: Checking authentication...");
        const currentUser = await DocsAuthHelpers.getCurrentUser();
        console.log("🔍 SimpleAuthButton: Auth check result:", { user: !!currentUser, email: currentUser?.email });
        
        if (currentUser) {
          // Apply user's theme if they're already logged in
          DocsAuthHelpers.setUserTheme(currentUser);
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
  }, []);

  const handleLogin = () => {
    console.log("🔵 SSO Login clicked!");
    const profilePackageUrl = "http://localhost:8001";
    const loginUrl = `${profilePackageUrl}/login?external_app=docs&origin=${encodeURIComponent(globalThis.location?.origin || "")}`;
    
    const popup = globalThis.window?.open(
      loginUrl,
      "sso-login",
      "width=500,height=700,scrollbars=yes,resizable=yes"
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
          DocsAuthHelpers.storeSession(accessToken, refreshToken || "", user, expiresIn);
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
      await DocsAuthHelpers.signOut();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center">
        <div class="loading loading-spinner loading-sm"></div>
      </div>
    );
  }

  if (user) {
    // User is authenticated - show user dropdown (same as store package)
    return (
      <div class="dropdown dropdown-top dropdown-end w-full">
        <div tabIndex={0} role="button" class="btn btn-ghost btn-sm gap-2 w-full justify-start">
          <div class="avatar">
            <div class="w-6 rounded-full">
              {user.user_metadata?.avatar_url ? (
                <img
                  alt="User avatar"
                  src={user.user_metadata.avatar_url}
                />
              ) : (
                <div class="bg-neutral text-neutral-content rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
          </div>
          <span class="text-sm font-medium truncate">
            {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
          </span>
        </div>
        <ul
          tabIndex={0}
          class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg mb-2"
        >
          <li>
            <button
              onClick={() => {
                globalThis.window?.open("http://localhost:8001/profile", "_blank");
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
    <button
      onClick={handleLogin}
      class="w-full flex items-center justify-center gap-2 p-3 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors font-medium"
    >
      <LogIn size={18} />
      Sign In
    </button>
  );
}