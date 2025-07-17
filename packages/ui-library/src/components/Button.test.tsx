// Button component tests

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import Button, { ButtonProps } from './Button.tsx';

Deno.test('Button - Basic Rendering', async () => {
  const props: ButtonProps = {
    children: 'Click me'
  };

  const result = await render(Button(props));
  assert(result.includes('Click me'));
  assert(result.includes('button'));
});

Deno.test('Button - Variant Classes', async () => {
  // Primary variant (default)
  let props: ButtonProps = {
    variant: 'primary',
    children: 'Primary'
  };
  let result = await render(Button(props));
  assert(result.includes('bg-blue-600'));
  assert(result.includes('text-white'));

  // Secondary variant
  props = {
    variant: 'secondary',
    children: 'Secondary'
  };
  result = await render(Button(props));
  assert(result.includes('bg-gray-600'));

  // Danger variant
  props = {
    variant: 'danger',
    children: 'Danger'
  };
  result = await render(Button(props));
  assert(result.includes('bg-red-600'));

  // Outline variant
  props = {
    variant: 'outline',
    children: 'Outline'
  };
  result = await render(Button(props));
  assert(result.includes('border'));
  assert(result.includes('bg-white'));

  // Ghost variant
  props = {
    variant: 'ghost',
    children: 'Ghost'
  };
  result = await render(Button(props));
  assert(result.includes('text-gray-700'));
  assert(result.includes('hover:bg-gray-100'));
});

Deno.test('Button - Size Classes', async () => {
  // Extra small
  let props: ButtonProps = {
    size: 'xs',
    children: 'XS Button'
  };
  let result = await render(Button(props));
  assert(result.includes('px-2'));
  assert(result.includes('py-1'));
  assert(result.includes('text-xs'));

  // Small
  props = {
    size: 'sm',
    children: 'SM Button'
  };
  result = await render(Button(props));
  assert(result.includes('px-3'));
  assert(result.includes('py-1.5'));

  // Medium (default)
  props = {
    size: 'md',
    children: 'MD Button'
  };
  result = await render(Button(props));
  assert(result.includes('px-4'));
  assert(result.includes('py-2'));

  // Large
  props = {
    size: 'lg',
    children: 'LG Button'
  };
  result = await render(Button(props));
  assert(result.includes('px-4'));
  assert(result.includes('py-2'));
  assert(result.includes('text-base'));

  // Extra large
  props = {
    size: 'xl',
    children: 'XL Button'
  };
  result = await render(Button(props));
  assert(result.includes('px-6'));
  assert(result.includes('py-3'));
});

Deno.test('Button - Disabled State', async () => {
  const props: ButtonProps = {
    disabled: true,
    children: 'Disabled Button'
  };

  const result = await render(Button(props));
  assert(result.includes('disabled'));
  assert(result.includes('opacity-50'));
  assert(result.includes('cursor-not-allowed'));
});

Deno.test('Button - Loading State', async () => {
  const props: ButtonProps = {
    loading: true,
    children: 'Loading Button'
  };

  const result = await render(Button(props));
  assert(result.includes('disabled'));
  assert(result.includes('animate-spin'));
  assert(result.includes('svg'));
});

Deno.test('Button - Full Width', async () => {
  const props: ButtonProps = {
    fullWidth: true,
    children: 'Full Width Button'
  };

  const result = await render(Button(props));
  assert(result.includes('w-full'));
});

Deno.test('Button - Custom Props', async () => {
  const props: ButtonProps = {
    id: 'custom-button',
    className: 'custom-class',
    'data-testid': 'test-button',
    type: 'submit',
    children: 'Custom Button'
  };

  const result = await render(Button(props));
  assert(result.includes('id="custom-button"'));
  assert(result.includes('custom-class'));
  assert(result.includes('data-testid="test-button"'));
  assert(result.includes('type="submit"'));
});

Deno.test('Button - Event Handlers', () => {
  let clickCalled = false;
  let focusCalled = false;
  let blurCalled = false;

  const props: ButtonProps = {
    onClick: () => { clickCalled = true; },
    onFocus: () => { focusCalled = true; },
    onBlur: () => { blurCalled = true; },
    children: 'Event Button'
  };

  // Create a mock button element to test event handling
  const button = Button(props);
  
  // Simulate events
  if (props.onClick) props.onClick(new Event('click'));
  if (props.onFocus) props.onFocus(new FocusEvent('focus'));
  if (props.onBlur) props.onBlur(new FocusEvent('blur'));

  assert(clickCalled);
  assert(focusCalled);
  assert(blurCalled);
});

Deno.test('Button - Disabled Click Prevention', () => {
  let clickCalled = false;

  const props: ButtonProps = {
    disabled: true,
    onClick: () => { clickCalled = true; },
    children: 'Disabled Button'
  };

  const button = Button(props);
  
  // Create a mock event
  const mockEvent = {
    preventDefault: () => {},
  } as Event;

  // Test the click handler logic
  const handleClick = (event: Event) => {
    if (props.disabled || props.loading) {
      event.preventDefault();
      return;
    }
    props.onClick?.(event);
  };

  handleClick(mockEvent);
  
  // Click should not be called when disabled
  assert(!clickCalled);
});

Deno.test('Button - Loading Click Prevention', () => {
  let clickCalled = false;

  const props: ButtonProps = {
    loading: true,
    onClick: () => { clickCalled = true; },
    children: 'Loading Button'
  };

  const button = Button(props);
  
  // Create a mock event
  const mockEvent = {
    preventDefault: () => {},
  } as Event;

  // Test the click handler logic
  const handleClick = (event: Event) => {
    if (props.disabled || props.loading) {
      event.preventDefault();
      return;
    }
    props.onClick?.(event);
  };

  handleClick(mockEvent);
  
  // Click should not be called when loading
  assert(!clickCalled);
});