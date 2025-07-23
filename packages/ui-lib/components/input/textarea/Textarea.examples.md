---
title: "Textarea"
description: "Multi-line text input component with customizable sizing and styling options"
category: "Input"
apiProps:
  - name: "size"
    type: "'xs' | 'sm' | 'md' | 'lg'"
    default: "'md'"
    description: "Size variant of the textarea"
  - name: "color"
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'"
    description: "Color theme for the textarea"
  - name: "bordered"
    type: "boolean"
    default: "true"
    description: "Whether to show border"
  - name: "ghost"
    type: "boolean"
    default: "false"
    description: "Ghost style variant"
  - name: "rows"
    type: "number"
    default: "3"
    description: "Number of visible text lines"
  - name: "disabled"
    type: "boolean"
    default: "false"
    description: "Disabled state"
  - name: "value"
    type: "string"
    description: "Current text value"
  - name: "placeholder"
    type: "string"
    description: "Placeholder text"
  - name: "onChange"
    type: "(value: string) => void"
    description: "Change event handler"
usageNotes:
  - "Supports both controlled and uncontrolled usage patterns"
  - "Multiple size and color variants available for different contexts"
  - "Use rows prop to control initial height and visual appearance"
  - "Use onChange handler for form integration and state management"
  - "Perfect for longer text input like comments, descriptions, and messages"
accessibilityNotes:
  - "Standard textarea accessibility features are supported"
  - "Proper labeling should be provided externally"
  - "Supports keyboard navigation and screen reader announcements"
relatedComponents:
  - name: "Input"
    path: "/components/input/input"
  - name: "Select"
    path: "/components/input/select"
  - name: "Checkbox"
    path: "/components/input/checkbox"
---

## Textarea Sizes

Different size variants for various contexts

```tsx
<Textarea size="xs" placeholder="Extra small textarea" />
<Textarea size="sm" placeholder="Small textarea" />
<Textarea size="md" placeholder="Medium textarea" />
<Textarea size="lg" placeholder="Large textarea" />
```

## Textarea Colors

Various color themes for different states and purposes

```tsx
<Textarea color="primary" placeholder="Primary textarea" />
<Textarea color="secondary" placeholder="Secondary textarea" />
<Textarea color="accent" placeholder="Accent textarea" />
<Textarea color="success" placeholder="Success textarea" />
<Textarea color="warning" placeholder="Warning textarea" />
<Textarea color="error" placeholder="Error textarea" />
```

## Textarea Variants

Different visual styles and appearances

```tsx
<Textarea bordered placeholder="Bordered (default)" />
<Textarea ghost placeholder="Ghost style" />
<Textarea bordered={false} placeholder="No border" />
```

## Textarea Rows

Control the height with different row counts

```tsx
<Textarea rows={2} placeholder="2 rows" />
<Textarea rows={5} placeholder="5 rows" />
<Textarea rows={8} placeholder="8 rows" />
```

## Textarea States

Different component states and conditions

```tsx
<Textarea disabled placeholder="Disabled textarea" />
<Textarea value="Pre-filled content" />
```

## Interactive Textarea

Textarea with change handlers for form integration

```tsx
<Textarea
  placeholder="Type something..."
  onChange={(value) => console.log("Textarea value:", value)}
/>
<Textarea
  value="Initial content"
  rows={4}
  color="primary"
  onChange={(value) => console.log("Large textarea:", value)}
/>
```
