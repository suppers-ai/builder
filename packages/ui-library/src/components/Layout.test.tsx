// Layout component tests

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
// Mock render function for testing
const render = async (component: any): Promise<string> => {
  // Simple mock that returns a string representation
  return JSON.stringify(component);
};
import Layout, { LayoutProps } from './Layout.tsx';

Deno.test('Layout - Default Variant', async () => {
  const props: LayoutProps = {
    children: 'Default layout content'
  };

  const result = await render(Layout(props));
  assert(result.includes('Default layout content'));
  assert(result.includes('w-full'));
});

Deno.test('Layout - Max Width Classes', async () => {
  const maxWidths = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'] as const;
  
  for (const maxWidth of maxWidths) {
    const props: LayoutProps = {
      maxWidth: maxWidth,
      children: `${maxWidth} layout`
    };

    const result = await render(Layout(props));
    assert(result.includes(`max-w-${maxWidth}`));
    assert(result.includes('mx-auto'));
  }
});

Deno.test('Layout - Padding Classes', async () => {
  // No padding
  let props: LayoutProps = {
    padding: 'none',
    children: 'No padding'
  };
  let result = await render(Layout(props));
  // Should not include padding classes

  // Extra small padding
  props = {
    padding: 'xs',
    children: 'XS padding'
  };
  result = await render(Layout(props));
  assert(result.includes('p-2'));

  // Small padding
  props = {
    padding: 'sm',
    children: 'SM padding'
  };
  result = await render(Layout(props));
  assert(result.includes('p-3'));

  // Medium padding (default)
  props = {
    padding: 'md',
    children: 'MD padding'
  };
  result = await render(Layout(props));
  assert(result.includes('p-4'));

  // Large padding
  props = {
    padding: 'lg',
    children: 'LG padding'
  };
  result = await render(Layout(props));
  assert(result.includes('p-6'));

  // Extra large padding
  props = {
    padding: 'xl',
    children: 'XL padding'
  };
  result = await render(Layout(props));
  assert(result.includes('p-8'));
});

Deno.test('Layout - Centered Variant', async () => {
  const props: LayoutProps = {
    variant: 'centered',
    maxWidth: 'md',
    children: 'Centered content'
  };

  const result = await render(Layout(props));
  assert(result.includes('flex'));
  assert(result.includes('items-center'));
  assert(result.includes('justify-center'));
  assert(result.includes('min-h-screen'));
  assert(result.includes('max-w-md'));
});

Deno.test('Layout - Sidebar Variant', async () => {
  const props: LayoutProps = {
    variant: 'sidebar',
    sidebar: 'Sidebar content',
    sidebarPosition: 'left',
    sidebarWidth: 'md',
    children: 'Main content'
  };

  const result = await render(Layout(props));
  assert(result.includes('Sidebar content'));
  assert(result.includes('Main content'));
  assert(result.includes('flex'));
  assert(result.includes('min-h-screen'));
  assert(result.includes('w-64')); // md width
  assert(result.includes('bg-gray-50'));
  assert(result.includes('border-r'));
});

Deno.test('Layout - Sidebar Right Position', async () => {
  const props: LayoutProps = {
    variant: 'sidebar',
    sidebar: 'Right sidebar',
    sidebarPosition: 'right',
    children: 'Main content'
  };

  const result = await render(Layout(props));
  assert(result.includes('Right sidebar'));
  assert(result.includes('border-l')); // Right sidebar has left border
});

Deno.test('Layout - Sidebar Width Classes', async () => {
  const widths = {
    xs: 'w-48',
    sm: 'w-56',
    md: 'w-64',
    lg: 'w-72',
    xl: 'w-80'
  };

  for (const [size, expectedClass] of Object.entries(widths)) {
    const props: LayoutProps = {
      variant: 'sidebar',
      sidebar: 'Sidebar',
      sidebarWidth: size as keyof typeof widths,
      children: 'Content'
    };

    const result = await render(Layout(props));
    assert(result.includes(expectedClass));
  }
});

