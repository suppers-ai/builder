import { ComponentChildren } from "preact";
import { JSX } from "preact";
import { BaseComponentProps } from "../../types.ts";
import { Loading } from "../../feedback/loading/Loading.tsx";

export interface LoadingButtonProps extends BaseComponentProps {
  loading?: boolean;
  children: ComponentChildren;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
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
  outline?: boolean;
  wide?: boolean;
  block?: boolean;
  circle?: boolean;
  square?: boolean;
  glass?: boolean;
  noAnimation?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: MouseEvent) => void;
}

export function LoadingButton({
  class: className = "",
  loading = false,
  children,
  disabled = false,
  size,
  variant,
  outline,
  wide,
  block,
  circle,
  square,
  glass,
  noAnimation,
  type = "button",
  ...props
}: LoadingButtonProps) {
  const buttonClasses = [
    "btn",
    size && `btn-${size}`,
    variant && (outline ? `btn-outline btn-${variant}` : `btn-${variant}`),
    wide && "btn-wide",
    block && "btn-block",
    circle && "btn-circle",
    square && "btn-square",
    glass && "btn-glass",
    noAnimation && "no-animation",
    loading && "loading",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      class={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loading class="loading-spinner loading-sm" />}
      {!loading && children}
    </button>
  );
}
