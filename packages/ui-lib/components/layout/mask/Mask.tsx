import { ComponentChildren } from "preact";
import { BaseComponentProps } from "../../types.ts";

export interface MaskProps extends BaseComponentProps {
  /** Child content to display in the mask */
  children: ComponentChildren;
  /** Mask shape variant */
  variant?:
    | "squircle"
    | "heart"
    | "hexagon"
    | "hexagon-2"
    | "decagon"
    | "pentagon"
    | "diamond"
    | "square"
    | "circle"
    | "parallelogram"
    | "parallelogram-2"
    | "parallelogram-3"
    | "parallelogram-4"
    | "star"
    | "star-2"
    | "triangle"
    | "triangle-2"
    | "triangle-3"
    | "triangle-4";
  /** Optional size modifier */
  size?: "half" | "full";
  /** Click handler for the mask */
  onMaskClick?: () => void;
  className?: string;
}

export function Mask({
  children,
  variant = "squircle",
  size,
  className,
  ...props
}: MaskProps) {
  // Build mask classes
  const maskClasses = [
    "mask",
    `mask-${variant}`,
    size && `mask-${size}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={maskClasses} {...props}>
      {children}
    </div>
  );
}
