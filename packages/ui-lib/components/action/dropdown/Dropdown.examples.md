---
title: "Dropdown"
description: "Dropdown menus for navigation and actions with customizable content"
category: "Actions"
apiProps:
  -
    name: "children"
    type: "ComponentChildren"
    description: "Dropdown trigger and content"
    required: true
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
  -
    name: "open"
    type: "boolean"
    description: "Control dropdown open state (for controlled component)"
    default: "false"
usageNotes:
  - "Use Dropdown for server-side rendered dropdowns without JavaScript interactivity"
  - "For interactive dropdowns with click handlers, create an island component"
  - "Always include proper z-index (z-[1]) for dropdown content to ensure it appears above other elements"
  - "Use dropdown-top, dropdown-end, dropdown-bottom, dropdown-left classes for positioning"
  - "Dropdown content should have appropriate background and shadow for visibility"
  - "Consider using dropdown-hover class for hover-triggered dropdowns"
accessibilityNotes:
  - "Dropdown uses semantic HTML details/summary elements for keyboard accessibility"
  - "Summary element is focusable and can be activated with Enter or Space"
  - "Dropdown content is properly associated with the trigger element"
  - "Use proper heading structure within dropdown content if needed"
  - "Ensure sufficient color contrast for dropdown items"
  - "Consider adding ARIA labels for icon-only dropdown triggers"
relatedComponents:
  -
    name: "Button"
    path: "/components/action/button"
  -
    name: "Menu"
    path: "/components/navigation/menu"
  -
    name: "Modal"
    path: "/components/action/modal"
  -
    name: "Navbar"
    path: "/components/navigation/navbar"
---

## Basic Dropdown

Simple dropdown menu with list items

```tsx
<Dropdown>
  <summary class="btn">Click me</summary>
  <ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
    <li><a>Item 1</a></li>
    <li><a>Item 2</a></li>
    <li><a>Item 3</a></li>
  </ul>
</Dropdown>
```

## Dropdown with Button

Dropdown triggered by a styled button

```tsx
<Dropdown>
  <summary class="btn btn-primary">Primary Menu</summary>
  <ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
    <li><a>Dashboard</a></li>
    <li><a>Profile</a></li>
    <li><a>Settings</a></li>
    <li class="disabled"><a>Disabled Item</a></li>
    <li><hr class="my-2" /></li>
    <li><a>Logout</a></li>
  </ul>
</Dropdown>
```

## Dropdown Positions

Different dropdown positions and alignments

```tsx
<div class="flex gap-4">
  <Dropdown>
    <summary class="btn">Top</summary>
    <ul class="menu dropdown-content dropdown-top bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
      <li><a>Item 1</a></li>
      <li><a>Item 2</a></li>
    </ul>
  </Dropdown>
  
  <Dropdown>
    <summary class="btn">End</summary>
    <ul class="menu dropdown-content dropdown-end bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
      <li><a>Item 1</a></li>
      <li><a>Item 2</a></li>
    </ul>
  </Dropdown>
</div>
```

## Complex Dropdown Content

Dropdown with rich content including forms and custom elements

```tsx
<Dropdown>
  <summary class="btn btn-secondary">Form Menu</summary>
  <div class="dropdown-content bg-base-100 rounded-box z-[1] w-64 p-4 shadow">
    <div class="form-control space-y-2">
      <label class="label">
        <span class="label-text">Username</span>
      </label>
      <input type="text" class="input input-bordered input-sm" />
      <label class="label">
        <span class="label-text">Password</span>
      </label>
      <input type="password" class="input input-bordered input-sm" />
      <button class="btn btn-primary btn-sm">Login</button>
    </div>
  </div>
</Dropdown>
```

