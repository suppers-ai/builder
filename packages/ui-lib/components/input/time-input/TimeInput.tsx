import {
  BaseComponentProps,
  ColorProps,
  DisabledProps,
  EventProps,
  SizeProps,
} from "../../types.ts";

export interface TimeInputProps
  extends BaseComponentProps, EventProps, SizeProps, ColorProps, DisabledProps {
  value?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
  bordered?: boolean;
  ghost?: boolean;
  required?: boolean;
}

export function TimeInput({
  value,
  placeholder,
  min,
  max,
  step,
  size = "md",
  color,
  disabled = false,
  bordered = true,
  ghost = false,
  required = false,
  class: className,
  onChange,
  onFocus,
  onBlur,
  onInput,
  ...props
}: TimeInputProps) {
  // Build input classes
  const inputClasses = [
    "input",
    `input-${size}`,
    color && `input-${color}`,
    bordered && "input-bordered",
    ghost && "input-ghost",
    disabled && "input-disabled",
    className,
  ].filter(Boolean).join(" ");

  return (
    <input
      type="time"
      className={inputClasses}
      value={value}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      required={required}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onInput={onInput}
      {...props}
    />
  );
}
