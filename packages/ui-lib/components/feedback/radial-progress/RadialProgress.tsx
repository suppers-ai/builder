import { BaseComponentProps, ColorProps, SizeProps } from "../../types.ts";

export interface RadialProgressProps extends BaseComponentProps, SizeProps, ColorProps {
  value?: number;
  max?: number;
  thickness?: number;
  showValue?: boolean;
  label?: string;
  // Controlled mode props
  animatedValue?: number;
  _onChange?: (value: number) => void;
}

export function RadialProgress({
  class: className = "",
  value = 0,
  max = 100,
  size = "md",
  color = "primary",
  thickness = 4,
  showValue = true,
  label,
  animatedValue,
  _onChange,
  id,
  ...props
}: RadialProgressProps) {
  // Use animatedValue if provided (controlled mode), otherwise use value
  const currentValue = animatedValue !== undefined ? animatedValue : value;

  // Normalize value between 0 and 100
  const percentage = Math.min(Math.max((currentValue / max) * 100, 0), 100);

  const sizeClasses = {
    xs: "w-8 h-8 text-xs",
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-20 h-20 text-lg",
    xl: "w-24 h-24 text-xl",
  };

  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    neutral: "text-neutral",
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
    "base-100": "text-base-100",
    "base-200": "text-base-200",
    "base-300": "text-base-300",
  };

  const progressClasses = [
    "radial-progress",
    sizeClasses[size],
    colorClasses[color],
    className,
  ].filter(Boolean).join(" ");

  const style = {
    "--value": percentage,
    "--size": thickness + "px",
  };

  return (
    <div class="flex flex-col items-center gap-2">
      <div
        class={progressClasses}
        style={style}
        role="progressbar"
        aria-valuenow={Math.round(currentValue)}
        aria-valuemin={0}
        aria-valuemax={max}
        id={id}
        {...props}
      >
        {showValue && (
          <span class="font-bold">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      {label && <span class="text-sm font-medium text-center">{label}</span>}
    </div>
  );
}
