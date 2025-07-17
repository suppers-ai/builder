// Example of using the JSON App Compiler API with Fresh 2.0 routing conventions
// This demonstrates how to generate API routes from JSON specifications

import { 
  generateRouteHandlers,
  type ApiEndpoint,
  type ApiDefinition,
  HttpMethod
} from "../mod.ts";

// Example API definition that would typically come from a JSON configuration
const apiDefinition: ApiDefinition = {
  endpoints: [
    // Users resource with CRUD operations
    {
      path: "/users",
      methods: ["GET", "POST"] as HttpMethod[],
      handler: "UsersHandler",
      validation: {
        body: {
          name: { type: "string", required: true, min: 2, max: 50 },
          email: { type: "string", required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" },
          role: { type: "string", enum: ["user", "admin", "editor"] },
        },
        query: {
          page: { type: "number", min: 1 },
          limit: { type: "number", min: 1, max: 100 },
          search: { type: "string" },
        }
      },
      middleware: ["auth"]
    },
    // Single user operations
    {
      path: "/users/:id",
      methods: ["GET", "PUT", "DELETE"] as HttpMethod[],
      handler: "UserHandler",
      validation: {
        params: {
          id: { type: "string", required: true, pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$" }
        },
        body: {
          name: { type: "string", min: 2, max: 50 },
          email: { type: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$" },
          role: { type: "string", enum: ["user", "admin", "editor"] },
        }
      },
      middleware: ["auth"]
    },
    // Authentication endpoints
    {
      path: "/auth/login",
      methods: ["POST"] as HttpMethod[],
      handler: "AuthLoginHandler",
      validation: {
        body: {
          email: { type: "string", required: true },
          password: { type: "string", required: true, min: 8 }
        }
      }
    },
    {
      path: "/auth/register",
      methods: ["POST"] as HttpMethod[],
      handler: "AuthRegisterHandler",
      validation: {
        body: {
          name: { type: "string", required: true, min: 2, max: 50 },
          email: { type: "string", required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" },
          password: { type: "string", required: true, min: 8 },
          confirmPassword: { type: "string", required: true }
        }
      }
    }
  ],
  middleware: [
    {
      name: "cors",
      config: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"] as HttpMethod[]
      }
    },
    {
      name: "rateLimit",
      config: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
      }
    }
  ],
  auth: {
    provider: "jwt",
    config: {
      secret: "your-secret-key",
      expiresIn: "1h"
    },
    routes: {
      login: "/auth/login",
      register: "/auth/register"
    }
  },
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] as HttpMethod[],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
};

// Generate route handlers from the API definition
const routeHandlers = generateRouteHandlers(apiDefinition.endpoints, {
  basePath: "/api",
  defaultMiddleware: ["cors", "rateLimit"],
  enableValidation: true,
  enableErrorHandling: true
});

// Example of how to use the generated route handlers in Fresh 2.0 routes

// For /api/users route (GET, POST)
export const handler_users = routeHandlers["/api/users"].handler;

// For /api/users/[id] route (GET, PUT, DELETE)
export const handler_users_id = routeHandlers["/api/users/[id]"].handler;

// For /api/auth/login route (POST)
export const handler_auth_login = routeHandlers["/api/auth/login"].handler;

// For /api/auth/register route (POST)
export const handler_auth_register = routeHandlers["/api/auth/register"].handler;

// Example of how to use the handlers with Fresh 2.0 method handlers
export function GET(req: Request, ctx: any) {
  // For /api/users route
  if (ctx.url.pathname === "/api/users") {
    return routeHandlers["/api/users"].handler(req, ctx);
  }
  
  // For /api/users/[id] route
  if (ctx.url.pathname.startsWith("/api/users/")) {
    return routeHandlers["/api/users/[id]"].handler(req, ctx);
  }
  
  return new Response("Not Found", { status: 404 });
}

export function POST(req: Request, ctx: any) {
  // For /api/users route
  if (ctx.url.pathname === "/api/users") {
    return routeHandlers["/api/users"].handler(req, ctx);
  }
  
  // For /api/auth/login route
  if (ctx.url.pathname === "/api/auth/login") {
    return routeHandlers["/api/auth/login"].handler(req, ctx);
  }
  
  // For /api/auth/register route
  if (ctx.url.pathname === "/api/auth/register") {
    return routeHandlers["/api/auth/register"].handler(req, ctx);
  }
  
  return new Response("Not Found", { status: 404 });
}

export function PUT(req: Request, ctx: any) {
  // For /api/users/[id] route
  if (ctx.url.pathname.startsWith("/api/users/")) {
    return routeHandlers["/api/users/[id]"].handler(req, ctx);
  }
  
  return new Response("Not Found", { status: 404 });
}

export function DELETE(req: Request, ctx: any) {
  // For /api/users/[id] route
  if (ctx.url.pathname.startsWith("/api/users/")) {
    return routeHandlers["/api/users/[id]"].handler(req, ctx);
  }
  
  return new Response("Not Found", { status: 404 });
}

// Example of how to create a Fresh 2.0 API route file structure
/*
// File: routes/api/users/index.ts
import { handler_users } from "../../../api-routes.ts";
export const handler = handler_users;

// File: routes/api/users/[id].ts
import { handler_users_id } from "../../../api-routes.ts";
export const handler = handler_users_id;

// File: routes/api/auth/login.ts
import { handler_auth_login } from "../../../api-routes.ts";
export const handler = handler_auth_login;

// File: routes/api/auth/register.ts
import { handler_auth_register } from "../../../api-routes.ts";
export const handler = handler_auth_register;
*/