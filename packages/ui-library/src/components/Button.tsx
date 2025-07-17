// Fresh 2.0 island component
import { useSignal } from "@preact/signals";
import { ComponentChildren } from '@json-app-compiler/shared';
import { ComponentEventHandlers, ThemedComponentProps } from '../types.ts';

export interface ButtonProps extends ThemedComponentProps, ComponentEventHandlers {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  children: ComponentChildren;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  className = '',
  style = {},
  children,
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onMouseEnter,
  onMouseLeave,
  id,
  'data-testid': testId,
  ...props
}: ButtonProps) {
  // Fresh 2.0 island state management
  const isPressed = useSignal(false);
  const isFocused = useSignal(false);
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-md',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ];

  const variantClasses = {
    primary: [
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
    ],
    secondary: [
      'bg-gray-600',
      'text-white',
      'hover:bg-gray-700',
      'focus:ring-gray-500',
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
    ],
    outline: [
      'border',
      'border-gray-300',
      'bg-white',
      'text-gray-700',
      'hover:bg-gray-50',
      'focus:ring-blue-500',
    ],
    ghost: [
      'text-gray-700',
      'hover:bg-gray-100',
      'focus:ring-blue-500',
    ],
  };

  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs'],
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-4', 'py-2', 'text-base'],
    xl: ['px-6', 'py-3', 'text-base'],
  };

  // Fresh 2.0 island event handlers with state management
  const handleClick = (event: Event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    isPressed.value = true;
    setTimeout(() => isPressed.value = false, 150); // Visual feedback
    onClick?.(event);
  };

  const handleFocus = (event: FocusEvent) => {
    isFocused.value = true;
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false;
    onBlur?.(event);
  };

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      isPressed.value = true;
    }
  };

  const handleMouseUp = () => {
    isPressed.value = false;
  };

  // Dynamic classes based on island state
  const dynamicClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    fullWidth ? 'w-full' : '',
    isPressed.value ? 'transform scale-95' : '',
    isFocused.value ? 'ring-2 ring-offset-2' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      id={id}
      type={type}
      className={dynamicClasses}
      style={style}
      disabled={disabled || loading}
      data-testid={testId}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}