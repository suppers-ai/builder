import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

export interface CollapseProps extends BaseComponentProps {
  title: ComponentChildren;
  children: ComponentChildren;
  open?: boolean;
  checkbox?: boolean;
  arrow?: boolean;
  plus?: boolean;
  icon?: ComponentChildren;
  // Controlled mode props
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  // Interactive controls
  showControls?: boolean;
  controlsPosition?: "top" | "bottom";
  allowStyleChange?: boolean;
  allowCustomIcon?: boolean;
  showStatus?: boolean;
}

export function Collapse({
  class: className = "",
  title,
  children,
  open = false,
  checkbox = false,
  arrow = false,
  plus = false,
  icon,
  isOpen,
  onToggle,
  showControls = false,
  controlsPosition = "top",
  allowStyleChange = false,
  allowCustomIcon = false,
  showStatus = false,
  id,
  ...props
}: CollapseProps) {
  // Internal state for interactive controls
  const [internalOpen, setInternalOpen] = useState(open);
  const [currentStyle, setCurrentStyle] = useState<"none" | "arrow" | "plus" | "checkbox">(
    checkbox ? "checkbox" : arrow ? "arrow" : plus ? "plus" : "none"
  );
  const [customIconEnabled, setCustomIconEnabled] = useState(false);
  
  // Use controlled mode if isOpen is provided, otherwise uncontrolled
  const isControlled = isOpen !== undefined;
  const currentOpen = isControlled ? isOpen : (showControls ? internalOpen : open);
  
  // Apply current style from interactive controls
  const activeCheckbox = showControls ? currentStyle === "checkbox" : checkbox;
  const activeArrow = showControls ? currentStyle === "arrow" : arrow;
  const activePlus = showControls ? currentStyle === "plus" : plus;
  
  const collapseClasses = [
    "collapse",
    activeCheckbox ? "collapse-checkbox" : activeArrow ? "collapse-arrow" : activePlus ? "collapse-plus" : "",
    className,
  ].filter(Boolean).join(" ");
  
  // Use custom icon if enabled and provided
  const activeIcon = (showControls && customIconEnabled && allowCustomIcon) ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ) : icon;

  const collapseId = id || `collapse-${Math.random().toString(36).substr(2, 9)}`;

  const handleToggle = () => {
    if (isControlled && onToggle) {
      onToggle(!currentOpen);
    } else if (showControls) {
      setInternalOpen(!currentOpen);
    }
  };

  // Controls component
  const renderControls = () => {
    if (!showControls) return null;

    const controlsClass = controlsPosition === "top" ? "mb-4" : "mt-4";
    
    return (
      <div class={`card bg-base-100 shadow-md ${controlsClass}`}>
        <div class="card-body">
          <h3 class="card-title">Collapse Controls</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allowStyleChange && (
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Style</span>
                </label>
                <select
                  class="select select-bordered"
                  value={currentStyle}
                  onChange={(e) => setCurrentStyle((e.target as HTMLSelectElement).value as any)}
                >
                  <option value="none">None</option>
                  <option value="arrow">Arrow</option>
                  <option value="plus">Plus/Minus</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
            )}

            {allowCustomIcon && (
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Custom Icon</span>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    checked={customIconEnabled}
                    onChange={(e) => setCustomIconEnabled((e.target as HTMLInputElement).checked)}
                  />
                </label>
              </div>
            )}

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Force Open</span>
                <input
                  type="checkbox"
                  class="toggle toggle-secondary"
                  checked={currentOpen}
                  onChange={handleToggle}
                />
              </label>
            </div>
          </div>

          {showStatus && (
            <div class="stats stats-horizontal shadow mt-4">
              <div class="stat">
                <div class="stat-title">State</div>
                <div class="stat-value text-sm">{currentOpen ? "Open" : "Closed"}</div>
              </div>
              <div class="stat">
                <div class="stat-title">Style</div>
                <div class="stat-value text-sm">{currentStyle}</div>
              </div>
              <div class="stat">
                <div class="stat-title">Custom Icon</div>
                <div class="stat-value text-sm">{customIconEnabled ? "Yes" : "No"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (activeCheckbox) {
    if (isControlled || showControls) {
      // Controlled mode - for islands
      return (
        <div class="space-y-6">
          {controlsPosition === "top" && renderControls()}
          <div class={collapseClasses} {...props}>
            <input
              type="checkbox"
              id={collapseId}
              checked={currentOpen}
              onChange={handleToggle}
            />
            <div class="collapse-title text-xl font-medium">
              <label for={collapseId} class="cursor-pointer flex items-center">
                {activeIcon && <span class="mr-2">{activeIcon}</span>}
                {title}
              </label>
            </div>
            <div class="collapse-content">
              {children}
            </div>
          </div>
          {controlsPosition === "bottom" && renderControls()}
        </div>
      );
    } else {
      // Uncontrolled mode - for static display
      return (
        <div class={collapseClasses} {...props}>
          <input type="checkbox" id={collapseId} defaultChecked={currentOpen} />
          <div class="collapse-title text-xl font-medium">
            <label for={collapseId}>
              {activeIcon && <span class="mr-2">{activeIcon}</span>}
              {title}
            </label>
          </div>
          <div class="collapse-content">
            {children}
          </div>
        </div>
      );
    }
  }

  if (isControlled || showControls) {
    // Controlled mode - for islands
    return (
      <div class="space-y-6">
        {controlsPosition === "top" && renderControls()}
        <div class={collapseClasses} {...props}>
          <input
            type="checkbox"
            checked={currentOpen}
            onChange={handleToggle}
            class="sr-only"
          />
          <div
            class="collapse-title text-xl font-medium cursor-pointer"
            onClick={handleToggle}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !e.defaultPrevented) {
                e.preventDefault();
                handleToggle();
              }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={currentOpen}
          >
            {activeIcon && <span class="mr-2">{activeIcon}</span>}
            {title}
          </div>
          <div class="collapse-content">
            {children}
          </div>
        </div>
        {controlsPosition === "bottom" && renderControls()}
      </div>
    );
  } else {
    // Uncontrolled mode - for static display
    return (
      <div class={collapseClasses} {...props}>
        <input type="checkbox" defaultChecked={currentOpen} />
        <div class="collapse-title text-xl font-medium">
          {activeIcon && <span class="mr-2">{activeIcon}</span>}
          {title}
        </div>
        <div class="collapse-content">
          {children}
        </div>
      </div>
    );
  }
}
