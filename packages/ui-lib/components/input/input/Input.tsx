import { useState } from "preact/hooks";
import { InputProps } from "./Input.schema.ts";

export function Input({
  class: className = "",
  type = "text",
  size = "md",
  color,
  placeholder = "",
  value,
  bordered = true,
  ghost = false,
  disabled = false,
  id,
  min,
  max,
  step,
  autoComplete,
  showPasswordToggle = false,
  showColorPreview = true,
  onChange,
  onFocus,
  onBlur,
  onInput,
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
}: InputProps) {
  // Set default placeholders based on input type
  const getDefaultPlaceholder = () => {
    if (placeholder) return placeholder;
    switch (type) {
      case "email": return "your@email.com";
      case "password": return "••••••••";
      case "number": return "0";
      case "date": return "";
      case "time": return "";
      case "color": return "";
      default: return "";
    }
  };

  // Set default autocomplete based on input type
  const getAutoComplete = () => {
    if (autoComplete) return autoComplete;
    switch (type) {
      case "email": return "email";
      case "password": return "current-password";
      default: return undefined;
    }
  };

  // Build input classes with type-specific adjustments
  const inputClasses = [
    "input",
    size ? `input-${size}` : "",
    color ? `input-${color}` : "",
    bordered ? "input-bordered" : "",
    ghost ? "input-ghost" : "",
    // Add padding for special input types with controls
    (type === "password" && showPasswordToggle) && "pr-12",
    (type === "number") && "pr-8",
    (type === "color" && showColorPreview) && "pl-12",
    className,
  ].filter(Boolean).join(" ");

  // For simple input types that don't need special UI
  const isSimpleInput = ["text", "email", "date", "time", "datetime-local", "tel", "url", "search"].includes(type);
  
  if (isSimpleInput) {
    return (
      <input
        type={type}
        class={inputClasses}
        placeholder={getDefaultPlaceholder()}
        value={value}
        disabled={disabled}
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        min={min}
        max={max}
        step={step}
        autoComplete={getAutoComplete()}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onInput={onInput}
        {...props}
      />
    );
  }

  // Password input with toggle
  if (type === "password") {
    const [isVisible, setIsVisible] = useState(false);
    
    const toggleVisibility = () => {
      setIsVisible(!isVisible);
    };
    
    return (
      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          class={inputClasses}
          placeholder={getDefaultPlaceholder()}
          value={value}
          disabled={disabled}
          id={id}
          name={name}
          defaultValue={defaultValue}
          required={required}
          autoComplete={getAutoComplete()}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onInput={onInput}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
            disabled={disabled}
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
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

  // Number input with increment/decrement controls
  if (type === "number") {
    const increment = () => {
      const currentValue = (value as number) || 0;
      const stepValue = (step as number) || 1;
      const newValue = currentValue + stepValue;
      if (max === undefined || newValue <= (max as number)) {
        const event = new Event("change");
        Object.defineProperty(event, "target", {
          value: { value: newValue.toString() },
          enumerable: true,
        });
        onChange?.(event);
      }
    };

    const decrement = () => {
      const currentValue = (value as number) || 0;
      const stepValue = (step as number) || 1;
      const newValue = currentValue - stepValue;
      if (min === undefined || newValue >= (min as number)) {
        const event = new Event("change");
        Object.defineProperty(event, "target", {
          value: { value: newValue.toString() },
          enumerable: true,
        });
        onChange?.(event);
      }
    };

    return (
      <div className="relative">
        <input
          type="number"
          class={inputClasses}
          placeholder={getDefaultPlaceholder()}
          value={value}
          disabled={disabled}
          id={id}
          name={name}
          defaultValue={defaultValue}
          required={required}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onInput={onInput}
          {...props}
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
          <button
            type="button"
            className="text-xs text-base-content/50 hover:text-base-content disabled:cursor-not-allowed"
            onClick={increment}
            disabled={disabled || (max !== undefined && ((value as number) || 0) >= (max as number))}
          >
            ▲
          </button>
          <button
            type="button"
            className="text-xs text-base-content/50 hover:text-base-content disabled:cursor-not-allowed"
            onClick={decrement}
            disabled={disabled || (min !== undefined && ((value as number) || 0) <= (min as number))}
          >
            ▼
          </button>
        </div>
      </div>
    );
  }

  // Color input with preview
  if (type === "color") {
    return (
      <div className="relative">
        {showColorPreview && (
          <div
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded border border-base-300"
            style={{ backgroundColor: (value as string) || "#000000" }}
          />
        )}
        <input
          type="color"
          class={inputClasses}
          value={(value as string) || "#000000"}
          disabled={disabled}
          id={id}
          name={name}
          defaultValue={defaultValue}
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

  // Fallback for any other input types
  return (
    <input
      type={type as string}
      class={inputClasses}
      placeholder={getDefaultPlaceholder()}
      value={value}
      disabled={disabled}
      id={id}
      name={name}
      defaultValue={defaultValue}
      required={required}
      min={min}
      max={max}
      step={step}
      autoComplete={getAutoComplete()}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      onInput={onInput}
      {...props}
    />
  );
}
