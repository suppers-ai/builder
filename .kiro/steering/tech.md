# Technology Stack

## Core Technologies
- **Runtime**: Deno 2.4.2+
- **Framework**: Fresh 2.0 (alpha) - Full-stack web framework
- **Frontend**: Preact with JSX
- **Styling**: Tailwind CSS 4.x + DaisyUI 5.x
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth/SSO
- **Validation**: Zod schemas
- **Testing**: Deno test + Playwright
- **Deployment**: Docker + Google Cloud Run

## Package Architecture
- **Workspace**: Deno workspace with 9 packages
- **Shared**: Common types, utilities, schemas, constants
- **UI Library**: Component library with comprehensive testing
- **Applications**: Store, Profile, Docs, CDN, API
- **Auth Client**: Reusable authentication client

## Development Commands

### Root Level
```bash
# Install and cache dependencies
deno task cache

# Testing
deno task test                 # Run all tests
deno task test:watch          # Watch mode
deno task test:coverage       # With coverage

# Code quality
deno task lint                # Lint code
deno task fmt                 # Format code
deno task fmt:check          # Check formatting
```

### UI Library Specific
```bash
# Component testing
deno task test:unit           # Unit tests
deno task test:component      # Component tests
deno task test:coverage       # Coverage report

# Visual/E2E testing (requires manual setup)
deno task playwright:install  # Install Playwright
npx playwright test          # Run visual tests
npx playwright test --ui     # Interactive mode
```

### Application Development
```bash
# Run individual apps
cd packages/store && deno task dev
cd packages/profile && deno task dev
cd packages/docs && deno task dev
```

## Code Standards
- **Formatting**: 2-space indent, 100 char line width, semicolons required
- **TypeScript**: Strict mode enabled, DOM + Deno libs
- **JSX**: React JSX with Preact import source
- **File naming**: kebab-case for files, PascalCase for components
- **Testing**: Co-located test files with `.test.ts` suffix