Deno.test('Layout - Header-Footer Variant', async () => {
  const props: LayoutProps = {
    variant: 'header-footer',
    header: 'Header content',
    footer: 'Footer content',
    children: 'Main content'
  };

  const result = await render(Layout(props));
  assert(result.includes('Header content'));
  assert(result.includes('Footer content'));
  assert(result.includes('Main content'));
  assert(result.includes('flex'));
  assert(result.includes('flex-col'));
  assert(result.includes('min-h-screen'));
  assert(result.includes('flex-1')); // Main content should flex
  assert(result.includes('flex-shrink-0')); // Header and footer should not shrink
});

Deno.test('Layout - Header-Footer Styling', async () => {
  const props: LayoutProps = {
    variant: 'header-footer',
    header: 'Header',
    footer: 'Footer',
    children: 'Content'
  };

  const result = await render(Layout(props));
  assert(result.includes('bg-white')); // Header background
  assert(result.includes('border-b')); // Header border
  assert(result.includes('bg-gray-50')); // Footer background
  assert(result.includes('border-t')); // Footer border
  assert(result.includes('border-gray-200'));
});

Deno.test('Layout - Full-Height Variant', async () => {
  const props: LayoutProps = {
    variant: 'full-height',
    children: 'Full height content'
  };

  const result = await render(Layout(props));
  assert(result.includes('h-screen'));
  assert(result.includes('flex'));
  assert(result.includes('flex-col'));
});

Deno.test('Layout - Gap Classes', async () => {
  // No gap
  let props: LayoutProps = {
    gap: 'none',
    children: 'No gap'
  };
  let result = await render(Layout(props));
  // Should not include gap classes

  // Extra small gap
  props = {
    gap: 'xs',
    children: 'XS gap'
  };
  result = await render(Layout(props));
  assert(result.includes('gap-2'));

  // Small gap
  props = {
    gap: 'sm',
    children: 'SM gap'
  };
  result = await render(Layout(props));
  assert(result.includes('gap-3'));

  // Medium gap (default)
  props = {
    gap: 'md',
    children: 'MD gap'
  };
  result = await render(Layout(props));
  assert(result.includes('gap-4'));

  // Large gap
  props = {
    gap: 'lg',
    children: 'LG gap'
  };
  result = await render(Layout(props));
  assert(result.includes('gap-6'));

  // Extra large gap
  props = {
    gap: 'xl',
    children: 'XL gap'
  };
  result = await render(Layout(props));
  assert(result.includes('gap-8'));
});

Deno.test('Layout - Custom Styling', async () => {
  const props: LayoutProps = {
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
    children: 'Custom styled layout'
  };

  const result = await render(Layout(props));
  // Style attributes should be applied
  assert(result.includes('style='));
});

Deno.test('Layout - Custom Props', async () => {
  const props: LayoutProps = {
    id: 'custom-layout',
    className: 'custom-class',
    'data-testid': 'test-layout',
    children: 'Custom layout'
  };

  const result = await render(Layout(props));
  assert(result.includes('id="custom-layout"'));
  assert(result.includes('custom-class'));
  assert(result.includes('data-testid="test-layout"'));
});

Deno.test('Layout - Fallback to Default', async () => {
  // Test with invalid variant
  const props: LayoutProps = {
    variant: 'invalid' as any,
    children: 'Fallback content'
  };

  const result = await render(Layout(props));
  assert(result.includes('Fallback content'));
  assert(result.includes('w-full'));
  // Should fallback to default layout behavior
});

Deno.test('Layout - Header-Footer Without Header', async () => {
  const props: LayoutProps = {
    variant: 'header-footer',
    footer: 'Footer only',
    children: 'Content'
  };

  const result = await render(Layout(props));
  assert(result.includes('Footer only'));
  assert(result.includes('Content'));
  // Should work without header
});

Deno.test('Layout - Header-Footer Without Footer', async () => {
  const props: LayoutProps = {
    variant: 'header-footer',
    header: 'Header only',
    children: 'Content'
  };

  const result = await render(Layout(props));
  assert(result.includes('Header only'));
  assert(result.includes('Content'));
  // Should work without footer
});

Deno.test('Layout - Sidebar Without Sidebar Content', async () => {
  const props: LayoutProps = {
    variant: 'sidebar',
    children: 'Main content only'
  };

  const result = await render(Layout(props));
  assert(result.includes('Main content only'));
  // Should work without sidebar content
});