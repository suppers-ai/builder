// Simple tests for API route generator

import { generateRouteHandler, generateRouteHandlers } from "./route-generator.ts";
import { HttpMethod } from "@json-app-compiler/shared";
import type { ApiEndpoint } from "@json-app-compiler/shared";

// Simple test for route generation
console.log("Testing route generator...");

// Test endpoint
const endpoint: ApiEndpoint = {
  path: "/users",
  methods: ["GET", "POST"] as HttpMethod[],
  handler: "UsersHandler",
};

// Generate route handler
const routeHandler = generateRouteHandler(endpoint);
console.log("Generated route handler:", {
  path: routeHandler.path,
  methods: routeHandler.methods,
  middleware: routeHandler.middleware,
});

// Test multiple endpoints
const endpoints: ApiEndpoint[] = [
  {
    path: "/users",
    methods: ["GET", "POST"] as HttpMethod[],
    handler: "UsersHandler",
  },
  {
    path: "/users/:id",
    methods: ["GET", "PUT", "DELETE"] as HttpMethod[],
    handler: "UserHandler",
  },
];

// Generate route handlers
const handlers = generateRouteHandlers(endpoints);
console.log("Generated route handlers:", Object.keys(handlers));

console.log("Tests completed successfully!");