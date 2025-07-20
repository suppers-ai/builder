# Suppers AI Builder Packages

This directory contains the modular packages that make up the Suppers AI Builder ecosystem.

## Package Structure

### Core Packages

- **`compiler/`** - TypeScript compiler and CLI tools for generating applications
- **`ui-lib/`** - React component library with Supabase integration
- **`supabase/`** - Supabase backend integration with Edge Functions and database schema

### Templates

- **`templates/`** - Application templates for different tech stacks
  - **`fresh-basic/`** - Basic Fresh application template

## Development

Each package can be developed independently using its own `deno.json` configuration:

```bash
# Work on the compiler
cd packages/compiler
deno task dev

# Work on the UI library
cd packages/ui-lib
deno task dev

# Work on a template
cd packages/templates/fresh-basic
deno task start
```

## Migration Status

🚧 **This is a work in progress** - migrating from Node.js/Nx to Deno workspace.

- ✅ Workspace structure created
- ⏳ Compiler migration in progress
- ⏳ UI library migration pending
- ⏳ Template migration pending

See the main `DENO-MIGRATION-PLAN.md` for detailed migration progress.
