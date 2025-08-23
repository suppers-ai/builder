import { useEffect, useState } from "preact/hooks";
import SimpleAuthButton from "./SimpleAuthButton.tsx";
import { Button, Logo } from "@suppers/ui-lib";
import { FolderOpen, Settings, Share2, Upload } from "lucide-preact";
import { UserSettingsModal } from "../components/UserSettingsModal.tsx";
import { getAuthClient } from "../lib/auth.ts";
import { userPreferences } from "../lib/user-preferences.ts";
import { errorMonitor } from "../lib/error-monitoring.ts";

interface SimpleNavbarProps {
  currentPath?: string;
}

export default function SimpleNavbar({ currentPath = "/" }: SimpleNavbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authClient = getAuthClient();
        const authenticated = await authClient.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const user = await authClient.getUser();
          if (user?.id) {
            userPreferences.setUserId(user.id);
            localStorage.setItem("user-id", user.id);
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        errorMonitor.reportError(error as Error, { context: "navbar-auth-check" });
      }
    };

    checkAuth();

    // Listen for settings keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        setShowSettings(true);
        errorMonitor.reportUserAction("Open settings via keyboard shortcut");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDocsClick = () => {
    // Open docs in new tab
    globalThis.open("https://docs.suppers.ai", "_blank");
    errorMonitor.reportUserAction("Open documentation");
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    errorMonitor.reportUserAction("Open settings modal");
  };

  return (
    <div class="navbar bg-base-100 border-b border-base-200">
      {/* Logo - Left */}
      <div class="navbar-start">
        <Logo
          href="/"
          alt="Sorted Storage Logo"
          variant="long"
          size="lg"
        />
      </div>

      {/* Navigation - Center */}
      <div class="navbar-center">
        <ul class="menu menu-horizontal px-1 gap-2 hidden md:flex">
          <li>
            <Button
              onClick={() => globalThis.location.href = "/"}
              class={`font-medium ${
                currentPath === "/" || currentPath === "/dashboard"
                  ? "text-primary bg-primary/10"
                  : "text-base-content hover:text-primary"
              } bg-transparent border-none`}
              variant="ghost"
            >
              <FolderOpen class="w-4 h-4 mr-1" />
              Storage
            </Button>
          </li>
          <li>
            <Button
              onClick={() => globalThis.location.href = "/dashboard"}
              class={`font-medium ${
                currentPath === "/dashboard" || currentPath.startsWith("/folder")
                  ? "text-primary bg-primary/10"
                  : "text-base-content hover:text-primary"
              } bg-transparent border-none`}
              variant="ghost"
            >
              <Upload class="w-4 h-4 mr-1" />
              Dashboard
            </Button>
          </li>
          <li>
            <Button
              onClick={handleDocsClick}
              class="font-medium text-base-content hover:text-primary bg-transparent border-none"
              variant="ghost"
            >
              Docs
            </Button>
          </li>
        </ul>
      </div>

      {/* Auth and Mobile Menu - Right */}
      <div class="navbar-end">
        {/* Settings Button - Only when authenticated */}
        {isAuthenticated && (
          <div class="mr-2">
            <Button
              onClick={handleSettingsClick}
              variant="ghost"
              size="sm"
              class="btn-square"
              title="Settings (Alt+S)"
              aria-label="Open settings"
            >
              <Settings class="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Auth Button - Always visible */}
        <div class="mr-2">
          <SimpleAuthButton />
        </div>

        {/* Mobile menu - dropdown */}
        <div class="md:hidden">
          <div class="dropdown dropdown-end">
            <div tabIndex={0} role="button" class="btn btn-ghost btn-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow border border-base-200"
            >
              <li>
                <a
                  href="/"
                  class={`${currentPath === "/" || currentPath === "/dashboard" ? "active" : ""}`}
                >
                  <FolderOpen class="w-4 h-4" />
                  Storage
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  class={`${
                    currentPath === "/dashboard" || currentPath.startsWith("/folder")
                      ? "active"
                      : ""
                  }`}
                >
                  <Upload class="w-4 h-4" />
                  Dashboard
                </a>
              </li>
              <li>
                <button
                  onClick={handleDocsClick}
                  class="w-full text-left"
                >
                  Docs
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <UserSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
