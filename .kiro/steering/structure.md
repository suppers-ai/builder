# Project Structure

## Root Directory
```
├── packages/           # Deno workspace packages
├── sites/             # Site configuration files (.json)
├── .env               # Environment variables
├── deno.json          # Workspace configuration
├── Dockerfile         # Multi-app container build
└── DEPLOYMENT.md      # Cloud Run deployment guide
```

## Package Organization

### Core Packages
- **shared/**: Common utilities, types, schemas, constants
  - `types/` - TypeScript interfaces and types
  - `utils/` - Utility functions (auth, api, files, etc.)
  - `schemas/` - Zod validation schemas
  - `constants/` - Application constants
  - `generated/` - Auto-generated types (database)

- **ui-lib/**: Component library with DaisyUI integration
  - `components/` - Organized by category (action, display, input, etc.)
  - `providers/` - React context providers
  - `utils/` - Component utilities and signals

### Applications
- **store/**: E-commerce application
- **profile/**: User authentication and profile management
- **docs/**: Documentation and component showcase
- **cdn/**: Static asset delivery service
- **api/**: Backend API with Supabase functions

### Supporting Packages
- **auth-client/**: Reusable authentication client
- **compiler/**: Code generation and build tools
- **templates/**: Project templates

## Application Structure (Fresh Apps)
Each Fresh application follows this pattern:
```
packages/[app]/
├── main.ts            # Application entry point
├── dev.ts             # Development server
├── routes/            # File-based routing
├── islands/           # Client-side interactive components
├── static/            # Static assets
├── lib/               # Application-specific utilities
└── _fresh/            # Generated Fresh files (build output)
```

## Component Structure (UI Library)
```
components/[category]/[component]/
├── Component.tsx      # Main component implementation
├── Component.schema.ts # Zod schema and TypeScript types
├── Component.test.ts  # Unit tests
├── Component.playwright.ts # Visual/E2E tests
├── Component.metadata.tsx # Component documentation
├── index.ts           # Export file
└── README.md          # Component documentation
```

## File Naming Conventions
- **Components**: PascalCase (e.g., `Button.tsx`, `LoginForm.tsx`)
- **Utilities**: kebab-case (e.g., `auth-helpers.ts`, `api-client.ts`)
- **Routes**: kebab-case following Fresh conventions
- **Types**: kebab-case with `.ts` extension
- **Tests**: Same as source file with `.test.ts` suffix

## Import Patterns
- Use workspace imports: `@suppers/shared`, `@suppers/ui-lib`
- Relative imports for local files
- JSR imports for Deno standard library: `@std/path`, `@std/fs`
- NPM imports for Node packages: `npm:package-name`

## Configuration Files
- **deno.json**: Workspace and package configuration
- **config.toml**: Application-specific configuration (API package)
- **.env**: Environment variables (not committed)
- **playwright.config.js**: Visual testing configuration