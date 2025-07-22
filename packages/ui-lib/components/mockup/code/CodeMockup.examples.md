---
title: "Code Mockup"
description: "Terminal-style code display component for showcasing commands and code snippets"
category: "Mockup"
apiProps:
  - name: "children"
    type: "ComponentChildren"
    description: "Code lines as pre elements with data-prefix attributes"
    required: true
  - name: "class"
    type: "string"
    description: "Additional CSS classes"
usageNotes:
  - "Use data-prefix attribute on pre elements for line prefixes"
  - "Support for terminal prompts ($, >), status indicators (✓, ❌, →), and line numbers"
  - "Add text-error and text-success classes for colored output"
  - "Perfect for documentation, tutorials, and command examples"
  - "Use backticks and template literals for code formatting"
accessibilityNotes:
  - "Code content should be properly structured for screen readers"
  - "Consider providing descriptions for complex code examples"
  - "Ensure sufficient color contrast for syntax highlighting"
relatedComponents:
  - name: "Browser Mockup"
    path: "/components/mockup/browser-mockup"
  - name: "Window Mockup"
    path: "/components/mockup/window-mockup"
---

## Basic Code Mockup

Simple terminal-style code display

```tsx
<CodeMockup>
  <pre data-prefix="$"><code>npm install daisyui</code></pre>
  <pre data-prefix=">"><code>Installing...</code></pre>
  <pre data-prefix=">"><code>Success! Installed daisyui</code></pre>
</CodeMockup>
```

## Code Mockup with Different Prefixes

Terminal commands with various status prefixes

```tsx
<CodeMockup>
  <pre data-prefix="$"><code>npm create fresh@latest</code></pre>
  <pre data-prefix=">"><code>Creating new Fresh project...</code></pre>
  <pre data-prefix=">"><code>Installing dependencies...</code></pre>
  <pre data-prefix="✓"><code>Project created successfully!</code></pre>
  <pre data-prefix="→"><code>cd my-fresh-app</code></pre>
  <pre data-prefix="$"><code>deno task start</code></pre>
</CodeMockup>
```

## Code Mockup with TypeScript

TypeScript code with line numbers

```tsx
<CodeMockup>
  <pre data-prefix="1"><code>interface User {`{`}</code></pre>
  <pre data-prefix="2"><code>  id: number;</code></pre>
  <pre data-prefix="3"><code>  name: string;</code></pre>
  <pre data-prefix="4"><code>  email: string;</code></pre>
  <pre data-prefix="5"><code>{`}`}</code></pre>
  <pre data-prefix="6"><code></code></pre>
  <pre data-prefix="7"><code>const user: User = {`{`}</code></pre>
  <pre data-prefix="8"><code>  id: 1,</code></pre>
  <pre data-prefix="9"><code>  name: "John Doe",</code></pre>
  <pre data-prefix="10"><code>  email: "john@example.com"</code></pre>
  <pre data-prefix="11"><code>{`}`};</code></pre>
</CodeMockup>
```

## Code Mockup with Git Commands

Git workflow commands and output

```tsx
<CodeMockup>
  <pre data-prefix="$"><code>git init</code></pre>
  <pre data-prefix=">"><code>Initialized empty Git repository</code></pre>
  <pre data-prefix="$"><code>git add .</code></pre>
  <pre data-prefix="$"><code>git commit -m "Initial commit"</code></pre>
  <pre data-prefix=">"><code>[main (root-commit) a1b2c3d] Initial commit</code></pre>
  <pre data-prefix=">"><code>5 files changed, 100 insertions(+)</code></pre>
</CodeMockup>
```

## Code Mockup with Errors

Error handling and success states with colored output

```tsx
<CodeMockup>
  <pre data-prefix="$"><code>deno run app.ts</code></pre>
  <pre data-prefix="❌" class="text-error"><code>error: Uncaught ReferenceError: foo is not defined</code></pre>
  <pre data-prefix="" class="text-error"><code>    at file:///app.ts:5:13</code></pre>
  <pre data-prefix="$"><code>deno run --allow-read app.ts</code></pre>
  <pre data-prefix="✅" class="text-success"><code>App running successfully!</code></pre>
</CodeMockup>
```

## Code Mockup with JSON

JSON configuration file display

```tsx
<CodeMockup>
  <pre data-prefix="1"><code>{`{`}</code></pre>
  <pre data-prefix="2"><code>  "name": "my-app",</code></pre>
  <pre data-prefix="3"><code>  "version": "1.0.0",</code></pre>
  <pre data-prefix="4"><code>  "scripts": {`{`}</code></pre>
  <pre data-prefix="5"><code>    "start": "deno run --allow-all main.ts",</code></pre>
  <pre data-prefix="6"><code>    "dev": "deno run --allow-all --watch main.ts"</code></pre>
  <pre data-prefix="7"><code>  {`}`}</code></pre>
  <pre data-prefix="8"><code>{`}`}</code></pre>
</CodeMockup>
```