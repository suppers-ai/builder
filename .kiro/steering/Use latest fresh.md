---
inclusion: fileMatch
fileMatchPattern: ['**/routes/**', '**/islands/**', '**/main.ts', '**/dev.ts', '**/mod.ts']
---

# Fresh Framework Guidelines

## Framework Version
- **Required**: Fresh 2.0 (canary/alpha) - reference https://fresh.deno.dev/docs/canary/introduction
- Always use latest Fresh patterns from canary documentation
- Never use deprecated Fresh 1.x patterns

## Architecture Patterns
- **Reference Implementation**: Use `packages/docs` as the canonical Fresh app structure
- **File-based Routing**: Routes in `routes/` directory with automatic URL mapping
- **Islands Architecture**: Client components in `islands/` for interactivity only
- **Static Assets**: Place in `static/` directory for automatic CDN serving
- **Build Artifacts**: Never modify `_fresh/` generated files

## Entry Points
- `main.ts`: Production server entry (required)
- `dev.ts`: Development server with hot reload (required)
- `mod.ts`: Package exports (if creating reusable Fresh modules)

## Code Conventions
- **Server-First**: Prefer server-side rendering over client-side JavaScript
- **Islands Sparingly**: Only use islands for components requiring client state/interactivity
- **Data Fetching**: Use Fresh handlers and page props, not client-side fetching
- **Route Handlers**: Export `GET`, `POST`, etc. functions from route files
- **Page Components**: Export default function from route files for rendering

## Performance Rules
- Leverage Fresh's automatic code splitting
- Use Fresh's built-in optimization features
- Minimize bundle size by keeping islands lightweight
- Prefer static generation where possible

## Development Workflow
- Always use `deno task dev` for development server
- Reference Fresh canary docs for breaking changes
- Test both server and client rendering paths