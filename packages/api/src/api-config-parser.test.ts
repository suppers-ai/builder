// Tests for API configuration parser

import { assertEquals, assertExists, assertArrayIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { parseApiConfig, validateApiEndpoint } from "./api-config-parser.ts";
import { HttpMethod } from "@json-app-compiler/shared";

Deno.test("parseApiConfig - valid configuration", () => {
  const apiConfig = {
    endpoints: [
      {
        path: "/users",
        methods: ["GET", "POST"] as HttpMethod[],
        handler: "UsersHandler",
      },
      {
        path: "/users/:id",
        methods: ["GET", "PUT", "DELETE"] as HttpMethod[],
        handler: "UserHandler",
        middleware: ["auth"],
      },
    ],
    middleware: [
      {
        name: "cors",
        config: {
          origin: "*",
        },
      },
      {
        name: "rateLimit",
        order: 1,
      },
    ],
    auth: {
      provider: "jwt",
      config: {
        secret: "test-secret",
      },
    },
    cors: {
      origin: "*",
    },
  };

  const result = parseApiConfig(apiConfig);
  
  assertEquals(result.errors.length, 0);
  assertEquals(result.endpoints.length, 2);
  assertEquals(result.globalMiddleware.length, 2);
  assertExists(result.authConfig);
  assertExists(result.corsConfig);
  
  // Check that middleware is included
  assertArrayIncludes(result.globalMiddleware, ["cors", "rateLimit"]);
});

Deno.test("parseApiConfig - with base path", () => {
  const apiConfig = {
    endpoints: [
      {
        path: "/users",
        methods: ["GET"] as HttpMethod[],
        handler: "UsersHandler",
      },
    ],
  };

  const result = parseApiConfig(apiConfig, { basePath: "/api/v1" });
  
  assertEquals(result.errors.length, 0);
  assertEquals(result.endpoints.length, 1);
  assertEquals(result.endpoints[0].path, "/api/v1/users");
});

Deno.test("parseApiConfig - with default middleware", () => {
  const apiConfig = {
    endpoints: [
      {
        path: "/users",
        methods: ["GET"] as HttpMethod[],
        handler: "UsersHandler",
      },
    ],
  };

  const result = parseApiConfig(apiConfig, { defaultMiddleware: ["logger", "cors"] });
  
  assertEquals(result.errors.length, 0);
  assertEquals(result.globalMiddleware.length, 2);
  assertEquals(result.globalMiddleware[0], "logger");
  assertEquals(result.globalMiddleware[1], "cors");
});

Deno.test("parseApiConfig - invalid configuration", () => {
  const apiConfig = {
    endpoints: [
      {
        // Missing path
        methods: ["GET"] as HttpMethod[],
        handler: "UsersHandler",
      },
    ],
  };

  const result = parseApiConfig(apiConfig);
  
  assertEquals(result.errors.length > 0, true);
  assertEquals(result.endpoints.length, 0);
});

Deno.test("parseApiConfig - non-strict mode", () => {
  const apiConfig = {
    endpoints: [
      {
        // Missing path
        methods: ["GET"] as HttpMethod[],
        handler: "UsersHandler",
      },
    ],
  };

  const result = parseApiConfig(apiConfig, { strict: false });
  
  // In non-strict mode, validation errors become warnings
  assertEquals(result.errors.length, 0);
  // Should have warnings
  assertEquals(result.warnings.length > 0, true);
});

Deno.test("validateApiEndpoint - valid endpoint", () => {
  const endpoint = {
    path: "/users",
    methods: ["GET", "POST"] as HttpMethod[],
    handler: "UsersHandler",
  };

  const errors = validateApiEndpoint(endpoint);
  
  assertEquals(errors.length, 0);
});

Deno.test("validateApiEndpoint - invalid path", () => {
  const endpoint = {
    path: "users", // Missing leading slash
    methods: ["GET"] as HttpMethod[],
    handler: "UsersHandler",
  };

  const errors = validateApiEndpoint(endpoint);
  
  assertEquals(errors.length, 1);
  assertEquals(errors[0].message, "API endpoint path must start with a forward slash");
});

Deno.test("validateApiEndpoint - invalid methods", () => {
  const endpoint = {
    path: "/users",
    methods: ["INVALID"] as unknown as HttpMethod[],
    handler: "UsersHandler",
  };

  const errors = validateApiEndpoint(endpoint);
  
  assertEquals(errors.length, 1);
  assertEquals(errors[0].message, "API endpoint contains invalid HTTP methods");
});

Deno.test("validateApiEndpoint - missing handler", () => {
  const endpoint = {
    path: "/users",
    methods: ["GET"] as HttpMethod[],
    // Missing handler
  } as unknown as any;

  const errors = validateApiEndpoint(endpoint);
  
  assertEquals(errors.length, 1);
  assertEquals(errors[0].message, "API endpoint must have a handler");
});

Deno.test("validateApiEndpoint - invalid validation schema", () => {
  const endpoint = {
    path: "/users",
    methods: ["POST"] as HttpMethod[],
    handler: "UsersHandler",
    validation: {
      body: {
        name: {
          // Missing type
        },
      },
    },
  } as unknown as any;

  const errors = validateApiEndpoint(endpoint);
  
  assertEquals(errors.length, 1);
  assertEquals(errors[0].message, "Field name in body schema is missing a type");
});