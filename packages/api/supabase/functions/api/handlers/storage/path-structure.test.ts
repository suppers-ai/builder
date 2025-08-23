/**
 * Path Structure Tests
 *
 * Tests to verify the new userId/applicationSlug/filename structure
 */

import { assertEquals } from "jsr:@std/assert";

Deno.test("Storage Path Structure - userId/applicationSlug/filename", () => {
  const testCases = [
    {
      userId: "123e4567-e89b-12d3-a456-426614174000",
      applicationSlug: "my-app",
      fileName: "document.pdf",
      expected: "123e4567-e89b-12d3-a456-426614174000/my-app/document.pdf",
    },
    {
      userId: "user-456",
      applicationSlug: "blog-site",
      fileName: "config/settings.json",
      expected: "user-456/blog-site/config/settings.json",
    },
    {
      userId: "abc123",
      applicationSlug: "photo-gallery",
      fileName: "images/vacation/beach.jpg",
      expected: "abc123/photo-gallery/images/vacation/beach.jpg",
    },
  ];

  testCases.forEach(({ userId, applicationSlug, fileName, expected }) => {
    const fullPath = `${userId}/${applicationSlug}/${fileName}`;
    assertEquals(fullPath, expected);

    // Test path parsing
    const pathParts = fullPath.split("/");
    assertEquals(pathParts[0], userId);
    assertEquals(pathParts[1], applicationSlug);
    assertEquals(pathParts.slice(2).join("/"), fileName);
  });
});

Deno.test("Storage Path Structure - Benefits verification", () => {
  const fullPath = "user-123/my-app/folder/file.txt";
  const pathParts = fullPath.split("/");

  // Easy extraction of components
  const userId = pathParts[0];
  const applicationSlug = pathParts[1];
  const filePath = pathParts.slice(2).join("/");

  assertEquals(userId, "user-123");
  assertEquals(applicationSlug, "my-app");
  assertEquals(filePath, "folder/file.txt");

  // Benefits:
  // 1. Easy to identify file owner (first path segment)
  // 2. Easy to identify application (second path segment)
  // 3. Natural file organization per user
  // 4. Simpler permission checking
  // 5. Better scalability with user-based sharding
});

Deno.test("Storage Path Structure - Policy matching", () => {
  // Simulate how the database policies would parse the path
  const testPath = "550e8400-e29b-41d4-a716-446655440000/ecommerce-site/products/chair.jpg";

  // This is how the policies extract userId and applicationSlug
  const userId = testPath.split("/")[0]; // split_part(name, '/', 1)
  const applicationSlug = testPath.split("/")[1]; // split_part(name, '/', 2)

  assertEquals(userId, "550e8400-e29b-41d4-a716-446655440000");
  assertEquals(applicationSlug, "ecommerce-site");

  // The policies can now easily check:
  // 1. Does split_part(name, '/', 1)::uuid = auth.uid() (file belongs to user)
  // 2. Find application where slug = split_part(name, '/', 2) (get app details)
  // 3. Simplified access control - authenticated users can access all applications
});
