---
title: "Divider"
description: "Visual separator component for organizing content with optional text labels"
category: "Layout"
apiProps:
  - name: "text"
    type: "string"
    description: "Optional text label for the divider"
  - name: "position"
    type: "'start' | 'center' | 'end'"
    default: "'center'"
    description: "Text alignment position"
  - name: "vertical"
    type: "boolean"
    default: "false"
    description: "Whether to display as vertical divider"
  - name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Can be used horizontally (default) or vertically"
  - "Supports custom text labels with positioning"
  - "Great for responsive design with conditional rendering"
  - "Can be styled with custom classes for different contexts"
  - "Perfect for separating content sections and form elements"
accessibilityNotes:
  - "Acts as a visual separator element"
  - "Text labels provide semantic meaning to screen readers"
  - "Use appropriate semantic context when separating content"
relatedComponents:
  - name: "Card"
    path: "/components/display/card"
  - name: "Hero"
    path: "/components/layout/hero"
---

## Basic Dividers

Simple dividers with and without text

```tsx
<Divider />
<Divider text="OR" />
```

## Text Positioning

Different text alignment options

```tsx
<Divider text="Start" position="start" />
<Divider text="Center" position="center" />
<Divider text="End" position="end" />
```

## Vertical Dividers

Vertical separators for horizontal layouts

```tsx
<Divider vertical />
```

## Login Form Example

Real-world usage in authentication forms

```tsx
<div class="space-y-4">
  <input class="input input-bordered w-full" placeholder="Username" />
  <input class="input input-bordered w-full" type="password" placeholder="Password" />
  <button class="btn btn-primary w-full">Sign In</button>
  <Divider text="OR" />
  <button class="btn btn-outline w-full">Sign Up</button>
</div>
```

## Content Sections

Separating feature sections with responsive behavior

```tsx
<div class="flex flex-col md:flex-row items-center">
  <div class="p-4">Section 1</div>
  <Divider vertical class="hidden md:block" />
  <Divider class="md:hidden" />
  <div class="p-4">Section 2</div>
</div>
```

## Timeline Example

Using vertical dividers in timeline layouts

```tsx
<div class="flex">
  <div class="flex-shrink-0">
    <div class="w-4 h-4 bg-primary rounded-full"></div>
    <Divider vertical class="ml-6 h-8" />
  </div>
  <div class="ml-4">
    <h4 class="font-semibold">Event Title</h4>
    <p class="text-sm opacity-70">Event description</p>
  </div>
</div>
```

## Pricing Table

Dividers in pricing cards with special styling

```tsx
<div class="card bg-base-100">
  <div class="card-body">
    <h3 class="card-title">Basic Plan</h3>
    <Divider />
    <div class="text-2xl font-bold">$9.99/month</div>
    <div class="divider divider-neutral">Most Popular</div>
    <ul class="list-disc list-inside space-y-1">
      <li>Feature 1</li>
      <li>Feature 2</li>
    </ul>
  </div>
</div>
```