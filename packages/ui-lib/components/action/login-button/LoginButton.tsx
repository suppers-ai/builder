import { ComponentChildren } from "preact";
import { LogIn } from "lucide-preact";
import { Button } from "../button/Button.tsx";

export interface LoginButtonProps {
  children?: ComponentChildren;
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "ghost"
    | "link"
    | "info"
    | "success"
    | "warning"
    | "error";
  size?: "xs" | "sm" | "md" | "lg";
  class?: string;
  href?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  showIcon?: boolean;
}

export function LoginButton({
  children = "Login",
  variant = "primary",
  size = "md",
  class: className = "",
  href = "/login",
  onClick,
  loading = false,
  disabled = false,
  showIcon = true,
  ...props
}: LoginButtonProps) {
  const content = (
    <>
      {showIcon && (
        <LogIn size={size === "xs" ? 14 : size === "sm" ? 16 : size === "lg" ? 20 : 18} />
      )}
      {children}
    </>
  );

  if (href && !onClick) {
    return (
      <Button
        as="a"
        href={href}
        variant={variant}
        size={size}
        class={className}
        loading={loading}
        disabled={disabled}
        {...props}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      class={className}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      {...props}
    >
      {content}
    </Button>
  );
}
