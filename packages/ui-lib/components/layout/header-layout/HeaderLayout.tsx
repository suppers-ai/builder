import { useEffect, useState } from "preact/hooks";
import { Bell, ChevronUp, Code2, Menu, Search, Settings, User } from "lucide-preact";
import { BaseComponentProps } from "../../types.ts";
import { Navbar } from "../../navigation/navbar/Navbar.tsx";
import { Breadcrumbs } from "../../navigation/breadcrumbs/Breadcrumbs.tsx";
import { CleanSidebarLayout } from "../clean-sidebar-layout/CleanSidebarLayout.tsx";
import { GlobalThemeController } from "../../action/theme-controller/ThemeController.tsx";
import { Button } from "../../action/button/Button.tsx";
import { Input } from "../../input/input/Input.tsx";
import { LoginButton } from "../../action/login-button/LoginButton.tsx";
import { SearchButton } from "../../action/search-button/SearchButton.tsx";
import { SearchModal } from "../../action/search-modal/SearchModal.tsx";
import { UserProfileDropdown } from "../../navigation/user-profile-dropdown/UserProfileDropdown.tsx";
import type { SearchResult } from "../../action/search-modal/SearchModal.tsx";
import type { UserProfileDropdownUser } from "../../navigation/user-profile-dropdown/UserProfileDropdown.tsx";
import {
  closeGlobalSidebar,
  globalShowScrollTop,
  globalSidebarOpen,
  initializeSidebar,
  scrollToTop,
  toggleGlobalSidebar,
  updateScrollTop,
} from "../../../utils/signals.ts";
import type { SidebarConfig } from "../../../utils/sidebar-config.tsx";

export interface HeaderLayoutProps extends BaseComponentProps {
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
  showBreadcrumbs?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  showLogin?: boolean;
  user?: UserProfileDropdownUser;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  searchResults?: SearchResult[];
  searchLoading?: boolean;
  sidebarConfig: SidebarConfig;
  currentPath?: string;
  // Interactive features
  showControls?: boolean;
  allowKeyboardShortcuts?: boolean;
  autoInitializeSidebar?: boolean;
  showScrollToTop?: boolean;
}

