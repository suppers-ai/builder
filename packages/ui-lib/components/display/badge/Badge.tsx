import { BaseComponentProps, ColorProps, SizeProps, VariantProps } from "../../types.ts";

export interface BadgeProps extends BaseComponentProps, SizeProps, ColorProps, VariantProps {
  content?: string | number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function Badge({
  children,
  class: className = "",
  size = "md",
  color,
  variant,
  content,
  position,
  id,
  ...props
}: BadgeProps) {
  const badgeClasses = [
    "badge",
    size ? `badge-${size}` : "",
    color ? `badge-${color}` : "",
    variant ? `badge-${variant}` : "",
    className,
  ].filter(Boolean).join(" ");

  const badgeContent = content !== undefined ? content : children;

  if (position && children) {
    // Positioned badge (indicator style)
    return (
      <div class="indicator" id={id} {...props}>
        <span class={`indicator-item ${badgeClasses} ${position ? `indicator-${position}` : ""}`}>
          {badgeContent}
        </span>
        {children}
      </div>
    );
  }

  // Regular badge
  return (
    <div class={badgeClasses} id={id} {...props}>
      {badgeContent}
    </div>
  );
}
