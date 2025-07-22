---
title: "Menu"
description: "Navigation menu component with support for nested items and flexible layout options"
category: "Navigation"
apiProps:
  - name: "items"
    type: "Array<{label: string, href?: string, active?: boolean, disabled?: boolean, children?: MenuItem[]}>"
    description: "Array of menu items with optional nested children"
    required: true
  - name: "size"
    type: "'sm' | 'md' | 'lg'"
    default: "'md'"
    description: "Size variant of the menu"
  - name: "horizontal"
    type: "boolean"
    default: "false"
    description: "Whether to display menu horizontally"
  - name: "compact"
    type: "boolean"
    default: "false"
    description: "Whether to use compact spacing"
  - name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Supports unlimited nesting levels for complex navigation"
  - "Items with active: true are highlighted as current selection"
  - "Items with disabled: true are shown but not clickable"
  - "Horizontal mode perfect for top navigation bars"
  - "Compact mode saves space in sidebars and tight layouts"
accessibilityNotes:
  - "Keyboard navigation with arrow keys and Enter"
  - "Screen reader support with proper role attributes"
  - "Focus management for nested menu interactions"
  - "ARIA expanded states for collapsible menu sections"
relatedComponents:
  - name: "Navbar"
    path: "/components/navigation/navbar"
  - name: "Breadcrumbs"
    path: "/components/navigation/breadcrumbs"
  - name: "Sidebar"
    path: "/components/navigation/sidebar"
---

## Basic Menu

Simple vertical menu with active and disabled states

```tsx
<Menu items={[
  { label: "Home", href: "/", active: true },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact", disabled: true }
]} />
```

## Menu Sizes

Different size variants for various contexts

```tsx
<Menu size="sm" items={[
  { label: "Home", href: "/", active: true },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" }
]} />
<Menu size="lg" items={[
  { label: "Home", href: "/", active: true },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" }
]} />
```

## Horizontal Menu

Menu layout for top navigation bars

```tsx
<Menu horizontal items={[
  { label: "File", href: "#" },
  { label: "Edit", href: "#" },
  { label: "View", href: "#", active: true },
  { label: "Help", href: "#" }
]} />
```

## Compact Menu

Space-efficient menu for tight layouts

```tsx
<Menu compact items={[
  { label: "Home", href: "/", active: true },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" }
]} />
```

## Nested Menu

Multi-level navigation with collapsible sections

```tsx
<Menu items={[
  { label: "Dashboard", href: "/dashboard", active: true },
  {
    label: "Products",
    children: [
      { label: "All Products", href: "/products" },
      { label: "New Product", href: "/products/new" },
      { label: "Categories", href: "/products/categories" }
    ]
  },
  {
    label: "Settings",
    children: [
      { label: "Profile", href: "/settings/profile" },
      { label: "Account", href: "/settings/account" },
      {
        label: "Security",
        children: [
          { label: "Password", href: "/settings/security/password" },
          { label: "Two-Factor", href: "/settings/security/2fa" }
        ]
      }
    ]
  },
  { label: "Logout", href: "/logout" }
]} />
```

## Horizontal + Compact

Combined layout options for specialized use cases

```tsx
<Menu horizontal compact items={[
  { label: "File", href: "#" },
  { label: "Edit", href: "#" },
  { label: "View", href: "#", active: true },
  { label: "Help", href: "#" }
]} />
```