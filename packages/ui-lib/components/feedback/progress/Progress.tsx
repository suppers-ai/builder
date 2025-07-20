import { BaseComponentProps, ColorProps, SizeProps } from "../../types.ts";

export interface ProgressProps extends BaseComponentProps, SizeProps, ColorProps {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  striped?: boolean;
  animated?: boolean;
}

export function Progress({
  class: className = "",
  size = "md",
  color = "primary",
  value = 0,
  max = 100,
  indeterminate = false,
  striped = false,
  animated = false,
  id,
  ...props
}: ProgressProps) {
  const progressClasses = [
    "progress",
    color ? `progress-${color}` : "",
    size ? `progress-${size}` : "",
    striped ? "progress-striped" : "",
    animated ? "progress-animated" : "",
    className,
  ].filter(Boolean).join(" ");

  if (indeterminate) {
    return <progress class={progressClasses} id={id} {...props}></progress>;
  }

  return (
    <progress
      class={progressClasses}
      value={value}
      max={max}
      id={id}
      {...props}
    >
      {value}%
    </progress>
  );
}
