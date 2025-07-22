---
title: "Avatar"
description: "Profile pictures and user representations with various sizes and states"
category: "Display"
apiProps:
  -
    name: "src"
    type: "string"
    description: "Image source URL"
  -
    name: "alt"
    type: "string"
    description: "Alt text for the image"
  -
    name: "size"
    type: "xs | sm | md | lg | xl"
    description: "Avatar size"
    default: "md"
  -
    name: "initials"
    type: "string"
    description: "Text to display when no image (e.g., 'AB')"
  -
    name: "ring"
    type: "boolean"
    description: "Show ring around avatar"
    default: "false"
  -
    name: "online"
    type: "boolean"
    description: "Show online status indicator"
    default: "false"
  -
    name: "offline"
    type: "boolean"
    description: "Show offline status indicator"
    default: "false"
  -
    name: "placeholder"
    type: "string"
    description: "Fallback text when no initials or image"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Use src prop for user profile images with proper alt text"
  - "Initials prop creates text-based avatars when no image is available"
  - "Ring prop adds visual emphasis and works well for active users"
  - "Status indicators (online/offline) show user presence"
  - "Avatar groups use negative margins to overlap avatars"
  - "Always provide alt text for accessibility"
  - "Consider loading states and error handling for images"
accessibilityNotes:
  - "Always include meaningful alt text for images"
  - "Initials should be readable against background colors"
  - "Status indicators need accessible labels or descriptions"
  - "Ring has sufficient contrast against all themes"
  - "Screen readers announce avatar content appropriately"
  - "Focus indicators are visible when avatars are interactive"
  - "Color alone should not convey status information"
relatedComponents:
  -
    name: "Badge"
    path: "/components/display/badge"
  -
    name: "Card"
    path: "/components/display/card"
  -
    name: "Button"
    path: "/components/action/button"
  -
    name: "Dropdown"
    path: "/components/action/dropdown"
---

## Basic Avatars

Simple avatar with image, ring, and initials

```tsx
<Avatar
  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
  alt="Profile"
/>
```

## Avatar Sizes

Different avatar sizes from xs to xl

```tsx
<Avatar
  size="lg"
  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
  alt="Large Avatar"
/>
```

## Avatar with Status

Online and offline status indicators

```tsx
<Avatar
  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
  alt="Online User"
  online
/>
```

## Avatar with Initials

Placeholder avatars using initials

```tsx
<Avatar
  initials="AB"
  size="lg"
/>
```

## Avatar Groups

Overlapping avatars for team displays

```tsx
<div class="flex -space-x-3">
  <Avatar src="user1.jpg" ring />
  <Avatar src="user2.jpg" ring />
  <Avatar src="user3.jpg" ring />
  <Avatar initials="+3" ring />
</div>
```

