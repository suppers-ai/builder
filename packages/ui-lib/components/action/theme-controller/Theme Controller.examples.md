---
title: "Theme Controller"
description: "Interface for switching between different application themes"
category: "Actions"
apiProps:
  -
    name: "value"
    type: "string"
    description: "Currently selected theme name"
    required: true
  -
    name: "options"
    type: "string[]"
    description: "Array of available theme names"
    required: true
  -
    name: "onChange"
    type: "(theme: string) => void"
    description: "Callback when theme changes"
  -
    name: "showNames"
    type: "boolean"
    description: "Show theme names in options"
    default: "true"
  -
    name: "variant"
    type: "radio | dropdown | toggle | grid"
    description: "Visual style of the controller"
    default: "radio"
  -
    name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Theme Controller manages DaisyUI theme switching across the application"
  - "Themes are applied via the 'data-theme' attribute on the html element"
  - "Use localStorage to persist user's theme preference"
  - "All 29 DaisyUI themes are supported out of the box"
  - "Radio variant is best for showing all available options"
  - "Dropdown variant saves space when many themes are available"
  - "Toggle variant works well for simple light/dark switching"
  - "Grid variant provides visual color previews for each theme"
accessibilityNotes:
  - "All variants use semantic form controls (radio, select, checkbox)"
  - "Keyboard navigation works with Tab, Arrow keys, Space, and Enter"
  - "Screen readers announce theme names and current selection"
  - "Focus indicators are clearly visible on all interactive elements"
  - "Theme changes are announced to screen readers"
  - "Use aria-label for icon-only theme controllers"
  - "Ensure sufficient contrast in all supported themes"
relatedComponents:
  -
    name: "Dropdown"
    path: "/components/action/dropdown"
  -
    name: "Radio"
    path: "/components/input/radio"
  -
    name: "Toggle"
    path: "/components/input/toggle"
  -
    name: "Swap"
    path: "/components/action/swap"
---

## Radio Theme Controller

Theme selection using radio buttons

```tsx
<div class="flex gap-2">
  <input type="radio" name="theme" class="radio radio-primary" value="light" />
  <input type="radio" name="theme" class="radio radio-secondary" value="dark" />
  <input type="radio" name="theme" class="radio radio-accent" value="cupcake" />
</div>
```

## Color Grid Theme Controller

Visual theme selection with color previews

```tsx
<div class="grid grid-cols-5 gap-2">
  <div class="tooltip" data-tip="Light">
    <input type="radio" name="theme" class="radio radio-sm" style="background: #ffffff; border-color: #d1d5db;" />
  </div>
  <div class="tooltip" data-tip="Dark">
    <input type="radio" name="theme" class="radio radio-sm" style="background: #1f2937; border-color: #374151;" />
  </div>
  <div class="tooltip" data-tip="Cupcake">
    <input type="radio" name="theme" class="radio radio-sm" style="background: #fce7f3; border-color: #f3e8ff;" />
  </div>
</div>
```

## Dropdown Theme Controller

Theme selection via dropdown menu

```tsx
<div class="dropdown">
  <label tabindex="0" class="btn btn-ghost">
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
    </svg>
    Theme
  </label>
  <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
    <li><a>Light</a></li>
    <li><a>Dark</a></li>
    <li><a>Cupcake</a></li>
    <li><a>Cyberpunk</a></li>
  </ul>
</div>
```

## Toggle Theme Controller

Simple light/dark toggle switch

```tsx
<label class="swap swap-rotate">
  <input type="checkbox" />
  <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
  </svg>
  <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
  </svg>
</label>
```

