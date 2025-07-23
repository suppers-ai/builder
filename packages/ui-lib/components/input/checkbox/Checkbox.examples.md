---
title: "Checkbox"
description: "Selection checkboxes for multiple choice inputs and forms"
category: "Input"
apiProps:
  -
    name: "checked"
    type: "boolean"
    description: "Whether checkbox is checked"
    default: "false"
  -
    name: "disabled"
    type: "boolean"
    description: "Whether checkbox is disabled"
    default: "false"
  -
    name: "color"
    type: "primary | secondary | accent | success | warning | error | info"
    description: "Checkbox color variant"
  -
    name: "size"
    type: "xs | sm | md | lg"
    description: "Checkbox size"
    default: "md"
  -
    name: "name"
    type: "string"
    description: "Form field name attribute"
  -
    name: "value"
    type: "string"
    description: "Form field value attribute"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Use Checkbox for server-side rendered forms"
  - "For interactive checkboxes with onChange handlers, create an island component"
  - "Always associate checkboxes with labels using label element"
  - "Group related checkboxes in form-control containers"
  - "Use appropriate colors to indicate state or category"
  - "Consider using fieldsets for groups of related checkboxes"
  - "Provide clear, descriptive labels for accessibility"
accessibilityNotes:
  - "Always associate checkboxes with descriptive labels"
  - "Use fieldset and legend for groups of related checkboxes"
  - "Ensure sufficient color contrast for all states"
  - "Test keyboard navigation with Tab and Space keys"
  - "Provide context for required checkbox groups"
  - "Use aria-describedby for additional help text"
  - "Screen readers should announce checkbox state changes"
relatedComponents:
  -
    name: "Radio"
    path: "/components/input/radio"
  -
    name: "Toggle"
    path: "/components/input/toggle"
  -
    name: "Button"
    path: "/components/action/button"
  -
    name: "Input"
    path: "/components/input/input"
---

## Basic Checkbox

Simple checkbox in different states

```tsx
<Checkbox />
<Checkbox checked />
<Checkbox disabled />
```

## Checkbox Colors

Different color variants

```tsx
<Checkbox color="primary" checked />
<Checkbox color="success" checked />
<Checkbox color="error" checked />
```

## Checkbox Sizes

Different sizes from xs to lg

```tsx
<Checkbox size="lg" checked color="primary" />;
```

## Checkbox with Labels

Checkboxes with accompanying text labels

```tsx
<label class="label cursor-pointer">
  <span class="label-text">Remember me</span>
  <Checkbox checked />
</label>;
```

## Form Checkbox Groups

Multiple checkboxes for form selections

```tsx
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">JavaScript</span>
    <Checkbox color="primary" checked />
  </label>
</div>;
```
