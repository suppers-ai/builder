---
title: "Alert"
description: "Notification messages for success, warnings, errors, and information"
category: "Feedback"
apiProps:
  -
    name: "children"
    type: "ComponentChildren"
    description: "Alert content (text, icons, buttons)"
    required: true
  -
    name: "color"
    type: "info | success | warning | error"
    description: "Alert type and color scheme"
  -
    name: "dismissible"
    type: "boolean"
    description: "Whether alert can be dismissed"
    default: "false"
  -
    name: "onDismiss"
    type: "() => void"
    description: "Callback when alert is dismissed"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Use Alert for server-side rendered alerts"
  - "For interactive alerts with dismiss functionality, create an island component"
  - "Choose appropriate colors that match the message severity"
  - "Include relevant icons to reinforce the alert type"
  - "Keep alert messages concise and actionable"
  - "Place alerts contextually near related content"
  - "Use consistent alert patterns throughout your application"
accessibilityNotes:
  - "Alerts should have appropriate ARIA roles (alert, alertdialog, status)"
  - "Use proper color contrast for text and background"
  - "Don't rely solely on color to convey meaning"
  - "Provide clear, descriptive text that explains the situation"
  - "Ensure dismiss buttons are keyboard accessible"
  - "Consider screen reader announcements for dynamic alerts"
  - "Important alerts should capture user attention appropriately"
relatedComponents:
  -
    name: "Toast"
    path: "/components/feedback/toast"
  -
    name: "Modal"
    path: "/components/action/modal"
  -
    name: "Badge"
    path: "/components/display/badge"
  -
    name: "Button"
    path: "/components/action/button"
---

## Basic Alert

Simple alert with text content

```tsx
<Alert>
  <span>Default alert message</span>
</Alert>
```

## Alert Colors

Different alert types for various messages

```tsx
<Alert color="success">
  <CheckCircle size={20} />
  <span>Success! Your changes have been saved.</span>
</Alert>
```

## Alert with Actions

Alerts containing action buttons

```tsx
<Alert color="warning">
  <AlertTriangle size={20} />
  <span>Your session will expire in 5 minutes.</span>
  <div>
    <button class="btn btn-sm">Dismiss</button>
    <button class="btn btn-sm btn-primary">Extend Session</button>
  </div>
</Alert>
```

## Alert Variants

Different visual styles and layouts

```tsx
<Alert color="success" class="shadow-lg">
  <CheckCircle size={20} />
  <div>
    <h3 class="font-bold">Success!</h3>
    <div class="text-xs">Your account has been created successfully.</div>
  </div>
</Alert>
```

## Compact Alerts

Smaller alerts for inline messages

```tsx
<Alert color="info" class="py-2">
  <Info size={16} />
  <span class="text-sm">Compact info message</span>
</Alert>
```

