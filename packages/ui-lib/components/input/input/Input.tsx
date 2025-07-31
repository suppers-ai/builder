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

  // Password input with optional toggle (for islands/client-side components)
  if (type === "password") {
    if (showPasswordToggle) {
      // Return a wrapper div that can be enhanced with client-side functionality
      return (
        <div className="relative flex items-center">
          <input
            type="password"
            class={`${inputClasses} flex-1`}
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
          <button
            type="button"
            className="ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={disabled}
            aria-label="Toggle password visibility"
            data-password-toggle="true"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      );
    } else {
      // Simple password input without toggle
      return (
        <input
          type="password"
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
      );
    }
  }

  // Number input with increment/decrement controls
  if (type === "number") {
    const stepValue = step || 1; // Default step for number inputs
    
    const increment = () => {
      const currentValue = (value as number) || 0;
      const newValue = currentValue + (stepValue as number);
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
      const newValue = currentValue - (stepValue as number);
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
          step={stepValue}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onInput={onInput}
          {...props}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
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
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-base-300"
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
