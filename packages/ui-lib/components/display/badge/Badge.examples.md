---
title: "Badge"
description: "Small labels and indicators for status, categories, and notifications"
category: "Display"
apiProps:
  -
    name: "children"
    type: "ComponentChildren"
    description: "Badge content (text, icons, etc.)"
  -
    name: "content"
    type: "string | number"
    description: "Alternative way to set badge content"
  -
    name: "color"
    type: "primary | secondary | accent | neutral | info | success | warning | error"
    description: "Badge color variant"
  -
    name: "size"
    type: "xs | sm | md | lg"
    description: "Badge size"
    default: "md"
  -
    name: "variant"
    type: "outline"
    description: "Badge style variant"
  -
    name: "position"
    type: "top-right | top-left | bottom-right | bottom-left"
    description: "Position when used as indicator"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Use descriptive text that clearly indicates the badge purpose"
  - "Choose appropriate colors that match the semantic meaning"
  - "Content prop can be used for simple text or numbers"
  - "Children prop allows for complex content like icons"
  - "Outline variant provides a subtle alternative to filled badges"
  - "Position prop creates indicator-style badges"
  - "Keep badge text concise for better readability"
accessibilityNotes:
  - "Badge text should be descriptive and meaningful"
  - "Ensure sufficient color contrast in all themes"
  - "Don't rely solely on color to convey information"
  - "Use appropriate semantic HTML when badges represent status"
  - "Consider screen reader announcements for dynamic badges"
  - "Provide context for numerical badges (e.g., '5 unread messages')"
  - "Test readability with various text sizes and zoom levels"
relatedComponents:
  -
    name: "Button"
    path: "/components/action/button"
  -
    name: "Alert"
    path: "/components/feedback/alert"
  -
    name: "Avatar"
    path: "/components/display/avatar"
  -
    name: "Card"
    path: "/components/display/card"
---

## Basic Badges

Simple badges with text content

```tsx
<Badge>Default</Badge>
<Badge color="primary">Primary</Badge>
```

## Badge Colors

Different color variants for various use cases

```tsx
<Badge color="primary">Primary</Badge>
<Badge color="success">Success</Badge>
<Badge color="error">Error</Badge>
```

## Badge Sizes

Different sizes from xs to lg

```tsx
<Badge size="lg" color="primary">Large</Badge>;
```

## Badge Variants

Filled and outline styles

```tsx
<Badge color="primary">Filled</Badge>
<Badge color="primary" variant="outline">Outline</Badge>
```

## Badge with Numbers

Badges displaying numerical content

```tsx
<Badge color="error" content={99} />
<Badge color="primary" content="999+" />
```

## Badge with Icons

Badges containing icons and text

```tsx
<Badge color="success">
  <span class="flex items-center gap-1">
    <Check size={16} /> Verified
  </span>
</Badge>;
```

## Status Badges

Badges for showing various status states

```tsx
<Badge color="success">Online</Badge>
<Badge color="warning">Pending</Badge>
<Badge color="error">Offline</Badge>
```
