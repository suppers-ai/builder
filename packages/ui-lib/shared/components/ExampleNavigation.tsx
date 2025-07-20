import { useState } from "preact/hooks";
import { ThemeSelector } from "../../islands/ThemeSelector.tsx";
import { CustomThemeCreator } from "../../islands/CustomThemeCreator.tsx";
import { UserAvatar } from "./UserAvatar.tsx";
import type { User } from "../lib/api-helpers.ts";

interface ExampleNavigationProps {
  user: User;
  onSignOut: () => void;
  className?: string;
}

export function ExampleNavigation({ user, onSignOut, className = "" }: ExampleNavigationProps) {
  const [showThemeCreator, setShowThemeCreator] = useState(false);

  // SSR safety check
  if (typeof document === "undefined") {
    return (
      <div class={`navbar bg-base-100 ${className}`}>
        <div class="navbar-start">
          <a class="btn btn-ghost text-xl">🚀 App Builder</a>
        </div>
        <div class="navbar-end">
          <span class="loading loading-spinner loading-sm"></span>
        </div>
      </div>
    );
  }

  const handleThemeChange = (theme: string, customTheme?: any) => {
    console.log(`Theme changed to: ${theme}`, customTheme);
  };

  const handleCreateCustomTheme = () => {
    setShowThemeCreator(true);
  };

  const handleSaveCustomTheme = (theme: any) => {
    console.log("Custom theme saved:", theme);
    setShowThemeCreator(false);
    // Here you would normally save to database and update the theme
  };

  return (
    <>
      <div class={`navbar bg-base-100 shadow-lg ${className}`}>
        {/* Logo/Brand */}
        <div class="navbar-start">
          <div class="dropdown">
            <div tabindex={0} role="button" class="btn btn-ghost lg:hidden">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabindex={0}
              class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <a href="/">🏠 Home</a>
              </li>
              <li>
                <a href="/my-applications">📱 My Apps</a>
              </li>
              <li>
                <a href="/admin">⚙️ Admin</a>
              </li>
            </ul>
          </div>
          <a class="btn btn-ghost text-xl">🚀 App Builder</a>
        </div>

        {/* Desktop Navigation */}
        <div class="navbar-center hidden lg:flex">
          <ul class="menu menu-horizontal px-1">
            <li>
              <a href="/">🏠 Home</a>
            </li>
            <li>
              <a href="/my-applications">📱 My Apps</a>
            </li>
            {(user as any).role === "admin" && (
              <li>
                <a href="/admin">⚙️ Admin</a>
              </li>
            )}
          </ul>
        </div>

        {/* User Actions */}
        <div class="navbar-end">
          <div class="flex items-center gap-2">
            {/* Theme Selector */}
            <ThemeSelector
              user={user}
              onThemeChange={handleThemeChange}
              onCreateCustomTheme={handleCreateCustomTheme}
              allowCustomThemes={true}
              size="sm"
            />

            {/* User Menu */}
            <div class="dropdown dropdown-end">
              <div tabindex={0} role="button" class="btn btn-ghost btn-circle avatar">
                <UserAvatar user={user} size="sm" />
              </div>
              <ul
                tabindex={0}
                class="dropdown-content menu bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li class="menu-title">
                  <span>{user.display_name || user.email}</span>
                </li>
                <li>
                  <a href="/user">👤 Profile</a>
                </li>
                <li>
                  <a href="/user#settings">⚙️ Settings</a>
                </li>
                <li>
                  <a onClick={handleCreateCustomTheme}>🎨 Create Theme</a>
                </li>
                <li>
                  <hr class="my-2" />
                </li>
                <li>
                  <a onClick={onSignOut}>🚪 Sign Out</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Theme Creator Modal */}
      {showThemeCreator && (
        <CustomThemeCreator
          user={user}
          onSave={handleSaveCustomTheme}
          onCancel={() => setShowThemeCreator(false)}
        />
      )}
    </>
  );
}

export default ExampleNavigation;
