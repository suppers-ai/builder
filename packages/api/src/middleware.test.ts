// Tests for API middleware

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { 
  createValidationMiddleware, 
  createCorsMiddleware, 
  createRateLimitMiddleware,
  type ValidationMiddlewareOptions 
} from "./middleware.ts";
import { HttpStatus } from "@json-app-compiler/shared";
import type { ValidationSchema } from "@json-app-compiler/shared";

// Mock FreshContext for testing
function createMockContext() {
  return {
    params: {},
    next: () => Promise.resolve(new Response("OK", { status: 200 })),
  } as any;
}

// Create mock request
function createMockRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>
) {
  const requestInit: RequestInit = {
    method,
    headers: headers || {},
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
    requestInit.headers = {
      ...requestInit.headers,
      "Content-Type": "application/json",
    };
  }

  return new Request(url, requestInit);
}

Deno.test("Validation middleware - valid request body", async () => {
  const schema: ValidationSchema = {
    body: {
      name: { type: "string", required: true, min: 2, max: 50 },
      email: { type: "string", required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" },
      age: { type: "number", min: 0, max: 120 },
    },
  };

  const middleware = createValidationMiddleware({ schema });
  const req = createMockRequest("POST", "http://localhost/api/users", {
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  });
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, 200);
});

Deno.test("Validation middleware - invalid request body", async () => {
  const schema: ValidationSchema = {
    body: {
      name: { type: "string", required: true, min: 2, max: 50 },
      email: { type: "string", required: true, pattern: "^[^@]+@[^@]+\\.[^@]+$" },
    },
  };

  const middleware = createValidationMiddleware({ schema });
  const req = createMockRequest("POST", "http://localhost/api/users", {
    name: "A", // Too short
    email: "invalid-email", // Invalid format
  });
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, HttpStatus.BAD_REQUEST);

  const data = await response.json();
  assertEquals(data.success, false);
  assertEquals(data.error.code, "VALIDATION_ERROR");
  assertExists(data.validationErrors);
  assertEquals(Array.isArray(data.validationErrors), true);
});

Deno.test("Validation middleware - missing required fields", async () => {
  const schema: ValidationSchema = {
    body: {
      name: { type: "string", required: true },
      email: { type: "string", required: true },
    },
  };

  const middleware = createValidationMiddleware({ schema });
  const req = createMockRequest("POST", "http://localhost/api/users", {
    name: "John Doe",
    // email is missing
  });
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, HttpStatus.BAD_REQUEST);

  const data = await response.json();
  assertEquals(data.success, false);
  assertExists(data.validationErrors);
  const emailError = data.validationErrors.find((err: any) => err.field === "body.email");
  assertExists(emailError);
  assertEquals(emailError.code, "REQUIRED_FIELD_MISSING");
});

Deno.test("Validation middleware - query parameters", async () => {
  const schema: ValidationSchema = {
    query: {
      page: { type: "number", min: 1 },
      limit: { type: "number", min: 1, max: 100 },
      search: { type: "string", max: 100 },
    },
  };

  const middleware = createValidationMiddleware({ schema });
  const req = createMockRequest("GET", "http://localhost/api/users?page=2&limit=10&search=john");
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, 200);
});

Deno.test("Validation middleware - invalid query parameters", async () => {
  const schema: ValidationSchema = {
    query: {
      page: { type: "number", min: 1 },
      limit: { type: "number", min: 1, max: 100 },
    },
  };

  const middleware = createValidationMiddleware({ schema });
  const req = createMockRequest("GET", "http://localhost/api/users?page=0&limit=200");
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, HttpStatus.BAD_REQUEST);

  const data = await response.json();
  assertEquals(data.success, false);
  assertExists(data.validationErrors);
  assertEquals(data.validationErrors.length, 2); // page and limit violations
});

Deno.test("Validation middleware - enum validation", async () => {
  const schema: ValidationSchema = {
    body: {
      status: { type: "string", required: true, enum: ["active", "inactive", "pending"] },
    },
  };

  const middleware = createValidationMiddleware({ schema });
  
  // Valid enum value
  const validReq = createMockRequest("POST", "http://localhost/api/users", {
    status: "active",
  });
  const validCtx = createMockContext();
  const validResponse = await middleware(validReq, validCtx);
  assertEquals(validResponse.status, 200);

  // Invalid enum value
  const invalidReq = createMockRequest("POST", "http://localhost/api/users", {
    status: "unknown",
  });
  const invalidCtx = createMockContext();
  const invalidResponse = await middleware(invalidReq, invalidCtx);
  assertEquals(invalidResponse.status, HttpStatus.BAD_REQUEST);

  const data = await invalidResponse.json();
  const statusError = data.validationErrors.find((err: any) => err.field === "body.status");
  assertEquals(statusError.code, "ENUM_VIOLATION");
});

