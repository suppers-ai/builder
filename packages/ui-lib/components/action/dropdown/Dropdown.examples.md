---
title: "Dropdown"
description: "Dropdown menus for navigation and actions with customizable trigger and content"
category: "Action"
apiProps:
  - name: "trigger"
    type: "ComponentChildren"
    description: "Element that triggers the dropdown"
    required: true
  - name: "content"
    type: "ComponentChildren"
    description: "Dropdown menu content"
    required: true
  - name: "position"
    type: "'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'"
    default: "'bottom'"
    description: "Position of dropdown relative to trigger"
  - name: "hover"
    type: "boolean"
    default: "false"
    description: "Whether to trigger on hover"
  - name: "open"
    type: "boolean"
    default: "false"
    description: "Control dropdown open state"
  - name: "forceOpen"
    type: "boolean"
    default: "false"
    description: "Force dropdown to stay open"
  - name: "onToggle"
    type: "(open: boolean) => void"
    description: "Callback when dropdown toggles"
  - name: "onOpen"
    type: "() => void"
    description: "Callback when dropdown opens"
  - name: "onClose"
    type: "() => void"
    description: "Callback when dropdown closes"
usageNotes:
  - "Use trigger prop for the clickable element that opens the dropdown"
  - "Use content prop for the dropdown menu items"
  - "Position prop controls where the dropdown appears relative to trigger"
  - "Hover prop enables hover-to-open behavior"
  - "Great for navigation menus, context menus, and action lists"
accessibilityNotes:
  - "Trigger element is keyboard accessible with proper tabindex and role"
  - "Dropdown content supports keyboard navigation"
  - "Screen readers announce dropdown state changes"
  - "Focus management handles dropdown open/close states"
relatedComponents:
  - name: "Button"
    path: "/components/action/button"
  - name: "Menu"
    path: "/components/navigation/menu"
  - name: "Navbar"
    path: "/components/navigation/navbar"
---

## Basic Dropdown

Simple dropdown menu with button trigger and list items

```tsx
<Dropdown
  trigger={<button class="btn">Click me</button>}
  content={
    <>
      <li>
        <a>Item 1</a>
      </li>
      <li>
        <a>Item 2</a>
      </li>
      <li>
        <a>Item 3</a>
      </li>
    </>
  }
/>;
```

## Dropdown with Styled Button

Dropdown triggered by a primary button

```tsx
<Dropdown
  trigger={<button class="btn btn-primary">Primary Menu</button>}
  content={
    <>
      <li>
        <a>Dashboard</a>
      </li>
      <li>
        <a>Profile</a>
      </li>
      <li>
        <a>Settings</a>
      </li>
      <li class="disabled">
        <a>Disabled Item</a>
      </li>
      <li>
        <hr class="my-2" />
      </li>
      <li>
        <a>Logout</a>
      </li>
    </>
  }
/>;
```

## Dropdown Positions

Different dropdown positions relative to the trigger

```tsx
<div class="flex gap-4">
  <Dropdown
    position="top"
    trigger={<button class="btn">Top</button>}
    content={
      <>
        <li>
          <a>Item 1</a>
        </li>
        <li>
          <a>Item 2</a>
        </li>
      </>
    }
  />

  <Dropdown
    position="bottom-end"
    trigger={<button class="btn">End</button>}
    content={
      <>
        <li>
          <a>Item 1</a>
        </li>
        <li>
          <a>Item 2</a>
        </li>
      </>
    }
  />

  <Dropdown
    position="left"
    trigger={<button class="btn">Left</button>}
    content={
      <>
        <li>
          <a>Item 1</a>
        </li>
        <li>
          <a>Item 2</a>
        </li>
      </>
    }
  />
</div>;
```

## Hover Dropdown

Dropdown that opens on hover instead of click

```tsx
<Dropdown
  hover={true}
  trigger={<button class="btn btn-outline">Hover Me</button>}
  content={
    <>
      <li>
        <a>Quick Action 1</a>
      </li>
      <li>
        <a>Quick Action 2</a>
      </li>
      <li>
        <a>Quick Action 3</a>
      </li>
    </>
  }
/>;
```

## User Profile Dropdown

Real-world example with user profile actions

```tsx
<Dropdown
  position="bottom-end"
  trigger={
    <div class="btn btn-ghost btn-circle avatar">
      <div class="w-10 rounded-full">
        <img
          alt="User avatar"
          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        />
      </div>
    </div>
  }
  content={
    <>
      <li class="menu-title">
        <span>John Doe</span>
      </li>
      <li>
        <a>Profile</a>
      </li>
      <li>
        <a>Settings</a>
      </li>
      <li>
        <a>Billing</a>
      </li>
      <li>
        <hr class="my-2" />
      </li>
      <li>
        <a>Help & Support</a>
      </li>
      <li>
        <a class="text-error">Sign out</a>
      </li>
    </>
  }
/>;
```

## Interactive Dropdown

Dropdown with event handlers for state management

```tsx
<Dropdown
  trigger={<button class="btn btn-secondary">Interactive Menu</button>}
  content={
    <>
      <li>
        <a>View Details</a>
      </li>
      <li>
        <a>Edit Item</a>
      </li>
      <li>
        <a>Share</a>
      </li>
      <li>
        <hr class="my-2" />
      </li>
      <li>
        <a class="text-warning">Archive</a>
      </li>
      <li>
        <a class="text-error">Delete</a>
      </li>
    </>
  }
  onOpen={() => console.log("Dropdown opened")}
  onClose={() => console.log("Dropdown closed")}
/>;
```
