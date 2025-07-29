import { useEffect, useState } from "preact/hooks";
import { ChevronDown, ChevronRight, LogIn, LogOut, Palette, User } from "lucide-preact";
import {
  closeGlobalSidebar,
  globalSidebarOpen,
  globalTheme,
  loadSavedTheme,
  LoginButton,
  UserProfileDropdown,
  Accordion,
} from "@suppers/ui-lib";
import type { UserProfileDropdownUser, AccordionItemProps } from "@suppers/ui-lib";
import { defaultUISidebarConfig } from "../utils/sidebar-config.tsx";
import ThemeModal from "./ThemeModal.tsx";

export interface CustomSidebarIslandProps {
  currentPath?: string;
  showLogin?: boolean;
  showProfile?: boolean;
  user?: UserProfileDropdownUser;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function CustomSidebarIsland({
  currentPath = "",
  showLogin = true,
  showProfile = false,
  user,
  onLogin,
  onLogout,
}: CustomSidebarIslandProps) {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Initialize with actual theme from DOM/localStorage on first render
    if (typeof window !== "undefined") {
      const domTheme = document.documentElement.getAttribute("data-theme");
      if (domTheme) return domTheme;

      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme;
    }
    return globalTheme.value;
  });

  const sidebarOpen = globalSidebarOpen.value;

  useEffect(() => {
    // Initialize all sections as open by default
    setOpenSections(defaultUISidebarConfig.sections.map((s) => s.id));

    // Load the saved theme to sync the signal with DOM
    loadSavedTheme();

    // Subscribe to theme changes to keep component reactive
    const unsubscribe = globalTheme.subscribe((newTheme) => {
      setCurrentTheme(newTheme);
    });

    // Subscribe to sidebar state changes and update body class
    const sidebarUnsubscribe = globalSidebarOpen.subscribe((isOpen) => {
      if (typeof document !== "undefined") {
        if (isOpen) {
          document.body.classList.remove("sidebar-closed");
        } else {
          document.body.classList.add("sidebar-closed");
        }
      }
    });

    // Set initial body class based on current sidebar state
    if (typeof document !== "undefined") {
      if (globalSidebarOpen.value) {
        document.body.classList.remove("sidebar-closed");
      } else {
        document.body.classList.add("sidebar-closed");
      }
    }

    return () => {
      unsubscribe();
      sidebarUnsubscribe();
    };
  }, []);

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      globalThis.location.href = "/login";
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      globalThis.location.href = "/auth/logout";
    }
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeGlobalSidebar();
    }
  };

  const handleAccordionToggle = (sectionId: string, isOpen: boolean) => {
    const newOpenSections = [...openSections];
    if (isOpen && !newOpenSections.includes(sectionId)) {
      newOpenSections.push(sectionId);
    } else if (!isOpen && newOpenSections.includes(sectionId)) {
      const index = newOpenSections.indexOf(sectionId);
      newOpenSections.splice(index, 1);
    }
    setOpenSections(newOpenSections);
  };

  // Determine logo based on theme
  const darkThemes = new Set([
    "dark",
    "night",
    "halloween",
    "forest",
    "black",
    "luxury",
    "dracula",
    "synthwave",
    "cyberpunk",
    "dim",
    "coffee",
    "business",
  ]);
  const isDarkTheme = darkThemes.has(currentTheme) || currentTheme?.includes("dark");
  const logoSrc = isDarkTheme ? "/logos/long_dark.png" : "/logos/long_light.png";

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Theme Modal */}
      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      {/* Sidebar */}
      <aside
        class={`fixed top-0 left-0 h-full w-80 bg-base-100 border-r border-base-300 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } z-50 lg:z-30 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div class="p-4 pr-16 border-b border-base-300 bg-base-100">
          <img
            src={logoSrc}
            alt="Suppers Software Logo"
            class="h-11 w-auto"
          />
        </div>

        {/* Scrollable Navigation Content */}
        <div class="flex-1 overflow-y-auto">
          <div class="p-4">
            {/* Quick Links */}
            {defaultUISidebarConfig.quickLinks && (
              <div class="mb-6">
                <div class="space-y-1">
                  {defaultUISidebarConfig.quickLinks.map((link) => (
                    <a
                      key={link.path}
                      href={link.path}
                      class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPath === link.path
                          ? "bg-primary text-primary-content"
                          : "text-base-content hover:bg-base-200"
                      }`}
                    >
                      {link.icon}
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Component Categories - Accordion */}
            <Accordion
              items={defaultUISidebarConfig.sections.map((section): AccordionItemProps => ({
                id: section.id,
                title: (
                  <div class="flex items-center gap-2">
                    {section.icon}
                    <span class="text-sm font-medium text-base-content">{section.title}</span>
                    {section.badge && (
                      <span class="badge badge-primary badge-xs">{section.badge}</span>
                    )}
                  </div>
                ),
                content: (
                  <div class="space-y-1">
                    {section.links.map((link) => (
                      <a
                        key={link.path || link.name}
                        href={link.path}
                        class={`block px-3 py-2 rounded text-sm transition-colors ${
                          currentPath === link.path
                            ? "bg-primary text-primary-content font-medium"
                            : "text-base-content/80 hover:text-base-content hover:bg-base-200"
                        }`}
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                ),
              }))}
              multiple={true}
              openItems={openSections}
              onToggle={handleAccordionToggle}
              class="space-y-1"
            />
          </div>
        </div>

        {/* Sticky Bottom Section */}
        <div class="border-t border-base-300 bg-base-100">
          {/* Theme Selector */}
          <div class="p-4 border-b border-base-300">
            <button
              onClick={() => setShowThemeModal(true)}
              class="w-full flex items-center justify-between p-3 bg-base-200 hover:bg-base-300 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-2">
                <Palette size={16} class="text-base-content/70" />
                <span class="text-sm text-base-content/70">Theme</span>
              </div>
              <ChevronDown size={16} class="text-base-content/50" />
            </button>
          </div>

          {/* Authentication Section */}
          <div class="p-4">
            {showLogin && !user && (
              <button
                onClick={handleLogin}
                class="w-full flex items-center justify-center gap-2 p-3 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <LogIn size={18} />
                Sign In
              </button>
            )}

            {showProfile && user && (
              <div class="space-y-3">
                <div class="p-3 bg-base-200 rounded-lg">
                  <UserProfileDropdown
                    user={user}
                    onLogout={handleLogout}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={handleLogout}
                  class="w-full flex items-center justify-center gap-2 p-3 text-error hover:bg-error/10 rounded-lg transition-colors border border-error/20"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
