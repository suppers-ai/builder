---
title: "Loading"
description: "Loading spinners and indicators for asynchronous operations"
category: "Feedback"
apiProps:
  -
    name: "type"
    type: "spinner | dots | ring | ball | bars"
    description: "Loading animation type"
    default: "spinner"
  -
    name: "size"
    type: "xs | sm | md | lg | xl"
    description: "Loading indicator size"
    default: "md"
  -
    name: "color"
    type: "primary | secondary | accent | neutral | info | success | warning | error"
    description: "Loading indicator color"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Use loading indicators for operations that take more than a few seconds"
  - "Choose loading types that match your application's design language"
  - "Provide context about what is loading when possible"
  - "Spinner type is most common and universally understood"
  - "Dots type works well for subtle loading states"
  - "Ring type provides a modern, minimal appearance"
  - "Always include accessible text for screen readers"
accessibilityNotes:
  - "Loading indicators should have appropriate ARIA labels"
  - "Use aria-live regions to announce loading state changes"
  - "Provide meaningful text descriptions of what is loading"
  - "Ensure loading indicators have sufficient color contrast"
  - "Consider focus management during loading states"
  - "Don't rely solely on visual indicators - provide text alternatives"
  - "Loading states should be announced to screen readers"
relatedComponents:
  -
    name: "Progress"
    path: "/components/feedback/progress"
  -
    name: "Skeleton"
    path: "/components/feedback/skeleton"
  -
    name: "Alert"
    path: "/components/feedback/alert"
  -
    name: "Button"
    path: "/components/action/button"
---

## Basic Loading

Simple loading spinners

```tsx
<Loading />
<Loading size="lg" />
```

## Loading Types

Different loading animation styles

```tsx
<Loading type="spinner" />
<Loading type="dots" />
<Loading type="ring" />
```

## Loading Sizes

Different sizes from xs to xl

```tsx
<Loading size="xl" type="spinner" />;
```

## Loading with Text

Loading indicators with descriptive text

```tsx
<div class="flex items-center gap-2">
  <Loading size="sm" />
  <span>Loading...</span>
</div>;
```

## Loading States

Loading in different contexts and layouts

```tsx
<div class="card bg-base-100 shadow-xl">
  <div class="card-body items-center text-center">
    <Loading size="lg" />
    <h2 class="card-title">Loading Content</h2>
    <p>Please wait while we fetch your data...</p>
  </div>
</div>;
```
