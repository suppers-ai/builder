import {
  BaseComponentProps,
  ColorProps,
  DisabledProps,
  EventProps,
  SizeProps,
} from "../../types.ts";

export interface DateInputProps
  extends BaseComponentProps, EventProps, SizeProps, ColorProps, DisabledProps {
  value?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  bordered?: boolean;
  ghost?: boolean;
  required?: boolean;
}

export function DateInput({
  value,
  placeholder,
  min,
  max,
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
}: DateInputProps) {
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
      type="date"
      className={inputClasses}
      value={value}
      placeholder={placeholder}
      min={min}
      max={max}
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
