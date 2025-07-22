---
title: "Breadcrumbs"
description: "Navigation breadcrumbs to show current page location with customizable separators and styling"
category: "Navigation"
apiProps:
  - name: "items"
    type: "Array<{label: string, href?: string, active?: boolean, disabled?: boolean}>"
    description: "Array of breadcrumb items"
    required: true
  - name: "size"
    type: "'sm' | 'md' | 'lg'"
    default: "'md'"
    description: "Size variant of the breadcrumbs"
  - name: "separator"
    type: "JSX.Element"
    description: "Custom separator element between breadcrumb items"
  - name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Items with active: true are displayed as current page (no link)"
  - "Items with disabled: true are shown but not clickable"
  - "Custom separators can be text, icons, or any JSX element"
  - "Responsive behavior can be controlled with CSS classes"
  - "Perfect for deep navigation hierarchies and user orientation"
accessibilityNotes:
  - "Uses semantic nav element with proper aria-label"
  - "Current page item is marked with aria-current='page'"
  - "Keyboard navigation supported for all interactive items"
  - "Screen readers announce breadcrumb navigation clearly"
relatedComponents:
  - name: "Navbar"
    path: "/components/navigation/navbar"
  - name: "Menu"
    path: "/components/navigation/menu"
  - name: "Pagination"
    path: "/components/navigation/pagination"
---

## Basic Breadcrumbs

Simple breadcrumb navigation with current page indicator

```tsx
<Breadcrumbs items={[
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Breadcrumbs", active: true }
]} />
```

## Breadcrumb Sizes

Different size variants for various contexts

```tsx
<Breadcrumbs size="sm" items={[
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Breadcrumbs", active: true }
]} />
<Breadcrumbs size="md" items={[
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Breadcrumbs", active: true }
]} />
<Breadcrumbs size="lg" items={[
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Breadcrumbs", active: true }
]} />
```

## Custom Separators

Different separator styles for visual variety

```tsx
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Breadcrumbs", active: true }
  ]}
  separator={<span>/</span>}
/>
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Breadcrumbs", active: true }
  ]}
  separator={<span>•</span>}
/>
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Breadcrumbs", active: true }
  ]}
  separator={
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  }
/>
```

## Complex Navigation

Multi-level navigation paths with deep hierarchies

```tsx
<Breadcrumbs items={[
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Website Redesign", href: "/projects/website-redesign" },
  { label: "Design System", href: "/projects/website-redesign/design-system" },
  { label: "Components", active: true }
]} />
```

## With Disabled Items

Breadcrumbs with some items disabled or inaccessible

```tsx
<Breadcrumbs items={[
  { label: "Home", href: "/" },
  { label: "Archive", disabled: true },
  { label: "2023", href: "/archive/2023" },
  { label: "December", active: true }
]} />
```

## E-commerce Example

Real-world usage in product catalog navigation

```tsx
<Breadcrumbs items={[
  { label: "Home", href: "/" },
  { label: "Electronics", href: "/electronics" },
  { label: "Computers", href: "/electronics/computers" },
  { label: "Laptops", href: "/electronics/computers/laptops" },
  { label: "MacBook Pro", active: true }
]} />
```