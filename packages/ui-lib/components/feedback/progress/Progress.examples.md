---
title: "Progress"
description: "Progress bars for showing completion status and loading states"
category: "Feedback"
apiProps:
  -
    name: "value"
    type: "number"
    description: "Current progress value"
    required: true
  -
    name: "max"
    type: "number"
    description: "Maximum progress value"
    default: "100"
  -
    name: "indeterminate"
    type: "boolean"
    description: "Show indeterminate/loading state"
    default: "false"
  -
    name: "color"
    type: "primary | secondary | accent | success | warning | error | info"
    description: "Progress bar color"
  -
    name: "size"
    type: "xs | sm | md | lg"
    description: "Progress bar height"
    default: "md"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Use progress bars for operations with known completion percentage"
  - "Include descriptive labels to explain what is progressing"
  - "Choose colors that reflect the nature of the operation"
  - "Use indeterminate state when completion time is unknown"
  - "Update progress values smoothly for better user experience"
  - "Consider showing actual values alongside percentages"
  - "Progress bars work well in cards, modals, and forms"
accessibilityNotes:
  - "Progress bars should use appropriate ARIA attributes"
  - "Provide text alternatives that describe current progress"
  - "Use aria-valuenow, aria-valuemin, and aria-valuemax"
  - "Include descriptive labels using aria-label or aria-labelledby"
  - "Announce progress changes to screen readers"
  - "Don't rely solely on color to indicate progress state"
  - "Ensure sufficient color contrast for progress indicators"
relatedComponents:
  -
    name: "Loading"
    path: "/components/feedback/loading"
  -
    name: "Skeleton"
    path: "/components/feedback/skeleton"
  -
    name: "Alert"
    path: "/components/feedback/alert"
  -
    name: "Badge"
    path: "/components/display/badge"
---

## Basic Progress

Simple progress bars with different values

```tsx
<Progress value={30} max={100} />
<Progress value={70} max={100} />
```

## Progress Colors

Different color variants for various states

```tsx
<Progress value={50} max={100} color="primary" />
<Progress value={75} max={100} color="success" />
<Progress value={25} max={100} color="error" />
```

## Progress Sizes

Different heights for various contexts

```tsx
<Progress value={60} max={100} size="lg" color="primary" />
```

## Progress with Labels

Progress bars with descriptive text

```tsx
<div class="w-full">
  <div class="flex justify-between text-sm mb-1">
    <span>Download Progress</span>
    <span>75%</span>
  </div>
  <Progress value={75} max={100} color="primary" />
</div>
```

## Indeterminate Progress

Progress bars for unknown completion time

```tsx
<Progress indeterminate color="primary" />
```

