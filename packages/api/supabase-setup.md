# Supabase Setup Guide for Deno Environment

This guide covers setting up Supabase for your Deno-based UI library with authentication and
database functionality.

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned (usually 2-3 minutes)
3. Navigate to **Settings** → **API** in your Supabase dashboard

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Get these from: Settings → API in your Supabase dashboard
```

**🔍 Where to find these values:**

- **Project URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → Project API keys → anon/public

### 3. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy the contents of database-schema.sql and run in Supabase
-- This creates all tables, policies, and functions needed
```

### 4. Authentication Configuration

#### Enable Auth Providers

In your Supabase dashboard:

1. **Go to Authentication** → **Providers**
2. **Enable desired providers**:
   - **Email** (enabled by default)
   - **Google OAuth**
   - **GitHub OAuth**
   - **Discord OAuth** (optional)
   - **Twitter OAuth** (optional)

#### Configure OAuth Providers

**Google OAuth:**

```bash
# Add to your OAuth provider settings
Site URL: http://localhost:8000
Redirect URLs: 
  - http://localhost:8000/auth/callback
  - https://your-domain.com/auth/callback
```

**GitHub OAuth:**

```bash
# In your GitHub OAuth App settings
Homepage URL: http://localhost:8000
Authorization callback URL: 
  - http://localhost:8000/auth/callback
  - https://your-domain.com/auth/callback
```

### 5. Storage Configuration

The schema automatically sets up an `avatars` bucket. Verify in **Storage** → **Buckets**.

## 📁 Project Structure

// TODO need to refactor, have a store which does the supabase authentication, then the other apps
would // sso into this, remove all components

// components should only do a POST or GET requests to the api package, or sso to the store, they do
not connect direclty to supabase

// Refactor, more templates, templates so simple site, blog site, dashboard etc, these are where the
islands and page layouts will be defined

// TODO I am thinking the sidebar needs to be reworked, so on desktop it will take a section, and on
minimise it will stay in top left? maybe fancy animation?

```
packages/ui-lib/src/
├── lib/
│   ├── supabase-client.ts     # Main Supabase client
│   ├── auth-helpers.ts        # Authentication methods
│   ├── api-helpers.ts         # Database operations  
│   └── database-types.ts      # TypeScript types
├── providers/
│   └── AuthProvider.tsx       # React auth context
└── components/
    ├── ProtectedRoute.tsx     # Route protection
    ├── SSOLogin.tsx          # OAuth login
    └── SSOCallback.tsx       # OAuth callback
```

## 🔧 Usage Examples

### Basic Setup

```tsx
import { AuthProvider } from "@your-org/ui-lib";

export default function App({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### Using Authentication

```tsx
import { ProtectedRoute, useAuth } from "@your-org/ui-lib";

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Welcome, {user?.email}</h1>
        <button onClick={signOut}>Sign Out</button>
      </div>
    </ProtectedRoute>
  );
}
```

### Database Operations

```tsx
import { ApiHelpers } from "@your-org/ui-lib";

// Create application
const app = await ApiHelpers.createApplication(user.id, {
  name: "My App",
  templateType: "fresh-supabase",
  configuration: { theme: "dark" },
});

// Get user applications
const apps = await ApiHelpers.getUserApplications(user.id);
```

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS policies that ensure:

- ✅ Users can only access their own data
- ✅ Shared applications respect access levels
- ✅ Proper access control for reads/writes

### Authentication Flow

1. **Sign Up**: `AuthHelpers.signUp({ email, password, fullName })`
2. **Sign In**: `AuthHelpers.signIn({ email, password })`
3. **OAuth**: `AuthHelpers.signInWithOAuth('google')`
4. **Password Reset**: `AuthHelpers.resetPassword({ email })`

## 🎯 Environment Variables

| Variable            | Required | Description                 |
| ------------------- | -------- | --------------------------- |
| `SUPABASE_URL`      | ✅       | Your Supabase project URL   |
| `SUPABASE_ANON_KEY` | ✅       | Your Supabase anonymous key |

## 📊 Database Schema

The setup creates these main tables:

- **`users`** - User profile information with flexible name fields
- **`applications`** - User-created applications and configurations
- **`user_access`** - Granular permission system (read/write/admin)
- **`oauth_codes`** - Authorization codes for external OAuth
- **`oauth_tokens`** - Access tokens for external integrations
- **`oauth_clients`** - Registered external applications

All tables include comprehensive Row Level Security (RLS) policies.

## 🛠️ Development Commands

```bash
# Start development server
deno task dev

# Run with Supabase integration
deno task dev:supabase

# Generate types from Supabase
supabase gen types typescript --project-id=your-project-ref > src/lib/database-types.ts
```

## 🚨 Troubleshooting

### Common Issues

**Environment Variables Not Loading:**

```bash
# Check file location
ls -la .env.local

# Verify content
cat .env.local
```

**Authentication Redirect Issues:**

```bash
# Check redirect URLs in Supabase Auth settings
# Ensure they match your development/production URLs
```

**RLS Policy Issues:**

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View current policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Deno Fresh Documentation](https://fresh.deno.dev/)

## 🎉 Ready to Go!

Your Supabase integration is now complete! You have:

- ✅ Full authentication system with OAuth
- ✅ Secure database with RLS policies
- ✅ File storage for avatars
- ✅ Application management system
- ✅ User access control and sharing
- ✅ TypeScript support throughout
- ✅ Deno-optimized configuration

Start building your application with confidence! 🚀
