import { BaseComponentProps, DaisyUIColor } from "../../types.ts";

export interface TooltipProps extends BaseComponentProps {
  tip: string;
  position?: "top" | "bottom" | "left" | "right";
  color?: DaisyUIColor;
  open?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

export function Tooltip({
  class: className = "",
  tip,
  position = "top",
  color,
  open = false,
  children,
  id,
  ...props
}: TooltipProps) {
  const tooltipClasses = [
    "tooltip",
    position ? `tooltip-${position}` : "",
    color ? `tooltip-${color}` : "",
    open ? "tooltip-open" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div
      class={tooltipClasses}
      data-tip={tip}
      id={id}
      {...props}
    >
      {children}
    </div>
  );
}
