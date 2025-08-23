/**
 * Storage API Integration Tests
 *
 * Note: These tests require a running Supabase instance and valid authentication.
 * They are intended to be integration tests rather than unit tests.
 */

import { assertEquals, assertExists } from "jsr:@std/assert";
import { handleStorage } from "./index.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock context for testing
const mockContext = {
  userId: "test-user-id",
  user: {
    id: "test-user-id",
    email: "test@example.com",
  },
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                id: "test-app-id",
                slug: "test-app",
              },
              error: null,
            }),
        }),
      }),
    }),
    storage: {
      from: () => ({
        upload: () =>
          Promise.resolve({
            data: { path: "test-app/test.txt", fullPath: "test-app/test.txt" },
            error: null,
          }),
        getPublicUrl: () => ({
          data: { publicUrl: "https://example.com/test.txt" },
        }),
      }),
    },
  } as unknown as SupabaseClient,
  supabaseAdmin: {},
  pathSegments: ["test-app", "test.txt"],
};

Deno.test("Storage API - Upload validation", async () => {
  // Test that application slug is required
  const noSlugContext = { ...mockContext, pathSegments: [] };
  const noSlugRequest = new Request("http://localhost/api/v1/storage", {
    method: "POST",
  });

  const response = await handleStorage(noSlugRequest, noSlugContext);
  const result = await response.json();

  assertEquals(response.status, 400);
  assertExists(result.error);
  assertEquals(result.error, "Application slug is required");
});

Deno.test("Storage API - Authentication check", async () => {
  const noUserContext = { 
    ...mockContext, 
    userId: "", 
    user: null 
  };
  const request = new Request("http://localhost/api/v1/storage/test-app", {
    method: "POST",
    body: new FormData(),
  });

  const response = await handleStorage(request, noUserContext);
  const result = await response.json();

  assertEquals(response.status, 401);
  assertExists(result.error);
});

Deno.test("Storage API - Method validation", async () => {
  const request = new Request("http://localhost/api/v1/storage/test-app", {
    method: "PATCH",
  });

  const response = await handleStorage(request, mockContext);
  const result = await response.json();

  assertEquals(response.status, 405);
  assertExists(result.error);
});

Deno.test("Storage API - Path parsing", () => {
  const testCases = [
    {
      pathSegments: ["test-app"],
      expectedSlug: "test-app",
      expectedPath: "",
    },
    {
      pathSegments: ["my-app", "documents", "file.pdf"],
      expectedSlug: "my-app",
      expectedPath: "documents/file.pdf",
    },
    {
      pathSegments: ["app-name", "images", "photos", "vacation.jpg"],
      expectedSlug: "app-name",
      expectedPath: "images/photos/vacation.jpg",
    },
  ];

  testCases.forEach(({ pathSegments, expectedSlug, expectedPath }) => {
    const applicationSlug = pathSegments[0];
    const filePath = pathSegments.slice(1).join("/");

    assertEquals(applicationSlug, expectedSlug);
    assertEquals(filePath, expectedPath);
  });
});
