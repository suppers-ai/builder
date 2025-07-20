# SSO Configuration for External Apps

This guide covers setting up Single Sign-On (SSO) to allow external applications to authenticate via
your backend API.

## 🔐 Available SSO Methods

### 1. **OAuth 2.0 Providers**

✅ **Pre-configured providers:**

- Google OAuth
- GitHub OAuth
- Microsoft Azure AD
- Apple Sign In
- Discord, Twitter, LinkedIn
- Slack, Spotify, Zoom

### 2. **Enterprise SSO**

- **SAML 2.0** (via WorkOS integration)
- **OIDC (OpenID Connect)** custom providers
- **Azure Active Directory**
- **Google Workspace**

### 3. **Custom OAuth Applications**

- Create your own OAuth app for external integrations
- JWT-based authentication for APIs
- Custom scopes and permissions

## 🚀 Setup for External Apps

### Step 1: Enable OAuth Providers

In your Supabase dashboard or update `config.toml`:

```toml
# Google OAuth
[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"
redirect_uri = "https://your-domain.com/auth/callback"

# GitHub OAuth  
[auth.external.github]
enabled = true
client_id = "env(GITHUB_CLIENT_ID)"
secret = "env(GITHUB_CLIENT_SECRET)"
redirect_uri = "https://your-domain.com/auth/callback"

# Microsoft Azure AD
[auth.external.azure]
enabled = true
client_id = "env(AZURE_CLIENT_ID)"
secret = "env(AZURE_CLIENT_SECRET)"
redirect_uri = "https://your-domain.com/auth/callback"
# For custom tenant: url = "https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0"
```

### Step 2: Configure External App URLs

Update your Supabase Auth settings:

```bash
# Production URLs
Site URL: https://your-app.com
Additional redirect URLs:
  - https://your-app.com/auth/callback
  - https://external-app-1.com/auth/callback  
  - https://external-app-2.com/auth/callback
  - https://mobile-app.com/callback
  
# Development URLs  
  - http://localhost:3000/auth/callback
  - http://localhost:8000/auth/callback
```

### Step 3: Environment Variables

Add to your `.env.local`:

```bash
# OAuth Provider Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id  
GITHUB_CLIENT_SECRET=your-github-client-secret
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret

# Custom OAuth (for your own external apps)
CUSTOM_OAUTH_CLIENT_ID=your-custom-client-id
CUSTOM_OAUTH_CLIENT_SECRET=your-custom-client-secret
```

## 🔗 External App Integration

### Method 1: Direct OAuth Flow

For external apps to use your SSO:

```javascript
// External app redirects user to your auth endpoint
const authUrl = `https://your-project.supabase.co/auth/v1/authorize?` +
  `provider=google&` +
  `redirect_to=https://external-app.com/auth/callback&` +
  `scopes=openid email profile`;

window.location.href = authUrl;
```

### Method 2: JWT Token Exchange

After successful auth, external apps receive JWT tokens:

```javascript
// In your auth callback endpoint
const { data: { session } } = await supabase.auth.getSession();

// Send JWT to external app
const jwt = session.access_token;
const user = session.user;

// External app can verify this JWT
fetch("https://external-app.com/auth/verify", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${jwt}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ user }),
});
```

### Method 3: Custom OAuth Server

Create custom OAuth endpoints for external apps:

```typescript
// supabase/functions/oauth/authorize.ts
import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const clientId = url.searchParams.get("client_id");
  const redirectUri = url.searchParams.get("redirect_uri");
  const scope = url.searchParams.get("scope");

  // Validate client_id and redirect_uri
  // Redirect to your auth page with OAuth flow

  return new Response(null, {
    status: 302,
    headers: {
      "Location": `/auth/login?oauth_flow=true&client_id=${clientId}&redirect_uri=${redirectUri}`,
    },
  });
});
```

## 🏢 Enterprise SSO Setup

### SAML 2.0 (via WorkOS)

```toml
[auth.external.workos]
enabled = true
client_id = "env(WORKOS_CLIENT_ID)"
secret = "env(WORKOS_CLIENT_SECRET)"
# Supports SAML, OIDC, and directory sync
```

### Custom OIDC Provider

```toml
[auth.external.custom_oidc]
enabled = true
client_id = "env(CUSTOM_OIDC_CLIENT_ID)"
secret = "env(CUSTOM_OIDC_CLIENT_SECRET)"
url = "https://your-identity-provider.com/.well-known/openid_configuration"
```

## 📱 Mobile App Integration

### React Native

```javascript
import { createClient } from "@supabase/supabase-js";
import { makeRedirectUri, startAsync } from "expo-auth-session";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const signInWithOAuth = async (provider) => {
  const redirectUri = makeRedirectUri({ useProxy: true });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectUri },
  });

  if (data?.url) {
    const result = await startAsync({ authUrl: data.url });
    // Handle the result
  }
};
```

### Flutter

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

final supabase = Supabase.instance.client;

Future<void> signInWithOAuth(Provider provider) async {
  await supabase.auth.signInWithOAuth(
    provider,
    redirectTo: 'com.yourapp://login-callback',
  );
}
```

## 🔒 Security Best Practices

### 1. **JWT Validation**

External apps should validate JWTs:

```javascript
// Verify JWT signature and claims
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: "https://your-project.supabase.co/.well-known/jwks.json",
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

jwt.verify(token, getKey, {
  audience: "authenticated",
  issuer: "https://your-project.supabase.co/auth/v1",
  algorithms: ["RS256"],
}, (err, decoded) => {
  if (err) {
    // Invalid token
  } else {
    // Valid token, user is authenticated
    console.log(decoded.sub); // User ID
    console.log(decoded.email);
  }
});
```

### 2. **PKCE for Mobile**

Use PKCE (Proof Key for Code Exchange) for mobile apps:

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: "com.yourapp://callback",
    pkce: true, // Enable PKCE
  },
});
```

### 3. **Scope Management**

Limit scopes for external apps:

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    scopes: "openid email profile",
    redirectTo: "https://external-app.com/callback",
  },
});
```

## 📋 Testing SSO Integration

### 1. **Local Testing**

```bash
# Start Supabase locally
cd packages/api
deno task dev

# Test OAuth flow
curl -X POST "http://localhost:54321/auth/v1/authorize" \
  -H "Content-Type: application/json" \
  -d '{"provider": "google", "redirect_to": "http://localhost:3000/callback"}'
```

### 2. **External App Test**

Create a test external application:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>External App SSO Test</title>
  </head>
  <body>
    <button onclick="loginWithSSO()">Login with Your App</button>

    <script>
      function loginWithSSO() {
        const authUrl = "https://your-project.supabase.co/auth/v1/authorize?" +
          "provider=google&" +
          "redirect_to=" + encodeURIComponent(window.location.origin + "/callback");

        window.location.href = authUrl;
      }

      // Handle callback
      if (window.location.pathname === "/callback") {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get("access_token");

        if (accessToken) {
          console.log("Authenticated! Token:", accessToken);
          // Verify token with your backend
        }
      }
    </script>
  </body>
</html>
```

## 🎯 Ready for External Apps!

Your SSO setup supports:

- ✅ **Multiple OAuth providers** (Google, GitHub, Microsoft, etc.)
- ✅ **Enterprise SSO** (SAML, OIDC via WorkOS)
- ✅ **Mobile app integration** (React Native, Flutter)
- ✅ **JWT-based authentication** for APIs
- ✅ **Custom OAuth flows** for external apps
- ✅ **Secure token validation** and PKCE support

External apps can now authenticate users through your backend API! 🚀