Deno.test("CORS middleware - basic functionality", async () => {
  const middleware = createCorsMiddleware({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  });

  const req = createMockRequest("GET", "http://localhost/api/users");
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  assertEquals(response.headers.get("Access-Control-Allow-Methods"), "GET, POST");
  assertEquals(response.headers.get("Access-Control-Allow-Headers"), "Content-Type");
});

Deno.test("CORS middleware - preflight request", async () => {
  const middleware = createCorsMiddleware({
    origin: "*",
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const req = createMockRequest("OPTIONS", "http://localhost/api/users");
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, 204);
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  assertEquals(response.headers.get("Access-Control-Allow-Methods"), "GET, POST, PUT");
  assertEquals(response.headers.get("Access-Control-Allow-Headers"), "Content-Type, Authorization");
});

Deno.test("CORS middleware - specific origin", async () => {
  const middleware = createCorsMiddleware({
    origin: ["https://example.com", "https://app.example.com"],
    methods: ["GET", "POST"],
  });

  const req = createMockRequest("GET", "http://localhost/api/users", undefined, {
    "Origin": "https://example.com",
  });
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "https://example.com");
});

Deno.test("Rate limit middleware - within limits", async () => {
  const middleware = createRateLimitMiddleware({
    windowMs: 60000, // 1 minute
    maxRequests: 10,
    keyGenerator: () => "test-key",
  });

  const req = createMockRequest("GET", "http://localhost/api/users");
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("X-RateLimit-Limit"), "10");
  assertEquals(response.headers.get("X-RateLimit-Remaining"), "9");
  assertExists(response.headers.get("X-RateLimit-Reset"));
});

Deno.test("Rate limit middleware - exceeds limits", async () => {
  const middleware = createRateLimitMiddleware({
    windowMs: 60000, // 1 minute
    maxRequests: 2,
    keyGenerator: () => "test-key-2",
  });

  const req = createMockRequest("GET", "http://localhost/api/users");
  const ctx = createMockContext();

  // First request - should pass
  const response1 = await middleware(req, ctx);
  assertEquals(response1.status, 200);

  // Second request - should pass
  const response2 = await middleware(req, ctx);
  assertEquals(response2.status, 200);

  // Third request - should be rate limited
  const response3 = await middleware(req, ctx);
  assertEquals(response3.status, HttpStatus.TOO_MANY_REQUESTS);

  const data = await response3.json();
  assertEquals(data.success, false);
  assertEquals(data.error.code, "RATE_LIMIT_EXCEEDED");
});

Deno.test("Validation middleware - type conversion", async () => {
  const schema: ValidationSchema = {
    query: {
      page: { type: "number" },
      active: { type: "boolean" },
    },
  };

  const middleware = createValidationMiddleware({ schema });
  const req = createMockRequest("GET", "http://localhost/api/users?page=5&active=true");
  const ctx = createMockContext();

  const response = await middleware(req, ctx);
  assertEquals(response.status, 200);
  
  // Check that the validated request has converted types
  const validatedReq = req as any;
  assertEquals(typeof validatedReq.validatedQuery?.page, "number");
  assertEquals(validatedReq.validatedQuery?.page, 5);
  assertEquals(typeof validatedReq.validatedQuery?.active, "boolean");
  assertEquals(validatedReq.validatedQuery?.active, true);
});

Deno.test("Validation middleware - array validation", async () => {
  const schema: ValidationSchema = {
    body: {
      tags: { type: "array", min: 1, max: 5 },
      categories: { type: "array", required: true },
    },
  };

  const middleware = createValidationMiddleware({ schema });
  
  // Valid array
  const validReq = createMockRequest("POST", "http://localhost/api/posts", {
    tags: ["javascript", "deno"],
    categories: ["tech"],
  });
  const validCtx = createMockContext();
  const validResponse = await middleware(validReq, validCtx);
  assertEquals(validResponse.status, 200);

  // Invalid array (too many items)
  const invalidReq = createMockRequest("POST", "http://localhost/api/posts", {
    tags: ["a", "b", "c", "d", "e", "f"], // 6 items, max is 5
    categories: ["tech"],
  });
  const invalidCtx = createMockContext();
  const invalidResponse = await middleware(invalidReq, invalidCtx);
  assertEquals(invalidResponse.status, HttpStatus.BAD_REQUEST);

  const data = await invalidResponse.json();
  const tagsError = data.validationErrors.find((err: any) => err.field === "body.tags");
  assertEquals(tagsError.code, "MAX_ITEMS_VIOLATION");
});