---
title: "Select"
description: "Dropdown selection component with customizable options and styling"
category: "Input"
apiProps:
  - name: "options"
    type: "Array<{value: string, label: string, disabled?: boolean}>"
    description: "Array of select options"
    required: true
  - name: "size"
    type: "'xs' | 'sm' | 'md' | 'lg'"
    default: "'md'"
    description: "Size variant of the select"
  - name: "color"
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'"
    description: "Color theme for the select"
  - name: "bordered"
    type: "boolean"
    default: "true"
    description: "Whether to show border"
  - name: "ghost"
    type: "boolean"
    default: "false"
    description: "Ghost style variant"
  - name: "disabled"
    type: "boolean"
    default: "false"
    description: "Disabled state"
  - name: "value"
    type: "string"
    description: "Selected value"
  - name: "placeholder"
    type: "string"
    description: "Placeholder text"
  - name: "onChange"
    type: "(value: string) => void"
    description: "Change event handler"
usageNotes:
  - "Options can be disabled individually using the disabled property"
  - "Supports both controlled and uncontrolled usage patterns"
  - "Multiple size and color variants available for different contexts"
  - "Use onChange handler for form integration and state management"
accessibilityNotes:
  - "Standard select accessibility features are supported"
  - "Proper labeling should be provided externally"
  - "Disabled options are announced correctly to screen readers"
relatedComponents:
  - name: "Input"
    path: "/components/input/input"
  - name: "Textarea"
    path: "/components/input/textarea"
  - name: "Checkbox"
    path: "/components/input/checkbox"
---

## Select Sizes

Different size variants for various contexts

```tsx
<Select size="xs" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Extra small" />
<Select size="sm" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Small" />
<Select size="md" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Medium" />
<Select size="lg" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Large" />
```

## Select Colors

Various color themes for different states and purposes

```tsx
<Select color="primary" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Primary" />
<Select color="secondary" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Secondary" />
<Select color="accent" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Accent" />
<Select color="success" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Success" />
<Select color="warning" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Warning" />
<Select color="error" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Error" />
```

## Select Variants

Different visual styles and appearances

```tsx
<Select bordered options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Bordered (default)" />
<Select ghost options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Ghost style" />
<Select bordered={false} options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="No border" />
```

## Select States

Different component states and conditions

```tsx
<Select disabled options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} placeholder="Disabled" />
<Select value="option2" options={[
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" }
]} />
```

## Interactive Select

Select with change handlers for form integration

```tsx
<Select
  options={[
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "orange", label: "Orange" },
    { value: "grape", label: "Grape", disabled: true },
  ]}
  placeholder="Choose a fruit"
  onChange={(value) => console.log("Selected fruit:", value)}
/>;
```
