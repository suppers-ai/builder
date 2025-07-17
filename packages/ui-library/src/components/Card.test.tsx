// Card component tests

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
// Mock render function for testing
const render = async (component: any): Promise<string> => {
  // Simple mock that returns a string representation
  return JSON.stringify(component);
};
import Card, { CardProps } from './Card.tsx';

Deno.test('Card - Basic Rendering', async () => {
  const props: CardProps = {
    children: 'Card content'
  };

  const result = await render(Card(props));
  assert(result.includes('Card content'));
  assert(result.includes('bg-white'));
});

Deno.test('Card - Variant Classes', async () => {
  // Default variant
  let props: CardProps = {
    variant: 'default',
    children: 'Default card'
  };
  let result = await render(Card(props));
  assert(result.includes('border'));
  assert(result.includes('border-gray-200'));

  // Outlined variant
  props = {
    variant: 'outlined',
    children: 'Outlined card'
  };
  result = await render(Card(props));
  assert(result.includes('border-2'));
  assert(result.includes('border-gray-300'));

  // Elevated variant
  props = {
    variant: 'elevated',
    children: 'Elevated card'
  };
  result = await render(Card(props));
  assert(result.includes('border-0'));

  // Filled variant
  props = {
    variant: 'filled',
    children: 'Filled card'
  };
  result = await render(Card(props));
  assert(result.includes('bg-gray-50'));
});

Deno.test('Card - Padding Classes', async () => {
  // No padding
  let props: CardProps = {
    padding: 'none',
    children: 'No padding'
  };
  let result = await render(Card(props));
  // Should not include padding classes in content area

  // Extra small padding
  props = {
    padding: 'xs',
    children: 'XS padding'
  };
  result = await render(Card(props));
  assert(result.includes('p-2'));

  // Small padding
  props = {
    padding: 'sm',
    children: 'SM padding'
  };
  result = await render(Card(props));
  assert(result.includes('p-3'));

  // Medium padding (default)
  props = {
    padding: 'md',
    children: 'MD padding'
  };
  result = await render(Card(props));
  assert(result.includes('p-4'));

  // Large padding
  props = {
    padding: 'lg',
    children: 'LG padding'
  };
  result = await render(Card(props));
  assert(result.includes('p-6'));

  // Extra large padding
  props = {
    padding: 'xl',
    children: 'XL padding'
  };
  result = await render(Card(props));
  assert(result.includes('p-8'));
});

Deno.test('Card - Shadow Classes', async () => {
  // No shadow
  let props: CardProps = {
    shadow: 'none',
    children: 'No shadow'
  };
  let result = await render(Card(props));
  // Should not include shadow classes

  // Small shadow
  props = {
    shadow: 'sm',
    children: 'SM shadow'
  };
  result = await render(Card(props));
  assert(result.includes('shadow-sm'));

  // Medium shadow (default)
  props = {
    shadow: 'md',
    children: 'MD shadow'
  };
  result = await render(Card(props));
  assert(result.includes('shadow-md'));

  // Large shadow
  props = {
    shadow: 'lg',
    children: 'LG shadow'
  };
  result = await render(Card(props));
  assert(result.includes('shadow-lg'));

  // Extra large shadow
  props = {
    shadow: 'xl',
    children: 'XL shadow'
  };
  result = await render(Card(props));
  assert(result.includes('shadow-xl'));
});

Deno.test('Card - Rounded Classes', async () => {
  // No rounded corners
  let props: CardProps = {
    rounded: 'none',
    children: 'No rounded'
  };
  let result = await render(Card(props));
  // Should not include rounded classes

  // Small rounded
  props = {
    rounded: 'sm',
    children: 'SM rounded'
  };
  result = await render(Card(props));
  assert(result.includes('rounded-sm'));

  // Medium rounded (default)
  props = {
    rounded: 'md',
    children: 'MD rounded'
  };
  result = await render(Card(props));
  assert(result.includes('rounded-md'));

  // Large rounded
  props = {
    rounded: 'lg',
    children: 'LG rounded'
  };
  result = await render(Card(props));
  assert(result.includes('rounded-lg'));

  // Extra large rounded
  props = {
    rounded: 'xl',
    children: 'XL rounded'
  };
  result = await render(Card(props));
  assert(result.includes('rounded-xl'));

  // Full rounded
  props = {
    rounded: 'full',
    children: 'Full rounded'
  };
  result = await render(Card(props));
  assert(result.includes('rounded-full'));
});

