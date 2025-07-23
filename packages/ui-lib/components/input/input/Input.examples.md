---
title: "Input"
description: "Text input fields with various types, sizes, and validation states"
category: "Input"
apiProps:
  -
    name: "type"
    type: "text | email | password | number | tel | url | search"
    description: "HTML input type"
    default: "text"
  -
    name: "placeholder"
    type: "string"
    description: "Placeholder text"
  -
    name: "value"
    type: "string"
    description: "Input value"
  -
    name: "disabled"
    type: "boolean"
    description: "Whether input is disabled"
    default: "false"
  -
    name: "readonly"
    type: "boolean"
    description: "Whether input is read-only"
    default: "false"
  -
    name: "required"
    type: "boolean"
    description: "Whether input is required"
    default: "false"
  -
    name: "color"
    type: "primary | secondary | accent | success | warning | error | info"
    description: "Input color variant"
  -
    name: "size"
    type: "xs | sm | md | lg"
    description: "Input size"
    default: "md"
  -
    name: "bordered"
    type: "boolean"
    description: "Whether input has border"
    default: "true"
  -
    name: "ghost"
    type: "boolean"
    description: "Ghost style without background"
    default: "false"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
demoInfo:
  variants: ["text", "email", "password", "search", "textarea"]
  interactions: ["focus", "validation", "error states", "helper text"]
  useCases: ["Forms", "Search", "User input", "Data entry"]
previewData:
  - title: "Basic Inputs"
    description: "Standard input fields"
    components:
      - props: { placeholder: "Type here..." }
      - props: { placeholder: "Email", type: "email" }
      - props: { placeholder: "Password", type: "password" }
  - title: "Input Colors"
    description: "Validation states and colors"
    components:
      - props: { color: "primary", placeholder: "Primary input" }
      - props: { color: "success", placeholder: "Success input" }
      - props: { color: "error", placeholder: "Error input" }
  - title: "Input Sizes"
    description: "Different sizes"
    components:
      - props: { size: "xs", placeholder: "Extra small" }
      - props: { size: "sm", placeholder: "Small" }
      - props: { placeholder: "Medium (default)" }
      - props: { size: "lg", placeholder: "Large" }
usageNotes:
  - "Use Input for server-side rendered forms"
  - "For interactive inputs with onChange handlers, create an island component"
  - "Always associate inputs with labels for accessibility"
  - "Use appropriate input types for better mobile keyboards"
  - "Color variants help indicate validation states"
  - "Provide helpful placeholder text and descriptions"
  - "Group related inputs in form-control containers"
accessibilityNotes:
  - "Always associate inputs with descriptive labels"
  - "Use proper input types for semantic meaning"
  - "Provide error messages that are programmatically associated"
  - "Ensure sufficient color contrast for all states"
  - "Use aria-describedby for additional help text"
  - "Required fields should be clearly indicated"
  - "Focus indicators must be clearly visible"
relatedComponents:
  -
    name: "Textarea"
    path: "/components/input/textarea"
  -
    name: "Select"
    path: "/components/input/select"
  -
    name: "Checkbox"
    path: "/components/input/checkbox"
  -
    name: "Button"
    path: "/components/action/button"
---

## Basic Input

Standard text input field

```tsx
<Input placeholder="Enter text..." />;
```

## Input Colors

Different color variants for validation states

```tsx
<Input color="primary" placeholder="Primary input" />
<Input color="success" placeholder="Success input" />
<Input color="error" placeholder="Error input" />
```

## Input Sizes

Different sizes from xs to lg

```tsx
<Input size="lg" placeholder="Large input" />;
```

## Input Types

Different input types for various data

```tsx
<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="123" />
```

## Input with Labels

Form inputs with proper labels

```tsx
<div class="form-control w-full max-w-xs">
  <label class="label">
    <span class="label-text">Username</span>
  </label>
  <Input type="text" placeholder="Enter username" />
  <label class="label">
    <span class="label-text-alt">Must be unique</span>
  </label>
</div>;
```
