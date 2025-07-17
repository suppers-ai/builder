# Advanced Edge Cases Example

This file contains advanced edge cases for thorough validation testing of the JSON App Compiler.

## Purpose

This configuration is intentionally designed with complex edge cases to test the compiler's validation capabilities in depth. It includes various types of validation issues, boundary conditions, and unusual patterns that might occur in real-world configurations.

## Edge Cases Tested

### Metadata
- Extra fields not in the schema
- Version with pre-release tag

### Components
- Extremely deep nesting (7+ levels)
- Mixed type children (strings, numbers, booleans, null, objects)
- Invalid prop types (numbers for strings, strings for booleans, etc.)
- Duplicate component IDs
- Empty component IDs
- Component IDs with special characters
- Missing children property
- Null or undefined children

### Routes
- Paths with special characters and parameters
- Extremely deep nested route paths
- References to non-existent components
- References to non-existent layouts
- Empty paths
- Invalid middleware references (non-existent, non-string values)
- Invalid meta fields (wrong types, nested objects)

### API
- Invalid HTTP methods
- Empty methods array
- Missing methods property
- Invalid handler (non-string value)
- Empty handler
- Missing handler property
- Complex nested validation schemas
- Circular references in middleware dependencies
- Invalid middleware configuration
- Non-string middleware names
- Empty middleware names
- Invalid auth configuration (wrong types)
- Invalid CORS configuration (wrong types)

### Theme
- Empty color values
- Null color values
- Invalid font family (number instead of string)
- Invalid spacing values (negative, non-numeric, null, boolean, object)
- Invalid breakpoint values (negative, non-numeric, null, boolean, object)
- Invalid custom properties (nested objects, missing dashes)

### Build
- Invalid target (number instead of string)
- Invalid boolean flags (strings instead of booleans)
- Invalid directory paths (numbers instead of strings)

## Expected Behavior

When the compiler processes this configuration, it should:

1. Identify and report all validation errors with clear messages
2. Provide line numbers and paths to the problematic fields
3. Suggest corrections where possible
4. Fail gracefully without crashing
5. Prioritize critical errors over minor issues

## Usage

This example is intended for testing the compiler's validation capabilities:

```bash
deno run -A packages/compiler/mod.ts compile examples/edge-cases/advanced-edge-cases.json
```

The compiler should report detailed validation errors for the issues in this configuration.