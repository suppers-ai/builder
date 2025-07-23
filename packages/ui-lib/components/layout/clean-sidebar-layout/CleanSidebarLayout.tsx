import { useEffect, useState } from "preact/hooks";
import { Code2, X } from "lucide-preact";
import { BaseComponentProps } from "../../types.ts";
import { Sidebar } from "../../navigation/sidebar/Sidebar.tsx";
import { Button } from "../../action/button/Button.tsx";
import { type SidebarConfig, type SidebarLink } from "../../../../shared/types/sidebar.tsx";

export interface CleanSidebarLayoutProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  config: SidebarConfig;
  currentPath?: string;
  // Interactive features
  showControls?: boolean;
  allowKeyboardNav?: boolean;
  autoCloseOnMobile?: boolean;
  showOverlay?: boolean;
  position?: "left" | "right";
  width?: string;
  // Header content
  title?: string;
  onToggle?: () => void;
}

export function CleanSidebarLayout({
  class: className = "",
  isOpen,
  onClose,
  config,
  currentPath = "",
  showControls = false,
  allowKeyboardNav = true,
  autoCloseOnMobile = true,
  showOverlay = true,
  position = "left",
  width = "w-80",
  title = "DaisyUI Components",
  onToggle,
  id,
  ...props
}: CleanSidebarLayoutProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [currentConfig, _setCurrentConfig] = useState(config);

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

  // Handle link clicks to close sidebar on mobile
  const handleLinkClick = (_link: SidebarLink) => {
    if (autoCloseOnMobile && globalThis.innerWidth < 1024) {
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

  // Sidebar header component (shows on desktop when sidebar is open)
  const renderSidebarHeader = () => {
    return (
      <div class="hidden lg:flex items-center justify-between p-4">
        {/* Logo/Brand */}
        <Button as="a" href="/" variant="ghost" class="text-xl font-bold">
          <Code2 size={24} class="text-primary" />
          <span>{title}</span>
        </Button>

        {/* Close button */}
        <Button
          variant="ghost"
          shape="square"
          onClick={onToggle || onClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </Button>
      </div>
    );
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
            <span class="label-text">Keyboard Navigation</span>
            <input
              type="checkbox"
              class="toggle toggle-secondary"
              checked={allowKeyboardNav}
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

        <div class="stats stats-vertical shadow">
          <div class="stat">
            <div class="stat-title">Status</div>
            <div class="stat-value text-sm">{internalOpen ? "Open" : "Closed"}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Position</div>
            <div class="stat-value text-sm">{position}</div>
          </div>
        </div>
      </div>
    );
  };

  const sidebarClasses = [
    // Mobile: positioned below header with overlay behavior
    "fixed top-16 h-[calc(100vh-4rem)] bg-base-100 border-r border-base-300 z-50",
    // Desktop: full height sidebar
    "lg:top-0 lg:h-screen",
    "transform transition-transform duration-300 ease-in-out",
    width,
    position === "left" ? "left-0" : "right-0",
    // On desktop (lg+), sidebar is always positioned normally when open
    // On mobile, it slides in/out with transform
    "lg:transform-none",
    activeOpen
      ? "translate-x-0"
      : (position === "left"
        ? "-translate-x-full lg:translate-x-0"
        : "translate-x-full lg:translate-x-0"),
    // Hide sidebar on desktop when closed
    activeOpen ? "lg:block" : "lg:hidden",
    className,
  ].filter(Boolean).join(" ");

  return (
    <>
      {/* Mobile Overlay - only shown on mobile when open */}
      {showOverlay && activeOpen && (
        <div
          class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        class={sidebarClasses}
        role="navigation"
        aria-label="Main navigation"
        id={id}
        {...props}
      >
        <div class="h-full flex flex-col">
          {renderSidebarHeader()}
          {renderControls()}
          <Sidebar
            config={currentConfig}
            currentPath={currentPath}
            onLinkClick={handleLinkClick}
            class="flex-1 overflow-y-auto"
          />
        </div>
      </aside>
    </>
  );
}
