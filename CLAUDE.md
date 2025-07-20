# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `deno task dev` - Start development server (runs compiler dev task)
- `deno task build` - Build the project
- `deno task test` - Run all tests
- `deno task test:watch` - Run tests in watch mode
- `deno task test:coverage` - Run tests with coverage report

### Code Quality
- `deno task lint` - Lint code
- `deno task fmt` - Format code
- `deno task fmt:check` - Check formatting
- `deno task check` - Type check all TypeScript files
- `deno task check:all` - Run check, lint, and format check

### Application Generation
- `deno task generate` - Generate application from JSON spec
- `deno task generate:basic` - Generate basic Fresh app

### Package-Specific Development
- `deno task dev:ui` - Start UI library development server
- `deno task dev:basic` - Start basic template development

### Database Management
- `deno task api:deploy` - Deploy to Supabase
- `deno task api:types` - Generate TypeScript types from database
- `deno task api:reset` - Reset local database

## Architecture Overview

This is a **Suppers AI Builder** - a modular application builder platform built with Deno, Fresh, and Supabase. The architecture consists of four main packages:

### Package Structure

**`packages/compiler/`** - Site generation engine
- Generates Fresh applications from JSON specifications
- Template-based project scaffolding
- Entry point: `mod.ts`, CLI: `cli.ts`

**`packages/ui-lib/`** - React/Preact component library
- 90+ UI components organized by category
- Complete theme system with 29 DaisyUI themes
- Supabase authentication integration
- Entry point: `mod.ts`

**`packages/templates/`** - Application templates
- `fresh-basic/` - Basic Fresh application template

**`packages/api/`** - Backend-as-a-Service integration
- Complete database schema with Row Level Security
- Edge Functions for API endpoints
- OAuth server implementation
- Multi-provider authentication support

### Key Technology Stack
- **Runtime**: Deno with TypeScript
- **Web Framework**: Fresh (Deno's web framework)
- **Frontend**: Preact/React with TypeScript
- **Styling**: TailwindCSS + DaisyUI
- **Icons**: Lucide Preact (professional icon library)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth providers

### Development Workflow
1. The **compiler** generates applications from JSON specifications
2. Generated apps use components from **ui-lib**
3. **Templates** provide the foundation structure
4. **API** package handles authentication and database operations

## Important File Locations

- **Root config**: `deno.json` - Main workspace configuration
- **Site configs**: `sites/*.json` - Generated site configurations
- **Generated apps**: `apps/generated/` - Output directory for generated applications
- **Component library**: `packages/ui-lib/src/components/` - UI components
- **Database schema**: `packages/api/database-schema.sql`
- **API functions**: `packages/api/functions/`

## Testing

The project includes comprehensive testing:
- Unit tests for components and utilities
- Integration tests for API endpoints
- Security tests for authentication and authorization
- See `TESTING_GUIDE.md` for detailed testing procedures

## Development Notes

- This is a **monorepo** with workspace configuration in `deno.json`
- All packages are TypeScript-first with strict type checking
- Components follow Fresh/Preact patterns with islands architecture
- Database operations use Row Level Security policies
- Authentication supports multiple OAuth providers
- The compiler generates type-safe applications with full TypeScript support

## Security Considerations

- All database operations use Row Level Security (RLS)
- Authentication is handled by Supabase Auth
- API endpoints are protected with proper authorization
- Input validation and sanitization throughout
- See `SECURITY_AUDIT.md` for security verification procedures