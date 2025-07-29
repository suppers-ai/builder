# Current State Documentation - packages/app

## Package Structure
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
│   ├── auth-helpers.test.ts
│   ├── auth-helpers.ts
│   ├── cleanup-service.ts
│   ├── middleware.ts
│   ├── mod.ts
│   ├── oauth-service.test.ts
│   ├── oauth-service.ts
│   ├── security-config.ts
│   ├── security-test.ts
│   ├── supabase-client.ts
│   └── token-manager.ts
├── routes/               # API and page routes
│   ├── .well-known/      # OAuth discovery endpoints
│   │   └── openid_configuration.tsx
│   ├── auth/             # Authentication routes
│   │   ├── callback.tsx
│   │   └── logout.tsx
│   ├── oauth/            # OAuth 2.0 endpoints
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
├── .env                  # Environment variables
├── .env.example          # Environment template
├── README.md             # Package documentation
├── deno.json             # Package configuration
├── dev.ts                # Development server
├── main.ts               # Production server
├── mod.ts                # Package exports
├── setup-avatars-bucket.sql
└── tailwind.config.ts    # Tailwind configuration
```

## Current Dependencies (from deno.json)
- @suppers/auth-client: ../auth-client/mod.ts
- @suppers/ui-lib: ../ui-lib/mod.ts
- @suppers/shared: ../shared/mod.ts
- @supabase/supabase-js: https://esm.sh/@supabase/supabase-js@2.39.8
- Fresh framework and related packages
- Preact and related packages
- Tailwind CSS
- Various utility libraries (zod, jose, lucide-preact)

## Test Status (as of backup)
- OAuth Service tests: PASSING (50 steps passed)
- Auth Helpers tests: FAILING (1 uncaught error in assertRejects)
- Overall test status: Some functionality working, some type checking issues

## Current Configuration
- Package name: "@suppers/app"
- Version: "1.0.0"
- Main export: "./mod.ts"
- Development port: Default (likely 8001)
- Environment variables: APP_PORT, APP_HOST

## Known Issues
1. Type checking errors in test files
2. One failing test in auth-helpers.test.ts (assertRejects issue)
3. Some UI library tests have type mismatches
4. Import map missing preact-render-to-string (fixed in root deno.json)

## Functionality Status
- OAuth 2.0 endpoints: Functional (tests passing)
- Authentication flows: Mostly functional (some test issues)
- Profile management: Present in codebase
- Fresh framework integration: Working
- Supabase integration: Configured