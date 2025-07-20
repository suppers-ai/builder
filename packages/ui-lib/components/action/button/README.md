# Button Component

Interactive buttons with multiple variants, sizes, and states for user actions.

## Features

- ✅ Multiple color variants (primary, secondary, accent, etc.)
- ✅ Different sizes (xs, sm, md, lg)
- ✅ Style variants (outline, ghost, link)
- ✅ Loading and disabled states
- ✅ Full TypeScript support
- ✅ SSR-safe (no hooks)
- ✅ Accessibility compliant (WCAG 2.1 AA)

## Usage

```tsx
import { Button } from "./Button.tsx";

// Basic button
<Button>Click me</Button>

// Primary button with size
<Button color="primary" size="lg">
  Large Primary
</Button>

// Outline variant
<Button variant="outline" color="secondary">
  Outline Button
</Button>

// Disabled state
<Button disabled>
  Disabled Button
</Button>

// Loading state
<Button loading color="primary">
  Loading...
</Button>
```

## Props

| Prop       | Type                                                                               | Default | Description                |
| ---------- | ---------------------------------------------------------------------------------- | ------- | -------------------------- |
| `children` | `ComponentChildren`                                                                | -       | Button content (required)  |
| `color`    | `primary \| secondary \| accent \| neutral \| info \| success \| warning \| error` | -       | Button color variant       |
| `size`     | `xs \| sm \| md \| lg`                                                             | `md`    | Button size                |
| `variant`  | `outline \| ghost \| link`                                                         | -       | Button style variant       |
| `disabled` | `boolean`                                                                          | `false` | Whether button is disabled |
| `loading`  | `boolean`                                                                          | `false` | Show loading spinner       |
| `class`    | `string`                                                                           | -       | Additional CSS classes     |

## Testing

This component includes comprehensive test coverage:

- **Unit Tests** (`Button.test.ts`) - Component logic and props
- **Visual Tests** (`Button.visual.test.ts`) - Screenshot regression testing
- **E2E Tests** (`Button.e2e.test.ts`) - User interaction testing

Run tests:

```bash
# All tests
deno test

# Unit tests only
deno test Button.test.ts

# Visual tests only  
deno test Button.visual.test.ts

# E2E tests only
deno test Button.e2e.test.ts
```

## Accessibility

- Uses semantic `<button>` element
- Proper ARIA attributes for loading/disabled states
- Keyboard navigation support (Tab, Space, Enter)
- Sufficient color contrast in all themes
- Screen reader announcements for state changes

## Related Components

- [Modal](../modal/) - For button actions that open dialogs
- [Dropdown](../dropdown/) - For button actions that show menus
- [Swap](../swap/) - For toggle button functionality
