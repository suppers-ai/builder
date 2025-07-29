import { ComponentChildren } from "preact";
import { BaseComponentProps, ColorProps } from "../../types.ts";

// Link interfaces
export interface LinkProps extends BaseComponentProps, ColorProps {
  /** Link text content */
  children: ComponentChildren;
  /** URL or path to navigate to */
  href?: string;
  /** Link variant style */
  variant?: "default" | "hover" | "focus" | "neutral";
  /** Whether link is underlined */
  underline?: boolean;
  /** Whether link is external (opens in new tab) */
  external?: boolean;
  /** Whether link is disabled */
  disabled?: boolean;
  /** Custom click handler */
  onClick?: (e: Event) => void;
  /** Additional click handling */
  onNavigate?: (href: string) => void;
  className?: string;
}

export function Link({
  children,
  href,
  variant = "default",
  color,
  underline = false,
  external = false,
  disabled = false,
  onClick,
  className,
  ...props
}: LinkProps) {
  const linkClasses = [
    "link",
    variant !== "default" ? `link-${variant}` : "",
    color ? `link-${color}` : "",
    underline ? "underline" : "no-underline",
    disabled ? "link-disabled" : "",
    "transition-colors duration-200",
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    className,
  ].filter(Boolean).join(" ");

  // Handle external links
  const linkProps = {
    href: disabled ? undefined : href,
    target: external ? "_blank" : undefined,
    rel: external ? "noopener noreferrer" : undefined,
    onClick: disabled ? undefined : onClick,
    className: linkClasses,
    "aria-disabled": disabled,
    ...props,
  };

  return (
    <a {...linkProps}>
      {children}
      {external && !disabled && (
        <span className="inline-block ml-1 text-xs opacity-70">
          ↗
        </span>
      )}
    </a>
  );
}