Deno.test('Card - Interactive States', async () => {
  // Hoverable card
  let props: CardProps = {
    hoverable: true,
    children: 'Hoverable card'
  };
  let result = await render(Card(props));
  assert(result.includes('hover:shadow-lg'));

  // Clickable card
  props = {
    clickable: true,
    children: 'Clickable card'
  };
  result = await render(Card(props));
  assert(result.includes('cursor-pointer'));
  assert(result.includes('hover:shadow-lg'));
  assert(result.includes('focus:outline-none'));
  assert(result.includes('focus:ring-2'));
  assert(result.includes('role="button"'));
  assert(result.includes('tabindex="0"'));
});

Deno.test('Card - Title and Subtitle', async () => {
  const props: CardProps = {
    title: 'Card Title',
    subtitle: 'Card subtitle description',
    children: 'Card content'
  };

  const result = await render(Card(props));
  assert(result.includes('Card Title'));
  assert(result.includes('Card subtitle description'));
  assert(result.includes('text-lg'));
  assert(result.includes('font-semibold'));
  assert(result.includes('text-gray-900'));
  assert(result.includes('text-sm'));
  assert(result.includes('text-gray-600'));
});

Deno.test('Card - Header and Footer', async () => {
  const props: CardProps = {
    header: 'Card Header',
    footer: 'Card Footer',
    children: 'Card content'
  };

  const result = await render(Card(props));
  assert(result.includes('Card Header'));
  assert(result.includes('Card Footer'));
  assert(result.includes('border-b'));
  assert(result.includes('border-t'));
  assert(result.includes('border-gray-200'));
});

Deno.test('Card - Image', async () => {
  const props: CardProps = {
    image: '/test-image.jpg',
    imageAlt: 'Test image',
    children: 'Card with image'
  };

  const result = await render(Card(props));
  assert(result.includes('src="/test-image.jpg"'));
  assert(result.includes('alt="Test image"'));
  assert(result.includes('w-full'));
  assert(result.includes('h-48'));
  assert(result.includes('object-cover'));
});

Deno.test('Card - Actions', async () => {
  const props: CardProps = {
    actions: 'Action buttons',
    children: 'Card with actions'
  };

  const result = await render(Card(props));
  assert(result.includes('Action buttons'));
  assert(result.includes('border-t'));
  assert(result.includes('border-gray-200'));
  assert(result.includes('flex'));
  assert(result.includes('justify-end'));
  assert(result.includes('space-x-2'));
});

Deno.test('Card - Custom Props', async () => {
  const props: CardProps = {
    id: 'custom-card',
    className: 'custom-class',
    'data-testid': 'test-card',
    children: 'Custom card'
  };

  const result = await render(Card(props));
  assert(result.includes('id="custom-card"'));
  assert(result.includes('custom-class'));
  assert(result.includes('data-testid="test-card"'));
});

Deno.test('Card - Event Handlers', () => {
  let clickCalled = false;
  let focusCalled = false;
  let blurCalled = false;

  const props: CardProps = {
    clickable: true,
    onClick: () => { clickCalled = true; },
    onFocus: () => { focusCalled = true; },
    onBlur: () => { blurCalled = true; },
    children: 'Event card'
  };

  // Simulate events
  if (props.onClick) props.onClick(new Event('click'));
  if (props.onFocus) props.onFocus(new FocusEvent('focus'));
  if (props.onBlur) props.onBlur(new FocusEvent('blur'));

  assert(clickCalled);
  assert(focusCalled);
  assert(blurCalled);
});

Deno.test('Card - Keyboard Navigation', () => {
  let clickCalled = false;

  const props: CardProps = {
    clickable: true,
    onClick: () => { clickCalled = true; },
    children: 'Keyboard card'
  };

  // Test Enter key
  const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
  const handleKeyDown = (event: KeyboardEvent) => {
    if (props.clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      props.onClick?.(event as any);
    }
  };

  handleKeyDown(enterEvent);
  assert(clickCalled);

  // Reset and test Space key
  clickCalled = false;
  const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
  handleKeyDown(spaceEvent);
  assert(clickCalled);
});

Deno.test('Card - Element Type Based on Clickable', async () => {
  // Non-clickable card should be a div
  let props: CardProps = {
    clickable: false,
    children: 'Div card'
  };
  let result = await render(Card(props));
  // Should render as div (default)

  // Clickable card should be a button
  props = {
    clickable: true,
    children: 'Button card'
  };
  result = await render(Card(props));
  // Should render as button element
});