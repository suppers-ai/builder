import { useEffect, useState } from "preact/hooks";
import { BaseComponentProps } from "../../types.ts";
import { SidebarMenu } from "../../navigation/sidebar-menu/SidebarMenu.tsx";

export interface SidebarLayoutProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  // Interactive features
  showControls?: boolean;
  allowKeyboardNav?: boolean;
  autoCloseOnMobile?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  position?: "left" | "right";
  width?: string;
}

export function SidebarLayout({
  class: className = "",
  isOpen,
  onClose,
  showControls = false,
  allowKeyboardNav = true,
  autoCloseOnMobile = true,
  showSearch = true,
  searchPlaceholder = "Search...",
  onSearchChange,
  position = "left",
  width = "w-80",
  id,
  ...props
}: SidebarLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [internalOpen, setInternalOpen] = useState(isOpen);

  // Use internal state if showControls is enabled
  const activeOpen = showControls ? internalOpen : isOpen;

  // Handle keyboard navigation
  useEffect(() => {
    if (!allowKeyboardNav) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeOpen) {
        if (showControls) {
          setInternalOpen(false);
        } else {
          onClose();
        }
      }
    };

    if (activeOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeOpen, onClose, allowKeyboardNav, showControls]);

  // Handle search input change
  const handleSearchChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const query = target.value;
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  // Handle link clicks to close sidebar on mobile
  const handleLinkClick = () => {
    if (autoCloseOnMobile && window.innerWidth < 1024) {
      if (showControls) {
        setInternalOpen(false);
      } else {
        onClose();
      }
    }
  };

  const handleOverlayClick = () => {
    if (showControls) {
      setInternalOpen(false);
    } else {
      onClose();
    }
  };

  // Controls component
  const renderControls = () => {
    if (!showControls) return null;

    return (
      <div class="p-4 border-b border-base-300 bg-base-200">
        <h3 class="text-lg font-bold mb-4">Sidebar Controls</h3>

        <div class="form-control mb-4">
          <label class="label cursor-pointer">
            <span class="label-text">Open/Close</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              checked={internalOpen}
              onChange={(e) => setInternalOpen((e.target as HTMLInputElement).checked)}
            />
          </label>
        </div>

        <div class="form-control mb-4">
          <label class="label cursor-pointer">
            <span class="label-text">Show Search</span>
            <input
              type="checkbox"
              class="toggle toggle-secondary"
              checked={showSearch}
              disabled
            />
          </label>
        </div>

        <div class="form-control mb-4">
          <label class="label cursor-pointer">
            <span class="label-text">Auto-close on Mobile</span>
            <input
              type="checkbox"
              class="toggle toggle-accent"
              checked={autoCloseOnMobile}
              disabled
            />
          </label>
        </div>

        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Search Query</span>
          </label>
          <input
            type="text"
            class="input input-bordered"
            value={searchQuery}
            placeholder="Type to search..."
            readOnly
          />
        </div>

        <div class="stats stats-vertical shadow">
          <div class="stat">
            <div class="stat-title">Status</div>
            <div class="stat-value text-sm">{internalOpen ? "Open" : "Closed"}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Position</div>
            <div class="stat-value text-sm">{position}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Search Results</div>
            <div class="stat-value text-sm">{searchQuery.length > 0 ? "Filtered" : "All"}</div>
          </div>
        </div>
      </div>
    );
  };

  const sidebarClasses = [
    "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-base-100 border-r border-base-300 z-50",
    "transform transition-transform duration-300 ease-in-out overflow-y-auto",
    width,
    position === "left" ? "left-0" : "right-0",
    activeOpen ? "translate-x-0" : (position === "left" ? "-translate-x-full" : "translate-x-full"),
    className,
  ].filter(Boolean).join(" ");

  return (
    <>
      {/* Mobile Overlay - only shown on mobile when open */}
      {activeOpen && (
        <div
          class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar - toggleable on both mobile and desktop */}
      <aside
        class={sidebarClasses}
        role="navigation"
        aria-label="Main navigation"
        id={id}
        {...props}
      >
        {renderControls()}
        <SidebarMenu
          isOpen={activeOpen}
          onClose={showControls ? () => setInternalOpen(false) : onClose}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onLinkClick={handleLinkClick}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
        />
      </aside>
    </>
  );
}
