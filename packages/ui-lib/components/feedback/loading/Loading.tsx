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
    "loading loading loading-spinner",
    `loading loading loading-spinner-${variant}`,
    size ? `loading loading loading-spinner-${size}` : "",
    color ? `text-${color}` : "",
    className,
  ].filter(Boolean).join(" ");

  return <span class={loadingClasses} id={id} {...props}></span>;
}
