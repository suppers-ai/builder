---
title: "Button"
description: "Interactive buttons with multiple variants, sizes, and states for user actions"
category: "Actions"
apiProps:
  - name: "children"
    type: "ComponentChildren"
    description: "Button content"
    required: true
  - name: "color"
    type: "'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error'"
    default: "undefined"
    description: "Button color theme"
  - name: "size"
    type: "'xs' | 'sm' | 'md' | 'lg'"
    default: "'md'"
    description: "Button size"
  - name: "variant"
    type: "'solid' | 'outline' | 'ghost' | 'link'"
    default: "'solid'"
    description: "Button visual style"
  - name: "disabled"
    type: "boolean"
    default: "false"
    description: "Disable button interactions"
  - name: "loading"
    type: "boolean"
    default: "false"
    description: "Show loading spinner"
  - name: "active"
    type: "boolean"
    default: "false"
    description: "Apply active state styling"
  - name: "onClick"
    type: "(event: Event) => void"
    description: "Click event handler (Islands only)"
usageNotes:
  - "Use Button component for server-side rendered buttons without interactivity"
  - "Use Button island for client-side interactive buttons with event handlers"
  - "Primary buttons should be used sparingly for the main action on a page"
  - "Outline buttons work well for secondary actions"
  - "Ghost buttons are ideal for tertiary actions or navigation"
  - "Loading state automatically disables the button to prevent multiple submissions"
---

## Basic Buttons

Standard button colors and variants

```tsx
<Button>Default</Button>
<Button color="primary">Primary</Button>
<Button color="secondary">Secondary</Button>
<Button color="accent">Accent</Button>
```

## Button Variants

Different visual styles for buttons

```tsx
<Button variant="outline" color="primary">Outline</Button>
<Button variant="ghost" color="primary">Ghost</Button>
<Button variant="link" color="primary">Link</Button>
```

## Button Sizes

Various button sizes for different use cases

```tsx
<Button size="xs" color="primary">Extra Small</Button>
<Button size="sm" color="primary">Small</Button>
<Button color="primary">Medium</Button>
<Button size="lg" color="primary">Large</Button>
```

## Button States

Different button states and interactions

```tsx
<Button color="primary">Normal</Button>
<Button color="primary" active>Active</Button>
<Button color="primary" disabled>Disabled</Button>
<Button color="primary" loading>Loading</Button>
```

## Interactive Buttons (Islands)

Client-side interactive buttons with event handlers

```tsx
<Button 
  color="primary" 
  onClick={() => alert('Clicked!')}
>
  Click Me
</Button>
```