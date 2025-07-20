import {
  BaseComponentProps,
  ColorProps,
  DisabledProps,
  LoadingProps,
  SizeProps,
  VariantProps,
} from "../../types.ts";

export interface ButtonProps
  extends BaseComponentProps, SizeProps, ColorProps, VariantProps, DisabledProps, LoadingProps {
  type?: "button" | "submit" | "reset";
  wide?: boolean;
  circle?: boolean;
  square?: boolean;
  shape?: "circle" | "square";
  glass?: boolean;
  noAnimation?: boolean;
  active?: boolean;
  as?: string;
  href?: string;
  target?: string;
  rel?: string;
  tabIndex?: number;
  role?: string;
  onClick?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

export function Button({
  children,
  class: className = "",
  type = "button",
  size,
  color,
  variant,
  disabled = false,
  loading = false,
  wide = false,
  circle = false,
  square = false,
  shape,
  glass = false,
  noAnimation = false,
  active = false,
  as = "button",
  href,
  target,
  rel,
  tabIndex,
  role,
  id,
  onClick,
  onFocus,
  onBlur,
  ...props
}: ButtonProps) {
  const classes = [
    "btn",
    size ? `btn-${size}` : "",
    color ? `btn-${color}` : "",
    variant ? `btn-${variant}` : "",
    wide ? "btn-wide" : "",
    circle || shape === "circle" ? "btn-circle" : "",
    square || shape === "square" ? "btn-square" : "",
    glass ? "glass" : "",
    noAnimation ? "no-animation" : "",
    active ? "btn-active" : "",
    loading ? "loading" : "",
    className,
  ].filter(Boolean).join(" ");

  const Component = as as any;

  return (
    <Component
      type={as === "button" ? type : undefined}
      class={classes}
      disabled={disabled || loading}
      href={href}
      target={target}
      rel={rel}
      tabIndex={tabIndex}
      role={role}
      id={id}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      {...props}
    >
      {loading && <span class="loading loading-spinner"></span>}
      {children}
    </Component>
  );
}
