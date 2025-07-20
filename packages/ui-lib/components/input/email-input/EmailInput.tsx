import {
  BaseComponentProps,
  ColorProps,
  DisabledProps,
  EventProps,
  SizeProps,
} from "../../types.ts";

export interface EmailInputProps
  extends BaseComponentProps, EventProps, SizeProps, ColorProps, DisabledProps {
  value?: string;
  placeholder?: string;
  bordered?: boolean;
  ghost?: boolean;
  required?: boolean;
  autoComplete?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export function EmailInput({
  value,
  placeholder = "your@email.com",
  size = "md",
  color,
  disabled = false,
  bordered = true,
  ghost = false,
  required = false,
  autoComplete = "email",
  class: className,
  onChange,
  onFocus,
  onBlur,
  onInput,
  ...props
}: EmailInputProps) {
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
      type="email"
      className={inputClasses}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onInput={onInput}
      {...props}
    />
  );
}
