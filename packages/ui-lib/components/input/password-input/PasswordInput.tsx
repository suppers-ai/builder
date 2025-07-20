import {
  BaseComponentProps,
  ColorProps,
  DisabledProps,
  EventProps,
  SizeProps,
} from "../../types.ts";

export interface PasswordInputProps
  extends BaseComponentProps, EventProps, SizeProps, ColorProps, DisabledProps {
  value?: string;
  placeholder?: string;
  bordered?: boolean;
  ghost?: boolean;
  required?: boolean;
  autoComplete?: string;
  showToggle?: boolean;
  onChange?: (value: string) => void;
  onVisibilityToggle?: (visible: boolean) => void;
}

export function PasswordInput({
  value,
  placeholder = "••••••••",
  size = "md",
  color,
  disabled = false,
  bordered = true,
  ghost = false,
  required = false,
  autoComplete = "current-password",
  showToggle = true,
  class: className,
  onChange,
  onFocus,
  onBlur,
  onInput,
  ...props
}: PasswordInputProps) {
  const isVisible = false; // Static for SSR, always show as password

  // Build input classes
  const inputClasses = [
    "input",
    `input-${size}`,
    color && `input-${color}`,
    bordered && "input-bordered",
    ghost && "input-ghost",
    disabled && "input-disabled",
    showToggle && "pr-12",
    className,
  ].filter(Boolean).join(" ");

  // Toggle functionality removed for SSR - use Island component for interactivity

  return (
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
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
      {showToggle && (
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content"
          // onClick functionality removed for SSR compatibility
          disabled={disabled}
        >
          {isVisible
            ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            )
            : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
        </button>
      )}
    </div>
  );
}
