# JSON App Compiler - Templates Package

The templates package provides base application templates and template processing utilities for the JSON App Compiler system. It includes Fresh 2.0 compatible templates with placeholder replacement, conditional file inclusion, and modern development practices.

## 📦 Installation

This package is part of the JSON App Compiler monorepo and is used internally by the compiler to generate application scaffolding.

```typescript
import { 
  TemplateEngine, 
  type TemplateContext,
  processTemplate 
} from "@json-app-compiler/templates";
```

## 🏗 Architecture

### Template Structure

```
packages/templates/
├── base/                    # Base Fresh 2.0 application template
│   ├── routes/             # Route templates with placeholders
│   │   ├── _layout.tsx     # Global layout template
│   │   ├── _404.tsx        # 404 error page template
│   │   ├── _500.tsx        # 500 error page template
│   │   ├── index.tsx       # Home page template
│   │   └── about.tsx       # About page template
│   ├── islands/            # Island component templates
│   │   ├── Counter.tsx     # Interactive counter component
│   │   └── ErrorBoundary.tsx # Error boundary component
│   ├── static/             # Static asset templates
│   │   ├── styles.css      # Global styles with CSS variables
│   │   └── favicon.ico     # Application favicon
│   ├── deno.json.template  # Deno configuration template
│   ├── main.ts.template    # Application entry point template
│   ├── dev.ts.template     # Development server template
│   ├── tailwind.config.ts.template # Tailwind configuration template
│   └── README.md.template  # Generated app documentation template
├── src/                    # Template processing utilities
│   ├── template-engine.ts  # Core template processing engine
│   └── integration.test.ts # Template integration tests
└── mod.ts                  # Package exports
```

## 🚀 Template Engine

### TemplateEngine Class

```typescript
class TemplateEngine {
  constructor(templateDir: string);
  
  // Process a single template file
  processTemplate(templatePath: string, context: TemplateContext): Promise<string>;
  
  // Process all templates in a directory
  processDirectory(outputDir: string, context: TemplateContext): Promise<ProcessingResult>;
  
  // Create template context from app configuration
  createContext(config: AppConfig): TemplateContext;
  
  // Copy and process template files
  copyTemplates(outputDir: string, context: TemplateContext): Promise<void>;
}
```

### Template Context

```typescript
interface TemplateContext {
  app: {
    name: string;
    version: string;
    description: string;
    author?: string;
    license?: string;
  };
  components: ComponentDefinition[];
  routes: RouteDefinition[];
  api: ApiDefinition;
  theme?: ThemeConfig;
  build?: BuildConfig;
  timestamp: string;
  generator: {
    name: string;
    version: string;
  };
}
```

## 📝 Template Syntax

### Placeholder Replacement

Templates use double curly braces for variable substitution:

```typescript
// Template content
const template = `
# {{app.name}}

{{app.description}}

Version: {{app.version}}
Generated: {{timestamp}}
`;

// Context
const context = {
  app: {
    name: "My App",
    description: "A great application",
    version: "1.0.0"
  },
  timestamp: "2024-01-01T00:00:00Z"
};

// Result
const result = `
# My App

A great application

Version: 1.0.0
Generated: 2024-01-01T00:00:00Z
`;
```

### Conditional Blocks

Templates support conditional inclusion based on configuration:

