import { RadioProps } from "./Radio.schema.ts";

export function Radio({
  class: className = "",
  size = "md",
  color = "primary",
  disabled = false,
  name,
  value,
  checked = false,
  label,
  onChange,
  id,
  ...props
}: RadioProps) {
  const radioClasses = [
    "radio",
    size ? `radio-${size}` : "",
    color ? `radio-${color}` : "",
    className,
  ].filter(Boolean).join(" ");

  const content = (
    <input
      type="radio"
      class={radioClasses}
      name={name}
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      id={id}
      {...props}
    />
  );

  if (label) {
    return (
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-3">
          {content}
          <span class="label-text">{label}</span>
        </label>
      </div>
    );
  }

  return content;
}
