# API Package

Standalone API package for Supabase Edge Functions with clean, modular architecture.

## Configuration

The API uses environment variables for configuration. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key configuration variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- See `.env.example` for full list

## Architecture

### Directory Structure

```
packages/api/
├── .env                           # Environment configuration
├── supabase/
│   └── functions/
│       └── api/
│           ├── _common/           # Shared utilities (standalone, no external deps)
│           │   ├── auth.ts        # Authentication & JWT handling
│           │   ├── config.ts      # Configuration management
│           │   ├── cors.ts        # CORS utilities
│           │   ├── database.ts    # Database client & queries
│           │   ├── errors.ts      # Error handling & custom errors
│           │   ├── handler.ts     # Request routing & middleware
│           │   ├── response.ts    # Response utilities
│           │   ├── validation.ts  # Input validation
│           │   └── index.ts       # Central exports
│           ├── handlers/          # Resource handlers
│           │   ├── admin/         # Admin endpoints
│           │   ├── entity/        # Entity CRUD
│           │   ├── storage/       # File storage
│           │   ├── product/       # Product management
│           │   └── ...           # Other resources
│           └── index.ts           # Main entry point
```

### Common Utilities

All common functionality is in `_common/` - standalone modules with no external dependencies:

#### Configuration (`config.ts`)
- Loads environment variables
- Provides typed configuration
- Singleton pattern for consistency

#### Authentication (`auth.ts`)
- JWT token verification
- User context extraction
- Role-based access control
- API key management

#### Database (`database.ts`)
- Standalone Supabase client implementation
- Query builders
- Transaction support
- Pagination helpers

#### Response (`response.ts`)
- Consistent API responses
- Success/error formatting
- CORS header injection
- Streaming support

#### Validation (`validation.ts`)
- Input validation rules
- Type checking
- Sanitization
- Common validation patterns

#### Error Handling (`errors.ts`)
- Custom error classes
- HTTP status mapping
- Error logging
- Graceful error handling

#### Request Handler (`handler.ts`)
- Route matching
- Middleware support
- Request context
- Method routing

## Usage Examples

### Creating a New Handler

```typescript
import {
  createHandler,
  successResponse,
  errorResponse,
  requireAuth,
  validate,
  commonRules,
} from '../_common/index.ts';

// Define your handler
const myHandler = createHandler([
  {
    method: 'GET',
    pattern: 'api/v1/resource/:id',
    requireAuth: true,
    handler: async (context) => {
      const { id } = extractPathParams('api/v1/resource/:id', context.pathSegments);
      
      // Your logic here
      const data = await fetchResource(id);
      
      return successResponse(data);
    },
  },
  {
    method: 'POST',
    pattern: 'api/v1/resource',
    requireAuth: true,
    handler: async (context) => {
      // Parse and validate body
      const body = await parseJsonBody(context.request);
      const validated = validateOrThrow(body, [
        { field: 'name', required: true, type: 'string', min: 1, max: 100 },
        commonRules.email('email'),
      ]);
      
      // Your logic here
      const created = await createResource(validated);
      
      return successResponse(created, { status: 201 });
    },
  },
]);
```

### Using Database Client

```typescript
import { createServiceClient, createClient } from '../_common/database.ts';

// Service client (admin access)
const db = createServiceClient();

// User-scoped client
const userDb = createClient(userToken);

// Query examples
const { data, error } = await db.select('users', {
  select: 'id, email, created_at',
  filters: { role: 'admin' },
  orderBy: { column: 'created_at', ascending: false },
  limit: 10,
});

// Insert
const { data: newUser } = await db.insert('users', {
  email: 'user@example.com',
  role: 'user',
});

// Update
const { data: updated } = await db.update('users', userId, {
  role: 'admin',
});

// Delete
await db.delete('users', userId);
```

### Error Handling

```typescript
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  toApiError,
  logError,
} from '../_common/errors.ts';

try {
  // Your logic
  if (!resource) {
    throw new NotFoundError('Resource');
  }
  
  if (!hasPermission) {
    throw new ForbiddenError('You do not have permission to access this resource');
  }
  
  if (!isValid) {
    throw new ValidationError('Invalid input', { field: 'email' });
  }
} catch (error) {
  const apiError = toApiError(error);
  logError(apiError, { endpoint: 'resource', method: 'GET' });
  throw apiError; // Will be handled by the handler wrapper
}
```

## Testing

Run tests:
```bash
deno task test
```

Test specific handler:
```bash
deno test packages/api/supabase/functions/api/handlers/admin/handler.test.ts
```

## Deployment

Deploy to Supabase:
```bash
deno task api:deploy
```

## Security

- All endpoints require authentication by default (except `/share`)
- Admin endpoints require admin role verification
- Input validation and sanitization on all endpoints
- Rate limiting available via middleware
- CORS configuration via environment variables
- JWT token verification with expiration checks

## Performance

- Lightweight standalone implementation
- No external dependencies in core utilities
- Efficient routing with pattern matching
- Connection pooling for database
- Response streaming for large data
- Caching support via middleware

## Migration from Old Structure

The API maintains backward compatibility through re-exports:
- Old `corsHeaders` imports still work
- `response-utils.ts` functions still available
- `supabase-client.ts` exports still function

However, new code should use the `_common/` utilities directly for better tree-shaking and cleaner imports.