import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface IndicatorProps extends BaseComponentProps {
  /** Content to display inside the indicator */
  content?: string | number | ComponentChildren;
  /** Child element that the indicator will be positioned relative to */
  children: ComponentChildren;
  /** Position of the indicator relative to the child element */
  position?:
    | "top-start"
    | "top-center"
    | "top-end"
    | "middle-start"
    | "middle-center"
    | "middle-end"
    | "bottom-start"
    | "bottom-center"
    | "bottom-end";
  /** Color variant of the indicator */
  color?: "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";
  /** Size of the indicator */
  size?: "xs" | "sm" | "md" | "lg";
  /** Visual variant of the indicator */
  variant?: "badge" | "dot" | "ping" | "pulse";
  /** Whether to offset the indicator from the edge */
  offset?: boolean;
  /** Click handler for the indicator */
  onIndicatorClick?: () => void;
  /** Whether the indicator is visible */
  visible?: boolean;
  className?: string;
}

export function Indicator({
  children,
  content,
  position = "top-end",
  color = "primary",
  size = "md",
  variant = "badge",
  offset = false,
  className,
  ...props
}: IndicatorProps) {
  // Position classes for indicator
  const positionClasses = {
    "top-start": "indicator-top indicator-start",
    "top-center": "indicator-top indicator-center",
    "top-end": "indicator-top indicator-end",
    "middle-start": "indicator-middle indicator-start",
    "middle-center": "indicator-middle indicator-center",
    "middle-end": "indicator-middle indicator-end",
    "bottom-start": "indicator-bottom indicator-start",
    "bottom-center": "indicator-bottom indicator-center",
    "bottom-end": "indicator-bottom indicator-end",
  };

  // Color classes
  const colorClasses = {
    primary: "badge-primary",
    secondary: "badge-secondary",
    accent: "badge-accent",
    neutral: "badge-neutral",
    info: "badge-info",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
  };

  // Size classes
  const sizeClasses = {
    xs: "badge-xs",
    sm: "badge-sm",
    md: "",
    lg: "badge-lg",
  };

  // Variant classes
  const variantClasses = {
    badge: "badge",
    dot: "badge w-3 h-3 p-0",
    ping: "badge animate-ping",
    pulse: "badge animate-pulse",
  };

  // Build indicator classes
  const indicatorClasses = [
    "indicator-item",
    variantClasses[variant],
    colorClasses[color],
    sizeClasses[size],
    positionClasses[position],
    offset && "indicator-offset",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className="indicator" {...props}>
      <span className={indicatorClasses}>
        {variant === "dot" ? "" : content}
      </span>
      {children}
    </div>
  );
}
