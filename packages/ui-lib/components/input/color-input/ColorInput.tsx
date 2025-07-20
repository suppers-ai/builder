import { BaseComponentProps, ColorProps, DisabledProps, SizeProps } from "../../types.ts";
import { DaisyUIColor } from "../../types.ts";

export interface ColorInputProps extends BaseComponentProps, SizeProps, ColorProps, DisabledProps {
  value?: string;
  placeholder?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: DaisyUIColor;
  bordered?: boolean;
  ghost?: boolean;
  required?: boolean;
  showPreview?: boolean;
  onChange?: (event: Event) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onInput?: (event: Event) => void;
}

export function ColorInput({
  value = "#000000",
  placeholder,
  size = "md",
  color,
  disabled = false,
  bordered = true,
  ghost = false,
  required = false,
  showPreview = true,
  class: className,
  onChange,
  onFocus,
  onBlur,
  onInput,
  ...props
}: ColorInputProps) {
  // Build input classes
  const inputClasses = [
    "input",
    `input-${size}`,
    color && `input-${color}`,
    bordered && "input-bordered",
    ghost && "input-ghost",
    disabled && "input-disabled",
    showPreview && "pl-12",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className="relative">
      {showPreview && (
        <div
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded border border-base-300"
          style={{ backgroundColor: value }}
        />
      )}
      <input
        type="color"
        className={inputClasses}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={onInput}
        {...props}
      />
    </div>
  );
}
