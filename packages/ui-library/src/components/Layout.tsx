// Fresh 2.0 island component
import { useSignal } from "@preact/signals";
import { ComponentChildren } from '@json-app-compiler/shared';
import { ThemedComponentProps } from '../types.ts';

export interface LayoutProps extends ThemedComponentProps {
  variant?: 'default' | 'centered' | 'sidebar' | 'header-footer' | 'full-height';
  maxWidth?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: ComponentChildren;
  header?: ComponentChildren;
  footer?: ComponentChildren;
  sidebar?: ComponentChildren;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  minHeight?: string;
}

export default function Layout({
  variant = 'default',
  maxWidth = 'none',
  padding = 'md',
  gap = 'md',
  className = '',
  style = {},
  children,
  header,
  footer,
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = 'md',
  backgroundColor,
  minHeight,
  id,
  'data-testid': testId,
  ...props
}: LayoutProps) {
  // Fresh 2.0 island state management for responsive behavior
  const isMobile = useSignal(false);
  const sidebarCollapsed = useSignal(false);
  
  // Check for mobile viewport on mount (Fresh 2.0 island client-side behavior)
  if (typeof window !== 'undefined') {
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
      if (isMobile.value && variant === 'sidebar') {
        sidebarCollapsed.value = true;
      }
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
  }
  const baseClasses = [
    'w-full',
  ];

  const maxWidthClasses = {
    none: [],
    xs: ['max-w-xs', 'mx-auto'],
    sm: ['max-w-sm', 'mx-auto'],
    md: ['max-w-md', 'mx-auto'],
    lg: ['max-w-lg', 'mx-auto'],
    xl: ['max-w-xl', 'mx-auto'],
    '2xl': ['max-w-2xl', 'mx-auto'],
    '3xl': ['max-w-3xl', 'mx-auto'],
    '4xl': ['max-w-4xl', 'mx-auto'],
    '5xl': ['max-w-5xl', 'mx-auto'],
    '6xl': ['max-w-6xl', 'mx-auto'],
    '7xl': ['max-w-7xl', 'mx-auto'],
  };

  const paddingClasses = {
    none: [],
    xs: ['p-2'],
    sm: ['p-3'],
    md: ['p-4'],
    lg: ['p-6'],
    xl: ['p-8'],
  };

  const gapClasses = {
    none: [],
    xs: ['gap-2'],
    sm: ['gap-3'],
    md: ['gap-4'],
    lg: ['gap-6'],
    xl: ['gap-8'],
  };

  const sidebarWidthClasses = {
    xs: 'w-48',
    sm: 'w-56',
    md: 'w-64',
    lg: 'w-72',
    xl: 'w-80',
  };

  const containerStyle = {
    ...style,
    backgroundColor: backgroundColor || style.backgroundColor,
    minHeight: minHeight || style.minHeight,
  };

  // Filter out custom props that shouldn't be passed to DOM elements
  const domProps = { ...props } as any;
  delete domProps.variant;
  delete domProps.maxWidth;
  delete domProps.padding;
  delete domProps.gap;
  delete domProps.header;
  delete domProps.footer;
  delete domProps.sidebar;
  delete domProps.sidebarPosition;
  delete domProps.sidebarWidth;
  delete domProps.backgroundColor;
  delete domProps.minHeight;
  delete domProps.theme;
  delete domProps.size;
  delete domProps.color;
  delete domProps.children;

  // Default layout
  if (variant === 'default') {
    const classes = [
      ...baseClasses,
      ...maxWidthClasses[maxWidth],
      ...paddingClasses[padding],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        id={id}
        className={classes}
        style={containerStyle}
        data-testid={testId}
      >
        {children}
      </div>
    );
  }

  // Centered layout
  if (variant === 'centered') {
    const classes = [
      ...baseClasses,
      'flex',
      'items-center',
      'justify-center',
      'min-h-screen',
      ...paddingClasses[padding],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        id={id}
        className={classes}
        style={containerStyle}
        data-testid={testId}
      >
        <div className={maxWidthClasses[maxWidth].join(' ')}>
          {children}
        </div>
      </div>
    );
  }

  // Sidebar layout
  if (variant === 'sidebar') {
    const mainClasses = [
      'flex-1',
      ...paddingClasses[padding],
    ].filter(Boolean).join(' ');

    const sidebarClasses = [
      sidebarWidthClasses[sidebarWidth],
      'flex-shrink-0',
      ...paddingClasses[padding],
      'bg-gray-50',
      'border-gray-200',
      sidebarPosition === 'left' ? 'border-r' : 'border-l',
    ].filter(Boolean).join(' ');

    const containerClasses = [
      ...baseClasses,
      'flex',
      'min-h-screen',
      ...gapClasses[gap],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        id={id}
        className={containerClasses}
        style={containerStyle}
        data-testid={testId}
      >
        {sidebarPosition === 'left' && sidebar && (
          <aside className={sidebarClasses}>
            {sidebar}
          </aside>
        )}
        
        <main className={mainClasses}>
          <div className={maxWidthClasses[maxWidth].join(' ')}>
            {children}
          </div>
        </main>
        
        {sidebarPosition === 'right' && sidebar && (
          <aside className={sidebarClasses}>
            {sidebar}
          </aside>
        )}
      </div>
    );
  }

  // Header-footer layout
  if (variant === 'header-footer') {
    const containerClasses = [
      ...baseClasses,
      'flex',
      'flex-col',
      'min-h-screen',
      className,
    ].filter(Boolean).join(' ');

    const mainClasses = [
      'flex-1',
      ...maxWidthClasses[maxWidth],
      ...paddingClasses[padding],
    ].filter(Boolean).join(' ');

    const headerClasses = [
      'flex-shrink-0',
      'bg-white',
      'border-b',
      'border-gray-200',
      ...paddingClasses[padding],
    ].filter(Boolean).join(' ');

    const footerClasses = [
      'flex-shrink-0',
      'bg-gray-50',
      'border-t',
      'border-gray-200',
      ...paddingClasses[padding],
    ].filter(Boolean).join(' ');

    return (
      <div
        id={id}
        className={containerClasses}
        style={containerStyle}
        data-testid={testId}
      >
        {header && (
          <header className={headerClasses}>
            {header}
          </header>
        )}
        
        <main className={mainClasses}>
          {children}
        </main>
        
        {footer && (
          <footer className={footerClasses}>
            {footer}
          </footer>
        )}
      </div>
    );
  }

  // Full-height layout
  if (variant === 'full-height') {
    const classes = [
      ...baseClasses,
      'h-screen',
      'flex',
      'flex-col',
      ...paddingClasses[padding],
      ...gapClasses[gap],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        id={id}
        className={classes}
        style={containerStyle}
        data-testid={testId}
      >
        {children}
      </div>
    );
  }

  // Fallback to default
  const classes = [
    ...baseClasses,
    ...maxWidthClasses[maxWidth],
    ...paddingClasses[padding],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      id={id}
      className={classes}
      style={containerStyle}
      data-testid={testId}
    >
      {children}
    </div>
  );
}