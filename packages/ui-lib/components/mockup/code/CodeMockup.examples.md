---
title: "CodeMockup"
description: "Code editor mockup for displaying code snippets with syntax highlighting and line numbers"
category: "Mockup"
apiProps:
  - name: "code"
    type: "string"
    default: "'console.log('Hello World!');'"
    description: "Code content to display"
  - name: "language"
    type: "'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json' | 'bash' | 'sql'"
    default: "'javascript'"
    description: "Programming language for syntax highlighting"
  - name: "showLineNumbers"
    type: "boolean"
    default: "false"
    description: "Whether to show line numbers"
  - name: "variant"
    type: "'default' | 'dark' | 'terminal'"
    default: "'default'"
    description: "Visual theme variant"
  - name: "filename"
    type: "string"
    description: "File name/title to display at the top"
  - name: "onMockupClick"
    type: "() => void"
    description: "Click handler for the mockup"
  - name: "onCopy"
    type: "(code: string) => void"
    description: "Copy to clipboard handler"
usageNotes:
  - "Perfect for documentation and code examples"
  - "Supports multiple programming languages"
  - "Line numbers help with code reference"
  - "Terminal variant great for command line examples"
  - "Filename prop adds context to code snippets"
accessibilityNotes:
  - "Code content is properly structured for screen readers"
  - "High contrast maintained across all variants"
  - "Keyboard navigation supported for interactive elements"
relatedComponents:
  - name: "BrowserMockup"
    path: "/components/mockup/browser"
  - name: "PhoneMockup"
    path: "/components/mockup/phone"
  - name: "WindowMockup"
    path: "/components/mockup/window"
---

## Basic Code Mockup

Simple code snippet with default styling

```tsx
<CodeMockup code="console.log('Hello World!');" />;
```

## Code with Line Numbers

Code display with line numbers for reference

```tsx
<CodeMockup
  code={`function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`}
  showLineNumbers={true}
  language="javascript"
/>;
```

## Code with Filename

Code mockup with file header

```tsx
<CodeMockup
  filename="app.js"
  code={`import { serve } from "https://deno.land/std/http/server.ts";

serve((req) => new Response("Hello World!"), { port: 8000 });`}
  language="javascript"
/>;
```

## Terminal Variant

Terminal-style code display for command line examples

```tsx
<CodeMockup
  variant="terminal"
  code={`npm create fresh-app my-app
cd my-app
deno task start`}
  language="bash"
/>;
```

## Dark Theme Code

Dark theme variant for better readability

```tsx
<CodeMockup
  variant="dark"
  filename="types.ts"
  code={`interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};`}
  language="typescript"
  showLineNumbers={true}
/>;
```

## Python Code Example

Python code with syntax highlighting

```tsx
<CodeMockup
  filename="main.py"
  code={`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`}
  language="python"
  showLineNumbers={true}
/>;
```
