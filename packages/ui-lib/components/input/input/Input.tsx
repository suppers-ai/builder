import {
  BaseComponentProps,
  ColorProps,
  DisabledProps,
  EventProps,
  SizeProps,
} from "../../types.ts";

export interface InputProps
  extends BaseComponentProps, EventProps, SizeProps, ColorProps, DisabledProps {
  type?: string;
  placeholder?: string;
  value?: string;
  bordered?: boolean;
  ghost?: boolean;
}

export function Input({
  class: className = "",
  type = "text",
  size = "md",
  color,
  placeholder = "",
  value = "",
  bordered = true,
  ghost = false,
  disabled = false,
  id,
  onChange,
  onFocus,
  onBlur,
  onInput,
  ...props
}: InputProps) {
  const inputClasses = [
    "input",
    size ? `input-${size}` : "",
    color ? `input-${color}` : "",
    bordered ? "input-bordered" : "",
    ghost ? "input-ghost" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <input
      type={type}
      class={inputClasses}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      id={id}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onInput={onInput}
      {...props}
    />
  );
}