export function HeaderLayout({
  class: className = "",
  title = "DaisyUI Components",
  breadcrumbs = [],
  showBreadcrumbs = false,
  showSearch = true,
  showNotifications = false,
  showProfile = false,
  showLogin = true,
  user,
  onSearch,
  onNotificationClick,
  onProfileClick,
  onLogin,
  onLogout,
  searchResults = [],
  searchLoading = false,
  sidebarConfig,
  currentPath = "",
  showControls = false,
  allowKeyboardShortcuts = true,
  autoInitializeSidebar = true,
  showScrollToTop = true,
  id,
  ...props
}: HeaderLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);

  // Initialize sidebar state on mount
  useEffect(() => {
    if (autoInitializeSidebar) {
      initializeSidebar();
    }
  }, [autoInitializeSidebar]);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    if (!showScrollToTop) return;

    const handleScroll = () => updateScrollTop();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showScrollToTop]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!allowKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        if (showControls) {
          setInternalSidebarOpen(!internalSidebarOpen);
        } else {
          toggleGlobalSidebar();
        }
      }

      // Open search modal with Ctrl/Cmd + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && showSearch) {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allowKeyboardShortcuts, showControls, internalSidebarOpen, showSearch]);

  // Search functionality
  const handleSearchModalOpen = () => {
    setShowSearchModal(true);
  };

  const handleSearchModalClose = () => {
    setShowSearchModal(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (query: string) => {
    onSearch?.(query);
    setShowSearchModal(false);
  };

  // Authentication handlers
  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = "/login";
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = "/logout";
    }
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    if (showControls) {
      setInternalSidebarOpen(false);
    } else {
      closeGlobalSidebar();
    }
  };

  // Handle scroll to top
  const handleScrollToTop = () => {
    scrollToTop();
  };

  // Toggle sidebar
  const handleSidebarToggle = () => {
    if (showControls) {
      setInternalSidebarOpen(!internalSidebarOpen);
    } else {
      toggleGlobalSidebar();
    }
  };

  // Controls component
  const renderControls = () => {
    if (!showControls) return null;

    return (
      <div class="bg-base-200 p-4 border-b border-base-300">
        <h3 class="text-lg font-bold mb-4">Header Layout Controls</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Show Search</span>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                checked={showSearch}
                disabled
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Show Breadcrumbs</span>
              <input
                type="checkbox"
                class="toggle toggle-secondary"
                checked={showBreadcrumbs}
                disabled
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Keyboard Shortcuts</span>
              <input
                type="checkbox"
                class="toggle toggle-accent"
                checked={allowKeyboardShortcuts}
                disabled
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Sidebar Open</span>
              <input
                type="checkbox"
                class="toggle toggle-info"
                checked={internalSidebarOpen}
                onChange={(e) => setInternalSidebarOpen((e.target as HTMLInputElement).checked)}
              />
            </label>
          </div>
        </div>

        <div class="stats stats-horizontal shadow mt-4">
          <div class="stat">
            <div class="stat-title">Search Active</div>
            <div class="stat-value text-sm">{searchQuery.trim() ? "Yes" : "No"}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Sidebar</div>
            <div class="stat-value text-sm">{internalSidebarOpen ? "Open" : "Closed"}</div>
          </div>
        </div>
      </div>
    );
  };

  const currentSidebarOpen = showControls
    ? internalSidebarOpen
    : (typeof window !== "undefined" ? globalSidebarOpen.value : false);

  const navStart = (
    <div class="flex items-center">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        shape="square"
        class="lg:hidden"
        onClick={handleSidebarToggle}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </Button>

      {/* Fixed-width logo container to maintain consistent spacing */}
      <div class="flex items-center">
        {/* Brand/Logo - use visibility instead of display to maintain space */}
        <Button
          as="a"
          href="/"
          variant="ghost"
          class={`text-xl font-bold ${currentSidebarOpen ? "lg:invisible" : "lg:visible"}`}
        >
          <Code2 size={24} class="text-primary" />
          <span class="hidden sm:inline">{title}</span>
          <span class="sm:hidden">Suppers Software</span>
        </Button>

        {/* Desktop menu button - positioned consistently */}
        <Button
          variant="ghost"
          class={`hidden ${currentSidebarOpen ? "lg:hidden" : "lg:flex"}`}
          onClick={handleSidebarToggle}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </Button>
      </div>
    </div>
  );

  // Remove search from center - it will go to the right
  const navCenter = null;

  const navEnd = (
    <div class="flex items-center gap-2">
      {/* Search button - now on the right */}
      {showSearch && (
        <SearchButton
          onClick={handleSearchModalOpen}
          tooltip="Search (⌘K)"
          variant="ghost"
        />
      )}

      {/* Notifications */}
      {showNotifications && (
        <Button
          variant="ghost"
          shape="square"
          onClick={onNotificationClick}
          aria-label="Notifications"
        >
          <Bell size={18} />
        </Button>
      )}

      {/* Authentication */}
      {user
        ? (
          <UserProfileDropdown
            user={user}
            onLogout={handleLogout}
            onProfile={onProfileClick}
          />
        )
        : showLogin && <LoginButton onClick={handleLogin} />}

      {/* Theme controller */}
      <GlobalThemeController
        themes={[
          "light",
          "dark",
          "cupcake",
          "bumblebee",
          "emerald",
          "corporate",
          "synthwave",
          "retro",
          "cyberpunk",
          "valentine",
          "halloween",
          "garden",
          "forest",
          "aqua",
          "lofi",
          "pastel",
          "fantasy",
          "wireframe",
          "black",
          "luxury",
          "dracula",
          "cmyk",
          "autumn",
          "business",
          "acid",
          "lemonade",
          "night",
          "coffee",
          "winter",
        ]}
        variant="dropdown"
        size="sm"
        showPreview={true}
        enableTransitions={true}
      />
    </div>
  );

  return (
    <div class={className} id={id} {...props}>
      {renderControls()}

      {/* Floating Header Elements */}
      <div class="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {/* Left Side - Logo and Menu */}
        <div class="absolute top-4 left-4 flex items-center gap-2 pointer-events-auto">
          {/* Logo/Brand */}
          <Button
            as="a"
            href="/"
            variant="ghost"
            class="text-xl font-bold bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/30 shadow-lg"
          >
            <Code2 size={24} class="text-white" />
            <span class="hidden sm:inline">{title}</span>
          </Button>

          {/* Menu Button - next to logo */}
          <Button
            variant="ghost"
            class="bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/30 shadow-lg"
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </Button>
        </div>

        {/* Right Side Controls - Top Right */}
        <div class="absolute top-4 right-4 flex items-center gap-2 pointer-events-auto">
          {/* Search button */}
          {showSearch && (
            <SearchButton
              onClick={handleSearchModalOpen}
              variant="ghost"
              class="bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/30 shadow-lg"
            />
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              shape="square"
              onClick={onNotificationClick}
              class="bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/30 shadow-lg"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </Button>
          )}

          {/* Theme controller - same height as other buttons */}
          <Button
            variant="ghost"
            class="bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/30 shadow-lg p-0"
          >
            <GlobalThemeController
              themes={[
                "light",
                "dark",
                "cupcake",
                "bumblebee",
                "emerald",
                "corporate",
                "synthwave",
                "retro",
                "cyberpunk",
                "valentine",
                "halloween",
                "garden",
                "forest",
                "aqua",
                "lofi",
                "pastel",
                "fantasy",
                "wireframe",
                "black",
                "luxury",
                "dracula",
                "cmyk",
                "autumn",
                "business",
                "acid",
                "lemonade",
                "night",
                "coffee",
                "winter",
              ]}
              variant="dropdown"
              size="sm"
              showPreview={true}
              enableTransitions={true}
            />
          </Button>

          {/* Authentication - Far Right */}
          {user
            ? (
              <UserProfileDropdown
                user={user}
                onLogout={handleLogout}
                onProfile={onProfileClick}
                class="bg-black/20 backdrop-blur-md border border-white/20 shadow-lg"
              />
            )
            : showLogin && (
              <LoginButton
                onClick={handleLogin}
                variant="ghost"
                class="bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-black/30 shadow-lg"
              />
            )}
        </div>

        {/* Floating Breadcrumbs */}
        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <div class="absolute top-20 left-4 right-4 pointer-events-auto">
            <div class="bg-black/20 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 shadow-lg">
              <Breadcrumbs
                items={breadcrumbs}
                size="sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <CleanSidebarLayout
        isOpen={currentSidebarOpen}
        onClose={handleSidebarClose}
        onToggle={handleSidebarToggle}
        config={sidebarConfig}
        currentPath={currentPath}
        showControls={showControls}
        title={title}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={handleSearchModalClose}
        onSearch={handleSearchSubmit}
        searchResults={searchResults}
        loading={searchLoading}
        placeholder="Search components..."
        showKeyboardShortcut={true}
      />

      {/* Scroll to Top Button */}
      {showScrollToTop && typeof window !== "undefined" && globalShowScrollTop.value && (
        <Button
          class="fixed bottom-6 right-6 shadow-lg z-40"
          variant="primary"
          shape="circle"
          onClick={() => scrollToTop()}
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </Button>
      )}
    </div>
  );
}
