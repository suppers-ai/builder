---
title: "Swap"
description: "Toggle between two states with smooth animations and transitions"
category: "Actions"
apiProps:
  -
    name: "on"
    type: "ComponentChildren"
    description: "Content to show in active state"
    required: true
  -
    name: "off"
    type: "ComponentChildren"
    description: "Content to show in inactive state"
    required: true
  -
    name: "active"
    type: "boolean"
    description: "Controls swap state"
    default: "false"
  -
    name: "rotate"
    type: "boolean"
    description: "Enable rotate animation"
    default: "false"
  -
    name: "flip"
    type: "boolean"
    description: "Enable flip animation"
    default: "false"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
  -
    name: "id"
    type: "string"
    description: "HTML id attribute"
usageNotes:
  - "Use Swap for server-side rendered swaps without interactivity"
  - "For interactive swaps with click handlers, create an island component"
  - "Swap uses a hidden checkbox input for state management"
  - "Choose between rotate and flip animations based on your design needs"
  - "Can swap between any type of content: icons, text, buttons, or custom elements"
  - "Animation classes (swap-rotate, swap-flip) provide smooth transitions"
  - "Use consistent sizing for on/off content to prevent layout shifts"
accessibilityNotes:
  - "Swap uses a checkbox input which is keyboard accessible"
  - "Screen readers announce state changes appropriately"
  - "Focus indicators are provided by default styling"
  - "Consider adding aria-label for icon-only swaps"
  - "Ensure sufficient color contrast for both states"
  - "Use meaningful labels when swapping between text states"
  - "Test with keyboard navigation (Tab, Space, Enter)"
relatedComponents:
  -
    name: "Button"
    path: "/components/action/button"
  -
    name: "Toggle"
    path: "/components/input/toggle"
  -
    name: "Checkbox"
    path: "/components/input/checkbox"
  -
    name: "Theme Controller"
    path: "/components/action/theme-controller"
---

## Basic Swap

Simple swap between two states

```tsx
<Swap
  on={<Eye size={24} />}
  off={<EyeOff size={24} />}
/>
```

## Rotate Animation

Swap with rotating animation effect

```tsx
<Swap
  rotate
  on={<Sun size={24} />}
  off={<Moon size={24} />}
/>
```

## Flip Animation

Swap with flipping animation effect

```tsx
<Swap
  flip
  on={<Heart size={24} className="text-red-500" />}
  off={<Heart size={24} className="text-gray-400" />}
/>
```

## Text Swap

Swap between text content

```tsx
<Swap
  on={<span class="text-green-500 font-bold">ON</span>}
  off={<span class="text-red-500 font-bold">OFF</span>}
/>
```

## Button Swap

Swap between different button states

```tsx
<Swap
  on={<button class="btn btn-primary">Save</button>}
  off={<button class="btn btn-outline">Edit</button>}
/>
```

