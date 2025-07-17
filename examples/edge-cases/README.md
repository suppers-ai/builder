# Edge Case Examples

This directory contains JSON configuration examples that test edge cases and validation handling in the JSON App Compiler.

## Purpose

The configurations in this directory are intentionally designed to contain errors, edge cases, and unusual patterns to test the compiler's validation and error handling capabilities. These examples should not be used as templates for real applications.

## Contents

- `app-config.json` - Contains various validation edge cases including:
  - Missing required properties
  - Invalid property values
  - Non-existent component types
  - Deeply nested component structures
  - Circular references
  - Empty children arrays
  - Extremely long IDs
  - Duplicate route paths
  - Invalid route paths
  - Non-existent middleware references
  - Invalid HTTP methods
  - Duplicate API endpoints
  - Invalid validation patterns
  - Duplicate middleware order
  - Invalid theme values

## Usage

These examples are primarily intended for testing the compiler's validation and error handling. When running the compiler against these configurations, you should expect detailed error messages that help identify and fix the issues.

```bash
deno run -A packages/compiler/mod.ts compile examples/edge-cases/app-config.json
```

The compiler should report specific validation errors for each issue in the configuration.