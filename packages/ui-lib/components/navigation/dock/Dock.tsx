import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";
import { Badge } from "../../display/badge/Badge.tsx";

export interface DockItem {
  /** Unique identifier */
  id: string;
  /** Item label */
  label: string;
  /** Icon component or content */
  icon?: ComponentChildren;
  /** Whether item is active */
  active?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Badge count or content */
  badge?: string | number;
  /** Click handler */
  onClick?: () => void;
  /** Href for navigation */
  href?: string;
}

export interface DockProps extends BaseComponentProps {
  /** Items to display in the dock */
  items: DockItem[];
  /** Position of the dock */
  position?: "bottom" | "top" | "left" | "right";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Background variant */
  variant?: "default" | "primary" | "secondary" | "accent" | "neutral" | "ghost";
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether dock is fixed position */
  fixed?: boolean;
  onItemClick?: (item: DockItem, index: number) => void;
  className?: string;
}

export function Dock({
  items = [],
  position = "bottom",
  size = "md",
  variant = "default",
  showLabels = true,
  fixed = false,
  className,
  ...props
}: DockProps) {
  // Position classes
  const positionClasses = {
    bottom: fixed ? "fixed bottom-0 left-0 right-0 w-full" : "w-full",
    top: fixed ? "fixed top-0 left-0 right-0 w-full" : "w-full",
    left: fixed ? "fixed left-0 top-0 bottom-0 h-full" : "h-full",
    right: fixed ? "fixed right-0 top-0 bottom-0 h-full" : "h-full",
  };

  // Size classes
  const sizeClasses = {
    sm: "h-14",
    md: "h-16",
    lg: "h-20",
  };

  // Variant classes
  const variantClasses = {
    default: "bg-base-100 border-base-300",
    primary: "bg-primary text-primary-content",
    secondary: "bg-secondary text-secondary-content",
    accent: "bg-accent text-accent-content",
    neutral: "bg-neutral text-neutral-content",
    ghost: "bg-transparent",
  };

  // Layout classes based on position
  const layoutClasses = position === "left" || position === "right"
    ? "flex-col justify-start"
    : "flex-row justify-center";

  // Item size classes
  const itemSizeClasses = {
    sm: "w-12 h-12 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-16 h-16 text-base",
  };

  const dockClasses = [
    "dock",
    "flex items-center",
    positionClasses[position],
    position === "bottom" || position === "top" ? sizeClasses[size] : "w-16",
    variantClasses[variant],
    layoutClasses,
    position === "bottom" || position === "top" ? "border-t" : "border-r",
    "shadow-lg",
    "z-50",
    className,
  ].filter(Boolean).join(" ");

  return (
    <nav className={dockClasses} {...props}>
      <div
        className={`flex ${layoutClasses} gap-1 ${
          position === "bottom" || position === "top" ? "px-4" : "py-4"
        } flex-1`}
      >
        {items.map((item) => {
          const ItemComponent = item.href ? "a" : "button";

          return (
            <ItemComponent
              key={item.id}
              href={item.href}
              onClick={item.onClick}
              disabled={item.disabled}
              className={[
                "dock-item",
                "flex flex-col items-center justify-center",
                "relative transition-all duration-200",
                "hover:scale-110 active:scale-95",
                itemSizeClasses[size],
                item.active ? "text-primary" : "text-base-content/70 hover:text-base-content",
                item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                "rounded-lg hover:bg-base-200/50",
              ].filter(Boolean).join(" ")}
            >
              {/* Icon */}
              {item.icon && (
                <div className="dock-icon text-lg mb-1">
                  {item.icon}
                </div>
              )}

              {/* Label */}
              {showLabels && (
                <span className="dock-label text-xs font-medium truncate max-w-full">
                  {item.label}
                </span>
              )}

              {/* Badge */}
              {item.badge && (
                <Badge
                  color="primary"
                  size="xs"
                  class="absolute -top-1 -right-1"
                >
                  {item.badge}
                </Badge>
              )}

              {/* Active indicator */}
              {item.active && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </ItemComponent>
          );
        })}
      </div>
    </nav>
  );
}
