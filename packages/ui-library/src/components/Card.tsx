// Fresh 2.0 island component
import { useSignal } from "@preact/signals";
import { ComponentChildren } from '@json-app-compiler/shared';
import { ComponentEventHandlers, ThemedComponentProps } from '../types.ts';

export interface CardProps extends ThemedComponentProps, ComponentEventHandlers {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hoverable?: boolean;
  clickable?: boolean;
  children: ComponentChildren;
  header?: ComponentChildren;
  footer?: ComponentChildren;
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  actions?: ComponentChildren;
}

export default function Card({
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  rounded = 'md',
  hoverable = false,
  clickable = false,
  className = '',
  style = {},
  children,
  header,
  footer,
  title,
  subtitle,
  image,
  imageAlt,
  actions,
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
}: CardProps) {
  // Fresh 2.0 island state management
  const isHovered = useSignal(false);
  const isFocused = useSignal(false);
  const isPressed = useSignal(false);
  const baseClasses = [
    'bg-white',
    'transition-all',
    'duration-200',
  ];

  const variantClasses = {
    default: ['border', 'border-gray-200'],
    outlined: ['border-2', 'border-gray-300'],
    elevated: ['border-0'],
    filled: ['bg-gray-50', 'border', 'border-gray-200'],
  };

  const paddingClasses = {
    none: [],
    xs: ['p-2'],
    sm: ['p-3'],
    md: ['p-4'],
    lg: ['p-6'],
    xl: ['p-8'],
  };

  const shadowClasses = {
    none: [],
    sm: ['shadow-sm'],
    md: ['shadow-md'],
    lg: ['shadow-lg'],
    xl: ['shadow-xl'],
  };

  const roundedClasses = {
    none: [],
    sm: ['rounded-sm'],
    md: ['rounded-md'],
    lg: ['rounded-lg'],
    xl: ['rounded-xl'],
    full: ['rounded-full'],
  };

  // Fresh 2.0 island event handlers with state management
  const handleClick = (event: Event) => {
    if (clickable && onClick) {
      isPressed.value = true;
      setTimeout(() => isPressed.value = false, 150);
      onClick(event);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      isPressed.value = true;
      setTimeout(() => isPressed.value = false, 150);
      onClick?.(event as any);
    }
    onKeyDown?.(event);
  };

  const handleFocus = (event: FocusEvent) => {
    isFocused.value = true;
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false;
    onBlur?.(event);
  };

  const handleMouseEnter = (event: MouseEvent) => {
    isHovered.value = true;
    onMouseEnter?.(event);
  };

  const handleMouseLeave = (event: MouseEvent) => {
    isHovered.value = false;
    onMouseLeave?.(event);
  };

  const interactiveClasses = [
    hoverable && isHovered.value ? 'shadow-lg' : '',
    clickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : '',
    clickable && isHovered.value ? 'shadow-lg' : '',
    isPressed.value ? 'transform scale-98' : '',
    isFocused.value ? 'ring-2 ring-offset-2' : '',
  ];

  const dynamicClasses = [
    ...baseClasses,
    ...variantClasses[variant],
    ...shadowClasses[shadow],
    ...roundedClasses[rounded],
    ...interactiveClasses,
    className,
  ].filter(Boolean).join(' ');

  const contentPaddingClasses = paddingClasses[padding].join(' ');

  const CardElement = clickable ? 'button' : 'div';

  // Filter out custom props that shouldn't be passed to DOM elements
  const domProps = { ...props } as any;
  delete domProps.variant;
  delete domProps.padding;
  delete domProps.shadow;
  delete domProps.rounded;
  delete domProps.hoverable;
  delete domProps.clickable;
  delete domProps.header;
  delete domProps.footer;
  delete domProps.title;
  delete domProps.subtitle;
  delete domProps.image;
  delete domProps.imageAlt;
  delete domProps.actions;
  delete domProps.theme;
  delete domProps.size;
  delete domProps.color;
  delete domProps.children;

  return (
    <CardElement
      id={id}
      className={dynamicClasses}
      style={style}
      data-testid={testId}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onKeyUp={onKeyUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? 'button' : undefined}
      {...domProps}
    >
      {image && (
        <div className={`${rounded !== 'none' ? 'rounded-t-' + rounded : ''} overflow-hidden`}>
          <img
            src={image}
            alt={imageAlt || ''}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {header && (
        <div className={`${contentPaddingClasses} ${image ? 'pt-4' : ''} border-b border-gray-200`}>
          {header}
        </div>
      )}

      {(title || subtitle) && (
        <div className={`${contentPaddingClasses} ${header || image ? 'pt-4' : ''}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={`${contentPaddingClasses} ${(title || subtitle || header || image) ? 'pt-4' : ''}`}>
        {children}
      </div>

      {actions && (
        <div className={`${contentPaddingClasses} pt-4 border-t border-gray-200 flex justify-end space-x-2`}>
          {actions}
        </div>
      )}

      {footer && (
        <div className={`${contentPaddingClasses} pt-4 border-t border-gray-200`}>
          {footer}
        </div>
      )}
    </CardElement>
  );
}