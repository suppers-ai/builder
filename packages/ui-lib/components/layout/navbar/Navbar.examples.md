---
title: "Navbar"
description: "Navigation bar component with flexible layout options for top-level site navigation"
category: "Layout"
apiProps:
  - name: "start"
    type: "JSX.Element"
    description: "Content for the left side of the navbar"
  - name: "center"
    type: "JSX.Element"
    description: "Content for the center of the navbar"
  - name: "end"
    type: "JSX.Element"
    description: "Content for the right side of the navbar"
  - name: "children"
    type: "JSX.Element"
    description: "Main content when not using start/center/end props"
  - name: "class"
    type: "string"
    description: "Additional CSS classes for styling"
demoInfo:
  variants: ["horizontal", "vertical", "with dropdown", "with search"]
  interactions: ["menu toggle", "dropdown", "search", "responsive collapse"]
  useCases: ["Site navigation", "App header", "User menu", "Brand display"]
usageNotes:
  - "Use start/center/end for structured three-section layout"
  - "Use children for simple single-content layout"
  - "Responsive behavior should be handled with CSS classes"
  - "Perfect for site headers with branding, navigation, and actions"
  - "Can contain any components like buttons, menus, search, avatars"
accessibilityNotes:
  - "Uses semantic nav element for proper navigation context"
  - "Keyboard navigation supported for all interactive elements"
  - "Screen reader friendly with proper heading structure"
  - "Focus management for dropdown and mobile menu interactions"
relatedComponents:
  - name: "Menu"
    path: "/components/navigation/menu"
  - name: "Button"
    path: "/components/action/button"
  - name: "Input"
    path: "/components/input/input"
---

## Basic Navbar

Simple navbar with just branding

```tsx
<Navbar>
  <Button variant="ghost" class="text-xl">daisyUI</Button>
</Navbar>;
```

## Navbar with Sections

Structured layout with start, center, and end sections

```tsx
<Navbar
  start={
    <div class="dropdown">
      <Button variant="ghost" class="lg:hidden" tabIndex={0} role="button">
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
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </Button>
      <ul
        tabIndex={0}
        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
      >
        <li>
          <a>Item 1</a>
        </li>
        <li>
          <a>Item 2</a>
        </li>
        <li>
          <a>Item 3</a>
        </li>
      </ul>
    </div>
  }
  center={<Button variant="ghost" class="text-xl">daisyUI</Button>}
  end={
    <div class="navbar-end">
      <Button>Login</Button>
    </div>
  }
/>;
```

## Navbar with Menu

Navigation bar with collapsible menu for responsive design

```tsx
<Navbar
  start={
    <>
      <div class="dropdown">
        <Button variant="ghost" class="lg:hidden" tabIndex={0} role="button">
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
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </Button>
        <ul
          tabIndex={0}
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
        >
          <li>
            <a>Item 1</a>
          </li>
          <li>
            <a>Parent</a>
            <ul class="p-2">
              <li>
                <a>Submenu 1</a>
              </li>
              <li>
                <a>Submenu 2</a>
              </li>
            </ul>
          </li>
          <li>
            <a>Item 3</a>
          </li>
        </ul>
      </div>
      <Button variant="ghost" class="text-xl">daisyUI</Button>
    </>
  }
  center={
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li>
          <a>Item 1</a>
        </li>
        <li>
          <details>
            <summary>Parent</summary>
            <ul class="p-2">
              <li>
                <a>Submenu 1</a>
              </li>
              <li>
                <a>Submenu 2</a>
              </li>
            </ul>
          </details>
        </li>
        <li>
          <a>Item 3</a>
        </li>
      </ul>
    </div>
  }
  end={<Button>Login</Button>}
/>;
```

## Navbar with Search

Navigation bar featuring search functionality and user actions

```tsx
<Navbar
  start={<Button variant="ghost" class="text-xl">daisyUI</Button>}
  center={
    <div class="form-control">
      <Input type="text" placeholder="Search" bordered class="w-24 md:w-auto" />
    </div>
  }
  end={
    <div class="flex gap-2">
      <div class="dropdown dropdown-end">
        <Button variant="ghost" circle={true} tabIndex={0} role="button">
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
            <Badge size="sm" class="indicator-item">8</Badge>
          </div>
        </Button>
        <div
          tabIndex={0}
          class="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow"
        >
          <div class="card-body">
            <span class="text-lg font-bold">8 Items</span>
            <span class="text-info">Subtotal: $999</span>
            <div class="card-actions">
              <Button color="primary" class="btn-block">View cart</Button>
            </div>
          </div>
        </div>
      </div>
      <div class="dropdown dropdown-end">
        <div tabIndex={0} role="button" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img
              alt="Profile"
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            />
          </div>
        </div>
        <ul
          tabIndex={0}
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
        >
          <li>
            <a class="justify-between">
              Profile <Badge size="sm">New</Badge>
            </a>
          </li>
          <li>
            <a>Settings</a>
          </li>
          <li>
            <a>Logout</a>
          </li>
        </ul>
      </div>
    </div>
  }
/>;
```

## Colored Navbars

Different color themes for various brand styles

```tsx
<Navbar class="bg-primary text-primary-content">
  <Button variant="ghost" class="text-xl">Primary Navbar</Button>
</Navbar>
<Navbar class="bg-secondary text-secondary-content">
  <Button variant="ghost" class="text-xl">Secondary Navbar</Button>
</Navbar>
<Navbar class="bg-accent text-accent-content">
  <Button variant="ghost" class="text-xl">Accent Navbar</Button>
</Navbar>
<Navbar class="bg-neutral text-neutral-content">
  <Button variant="ghost" class="text-xl">Neutral Navbar</Button>
</Navbar>
```

## Responsive Example

Complete responsive navbar with mobile menu and desktop navigation

```tsx
<Navbar class="shadow-lg">
  <div class="navbar-start">
    <div class="dropdown">
      <Button variant="ghost" class="lg:hidden" tabIndex={0} role="button">
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
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </Button>
      <ul
        tabIndex={0}
        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
      >
        <li>
          <a>Home</a>
        </li>
        <li>
          <a>About</a>
        </li>
        <li>
          <a>Services</a>
        </li>
        <li>
          <a>Contact</a>
        </li>
      </ul>
    </div>
    <Button variant="ghost" class="text-xl">My App</Button>
  </div>
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li>
        <a>Home</a>
      </li>
      <li>
        <a>About</a>
      </li>
      <li>
        <a>Services</a>
      </li>
      <li>
        <a>Contact</a>
      </li>
    </ul>
  </div>
  <div class="navbar-end">
    <Button color="primary">Get Started</Button>
  </div>
</Navbar>;
```
