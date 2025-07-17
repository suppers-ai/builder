// Input component tests

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
// Mock render function for testing
const render = async (component: any): Promise<string> => {
  // Simple mock that returns a string representation
  return JSON.stringify(component);
};
import Input, { InputProps } from './Input.tsx';

Deno.test('Input - Basic Rendering', async () => {
  const props: InputProps = {
    placeholder: 'Enter text'
  };

  const result = await render(Input(props));
  assert(result.includes('input'));
  assert(result.includes('placeholder="Enter text"'));
});

Deno.test('Input - Input Types', async () => {
  const types = ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] as const;
  
  for (const type of types) {
    const props: InputProps = {
      type: type,
      placeholder: `${type} input`
    };

    const result = await render(Input(props));
    assert(result.includes(`type="${type}"`));
  }
});

Deno.test('Input - Size Classes', async () => {
  // Extra small
  let props: InputProps = {
    size: 'xs',
    placeholder: 'XS Input'
  };
  let result = await render(Input(props));
  assert(result.includes('px-2'));
  assert(result.includes('py-1'));
  assert(result.includes('text-xs'));

  // Small
  props = {
    size: 'sm',
    placeholder: 'SM Input'
  };
  result = await render(Input(props));
  assert(result.includes('px-3'));
  assert(result.includes('py-1.5'));

  // Medium (default)
  props = {
    size: 'md',
    placeholder: 'MD Input'
  };
  result = await render(Input(props));
  assert(result.includes('px-3'));
  assert(result.includes('py-2'));

  // Large
  props = {
    size: 'lg',
    placeholder: 'LG Input'
  };
  result = await render(Input(props));
  assert(result.includes('px-4'));
  assert(result.includes('py-2'));
  assert(result.includes('text-base'));

  // Extra large
  props = {
    size: 'xl',
    placeholder: 'XL Input'
  };
  result = await render(Input(props));
  assert(result.includes('px-4'));
  assert(result.includes('py-3'));
});

Deno.test('Input - Variant Classes', async () => {
  // Default variant
  let props: InputProps = {
    variant: 'default',
    placeholder: 'Default input'
  };
  let result = await render(Input(props));
  assert(result.includes('border-gray-300'));
  assert(result.includes('focus:border-blue-500'));

  // Error variant
  props = {
    variant: 'error',
    placeholder: 'Error input'
  };
  result = await render(Input(props));
  assert(result.includes('border-red-300'));
  assert(result.includes('focus:border-red-500'));

  // Success variant
  props = {
    variant: 'success',
    placeholder: 'Success input'
  };
  result = await render(Input(props));
  assert(result.includes('border-green-300'));
  assert(result.includes('focus:border-green-500'));
});

Deno.test('Input - Label and Helper Text', async () => {
  const props: InputProps = {
    label: 'Username',
    helperText: 'Enter your username',
    placeholder: 'username'
  };

  const result = await render(Input(props));
  assert(result.includes('Username'));
  assert(result.includes('Enter your username'));
  assert(result.includes('label'));
});

Deno.test('Input - Required Field', async () => {
  const props: InputProps = {
    label: 'Email',
    required: true,
    placeholder: 'email@example.com'
  };

  const result = await render(Input(props));
  assert(result.includes('required'));
  assert(result.includes('*')); // Required asterisk
  assert(result.includes('text-red-500')); // Red asterisk
});

Deno.test('Input - Error Text', async () => {
  const props: InputProps = {
    label: 'Password',
    errorText: 'Password is required',
    placeholder: 'password'
  };

  const result = await render(Input(props));
  assert(result.includes('Password is required'));
  assert(result.includes('text-red-600')); // Error text color
  assert(result.includes('border-red-300')); // Error border
});

Deno.test('Input - Disabled State', async () => {
  const props: InputProps = {
    disabled: true,
    placeholder: 'Disabled input'
  };

  const result = await render(Input(props));
  assert(result.includes('disabled'));
  assert(result.includes('opacity-50'));
  assert(result.includes('cursor-not-allowed'));
});

Deno.test('Input - Readonly State', async () => {
  const props: InputProps = {
    readonly: true,
    value: 'Readonly value'
  };

  const result = await render(Input(props));
  assert(result.includes('readonly'));
  assert(result.includes('read-only:bg-gray-50'));
  assert(result.includes('read-only:cursor-default'));
});

Deno.test('Input - Full Width', async () => {
  const props: InputProps = {
    fullWidth: true,
    placeholder: 'Full width input'
  };

  const result = await render(Input(props));
  assert(result.includes('w-full'));
});

Deno.test('Input - Icons', async () => {
  // Left icon
  let props: InputProps = {
    leftIcon: '🔍',
    placeholder: 'Search'
  };
  let result = await render(Input(props));
  assert(result.includes('🔍'));
  assert(result.includes('pl-10')); // Left padding for icon

  // Right icon
  props = {
    rightIcon: '✓',
    placeholder: 'Valid input'
  };
  result = await render(Input(props));
  assert(result.includes('✓'));
  assert(result.includes('pr-10')); // Right padding for icon
});

Deno.test('Input - Custom Props', async () => {
  const props: InputProps = {
    id: 'custom-input',
    name: 'username',
    className: 'custom-class',
    'data-testid': 'test-input',
    autoComplete: 'username',
    maxLength: 50,
    minLength: 3,
    pattern: '[a-zA-Z0-9]+',
    placeholder: 'Custom input'
  };

  const result = await render(Input(props));
  assert(result.includes('id="custom-input"'));
  assert(result.includes('name="username"'));
  assert(result.includes('custom-class'));
  assert(result.includes('data-testid="test-input"'));
  assert(result.includes('autocomplete="username"'));
  assert(result.includes('maxlength="50"'));
  assert(result.includes('minlength="3"'));
  assert(result.includes('pattern="[a-zA-Z0-9]+"'));
});

Deno.test('Input - Event Handlers', () => {
  let changeCalled = false;
  let focusCalled = false;
  let blurCalled = false;

  const props: InputProps = {
    onChange: () => { changeCalled = true; },
    onFocus: () => { focusCalled = true; },
    onBlur: () => { blurCalled = true; },
    placeholder: 'Event input'
  };

  // Simulate events
  if (props.onChange) props.onChange(new Event('change'));
  if (props.onFocus) props.onFocus(new FocusEvent('focus'));
  if (props.onBlur) props.onBlur(new FocusEvent('blur'));

  assert(changeCalled);
  assert(focusCalled);
  assert(blurCalled);
});

Deno.test('Input - Auto Focus', async () => {
  const props: InputProps = {
    autoFocus: true,
    placeholder: 'Auto focus input'
  };

  const result = await render(Input(props));
  assert(result.includes('autofocus'));
});

Deno.test('Input - Value vs Default Value', async () => {
  // Controlled input with value
  let props: InputProps = {
    value: 'controlled value',
    placeholder: 'Controlled input'
  };
  let result = await render(Input(props));
  assert(result.includes('value="controlled value"'));

  // Uncontrolled input with defaultValue
  props = {
    defaultValue: 'default value',
    placeholder: 'Uncontrolled input'
  };
  result = await render(Input(props));
  assert(result.includes('value="default value"')); // defaultValue becomes value in HTML
});