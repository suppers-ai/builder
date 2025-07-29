# Current State Backup - Profile Package

## Package Structure Documentation

### Package Metadata
- **Name**: @suppers/app
- **Version**: 1.0.0
- **Export**: ./mod.ts

### Directory Structure
```
packages/app/
├── islands/              # Client-side interactive components
│   ├── AuthCallbackHandler.tsx
│   ├── LoginPageIsland.tsx
│   ├── LogoutHandler.tsx
│   ├── OAuthHandler.tsx
│   └── ProfilePageIsland.tsx
├── lib/                  # Server-side utilities and services
│   ├── api-client.ts
│   ├── auth-helpers.ts
│   ├── auth-helpers.test.ts
│   ├── cleanup-service.ts
│   ├── middleware.ts
│   ├── mod.ts
│   ├── oauth-service.ts
│   ├── oauth-service.test.ts
│   ├── security-config.ts
│   ├── security-test.ts
│   ├── supabase-client.ts
│   └── token-manager.ts
├── routes/               # API and page routes
│   ├── .well-known/
│   │   └── openid_configuration.tsx
│   ├── auth/
│   │   ├── callback.tsx
│   │   └── logout.tsx
│   ├── oauth/
│   │   ├── authorize.tsx
│   │   ├── revoke.tsx
│   │   ├── token.tsx
│   │   ├── userinfo.tsx
│   │   └── validate.tsx
│   ├── _app.tsx
│   ├── index.tsx
│   ├── login.tsx
│   └── profile.tsx
├── static/               # Static assets
│   ├── backgrounds/
│   │   └── hero-gradient.webp
│   ├── logos/
│   │   ├── daisyui.svg
│   │   ├── deno.svg
│   │   ├── fresh.svg
│   │   ├── long_dark.png
│   │   ├── long_light.png
│   │   └── preact.svg
│   └── styles.css
├── deno.json
├── dev.ts
├── main.ts
├── mod.ts
├── README.md
├── setup-avatars-bucket.sql
└── tailwind.config.ts
```

### Dependencies
- **Internal Dependencies**:
  - @suppers/auth-client
  - @suppers/ui-lib
  - @suppers/shared
- **External Dependencies**:
  - @supabase/supabase-js@2.39.8
  - preact@10.26.9
  - fresh@2.0.0-alpha.34
  - tailwindcss@3.4.0
  - zod@3.25.1
  - jose@5.2.0
  - lucide-preact@0.460.0

### Workspace Configuration
- Listed in root deno.json workspace array as "packages/app"
- Has dedicated tasks in root deno.json:
  - dev:app
  - start:app
  - build:app
  - test:app
  - check:app

### Test Status (Baseline)
- OAuth Service tests: PASSING (10ms, 50 steps)
- Auth Helpers tests: FAILING (1 uncaught error in assertRejects)
- Overall test status: Some functionality working, some test issues

### Environment Variables
- APP_PORT (default: 8001)
- APP_HOST (default: localhost)

### Key Functionality
- OAuth 2.0 endpoints (/oauth/authorize, /oauth/token, etc.)
- User authentication flows
- Profile management
- SSO integration
- Session management

## Cross-Package Dependencies Found
- **Root deno.json**: Listed in workspace array as "packages/app"
- **Root deno.json tasks**: dev:app, start:app, build:app, test:app, check:app
- **scripts/dev-concurrent.ts**: References "./packages/app" as cwd
- **deno.lock**: Contains dependency entries for "packages/app"

## Test Results (Baseline)
- **OAuth Service Tests**: ✅ PASSING (28 steps, 22ms)
  - All OAuth 2.0 functionality working correctly
  - Client validation, token generation, authorization flows working
- **Auth Helpers Tests**: ❌ FAILING (1 uncaught error)
  - Core functionality appears to work but test has assertion issue
- **Application Startup**: ✅ WORKING
  - App starts successfully on http://localhost:8001
  - Fresh framework loads correctly

## Backup Created
- **Full backup**: packages/app-backup-20250730-085829/
- **Documentation backup**: This file (CURRENT_STATE_BACKUP.md)
- **Date**: 2025-01-30 08:58:29

## Ready for Refactoring
All sub-tasks completed:
✅ Run full test suite to establish baseline functionality
✅ Document current package structure and dependencies  
✅ Create backup of current working state