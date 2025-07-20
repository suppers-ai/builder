# API Package

This package contains the backend API integration for the UI library builder, including
database schema, Edge Functions, and **comprehensive SSO/OAuth support** for external applications.

## 📁 Package Structure

```
packages/api/
├── README.md                    # This file
├── supabase-setup.md           # Complete setup guide
├── sso-configuration.md        # SSO setup for external apps
├── database-schema.sql         # Database schema with OAuth tables
├── config.toml                 # Supabase local development config
└── functions/
    ├── api/                    # Main API endpoints
    │   ├── index.ts           # API router
    │   └── handlers/          # Auth, apps, profile, access
    └── oauth/                 # OAuth server for external apps
        ├── authorize.ts       # OAuth authorization endpoint
        ├── callback.ts        # OAuth callback handler
        └── deno.json         # OAuth function config
```

## 🔐 SSO & OAuth Features

### **Built-in OAuth Providers**

✅ Google, GitHub, Microsoft Azure, Apple, Discord, Twitter, LinkedIn, Slack, Spotify, Zoom

### **External App Integration**

✅ **Custom OAuth Server** - Let external apps authenticate via your backend\
✅ **JWT Token Exchange** - Secure API access for external applications\
✅ **PKCE Support** - Secure mobile app authentication\
✅ **Enterprise SSO** - SAML 2.0 and OIDC via WorkOS integration

### **Database Tables for OAuth**

- `oauth_clients` - Registered external applications
- `oauth_codes` - Authorization codes for OAuth flow
- `oauth_tokens` - Access/refresh tokens for external apps
- Row-level security policies for all OAuth data

## 🚀 Quick Start

### 1. **Standard Setup**

Follow the setup guide: See `supabase-setup.md` for detailed instructions

### 2. **SSO for External Apps**

Follow the SSO guide: See `sso-configuration.md` for external app integration

### 3. **OAuth Server Setup**

```bash
# Deploy OAuth functions
cd packages/api
deno task deploy

# OAuth endpoints will be available at:
# https://your-project.supabase.co/functions/v1/oauth/authorize
# https://your-project.supabase.co/functions/v1/oauth/callback
```

### 4. **External App Flow**

```javascript
// External app redirects to your OAuth server
const authUrl = "https://your-project.supabase.co/functions/v1/oauth/authorize?" +
  "client_id=external-web-app&" +
  "redirect_uri=https://external-app.com/callback&" +
  "response_type=code&" +
  "scope=openid email profile";

window.location.href = authUrl;
```

## 🔗 Integration Examples

### **React Component**

```tsx
import { SSOLogin, SSOCallback } from '@suppers/ui-lib';

// Multi-provider login
<SSOLogin 
  providers={['google', 'github', 'microsoft']}
  onSuccess={() => console.log('Logged in!')}
/>

// Handle OAuth callbacks
<SSOCallback 
  successRedirect="/dashboard"
  errorRedirect="/login"
/>
```

### **External API Access**

```javascript
// External app gets JWT token after OAuth
const response = await fetch("https://your-api.com/user/apps", {
  headers: {
    "Authorization": `Bearer ${jwtToken}`,
    "Content-Type": "application/json",
  },
});
```

### **Mobile Apps (React Native)**

```javascript
import { supabase } from "@suppers/api";

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: "com.yourapp://callback",
    pkce: true,
  },
});
```

## 🏢 Enterprise Features

- **SAML 2.0** via WorkOS integration
- **Active Directory** and Google Workspace
- **Custom OIDC** providers
- **Multi-tenant** support with organization isolation
- **Audit logging** for compliance

## 🔒 Security Features

- **Row Level Security** on all tables
- **JWT signature verification** for external apps
- **PKCE flow** for mobile applications
- **Scope-based permissions** (read, write, admin)
- **Token expiration** and automatic cleanup
- **Rate limiting** and abuse protection

## 🎯 Use Cases

### **Internal Applications**

- User management with profiles and avatars
- Application sharing with granular permissions
- Real-time authentication state management

### **External Integrations**

- **Partner APIs** - Let partners access user data via OAuth
- **Mobile Apps** - Native iOS/Android authentication
- **Third-party Tools** - Integrate with external services
- **Webhooks** - Secure API access for automated systems

## 🛠️ Development Commands

```bash
# Start local Supabase
deno task dev

# Deploy all functions
deno task deploy

# Generate TypeScript types
deno task types

# View function logs
deno task logs
```

## 📚 Documentation

- **Setup Guide**: `supabase-setup.md` - Complete Supabase setup
- **SSO Configuration**: `sso-configuration.md` - External app integration
- **Database Schema**: `database-schema.sql` - Tables and security policies
- **API Documentation**: See handler files for endpoint specifications

## 🎉 Ready for Production!

Your API package provides enterprise-grade authentication with:

- ✅ **Multi-provider SSO** (Google, GitHub, Microsoft, etc.)
- ✅ **Custom OAuth server** for external app integration
- ✅ **Mobile app support** with PKCE security
- ✅ **Enterprise SSO** (SAML, OIDC)
- ✅ **JWT-based APIs** with proper validation
- ✅ **Comprehensive security** with RLS and scope management

Perfect for SaaS platforms, mobile apps, and enterprise integrations! 🚀

### Database Schema

The package includes a complete database schema with:

- **`users`** - User profile information with flexible name fields (first_name, middle_names,
  last_name, display_name)
- **`applications`** - User-created applications with owner_id and template_id references
- **`user_access`** - Granular access control (read/write/admin)
- **`oauth_codes`** - Authorization codes for OAuth flow
- **`oauth_tokens`** - Access/refresh tokens for external apps
- **`oauth_clients`** - Registered external applications

All tables include Row Level Security (RLS) policies for secure multi-tenant access.
