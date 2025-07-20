import { BaseComponentProps, ColorProps, DisabledProps, SizeProps } from "../../types.ts";

export interface ToggleProps extends BaseComponentProps, SizeProps, ColorProps, DisabledProps {
  checked?: boolean;
  onChange?: (event: Event) => void;
}

export function Toggle({
  class: className = "",
  size = "md",
  color = "primary",
  disabled = false,
  checked = false,
  onChange,
  id,
  children,
  ...props
}: ToggleProps) {
  const toggleClasses = [
    "toggle",
    size ? `toggle-${size}` : "",
    color ? `toggle-${color}` : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div class="form-control">
      <label class="label cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          class={toggleClasses}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          id={id}
          {...props}
        />
        {children && <span class="label-text">{children}</span>}
      </label>
    </div>
  );
}
