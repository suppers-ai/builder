import { BaseComponentProps, SizeProps } from "../../types.ts";

export interface KbdProps extends BaseComponentProps, SizeProps {
  variant?: "default" | "primary" | "secondary" | "accent" | "ghost";
  // Controlled mode props
  onClick?: () => void;
}

export function Kbd({
  class: className = "",
  children,
  size = "md",
  variant = "default",
  onClick,
  id,
  ...props
}: KbdProps) {
  const sizeClasses = {
    xs: "kbd-xs",
    sm: "kbd-sm",
    md: "kbd-md",
    lg: "kbd-lg",
    xl: "kbd-xl",
  };

  const variantClasses = {
    default: "",
    primary: "kbd-primary",
    secondary: "kbd-secondary",
    accent: "kbd-accent",
    ghost: "kbd-ghost",
  };

  const kbdClasses = [
    "kbd",
    sizeClasses[size],
    variantClasses[variant],
    onClick ? "cursor-pointer hover:opacity-80" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <kbd
      class={kbdClasses}
      onClick={onClick}
      id={id}
      {...props}
    >
      {children}
    </kbd>
  );
}
