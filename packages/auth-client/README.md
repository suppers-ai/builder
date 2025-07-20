# Auth Client Package

A lightweight TypeScript client for integrating with the Suppers Store SSO authentication system.

## Features

- 🔐 **Token Management**: Automatic token refresh and storage
- 🔄 **Session Validation**: Validates and manages authentication sessions
- 🚀 **Easy Integration**: Simple API for authentication flows
- 🌐 **Cross-Platform**: Works in browser and Deno environments
- 📱 **Event System**: Listen to authentication events

## Installation

```typescript
import { AuthClient } from "@packages/auth-client";
```

## Usage

### Basic Setup

```typescript
const authClient = new AuthClient({
  storeUrl: "https://auth.yourdomain.com",
  clientId: "your-app-id",
  redirectUri: "https://yourapp.com/callback",
  scopes: ["openid", "email", "profile"],
});

// Initialize the client
await authClient.initialize();
```

### Login Flow

```typescript
// Redirect to login
authClient.login({
  redirectUri: "https://yourapp.com/callback",
  state: "optional-state-parameter",
});

// Check if user is authenticated
if (authClient.isAuthenticated()) {
  const user = authClient.getUser();
  console.log("Logged in as:", user?.email);
}
```

### Logout

```typescript
await authClient.logout();
```

### Making Authenticated API Requests

```typescript
// The client automatically handles token refresh
const response = await authClient.apiRequest("/api/protected-endpoint");
const data = await response.json();
```

### Event Handling

```typescript
// Listen for authentication events
authClient.addEventListener("login", (event, session) => {
  console.log("User logged in:", session.user);
});

authClient.addEventListener("logout", () => {
  console.log("User logged out");
});

authClient.addEventListener("token_refresh", (event, session) => {
  console.log("Token refreshed");
});

authClient.addEventListener("error", (event, error) => {
  console.error("Auth error:", error);
});
```

## API Reference

### AuthClient

#### Constructor Options

```typescript
interface AuthClientConfig {
  storeUrl: string;        // URL of the auth store
  clientId?: string;       // Your application's client ID
  redirectUri?: string;    // Redirect URI after authentication
  scopes?: string[];       // OAuth scopes to request
  storageKey?: string;     // Key for session storage
}
```

#### Methods

- `initialize()`: Initialize the client and check for existing sessions
- `login(options?)`: Start the login flow
- `logout()`: Log out the current user
- `getUser()`: Get current user information
- `getSession()`: Get current session
- `isAuthenticated()`: Check if user is authenticated
- `getAccessToken()`: Get current access token
- `refreshToken()`: Manually refresh the access token
- `apiRequest(endpoint, options)`: Make authenticated API requests

#### Events

- `login`: Fired when user logs in
- `logout`: Fired when user logs out
- `token_refresh`: Fired when token is refreshed
- `error`: Fired when an error occurs

## Configuration

The auth client supports various configuration options:

```typescript
const authClient = new AuthClient({
  storeUrl: "https://auth.yourdomain.com",
  clientId: "your-app-id",
  redirectUri: "https://yourapp.com/callback",
  scopes: ["openid", "email", "profile"],
  storageKey: "custom_auth_session", // Default: 'auth_session'
});
```

## Error Handling

The client provides comprehensive error handling:

```typescript
try {
  await authClient.apiRequest("/api/endpoint");
} catch (error) {
  if (error.error === "invalid_token") {
    // Token is invalid, redirect to login
    authClient.login();
  } else {
    console.error("API Error:", error);
  }
}
```

## Storage

The client automatically manages session storage across different environments:

- **Browser**: Uses localStorage and sessionStorage
- **Deno**: Uses environment variables (read-only)
- **Node.js**: Can be extended with custom storage adapters

## Security

- Tokens are stored securely in browser storage
- Automatic token refresh prevents expired token issues
- HTTPS is enforced for all communications
- PKCE support for additional security

## Examples

### React Integration

```typescript
import { useEffect, useState } from "react";
import { AuthClient } from "@packages/auth-client";

const authClient = new AuthClient({
  storeUrl: "https://auth.yourdomain.com",
  clientId: "your-app-id",
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.initialize().then(() => {
      setUser(authClient.getUser());
      setLoading(false);
    });

    authClient.addEventListener("login", (event, session) => {
      setUser(session.user);
    });

    authClient.addEventListener("logout", () => {
      setUser(null);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <button onClick={() => authClient.logout()}>Logout</button>
    </div>
  ) : (
    <div>
      <h1>Please log in</h1>
      <button onClick={() => authClient.login()}>Login</button>
    </div>
  );
}
```

### Fresh Integration

```typescript
// islands/AuthProvider.tsx
import { AuthClient } from "@packages/auth-client";

const authClient = new AuthClient({
  storeUrl: "https://auth.yourdomain.com",
  clientId: "your-app-id",
});

export default function AuthProvider({ children }) {
  // Initialize auth client
  useEffect(() => {
    authClient.initialize();
  }, []);

  return (
    <AuthContext.Provider value={authClient}>
      {children}
    </AuthContext.Provider>
  );
}
```