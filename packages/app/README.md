# @suppers/app - SSO Authentication Service

A dedicated Single Sign-On (SSO) authentication service built with Fresh and Deno. This package
provides OAuth 2.0 authentication endpoints and user management functionality for the Suppers
ecosystem.

## Features

- 🔐 **OAuth 2.0 Provider**: Complete OAuth authorization server implementation
- 👤 **User Authentication**: Email/password and social login support
- 🔑 **Token Management**: JWT access tokens with refresh token support
- 🛡️ **Security**: CSRF protection, rate limiting, and secure session management
- 🎨 **Modern UI**: Built with Tailwind CSS and daisyUI components
- ⚡ **Fast & Lightweight**: Minimal dependencies, focused on authentication only

## Quick Start

### Prerequisites

- [Deno](https://deno.land/) 1.40+
- [Supabase](https://supabase.com/) account and project

### Installation

1. Clone the repository and navigate to the app package:
   ```bash
   cd packages/app
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   OAUTH_CLIENT_ID=your_oauth_client_id
   OAUTH_CLIENT_SECRET=your_oauth_client_secret
   ```

4. Start the development server:
   ```bash
   deno task dev
   ```

The app will be available at `http://localhost:8001`.

## Development

### Available Scripts

- `deno task dev` - Start development server with hot reload
- `deno task start` - Start production server
- `deno task build` - Build the application
- `deno task test` - Run tests
- `deno task test:watch` - Run tests in watch mode
- `deno task check` - Type check the code
- `deno task fmt` - Format code
- `deno task lint` - Lint code

### Project Structure

```
packages/app/
├── islands/           # Interactive client-side components
│   ├── AuthCallbackHandler.tsx
│   ├── LoginPageIsland.tsx
│   ├── LogoutHandler.tsx
│   └── ProfilePageIsland.tsx
├── lib/              # Server-side utilities and services
│   ├── auth-helpers.ts
│   ├── middleware.ts
│   ├── oauth-service.ts
│   ├── security-config.ts
│   ├── supabase-client.ts
│   └── token-manager.ts
├── routes/           # API and page routes
│   ├── auth/         # Authentication routes
│   ├── oauth/        # OAuth 2.0 endpoints
│   ├── .well-known/  # OAuth discovery endpoint
│   ├── login.tsx     # Login page
│   └── profile.tsx   # User profile page
├── static/           # Static assets
├── main.ts           # Application entry point
└── deno.json         # Deno configuration
```

## Authentication Setup

### OAuth 2.0 Configuration

The app package implements a complete OAuth 2.0 authorization server with the following endpoints:

#### Authorization Endpoint

```
GET /oauth/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=SCOPE&state=STATE
```

#### Token Endpoint

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=CODE&redirect_uri=REDIRECT_URI&client_id=CLIENT_ID&client_secret=CLIENT_SECRET
```

#### User Info Endpoint

```
GET /oauth/userinfo
Authorization: Bearer ACCESS_TOKEN
```

#### Token Validation

```
POST /oauth/validate
Authorization: Bearer ACCESS_TOKEN
```

#### Token Revocation

```
POST /oauth/revoke
Authorization: Bearer ACCESS_TOKEN
```

### Database Schema

The app uses the following Supabase tables:

- `users` - User profiles and authentication data
- `oauth_clients` - Registered OAuth client applications
- `oauth_tokens` - Access and refresh tokens
- `oauth_authorization_codes` - Temporary authorization codes

### Environment Variables

| Variable                    | Description                            | Required |
| --------------------------- | -------------------------------------- | -------- |
| `SUPABASE_URL`              | Your Supabase project URL              | Yes      |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key                 | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key              | Yes      |
| `JWT_SECRET`                | Secret for signing JWT tokens          | Yes      |
| `OAUTH_CLIENT_ID`           | Default OAuth client ID                | No       |
| `OAUTH_CLIENT_SECRET`       | Default OAuth client secret            | No       |
| `CORS_ORIGINS`              | Allowed CORS origins (comma-separated) | No       |
| `RATE_LIMIT_REQUESTS`       | Rate limit requests per minute         | No       |
| `TOKEN_EXPIRY_MINUTES`      | Access token expiry in minutes         | No       |

## OAuth Integration for External Applications

### Registering a Client Application

1. Create an OAuth client in your Supabase `oauth_clients` table:
   ```sql
   INSERT INTO oauth_clients (client_id, client_secret, redirect_uris, name, description)
   VALUES (
     'your-app-client-id',
     'your-app-client-secret',
     ARRAY['https://yourapp.com/auth/callback'],
     'Your App Name',
     'Description of your application'
   );
   ```

### Integration Example

Here's how to integrate with the SSO service from your application:

```typescript
// 1. Redirect user to authorization endpoint
const authUrl = new URL("http://localhost:8001/oauth/authorize");
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", "your-client-id");
authUrl.searchParams.set("redirect_uri", "https://yourapp.com/auth/callback");
authUrl.searchParams.set("scope", "openid profile email");
authUrl.searchParams.set("state", generateRandomState());

window.location.href = authUrl.toString();

// 2. Handle the callback in your application
async function handleCallback(code: string, state: string) {
  const tokenResponse = await fetch("http://localhost:8001/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: "https://yourapp.com/auth/callback",
      client_id: "your-client-id",
      client_secret: "your-client-secret",
    }),
  });

  const tokens = await tokenResponse.json();

  // Store tokens securely
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
}

// 3. Use the access token to get user info
async function getUserInfo(accessToken: string) {
  const response = await fetch("http://localhost:8001/oauth/userinfo", {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  return await response.json();
}
```

## Security Considerations

- **HTTPS Only**: Always use HTTPS in production
- **Secure Secrets**: Store JWT secrets and OAuth credentials securely
- **CORS Configuration**: Configure CORS origins appropriately
- **Rate Limiting**: Implement rate limiting for authentication endpoints
- **Token Expiry**: Use short-lived access tokens with refresh tokens
- **State Parameter**: Always validate OAuth state parameter for CSRF protection

## Deployment

### Deno Deploy

1. Install the Deno Deploy CLI:
   ```bash
   deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts
   ```

2. Deploy the application:
   ```bash
   deployctl deploy --project=your-project-name main.ts
   ```

### Docker

```dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app
COPY . .
RUN deno cache main.ts

EXPOSE 8001
CMD ["deno", "run", "--allow-all", "main.ts"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `deno task check` and `deno task test`
6. Submit a pull request

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

For questions and support:

- Create an issue in the repository
- Check the [documentation](../../docs/)
- Join our community discussions
