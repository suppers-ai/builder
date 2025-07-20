import { BaseComponentProps, ColorProps, DisabledProps, SizeProps } from "../../types.ts";

export interface RangeProps extends BaseComponentProps, SizeProps, ColorProps, DisabledProps {
  min?: number;
  max?: number;
  value?: number;
  step?: number;
  onChange?: (event: Event) => void;
}

export function Range({
  class: className = "",
  size = "md",
  color = "primary",
  disabled = false,
  min = 0,
  max = 100,
  value = 50,
  step = 1,
  onChange,
  id,
  ...props
}: RangeProps) {
  const rangeClasses = [
    "range",
    size ? `range-${size}` : "",
    color ? `range-${color}` : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <input
      type="range"
      class={rangeClasses}
      min={min}
      max={max}
      value={value}
      step={step}
      disabled={disabled}
      onChange={onChange}
      id={id}
      {...props}
    />
  );
}
