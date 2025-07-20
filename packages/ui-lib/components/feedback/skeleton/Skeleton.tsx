import { BaseComponentProps } from "../../types.ts";

export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  rounded?: boolean;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  class: className = "",
  width,
  height,
  circle = false,
  rounded = true,
  animation = "pulse",
  id,
  ...props
}: SkeletonProps) {
  const skeletonClasses = [
    "skeleton",
    circle ? "w-12 h-12 rounded-full" : "",
    rounded && !circle ? "rounded" : "",
    animation === "pulse" ? "animate-pulse" : "",
    className,
  ].filter(Boolean).join(" ");

  const style: Record<string, string> = {};
  if (width && !circle) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height && !circle) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      class={skeletonClasses}
      style={style}
      id={id}
      {...props}
    />
  );
}
