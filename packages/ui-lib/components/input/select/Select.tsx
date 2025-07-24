import { SelectProps, SelectOption } from "./Select.schema.ts";

export function Select({
  class: className = "",
  size = "md",
  color,
  disabled = false,
  value,
  options = [],
  placeholder,
  bordered = true,
  ghost = false,
  onChange,
  id,
  // Extract schema-specific props that conflict with HTML attributes
  children,
  name,
  defaultValue,
  required,
  // Extract accessibility props to avoid type conflicts
  role,
  tabIndex,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  "aria-expanded": ariaExpanded,
  "aria-hidden": ariaHidden,
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
      id={id}
      name={name}
      defaultValue={defaultValue}
      required={required}
      onChange={onChange}
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
