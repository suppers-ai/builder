import {
  BaseComponentProps,
  ColorProps,
  DisabledProps,
  EventProps,
  SizeProps,
} from "../../types.ts";

export interface NumberInputProps
  extends BaseComponentProps, EventProps, SizeProps, ColorProps, DisabledProps {
  value?: number;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  bordered?: boolean;
  ghost?: boolean;
  required?: boolean;
  onChange?: (value: number) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export function NumberInput({
  value,
  placeholder = "0",
  min,
  max,
  step = 1,
  size = "md",
  color,
  disabled = false,
  bordered = true,
  ghost = false,
  required = false,
  class: className,
  onChange,
  onFocus,
  onBlur,
  onInput,
  ...props
}: NumberInputProps) {
  // Build input classes
  const inputClasses = [
    "input",
    `input-${size}`,
    color && `input-${color}`,
    bordered && "input-bordered",
    ghost && "input-ghost",
    disabled && "input-disabled",
    "pr-8",
    className,
  ].filter(Boolean).join(" ");

  const increment = () => {
    const currentValue = value || 0;
    const newValue = currentValue + step;
    if (max === undefined || newValue <= max) {
      const event = new Event("change");
      Object.defineProperty(event, "target", {
        value: { value: newValue.toString() },
        enumerable: true,
      });
      onChange?.(event);
    }
  };

  const decrement = () => {
    const currentValue = value || 0;
    const newValue = currentValue - step;
    if (min === undefined || newValue >= min) {
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
        className={inputClasses}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
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
          disabled={disabled || (max !== undefined && (value || 0) >= max)}
        >
          ▲
        </button>
        <button
          type="button"
          className="text-xs text-base-content/50 hover:text-base-content disabled:cursor-not-allowed"
          onClick={decrement}
          disabled={disabled || (min !== undefined && (value || 0) <= min)}
        >
          ▼
        </button>
      </div>
    </div>
  );
}