```typescript
// Template with conditional content
const template = `
{{#if api.endpoints}}
## API Endpoints

This application includes the following API endpoints:
{{#each api.endpoints}}
- {{method}} {{path}}
{{/each}}
{{/if}}

{{#unless theme}}
This application uses default theming.
{{/unless}}
`;
```

### Loops and Iteration

Templates can iterate over arrays:

```typescript
// Template with loops
const template = `
## Routes

{{#each routes}}
- **{{path}}** - {{meta.title}}
{{/each}}

## Components

{{#each components}}
### {{type}} ({{id}})
{{#if props}}
Props: {{#each props}}{{@key}}: {{this}}{{/each}}
{{/if}}
{{/each}}
`;
```

## 🎨 Base Template Features

### Fresh 2.0 Alpha Integration

The base template is built for Fresh 2.0 Alpha with:

- **Enhanced Island Architecture** - Optimized client-side interactivity
- **Improved Routing** - File-based routing with enhanced features
- **Better Performance** - Faster SSR and hydration
- **Modern Development** - Hot reloading and development tools

### Template Files

#### deno.json.template

```json
{
  "name": "{{app.name}}",
  "version": "{{app.version}}",
  "description": "{{app.description}}",
  "imports": {
    "$fresh/": "https://deno.land/x/fresh@2.0.0-alpha.19/",
    "preact": "https://esm.sh/preact@10.19.6",
    "preact/": "https://esm.sh/preact@10.19.6/",
    "@preact/signals": "https://esm.sh/*@preact/signals@1.2.2",
    "tailwindcss": "npm:tailwindcss@3.4.1",
    "tailwindcss/": "npm:/tailwindcss@3.4.1/"
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  },
  "tasks": {
    "dev": "deno run -A --watch=static/,routes/ dev.ts",
    "build": "deno run -A dev.ts build",
    "preview": "deno run -A main.ts",
    "update": "deno run -A -r https://fresh.deno.dev/update ."
  }
}
```

#### main.ts.template

```typescript
#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "$std/dotenv/load.ts";

await dev(import.meta.url, "./main.ts", config);
```

#### routes/_layout.tsx.template

```tsx
import { PageProps } from "$fresh/server.ts";

export default function Layout({ Component, state }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{app.name}}</title>
        <meta name="description" content="{{app.description}}" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="bg-gray-50 text-gray-900">
        <header class="bg-white shadow-sm border-b">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <h1 class="text-2xl font-bold text-gray-900">
                <a href="/" class="hover:text-blue-600">{{app.name}}</a>
              </h1>
              <nav class="flex space-x-4">
                <a href="/" class="text-gray-600 hover:text-gray-900">Home</a>
                <a href="/about" class="text-gray-600 hover:text-gray-900">About</a>
              </nav>
            </div>
          </div>
        </header>
        
        <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Component />
        </main>
        
        <footer class="bg-gray-100 border-t mt-16">
          <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <p class="text-center text-gray-600">
              © 2024 {{app.name}}. Generated by JSON App Compiler.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
```

#### islands/Counter.tsx.template

```tsx
import { signal } from "@preact/signals";

interface CounterProps {
  start?: number;
  step?: number;
  min?: number;
  max?: number;
}

export default function Counter(props: CounterProps) {
  const { start = 0, step = 1, min = -Infinity, max = Infinity } = props;
  const count = signal(start);

  const increment = () => {
    if (count.value + step <= max) {
      count.value += step;
    }
  };

  const decrement = () => {
    if (count.value - step >= min) {
      count.value -= step;
    }
  };

  const reset = () => {
    count.value = start;
  };

  return (
    <div class="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
      <button
        onClick={decrement}
        disabled={count.value - step < min}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        -
      </button>
      
      <span class="text-2xl font-bold min-w-[3rem] text-center">
        {count.value}
      </span>
      
      <button
        onClick={increment}
        disabled={count.value + step > max}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        +
      </button>
      
      <button
        onClick={reset}
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Reset
      </button>
    </div>
  );
}
```

### Styling System

#### static/styles.css.template

```css
/* CSS Custom Properties for theming */
:root {
  --color-primary: {{theme.primaryColor || '#3b82f6'}};
  --color-secondary: {{theme.secondaryColor || '#64748b'}};
  --font-family: {{theme.fontFamily || 'system-ui, sans-serif'}};
  
  {{#if theme.customProperties}}
  {{#each theme.customProperties}}
  {{@key}}: {{this}};
  {{/each}}
  {{/if}}
}

/* Utility classes */
.btn {
  @apply px-4 py-2 rounded font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.btn-secondary {
  @apply bg-gray-500 text-white hover:bg-gray-600;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50;
}

.card {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-body {
  @apply px-6 py-4;
}

.card-footer {
  @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
}

/* Form elements */
.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-error {
  @apply text-sm text-red-600 mt-1;
}

.form-help {
  @apply text-sm text-gray-500 mt-1;
}

/* Alert components */
.alert {
  @apply p-4 rounded-md;
}

.alert-info {
  @apply bg-blue-50 text-blue-800 border border-blue-200;
}

.alert-success {
  @apply bg-green-50 text-green-800 border border-green-200;
}

.alert-warning {
  @apply bg-yellow-50 text-yellow-800 border border-yellow-200;
}

.alert-error {
  @apply bg-red-50 text-red-800 border border-red-200;
}

/* Responsive utilities */
@media (max-width: 640px) {
  .container {
    @apply px-4;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .container {
    @apply px-6;
  }
}

@media (min-width: 1025px) {
  .container {
    @apply px-8;
  }
}
```

## 🔧 Template Processing

### Processing Pipeline

1. **Template Discovery** - Find all template files in the template directory
2. **Context Creation** - Build template context from app configuration
3. **Placeholder Replacement** - Replace variables with context values
4. **Conditional Processing** - Handle conditional blocks and loops
5. **File Generation** - Write processed templates to output directory
6. **Asset Copying** - Copy static assets and binary files

### Custom Template Processing

```typescript
import { TemplateEngine } from "@json-app-compiler/templates";

const engine = new TemplateEngine("./custom-templates");

// Create custom context
const context = {
  app: {
    name: "My Custom App",
    version: "1.0.0",
    description: "A custom application"
  },
  customData: {
    features: ["auth", "api", "ui"],
    environment: "production"
  }
};

// Process templates
const result = await engine.processDirectory("./output", context);
if (result.success) {
  console.log(`Generated ${result.filesProcessed} files`);
} else {
  console.error("Template processing failed:", result.errors);
}
```

## 🎯 Template Best Practices

### Template Organization

1. **Logical Structure** - Organize templates to match output structure
2. **Reusable Partials** - Create reusable template fragments
3. **Clear Naming** - Use descriptive names for template files
4. **Documentation** - Document template variables and usage

### Variable Naming

1. **Consistent Naming** - Use consistent variable naming conventions
2. **Nested Objects** - Organize related variables in objects
3. **Default Values** - Provide sensible defaults for optional variables
4. **Type Safety** - Use TypeScript interfaces for context types

### Performance

1. **Minimal Processing** - Keep template logic simple
2. **Caching** - Cache processed templates when possible
3. **Lazy Loading** - Process templates only when needed
4. **Efficient Loops** - Optimize loops and iterations

## 🧪 Testing

### Template Testing

```typescript
import { TemplateEngine } from "@json-app-compiler/templates";

test("Template processes placeholders correctly", async () => {
  const engine = new TemplateEngine("./test-templates");
  
  const context = {
    app: { name: "Test App", version: "1.0.0" }
  };
  
  const result = await engine.processTemplate("test.template", context);
  expect(result).toContain("Test App");
  expect(result).toContain("1.0.0");
});

test("Template handles conditional blocks", async () => {
  const engine = new TemplateEngine("./test-templates");
  
  const contextWithApi = {
    app: { name: "Test" },
    api: { endpoints: [{ path: "/test" }] }
  };
  
  const contextWithoutApi = {
    app: { name: "Test" }
  };
  
  const resultWith = await engine.processTemplate("conditional.template", contextWithApi);
  const resultWithout = await engine.processTemplate("conditional.template", contextWithoutApi);
  
  expect(resultWith).toContain("API Endpoints");
  expect(resultWithout).not.toContain("API Endpoints");
});
```

### Running Tests

```bash
# Run template tests
deno test packages/templates/ --allow-all

# Run integration tests
deno test packages/templates/src/integration.test.ts --allow-all
```

## 🔌 Extensibility

### Custom Templates

Create custom templates by following the base template structure:

```
custom-template/
├── routes/
│   ├── _layout.tsx.template
│   └── index.tsx.template
├── islands/
│   └── CustomComponent.tsx.template
├── static/
│   └── custom-styles.css.template
├── deno.json.template
└── README.md.template
```

### Template Helpers

Add custom template helpers for complex processing:

```typescript
interface TemplateHelpers {
  formatDate(date: string): string;
  capitalize(str: string): string;
  pluralize(word: string, count: number): string;
  generateId(): string;
}

const helpers: TemplateHelpers = {
  formatDate: (date) => new Date(date).toLocaleDateString(),
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
  pluralize: (word, count) => count === 1 ? word : `${word}s`,
  generateId: () => Math.random().toString(36).substr(2, 9)
};

// Use in templates
const template = `
Generated on: {{formatDate timestamp}}
{{capitalize app.name}} has {{pluralize "component" components.length}}
`;
```

## 📄 License

Part of the JSON App Compiler project. See the main project LICENSE for details.