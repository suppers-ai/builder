// Example Fresh 2.0 API route using the JSON App Compiler API handlers
// This would typically be placed in a Fresh app's routes/api/users/[id].ts file

import type { FreshContext } from "$fresh/server.ts";
import { 
  createCrudHandler, 
  createValidationMiddleware,
  type CrudConfig,
  type ValidationSchema 
} from "../mod.ts";

// Define the CRUD configuration for users
const usersCrudConfig: CrudConfig = {
  resource: "users",
  operations: ["create", "read", "update", "delete", "list"],
  validation: {
    create: {
      body: {
        name: { type: "string", required: true, min: 2, max: 50 },
        email: { type: "string", required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" },
        age: { type: "number", min: 0, max: 120 },
        role: { type: "string", enum: ["user", "admin", "moderator"] },
      },
    },
    update: {
      body: {
        name: { type: "string", min: 2, max: 50 },
        email: { type: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$" },
        age: { type: "number", min: 0, max: 120 },
        role: { type: "string", enum: ["user", "admin", "moderator"] },
      },
    },
    query: {
      page: { type: "number", min: 1 },
      limit: { type: "number", min: 1, max: 100 },
      search: { type: "string", max: 100 },
      role: { type: "string", enum: ["user", "admin", "moderator"] },
    },
  },
};

// Create the CRUD handler
const usersHandler = createCrudHandler(usersCrudConfig);

// Create validation middleware
const validationMiddleware = createValidationMiddleware({
  schema: usersCrudConfig.validation?.create || {},
});

// Fresh 2.0 route handlers
export async function handler(req: Request, ctx: FreshContext) {
  // Apply validation middleware first
  const validationResponse = await validationMiddleware(req, ctx);
  if (validationResponse.status !== 200) {
    return validationResponse;
  }

  // Handle the request with the CRUD handler
  return await usersHandler.handle(req as any, ctx);
}

// Alternative: Individual method handlers for more control
export async function GET(req: Request, ctx: FreshContext) {
  const hasId = ctx.params.id !== undefined;
  
  if (hasId) {
    return await usersHandler.read(req as any, ctx);
  } else {
    // Apply query validation for list operations
    const queryValidation: ValidationSchema = {
      query: usersCrudConfig.validation?.query,
    };
    
    const middleware = createValidationMiddleware({ schema: queryValidation });
    const validationResponse = await middleware(req, ctx);
    if (validationResponse.status !== 200) {
      return validationResponse;
    }
    
    return await usersHandler.list(req as any, ctx);
  }
}

export async function POST(req: Request, ctx: FreshContext) {
  // Apply create validation
  const createValidation: ValidationSchema = {
    body: usersCrudConfig.validation?.create?.body,
  };
  
  const middleware = createValidationMiddleware({ schema: createValidation });
  const validationResponse = await middleware(req, ctx);
  if (validationResponse.status !== 200) {
    return validationResponse;
  }
  
  return await usersHandler.create(req as any, ctx);
}

export async function PUT(req: Request, ctx: FreshContext) {
  // Apply update validation
  const updateValidation: ValidationSchema = {
    body: usersCrudConfig.validation?.update?.body,
  };
  
  const middleware = createValidationMiddleware({ schema: updateValidation });
  const validationResponse = await middleware(req, ctx);
  if (validationResponse.status !== 200) {
    return validationResponse;
  }
  
  return await usersHandler.update(req as any, ctx);
}

export async function DELETE(req: Request, ctx: FreshContext) {
  return await usersHandler.delete(req as any, ctx);
}