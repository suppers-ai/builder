---
title: "Indicator"
description: "Add badges, notifications, and status indicators to any element for showing counts and status"
category: "Layout"
apiProps:
  - name: "content"
    type: "string | number"
    description: "Content to display in the indicator badge"
  - name: "variant"
    type: "'dot' | 'ping' | 'badge'"
    default: "'badge'"
    description: "Visual style variant of the indicator"
  - name: "color"
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'"
    description: "Color theme for the indicator"
  - name: "position"
    type: "'top-start' | 'top-center' | 'top-end' | 'middle-start' | 'middle-center' | 'middle-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'"
    default: "'top-end'"
    description: "Position of the indicator relative to its container"
  - name: "onIndicatorClick"
    type: "() => void"
    description: "Click handler for the indicator element"
  - name: "children"
    type: "JSX.Element"
    description: "The element to add the indicator to"
    required: true
usageNotes:
  - "Perfect for notification counts, status dots, and attention indicators"
  - "Dot variant great for simple online/offline status"
  - "Ping variant adds pulsing animation for urgent notifications"
  - "Content can be numbers, text, or even emojis"
  - "Position relative to container for flexible placement"
accessibilityNotes:
  - "Screen readers announce indicator content appropriately"
  - "Clickable indicators support keyboard navigation"
  - "Proper color contrast maintained for all color variants"
  - "Semantic meaning conveyed through text and color together"
relatedComponents:
  - name: "Badge"
    path: "/components/display/badge"
  - name: "Button"
    path: "/components/action/button"
  - name: "Avatar"
    path: "/components/display/avatar"
---

## Basic Indicators

Simple notification badges with different content types

```tsx
<Indicator content="5" position="top-end">
  <Button color="primary">Messages</Button>
</Indicator>
<Indicator content="99+" color="warning" position="top-end">
  <Button color="accent">📧 Inbox</Button>
</Indicator>
<Indicator content="!" color="error" position="top-end">
  <Button variant="outline">⚠️ Alert</Button>
</Indicator>
```

## Indicator Variants

Different visual styles for various use cases

```tsx
<Indicator variant="dot" color="success" position="top-end">
  <div class="avatar">
    <div class="w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content text-xl font-bold">
      JD
    </div>
  </div>
</Indicator>
<Indicator variant="ping" color="error" position="top-end">
  <Button variant="outline">⚠️ Alert</Button>
</Indicator>
<Indicator variant="badge" content="12" color="primary" position="top-end">
  <Button color="accent">📧 Inbox</Button>
</Indicator>
```

## Position Variants

Different indicator positions relative to the container

```tsx
<Indicator content="1" position="top-start">
  <Button>Top Start</Button>
</Indicator>
<Indicator content="2" position="top-center">
  <Button>Top Center</Button>
</Indicator>
<Indicator content="3" position="top-end">
  <Button>Top End</Button>
</Indicator>
<Indicator content="4" position="middle-start">
  <Button>Middle Start</Button>
</Indicator>
<Indicator content="5" position="middle-end">
  <Button>Middle End</Button>
</Indicator>
<Indicator content="6" position="bottom-start">
  <Button>Bottom Start</Button>
</Indicator>
<Indicator content="7" position="bottom-center">
  <Button>Bottom Center</Button>
</Indicator>
<Indicator content="8" position="bottom-end">
  <Button>Bottom End</Button>
</Indicator>
```

## Interactive Indicators

Clickable indicators with event handlers

```tsx
<Indicator
  content="3"
  color="primary"
  position="top-end"
  onIndicatorClick={() => alert("3 new messages!")}
>
  <Button variant="outline">📧 Email</Button>
</Indicator>
<Indicator
  content="!"
  color="warning"
  position="top-end"
  onIndicatorClick={() => alert("System update available!")}
>
  <Button variant="outline">⚙️ System</Button>
</Indicator>
<Indicator
  variant="dot"
  color="success"
  position="top-end"
  onIndicatorClick={() => alert("User is online!")}
>
  <Button variant="outline">👤 Profile</Button>
</Indicator>
```

## Menu with Indicators

Navigation menu items enhanced with notification counts

```tsx
<div class="menu bg-base-100 rounded-lg">
  <li>
    <Indicator content="12" color="primary" position="top-end">
      <a>📧 Messages</a>
    </Indicator>
  </li>
  <li>
    <Indicator content="3" color="warning" position="top-end">
      <a>🔔 Notifications</a>
    </Indicator>
  </li>
  <li>
    <Indicator variant="dot" color="success" position="top-end">
      <a>👥 Friends Online</a>
    </Indicator>
  </li>
  <li>
    <a>📊 Dashboard</a>
  </li>
  <li>
    <Indicator content="!" color="error" position="top-end">
      <a>⚙️ Settings</a>
    </Indicator>
  </li>
</div>;
```

## Shopping Cart Example

E-commerce cart button with item count indicator

```tsx
<Indicator content="8" color="primary" position="top-end">
  <Button variant="ghost" circle={true}>
    <div class="indicator">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
        />
      </svg>
    </div>
  </Button>
</Indicator>;
```
