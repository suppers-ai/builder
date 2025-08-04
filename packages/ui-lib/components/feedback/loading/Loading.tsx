import { BaseComponentProps, ColorProps, SizeProps } from "../../types.ts";

export interface LoadingProps extends BaseComponentProps, SizeProps, ColorProps {
  variant?: "spinner" | "dots" | "ring" | "ball" | "bars" | "infinity";
}

export function Loading({
  class: className = "",
  size = "md",
  color,
  variant = "spinner",
  id,
  ...props
}: LoadingProps) {
  const loadingClasses = [
    "loading",
    `loading-${variant}`,
    size ? `loading-${size}` : "",
    color ? `text-${color}` : "",
    className,
  ].filter(Boolean).join(" ");

  return <span class={loadingClasses} id={id} {...props}></span>;
}
