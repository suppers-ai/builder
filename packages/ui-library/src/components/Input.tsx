// Fresh 2.0 island component
import { useSignal } from "@preact/signals";
import { ComponentEventHandlers, ThemedComponentProps } from '../types.ts';

export interface InputProps extends ThemedComponentProps, ComponentEventHandlers {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'error' | 'success';
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: string;
  rightIcon?: string;
}

export default function Input({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  readonly = false,
  required = false,
  name,
  autoComplete,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  size = 'md',
  variant = 'default',
  fullWidth = false,
  label,
  helperText,
  errorText,
  leftIcon,
  rightIcon,
  className = '',
  style = {},
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  id,
  'data-testid': testId,
  ...props
}: InputProps) {
  // Fresh 2.0 island state management
  const isFocused = useSignal(false);
  const inputValue = useSignal(value || defaultValue || '');
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = variant === 'error' || !!errorText;
  const hasSuccess = variant === 'success';

  const baseClasses = [
    'block',
    'border',
    'rounded-md',
    'shadow-sm',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'read-only:bg-gray-50',
    'read-only:cursor-default',
  ];

  const variantClasses = {
    default: [
      'border-gray-300',
      'focus:border-blue-500',
      'focus:ring-blue-500',
    ],
    error: [
      'border-red-300',
      'focus:border-red-500',
      'focus:ring-red-500',
    ],
    success: [
      'border-green-300',
      'focus:border-green-500',
      'focus:ring-green-500',
    ],
  };

  const sizeClasses = {
    xs: ['px-2', 'py-1', 'text-xs'],
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-3', 'py-2', 'text-sm'],
    lg: ['px-4', 'py-2', 'text-base'],
    xl: ['px-4', 'py-3', 'text-base'],
  };

  const inputClasses = [
    ...baseClasses,
    ...variantClasses[hasError ? 'error' : hasSuccess ? 'success' : 'default'],
    ...sizeClasses[size],
    fullWidth ? 'w-full' : '',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    className,
  ].filter(Boolean).join(' ');

  const containerClasses = [
    fullWidth ? 'w-full' : '',
    'relative',
  ].filter(Boolean).join(' ');

  // Fresh 2.0 island event handlers with state management
  const handleFocus = (event: FocusEvent) => {
    isFocused.value = true;
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false;
    onBlur?.(event);
  };

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    inputValue.value = target.value;
    onChange?.(event);
  };

  // Dynamic classes based on island state
  const dynamicInputClasses = [
    ...baseClasses,
    ...variantClasses[hasError ? 'error' : hasSuccess ? 'success' : 'default'],
    ...sizeClasses[size],
    fullWidth ? 'w-full' : '',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    isFocused.value ? 'ring-2 ring-offset-2' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">{leftIcon}</span>
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          value={inputValue.value}
          disabled={disabled}
          readOnly={readonly}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={dynamicInputClasses}
          style={style}
          data-testid={testId}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {(helperText || errorText) && (
        <p className={`mt-1 text-xs ${hasError ? 'text-red-600' : 'text-gray-500'}`}>
          {errorText || helperText}
        </p>
      )}
    </div>
  );
}