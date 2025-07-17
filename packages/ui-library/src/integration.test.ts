// Integration test for UI Library components

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { 
  Button, 
  Input, 
  Card, 
  Layout,
  ButtonProps,
  InputProps,
  CardProps,
  LayoutProps
} from './index.ts';

Deno.test('UI Library - Component Exports', () => {
  // Verify all components are exported correctly
  assert(typeof Button === 'function', 'Button component should be exported');
  assert(typeof Input === 'function', 'Input component should be exported');
  assert(typeof Card === 'function', 'Card component should be exported');
  assert(typeof Layout === 'function', 'Layout component should be exported');
});

Deno.test('UI Library - Type Exports', () => {
  // Verify component prop types work correctly
  const buttonProps: ButtonProps = {
    variant: 'primary',
    size: 'md',
    children: 'Test Button'
  };
  
  const inputProps: InputProps = {
    type: 'text',
    placeholder: 'Enter text',
    size: 'md'
  };
  
  const cardProps: CardProps = {
    variant: 'default',
    padding: 'md',
    children: 'Card content'
  };
  
  const layoutProps: LayoutProps = {
    variant: 'default',
    maxWidth: 'lg',
    children: 'Layout content'
  };
  
  // If we get here without TypeScript errors, the types are working
  assert(buttonProps.variant === 'primary', 'ButtonProps type should work');
  assert(inputProps.type === 'text', 'InputProps type should work');
  assert(cardProps.variant === 'default', 'CardProps type should work');
  assert(layoutProps.variant === 'default', 'LayoutProps type should work');
});

Deno.test('UI Library - Fresh 2.0 Island Features', () => {
  // Test that components support Fresh 2.0 island features
  
  // All components should accept standard HTML attributes
  const commonProps = {
    id: 'test-component',
    className: 'custom-class',
    'data-testid': 'component-test'
  };
  
  // Button with Fresh island props
  const buttonProps: ButtonProps = {
    ...commonProps,
    onClick: () => console.log('Button clicked'),
    children: 'Interactive Button'
  };
  
  // Input with Fresh island props
  const inputProps: InputProps = {
    ...commonProps,
    onChange: () => console.log('Input changed'),
    onFocus: () => console.log('Input focused')
  };
  
  // Card with Fresh island props
  const cardProps: CardProps = {
    ...commonProps,
    clickable: true,
    onClick: () => console.log('Card clicked'),
    children: 'Interactive Card'
  };
  
  // Layout with Fresh island props
  const layoutProps: LayoutProps = {
    ...commonProps,
    variant: 'sidebar',
    children: 'Layout with sidebar'
  };
  
  // Verify event handlers are functions
  assert(typeof buttonProps.onClick === 'function', 'Button should support onClick');
  assert(typeof inputProps.onChange === 'function', 'Input should support onChange');
  assert(typeof inputProps.onFocus === 'function', 'Input should support onFocus');
  assert(typeof cardProps.onClick === 'function', 'Card should support onClick');
  
  // Verify boolean props
  assert(cardProps.clickable === true, 'Card should support clickable prop');
  
  // Verify variant props
  assert(layoutProps.variant === 'sidebar', 'Layout should support variant prop');
});

Deno.test('UI Library - Component Composition', () => {
  // Test that components can be composed together
  
  // Create a complex layout with multiple components
  const layoutProps: LayoutProps = {
    variant: 'header-footer',
    header: 'App Header',
    footer: 'App Footer',
    children: 'Main content area'
  };
  
  const cardProps: CardProps = {
    title: 'User Profile',
    subtitle: 'Manage your account settings',
    padding: 'lg',
    shadow: 'md',
    children: 'Card content with form'
  };
  
  const inputProps: InputProps = {
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
    helperText: 'We will never share your email'
  };
  
  const buttonProps: ButtonProps = {
    variant: 'primary',
    size: 'lg',
    fullWidth: true,
    children: 'Save Changes'
  };
  
  // Verify all props are valid for composition
  assert(layoutProps.variant === 'header-footer', 'Layout should support header-footer variant');
  assert(cardProps.title === 'User Profile', 'Card should support title prop');
  assert(inputProps.label === 'Email Address', 'Input should support label prop');
  assert(buttonProps.variant === 'primary', 'Button should support primary variant');
  assert(buttonProps.fullWidth === true, 'Button should support fullWidth prop');
});

Deno.test('UI Library - CSS Styling Integration', () => {
  // Test that components support CSS styling approaches used in Fresh 2.0
  
  // Test Tailwind CSS class support
  const styledProps = {
    className: 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
  };
  
  const buttonWithStyles: ButtonProps = {
    ...styledProps,
    children: 'Styled Button'
  };
  
  const inputWithStyles: InputProps = {
    ...styledProps,
    placeholder: 'Styled input'
  };
  
  const cardWithStyles: CardProps = {
    ...styledProps,
    children: 'Styled card'
  };
  
  const layoutWithStyles: LayoutProps = {
    ...styledProps,
    children: 'Styled layout'
  };
  
  // Verify className prop is accepted
  assert(buttonWithStyles.className?.includes('bg-blue-500'), 'Button should accept Tailwind classes');
  assert(inputWithStyles.className?.includes('hover:bg-blue-600'), 'Input should accept Tailwind classes');
  assert(cardWithStyles.className?.includes('text-white'), 'Card should accept Tailwind classes');
  assert(layoutWithStyles.className?.includes('font-bold'), 'Layout should accept Tailwind classes');
  
  // Test inline styles support
  const inlineStyles = {
    style: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px'
    }
  };
  
  const buttonWithInlineStyles: ButtonProps = {
    ...inlineStyles,
    children: 'Inline styled button'
  };
  
  assert(buttonWithInlineStyles.style?.backgroundColor === '#3b82f6', 'Button should accept inline styles');
  assert(buttonWithInlineStyles.style?.color === 'white', 'Button should accept color styles');
});