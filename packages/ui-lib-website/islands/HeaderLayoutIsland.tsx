import { HeaderLayout } from "@suppers/ui-lib";
import type { SearchResult, UserProfileDropdownUser } from "@suppers/ui-lib";
import { useEffect, useState } from "preact/hooks";

export interface HeaderLayoutIslandProps {
  currentPath?: string;
  showControls?: boolean;
  title?: string;
  showSearch?: boolean;
  showLogin?: boolean;
  showProfile?: boolean;
  user?: UserProfileDropdownUser;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function HeaderLayoutIsland({
  currentPath = "",
  showControls = false,
  title = "DaisyUI Components",
  showSearch = true,
  showLogin = true,
  showProfile = false,
  user,
  onLogin,
  onLogout,
}: HeaderLayoutIslandProps) {
  const [mounted, setMounted] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle search functionality
  const handleSearch = async (query: string) => {
    setSearchLoading(true);
    try {
      // Simulate search API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Mock search results for demo
      const mockResults: SearchResult[] = [
        {
          id: "button",
          title: "Button",
          description: "Interactive button component with multiple variants",
          url: "/components/button",
          category: "Action",
        },
        {
          id: "modal",
          title: "Modal",
          description: "Dialog component for displaying content in an overlay",
          url: "/components/modal",
          category: "Action",
        },
        {
          id: "input",
          title: "Input",
          description: "Text input component with validation support",
          url: "/components/input",
          category: "Input",
        },
      ].filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle login
  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      // Default behavior: navigate to login page
      window.location.href = "/login";
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default behavior: navigate to logout endpoint
      window.location.href = "/auth/logout";
    }
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div class="h-16 bg-base-100 border-b border-base-300">
        <div class="flex items-center justify-between h-full px-4">
          <div class="text-xl font-bold">{title}</div>
          <div class="w-8 h-8 bg-base-300 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <HeaderLayout
      title={title}
      currentPath={currentPath}
      showControls={showControls}
      showSearch={showSearch}
      showLogin={showLogin}
      showProfile={showProfile}
      user={user}
      onSearch={handleSearch}
      onLogin={handleLogin}
      onLogout={handleLogout}
      searchResults={searchResults}
      searchLoading={searchLoading}
      showScrollToTop={true}
      autoInitializeSidebar={true}
      allowKeyboardShortcuts={true}
      showBreadcrumbs={false}
      showNotifications={false}
    />
  );
}
