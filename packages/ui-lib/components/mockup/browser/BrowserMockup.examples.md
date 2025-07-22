---
title: "Browser Mockup"
description: "Desktop browser mockup component for displaying web content and interfaces"
category: "Mockup"
apiProps:
  - name: "children"
    type: "ComponentChildren"
    description: "Content to display inside the browser mockup"
    required: true
  - name: "url"
    type: "string"
    description: "URL to display in the browser's address bar"
    required: true
  - name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Perfect for showcasing web applications and landing pages"
  - "Use realistic content to demonstrate browser interfaces"
  - "Great for marketing materials and documentation"
  - "Supports any web content layout inside the browser frame"
accessibilityNotes:
  - "Ensure content inside mockup has proper semantic structure"
  - "Provide meaningful alt text for any images within mockup"
  - "Consider color contrast for content visibility"
relatedComponents:
  - name: "Window Mockup"
    path: "/components/mockup/window-mockup"
  - name: "Phone Mockup"
    path: "/components/mockup/phone-mockup"
---

## Basic Browser Mockup

Simple browser mockup with basic content

```tsx
<BrowserMockup url="https://daisyui.com">
  <div class="bg-base-200 p-8 text-center">
    <h3 class="text-2xl font-bold mb-4">Welcome to DaisyUI</h3>
    <p class="mb-4">
      The most popular, free and open-source Tailwind CSS component library
    </p>
    <button class="btn btn-primary">Get Started</button>
  </div>
</BrowserMockup>
```

## Browser Mockup with Website Content

Browser mockup displaying website landing page content

```tsx
<BrowserMockup url="https://example.com">
  <div class="bg-gradient-to-r from-primary to-secondary p-8 text-white">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-4">Modern Web Design</h1>
      <p class="text-lg mb-6">
        Create beautiful, responsive websites with the latest technologies
      </p>
      <div class="flex gap-4">
        <button class="btn btn-primary">Learn More</button>
        <button class="btn btn-outline btn-primary">Get Started</button>
      </div>
    </div>
  </div>
</BrowserMockup>
```

## Browser Mockup with Dashboard

Browser mockup showing a dashboard interface

```tsx
<BrowserMockup url="https://dashboard.example.com">
  <div class="bg-base-100 p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Dashboard</h2>
      <button class="btn btn-primary">New Project</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title">Total Users</h3>
          <p class="text-2xl font-bold">1,234</p>
        </div>
      </div>
      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title">Revenue</h3>
          <p class="text-2xl font-bold">$12,345</p>
        </div>
      </div>
      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title">Orders</h3>
          <p class="text-2xl font-bold">567</p>
        </div>
      </div>
    </div>
  </div>
</BrowserMockup>
```