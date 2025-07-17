# JSON App Compiler - API Package

This package provides Fresh 2.0 compatible API route handlers and middleware for the JSON App Compiler system. It includes CRUD operation templates, request validation middleware, and consistent error response formatting.

## Features

- **CRUD Handlers**: Pre-built handlers for Create, Read, Update, Delete, and List operations
- **Request Validation**: Middleware for validating request bodies, query parameters, headers, and URL parameters
- **Error Handling**: Consistent error response formatting with detailed error information
- **CORS Support**: Configurable CORS middleware for cross-origin requests
- **Rate Limiting**: Basic rate limiting middleware to prevent abuse
- **Fresh 2.0 Compatible**: Designed to work seamlessly with Fresh 2.0 alpha routing conventions

## Installation

This package is part of the JSON App Compiler monorepo and is typically used internally by the compiler. However, you can also use it directly in your Fresh applications.

```typescript
import { 
  createCrudHandler, 
  createValidationMiddleware,
  createCorsMiddleware 
} from "@json-app-compiler/api";
```

## Quick Start

### Basic CRUD Handler

```typescript
// routes/api/users/[id].ts
import type { FreshContext } from "$fresh/server.ts";
import { createCrudHandler, type CrudConfig } from "@json-app-compiler/api";

const config: CrudConfig = {
  resource: "users",
  operations: ["create", "read", "update", "delete", "list"],
};

const handler = createCrudHandler(config);

export async function handler(req: Request, ctx: FreshContext) {
  return await handler.handle(req as any, ctx);
}
```

### With Validation

```typescript
// routes/api/users/[id].ts
import type { FreshContext } from "$fresh/server.ts";
import { 
  createCrudHandler, 
  createValidationMiddleware,
  type CrudConfig,
  type ValidationSchema 
} from "@json-app-compiler/api";

const config: CrudConfig = {
  resource: "users",
  operations: ["create", "read", "update", "delete", "list"],
  validation: {
    create: {
      body: {
        name: { type: "string", required: true, min: 2, max: 50 },
        email: { type: "string", required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" },
        age: { type: "number", min: 0, max: 120 },
      },
    },
  },
};

const crudHandler = createCrudHandler(config);
const validationMiddleware = createValidationMiddleware({
  schema: config.validation?.create || {},
});

export async function handler(req: Request, ctx: FreshContext) {
  // Apply validation first
  const validationResponse = await validationMiddleware(req, ctx);
  if (validationResponse.status !== 200) {
    return validationResponse;
  }

  // Handle the request
  return await crudHandler.handle(req as any, ctx);
}
```

## API Reference

### CRUD Handlers

#### `createCrudHandler(config: CrudConfig)`

Creates a new CRUD handler with the specified configuration.

**Parameters:**
- `config.resource` - The name of the resource (e.g., "users", "posts")
- `config.operations` - Array of allowed operations: `["create", "read", "update", "delete", "list"]`
- `config.validation` - Optional validation schemas for different operations
- `config.middleware` - Optional middleware function names

**Returns:** `BaseApiHandler` instance

#### `BaseApiHandler` Methods

- `create(req, ctx)` - Handle POST requests (create new resource)
- `read(req, ctx)` - Handle GET requests with ID (read single resource)
- `update(req, ctx)` - Handle PUT/PATCH requests (update existing resource)
- `delete(req, ctx)` - Handle DELETE requests (delete resource)
- `list(req, ctx)` - Handle GET requests without ID (list resources with pagination)
- `handle(req, ctx)` - Route requests to appropriate method based on HTTP method and presence of ID

### Validation Middleware

#### `createValidationMiddleware(options: ValidationMiddlewareOptions)`

Creates middleware that validates incoming requests against JSON schemas.

**Parameters:**
- `options.schema` - Validation schema object
- `options.strict` - Whether to use strict validation (default: true)
- `options.allowUnknown` - Whether to allow unknown fields (default: false)

**Schema Structure:**
```typescript
{
  body?: Record<string, FieldValidation>;     // Request body validation
  query?: Record<string, FieldValidation>;    // Query parameters validation
  params?: Record<string, FieldValidation>;   // URL parameters validation
  headers?: Record<string, FieldValidation>;  // Headers validation
}
```

**Field Validation Options:**
```typescript
{
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;        // Min length/value/items
  max?: number;        // Max length/value/items
  pattern?: string;    // Regex pattern (for strings)
  enum?: unknown[];    // Allowed values
  custom?: string;     // Custom validation function name
}
```

### CORS Middleware

#### `createCorsMiddleware(options)`

Creates CORS middleware for handling cross-origin requests.

**Parameters:**
- `options.origin` - Allowed origins (string, array, or boolean)
- `options.methods` - Allowed HTTP methods
- `options.allowedHeaders` - Allowed request headers
- `options.credentials` - Whether to allow credentials

### Rate Limiting Middleware

#### `createRateLimitMiddleware(options)`

Creates basic rate limiting middleware.

**Parameters:**
- `options.windowMs` - Time window in milliseconds (default: 15 minutes)
- `options.maxRequests` - Maximum requests per window (default: 100)
- `options.keyGenerator` - Function to generate rate limit keys

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "pagination": { /* pagination info for list responses */ }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details",
    "field": "field_name", // For validation errors
    "suggestions": ["suggestion1", "suggestion2"]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": "2 validation error(s) found"
  },
  "validationErrors": [
    {
      "field": "body.email",
      "message": "Field 'email' does not match required pattern",
      "code": "PATTERN_VIOLATION",
      "value": "invalid-email"
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## HTTP Status Codes

The handlers use appropriate HTTP status codes:

- `200 OK` - Successful GET, PUT, PATCH requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Validation errors, missing required data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not supported for resource
- `422 Unprocessable Entity` - Semantic validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server errors

## Examples

See the `examples/` directory for complete examples of how to use the API handlers in Fresh 2.0 applications.

## Testing

Run the test suite:

```bash
deno test packages/api/ --allow-all
```

The package includes comprehensive tests for:
- CRUD operations
- Request validation
- Error handling
- Middleware functionality
- Type conversions
- Edge cases

## Integration with JSON App Compiler

This package is designed to work seamlessly with the JSON App Compiler system. When you define API endpoints in your JSON configuration, the compiler will automatically generate Fresh routes that use these handlers and middleware.

Example JSON configuration:
```json
{
  "api": {
    "endpoints": [
      {
        "path": "/api/users",
        "methods": ["GET", "POST"],
        "handler": "UserHandler",
        "validation": {
          "body": {
            "name": { "type": "string", "required": true },
            "email": { "type": "string", "required": true }
          }
        }
      }
    ]
  }
}
```

This will generate a Fresh route that uses the handlers and validation from this package.