import { CheckboxProps } from "./Checkbox.schema.ts";

export function Checkbox({
  class: className = "",
  size = "md",
  color = "primary",
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  id,
  onChange,
  ...props
}: CheckboxProps) {
  const checkboxClasses = [
    "checkbox",
    size ? `checkbox-${size}` : "",
    color ? `checkbox-${color}` : "",
    className,
  ].filter(Boolean).join(" ");

  const checkbox = (
    <input
      type="checkbox"
      class={checkboxClasses}
      checked={checked}
      disabled={disabled}
      id={id}
      ref={(el) => {
        if (el) {
          el.indeterminate = indeterminate;
        }
      }}
      onChange={onChange}
      {...props}
    />
  );

  if (label) {
    return (
      <div class="form-control">
        <label class="label cursor-pointer">
          {checkbox}
          <span class="label-text">{label}</span>
        </label>
      </div>
    );
  }

  return checkbox;
}
