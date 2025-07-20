import { BaseComponentProps, ColorProps, DisabledProps, SizeProps } from "../../types.ts";

export interface SelectProps extends BaseComponentProps, SizeProps, ColorProps, DisabledProps {
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  bordered?: boolean;
  ghost?: boolean;
  onChange?: (event: Event) => void;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function Select({
  class: className = "",
  size = "md",
  color,
  disabled = false,
  value,
  options,
  placeholder,
  bordered = true,
  ghost = false,
  onChange,
  id,
  ...props
}: SelectProps) {
  const selectClasses = [
    "select",
    size ? `select-${size}` : "",
    color ? `select-${color}` : "",
    bordered ? "select-bordered" : "",
    ghost ? "select-ghost" : "",
    "w-full max-w-xs",
    className,
  ].filter(Boolean).join(" ");

  return (
    <select
      class={selectClasses}
      value={value}
      disabled={disabled}
      onChange={onChange}
      id={id}
      {...props}
    >
      {placeholder && (
        <option disabled selected={!value}>
          {placeholder}
        </option>
      )}
      {options.map((option, index) => (
        <option
          key={index}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
