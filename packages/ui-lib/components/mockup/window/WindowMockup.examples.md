---
title: "Window Mockup"
description: "Desktop application window mockup component for displaying desktop software interfaces"
category: "Mockup"
apiProps:
  - name: "children"
    type: "ComponentChildren"
    description: "Desktop application content to display inside the window mockup"
    required: true
  - name: "title"
    type: "string"
    description: "Title displayed in the window's title bar"
    required: true
  - name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Perfect for showcasing desktop applications and complex forms"
  - "Use appropriate background colors for different application types"
  - "Great for code editors, IDEs, and business applications"
  - "The title prop sets the window title bar text"
  - "Supports rich content layouts within window frame"
accessibilityNotes:
  - "Ensure window content has proper semantic structure"
  - "Provide meaningful window titles for context"
  - "Consider desktop accessibility patterns and keyboard navigation"
  - "Use appropriate heading hierarchy within window content"
relatedComponents:
  - name: "Browser Mockup"
    path: "/components/mockup/browser-mockup"
  - name: "Phone Mockup"
    path: "/components/mockup/phone-mockup"
---

## Basic Window Mockup

Simple desktop application window

```tsx
<WindowMockup title="My Application">
  <div class="bg-base-200 p-8 text-center">
    <h3 class="text-2xl font-bold mb-4">Desktop Application</h3>
    <p class="mb-4">This is a mockup of a desktop application window</p>
    <div class="flex gap-4 justify-center">
      <button class="btn btn-primary">Primary Action</button>
      <button class="btn btn-outline">Secondary Action</button>
    </div>
  </div>
</WindowMockup>;
```

## Window Mockup with Code Editor

Code editor interface with syntax-highlighted content

```tsx
<WindowMockup title="Code Editor - main.tsx">
  <div class="bg-base-300 p-4 font-mono text-sm">
    <div class="mb-2 text-primary">// React component example</div>
    <div class="mb-2">import React from 'react';</div>
    <div class="mb-2"></div>
    <div class="mb-2">function App() {`{`}</div>
    <div class="mb-2 ml-4">return (</div>
    <div class="mb-2 ml-8">{'<div className="app">'}</div>
    <div class="mb-2 ml-12">{"<h1>Hello World</h1>"}</div>
    <div class="mb-2 ml-8">{"</div>"}</div>
    <div class="mb-2 ml-4">);</div>
    <div class="mb-2">{`}`}</div>
    <div class="mb-2"></div>
    <div class="text-secondary">export default App;</div>
  </div>
</WindowMockup>;
```

## Window Mockup with Form

User registration form in a desktop application window

```tsx
<WindowMockup title="User Registration">
  <div class="bg-base-100 p-6">
    <form class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Full Name</span>
        </label>
        <input
          type="text"
          placeholder="Enter your full name"
          class="input input-bordered"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Email</span>
        </label>
        <input type="email" placeholder="Enter your email" class="input input-bordered" />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Password</span>
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          class="input input-bordered"
        />
      </div>
      <div class="form-control mt-6">
        <button class="btn btn-primary">Register</button>
      </div>
    </form>
  </div>
</WindowMockup>;
```
