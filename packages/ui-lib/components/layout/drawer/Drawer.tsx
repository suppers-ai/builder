import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

export interface DrawerProps extends BaseComponentProps {
  side?: "left" | "right";
  open?: boolean;
  overlay?: boolean;
  sidebarContent: ComponentChildren;
  children: ComponentChildren;
  // Controlled mode props
  onToggle?: (open: boolean) => void;
  onClose?: () => void;
  // Interactive controls
  showControls?: boolean;
  allowSideSwitch?: boolean;
  allowOverlayToggle?: boolean;
  showStatus?: boolean;
  controlsPosition?: "sidebar" | "content";
}

export function Drawer({
  class: className = "",
  side = "left",
  open = false,
  overlay = true,
  sidebarContent,
  children,
  onToggle,
  onClose,
  showControls = false,
  allowSideSwitch = false,
  allowOverlayToggle = false,
  showStatus = false,
  controlsPosition = "sidebar",
  id,
  ...props
}: DrawerProps) {
  // Internal state for interactive controls
  const [internalOpen, setInternalOpen] = useState(open);
  const [currentSide, setCurrentSide] = useState<"left" | "right">(side);
  const [overlayEnabled, setOverlayEnabled] = useState(overlay);

  // Use internal state if showControls is enabled, otherwise use props
  const isControlled = onToggle !== undefined;
  const currentOpen = isControlled ? open : (showControls ? internalOpen : open);
  const activeSide = showControls ? currentSide : side;
  const activeOverlay = showControls ? overlayEnabled : overlay;

  const drawerClasses = [
    "drawer",
    activeSide === "right" ? "drawer-end" : "",
    className,
  ].filter(Boolean).join(" ");

  const drawerId = id || "drawer-toggle";

  const handleToggle = () => {
    const newState = !currentOpen;
    if (isControlled) {
      onToggle?.(newState);
    } else if (showControls) {
      setInternalOpen(newState);
    }
  };

  const handleOverlayClick = () => {
    if (activeOverlay) {
      if (isControlled) {
        onToggle?.(false);
        onClose?.();
      } else if (showControls) {
        setInternalOpen(false);
      }
    }
  };

  // Controls component
  const renderControls = () => {
    if (!showControls) return null;

    return (
      <div class="mb-4">
        <h3 class="text-lg font-bold mb-4">Interactive Drawer Controls</h3>
        <p class="mb-4">This drawer is controlled by React state.</p>

        {allowOverlayToggle && (
          <div class="form-control mb-4">
            <label class="label cursor-pointer">
              <span class="label-text">Overlay</span>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                checked={overlayEnabled}
                onChange={(e) => setOverlayEnabled((e.target as HTMLInputElement).checked)}
              />
            </label>
          </div>
        )}

        {allowSideSwitch && (
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Side</span>
            </label>
            <select
              class="select select-bordered"
              value={currentSide}
              onChange={(e) =>
                setCurrentSide((e.target as HTMLSelectElement).value as "left" | "right")}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        )}

        <button
          class="btn btn-primary btn-block mb-4"
          onClick={handleToggle}
        >
          {currentOpen ? "Close Drawer" : "Open Drawer"}
        </button>

        {showStatus && (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="stat bg-base-200">
              <div class="stat-title">Drawer State</div>
              <div class="stat-value text-lg">{currentOpen ? "Open" : "Closed"}</div>
            </div>
            <div class="stat bg-base-200">
              <div class="stat-title">Side</div>
              <div class="stat-value text-lg">{activeSide}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div class={drawerClasses} {...props}>
      <input
        id={drawerId}
        type="checkbox"
        class="drawer-toggle"
        checked={currentOpen}
        onChange={handleToggle}
      />

      <div class="drawer-content flex flex-col">
        {controlsPosition === "content" && (
          <div class="p-8">
            {renderControls()}
          </div>
        )}
        {children}
      </div>

      <div class="drawer-side">
        {activeOverlay && (
          <label
            for={drawerId}
            aria-label="close sidebar"
            class="drawer-overlay"
            onClick={handleOverlayClick}
          >
          </label>
        )}
        <aside class="bg-base-200 min-h-full w-80 p-4">
          {controlsPosition === "sidebar" && renderControls()}
          {sidebarContent}
        </aside>
      </div>
    </div>
  );
}
