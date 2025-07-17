// Tests for API handlers

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { BaseApiHandler, createCrudHandler, type CrudConfig } from "./handlers.ts";
import { HttpStatus } from "@json-app-compiler/shared";

// Mock FreshContext for testing
function createMockContext(params: Record<string, string> = {}) {
  return {
    params,
    next: () => Promise.resolve(new Response()),
  } as any;
}

// Mock ValidatedRequest for testing
function createMockRequest(
  method: string,
  body?: Record<string, unknown>,
  query?: Record<string, unknown>
) {
  const url = new URL("http://localhost/api/test");
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const request = new Request(url.toString(), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { "Content-Type": "application/json" } : undefined,
  }) as any;

  if (body) {
    request.validatedBody = body;
  }
  if (query) {
    request.validatedQuery = query;
  }

  return request;
}

Deno.test("BaseApiHandler - create operation", async () => {
  const config: CrudConfig = {
    resource: "users",
    operations: ["create"],
  };

  const handler = new BaseApiHandler(config);
  const req = createMockRequest("POST", { name: "John Doe", email: "john@example.com" });
  const ctx = createMockContext();

  const response = await handler.create(req, ctx);
  assertEquals(response.status, HttpStatus.CREATED);

  const data = await response.json();
  assertEquals(data.success, true);
  assertExists(data.data.id);
  assertEquals(data.data.name, "John Doe");
  assertEquals(data.data.email, "john@example.com");
  assertExists(data.data.createdAt);
  assertExists(data.data.updatedAt);
});

Deno.test("BaseApiHandler - read operation", async () => {
  const config: CrudConfig = {
    resource: "users",
    operations: ["read"],
  };

  const handler = new BaseApiHandler(config);
  const req = createMockRequest("GET");
  const ctx = createMockContext({ id: "123" });

  const response = await handler.read(req, ctx);
  assertEquals(response.status, HttpStatus.OK);

  const data = await response.json();
  assertEquals(data.success, true);
  assertEquals(data.data.id, "123");
  assertEquals(data.data.name, "Sample users");
});

Deno.test("BaseApiHandler - update operation", async () => {
  const config: CrudConfig = {
    resource: "users",
    operations: ["update"],
  };

  const handler = new BaseApiHandler(config);
  const req = createMockRequest("PUT", { name: "Jane Doe" });
  const ctx = createMockContext({ id: "123" });

  const response = await handler.update(req, ctx);
  assertEquals(response.status, HttpStatus.OK);

  const data = await response.json();
  assertEquals(data.success, true);
  assertEquals(data.data.id, "123");
  assertEquals(data.data.name, "Jane Doe");
  assertExists(data.data.updatedAt);
});

Deno.test("BaseApiHandler - delete operation", async () => {
  const config: CrudConfig = {
    resource: "users",
    operations: ["delete"],
  };

  const handler = new BaseApiHandler(config);
  const req = createMockRequest("DELETE");
  const ctx = createMockContext({ id: "123" });

  const response = await handler.delete(req, ctx);
  assertEquals(response.status, HttpStatus.NO_CONTENT);

  const data = await response.json();
  assertEquals(data.success, true);
  assertEquals(data.data.id, "123");
  assertEquals(data.data.deleted, true);
});

Deno.test("BaseApiHandler - list operation", async () => {
  const config: CrudConfig = {
    resource: "users",
    operations: ["list"],
  };

  const handler = new BaseApiHandler(config);
  const req = createMockRequest("GET", undefined, { page: "2", limit: "5" });
  const ctx = createMockContext();

  const response = await handler.list(req, ctx);
  assertEquals(response.status, HttpStatus.OK);

  const data = await response.json();
  assertEquals(data.success, true);
  assertEquals(Array.isArray(data.data), true);
  assertEquals(data.data.length, 5);
  assertExists(data.meta.pagination);
  assertEquals(data.meta.pagination.page, 2);
  assertEquals(data.meta.pagination.limit, 5);
});

Deno.test("BaseApiHandler - handle method routing", async () => {
  const config: CrudConfig = {
    resource: "users",
    operations: ["create", "read", "update", "delete", "list"],
  };

  const handler = new BaseApiHandler(config);

  // Test GET without ID (should route to list)
  const listReq = createMockRequest("GET");
  const listCtx = createMockContext();
  const listResponse = await handler.handle(listReq, listCtx);
  assertEquals(listResponse.status, HttpStatus.OK);
  const listData = await listResponse.json();
  assertEquals(Array.isArray(listData.data), true);

  // Test GET with ID (should route to read)
  const readReq = createMockRequest("GET");
  const readCtx = createMockContext({ id: "123" });
  const readResponse = await handler.handle(readReq, readCtx);
  assertEquals(readResponse.status, HttpStatus.OK);
  const readData = await readResponse.json();
  assertEquals(readData.data.id, "123");

  // Test POST (should route to create)
  const createReq = createMockRequest("POST", { name: "Test" });
  const createCtx = createMockContext();
  const createResponse = await handler.handle(createReq, createCtx);
  assertEquals(createResponse.status, HttpStatus.CREATED);
});

Deno.test("BaseApiHandler - error handling", async () => {
  const config: CrudConfig = {
    resource: "users",
    operations: ["create"],
  };

  const handler = new BaseApiHandler(config);

  // Test create without body
  const req = createMockRequest("POST");
  const ctx = createMockContext();

  const response = await handler.create(req, ctx);
  assertEquals(response.status, HttpStatus.BAD_REQUEST);

  const data = await response.json();
  assertEquals(data.success, false);
  assertEquals(data.error.code, "MISSING_BODY");
});

Deno.test("BaseApiHandler - method not allowed", async () => {
  const config: CrudConfig = {
    resource: "users",
    operations: ["create"],
  };

  const handler = new BaseApiHandler(config);
  const req = createMockRequest("PATCH");
  const ctx = createMockContext();

  const response = await handler.handle(req, ctx);
  assertEquals(response.status, HttpStatus.METHOD_NOT_ALLOWED);

  const data = await response.json();
  assertEquals(data.success, false);
  assertEquals(data.error.code, "METHOD_NOT_ALLOWED");
});

Deno.test("createCrudHandler factory", () => {
  const config: CrudConfig = {
    resource: "posts",
    operations: ["create", "read"],
  };

  const handler = createCrudHandler(config);
  assertExists(handler);
  assertEquals(handler instanceof BaseApiHandler, true);
});