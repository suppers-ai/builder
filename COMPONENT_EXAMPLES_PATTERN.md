# Component Examples Pattern

This document describes the markdown-based examples pattern implemented for UI component documentation.

## Overview

The Component Examples Pattern allows UI components to define their documentation examples in markdown files alongside their implementation. This creates a single source of truth for component examples and reduces duplication between metadata and route files.

## Architecture

### File Structure

```
packages/ui-lib/components/{category}/{component}/
├── Component.tsx           # Component implementation
├── Component.metadata.tsx  # Component metadata
├── Component.examples.md   # NEW: Component examples (markdown)
├── Component.test.ts      # Component tests
└── index.ts               # Component exports
```

### Key Components

1. **Markdown Parser Utility** (`packages/shared/utils/markdown.ts`)
   - Parses YAML frontmatter and markdown content
   - Converts markdown to structured example data
   - Handles API props, usage notes, and example sections

2. **Examples Loader Utility** (`packages/shared/utils/examples.ts`)
   - Loads and caches component examples
   - Provides helper functions for component routes
   - Manages file path resolution

3. **Component Route Integration** (e.g., `packages/ui-lib-website/routes/components/action/button.tsx`)
   - Loads examples from markdown files
   - Creates preview components for each example
   - Maintains backward compatibility with existing API

## Markdown File Format

### Structure

```markdown
---
# YAML Frontmatter with component metadata
title: "Component Name"
description: "Component description"
category: "Component Category"
apiProps:
  - name: "propName"
    type: "PropType"
    description: "Prop description"
    required: true
    default: "defaultValue"
usageNotes:
  - "Usage note 1"
  - "Usage note 2"
---

## Example Section Title

Example description here

```tsx
<Component prop="value">
  Content
</Component>
\```

## Another Example Section

Another description

```tsx
<Component variant="different">
  More content
</Component>
\```
```

### Frontmatter Schema

- **title**: Component display name
- **description**: Brief component description
- **category**: Component category (Actions, Display, etc.)
- **apiProps**: Array of component properties with type information
- **usageNotes**: Array of usage guidelines and best practices

### Example Sections

Each example section follows this pattern:
1. **Heading**: `## Section Title`
2. **Description**: Plain text description
3. **Code Block**: TypeScript/TSX code example wrapped in ```tsx

## Implementation Guide

### Step 1: Create Component Examples File

Create `{ComponentName}.examples.md` in your component directory:

```markdown
---
title: "Button"
description: "Interactive buttons with multiple variants"
category: "Actions"
apiProps:
  - name: "children"
    type: "ComponentChildren"
    required: true
    description: "Button content"
  - name: "variant"
    type: "'solid' | 'outline' | 'ghost'"
    default: "'solid'"
    description: "Button style variant"
usageNotes:
  - "Use primary buttons sparingly"
  - "Outline buttons work well for secondary actions"
---

## Basic Usage

Simple button with default styling

```tsx
<Button>Click Me</Button>
\```

## Variants

Different button styles

```tsx
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
\```
```

### Step 2: Update Component Route

Modify your component route to use the markdown examples:

```tsx
import { loadComponentPageDataCached } from "@suppers/shared";
import { join } from "jsr:@std/path@^1.0.8";

export default async function ComponentRoute(props: PageProps) {
  // Load examples from markdown
  const componentPath = join(Deno.cwd(), "packages/ui-lib/components/{category}/{component}/{Component}.tsx");
  const pageData = await loadComponentPageDataCached(componentPath);

  // Create preview components for each example
  const examples = pageData.examples.map(example => {
    let preview;
    
    switch (example.title) {
      case "Basic Usage":
        preview = <Component>Click Me</Component>;
        break;
      // Add cases for each example section
    }

    return { ...example, preview };
  });

  return (
    <ComponentPageTemplate
      title={pageData.title}
      description={pageData.description}
      category={pageData.category}
      examples={examples}
      apiProps={pageData.apiProps}
      usageNotes={pageData.usageNotes}
    />
  );
}
```

## Benefits

### Single Source of Truth
- Component examples are defined once in markdown
- No duplication between metadata and route files
- Easy to maintain and update

### Developer Experience
- Markdown is easy to write and read
- Clear separation of content and presentation
- Version control friendly format

### Consistency
- Standardized format across all components
- Automated validation of required fields
- Consistent API documentation structure

### Performance
- Built-in caching system
- Efficient file loading
- No runtime overhead for static content

## Usage Notes

1. **Preview Components**: Each example section requires a corresponding preview component in the route file
2. **Caching**: Examples are cached automatically to improve performance
3. **File Naming**: Use `{ComponentName}.examples.md` convention
4. **YAML Frontmatter**: Must be valid YAML syntax
5. **Code Blocks**: Use `tsx` language identifier for TypeScript/JSX examples

## Troubleshooting

### Common Issues

**Frontmatter Parsing Errors**
- Ensure YAML syntax is correct
- Check indentation and string quoting
- Validate required fields are present

**Missing Preview Components**
- Add switch cases for all example titles
- Ensure exact title matching
- Provide fallback preview for unknown sections

**File Not Found Errors**
- Verify file path and naming convention
- Check component directory structure
- Ensure markdown file exists

## Future Enhancements

- [ ] Automatic preview generation from code examples
- [ ] Schema validation for frontmatter
- [ ] IDE support for markdown files
- [ ] Hot reloading for development

## Related Files

- `packages/shared/utils/markdown.ts` - Markdown parsing utilities
- `packages/shared/utils/examples.ts` - Examples loading utilities  
- `packages/ui-lib/components/action/button/Button.examples.md` - Example implementation
- `packages/ui-lib-website/routes/components/action/button.tsx` - Route integration example