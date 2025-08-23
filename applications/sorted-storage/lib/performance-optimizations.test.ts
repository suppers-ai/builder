/**
 * Tests for performance optimizations
 * Requirements: 8.1, 8.3, 8.5
 */

import { assertEquals, assertExists } from "@std/assert";
import { cacheInvalidation, cacheKeys, CacheManager } from "./cache-manager.ts";
import { optimisticHelpers, OptimisticUpdatesManager } from "./optimistic-updates.ts";
import { performanceMonitoring, queryOptimizations } from "./database-optimizations.ts";

Deno.test("CacheManager - basic operations", async () => {
  const cache = new CacheManager<string>({ ttl: 1000, maxSize: 3 });

  try {
    // Test set and get
    cache.set("key1", "value1");
    assertEquals(cache.get("key1"), "value1");

    // Test has
    assertEquals(cache.has("key1"), true);
    assertEquals(cache.has("nonexistent"), false);

    // Test delete
    assertEquals(cache.delete("key1"), true);
    assertEquals(cache.get("key1"), null);
  } finally {
    cache.destroy();
  }
});

Deno.test("CacheManager - TTL expiration", async () => {
  const cache = new CacheManager<string>({ ttl: 50 }); // 50ms TTL

  try {
    cache.set("key1", "value1");
    assertEquals(cache.get("key1"), "value1");

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 100));

    assertEquals(cache.get("key1"), null);
  } finally {
    cache.destroy();
  }
});

Deno.test("CacheManager - LRU eviction", () => {
  const cache = new CacheManager<string>({ maxSize: 2 });

  try {
    cache.set("key1", "value1");
    cache.set("key2", "value2");
    cache.set("key3", "value3"); // Should evict key1

    assertEquals(cache.get("key1"), null);
    assertEquals(cache.get("key2"), "value2");
    assertEquals(cache.get("key3"), "value3");
  } finally {
    cache.destroy();
  }
});

Deno.test("CacheManager - getOrSet", async () => {
  const cache = new CacheManager<string>({ ttl: 1000 });
  let callCount = 0;

  try {
    const factory = async () => {
      callCount++;
      return "computed-value";
    };

    // First call should execute factory
    const result1 = await cache.getOrSet("key1", factory);
    assertEquals(result1, "computed-value");
    assertEquals(callCount, 1);

    // Second call should use cache
    const result2 = await cache.getOrSet("key1", factory);
    assertEquals(result2, "computed-value");
    assertEquals(callCount, 1); // Should not increment
  } finally {
    cache.destroy();
  }
});

Deno.test("CacheManager - pattern invalidation", () => {
  const cache = new CacheManager<string>();

  try {
    cache.set("user:1:profile", "profile1");
    cache.set("user:1:settings", "settings1");
    cache.set("user:2:profile", "profile2");
    cache.set("other:data", "data");

    const invalidated = cache.invalidatePattern(/^user:1:/);
    assertEquals(invalidated, 2);

    assertEquals(cache.get("user:1:profile"), null);
    assertEquals(cache.get("user:1:settings"), null);
    assertEquals(cache.get("user:2:profile"), "profile2");
    assertEquals(cache.get("other:data"), "data");
  } finally {
    cache.destroy();
  }
});

Deno.test("CacheManager - statistics", () => {
  const cache = new CacheManager<string>();

  try {
    cache.set("key1", "value1");

    // Generate some hits and misses
    cache.get("key1"); // hit
    cache.get("key1"); // hit
    cache.get("nonexistent"); // miss

    const stats = cache.getStats();
    assertEquals(stats.hits, 2);
    assertEquals(stats.misses, 1);
    assertEquals(stats.hitRate, 2 / 3);
    assertEquals(stats.size, 1);
  } finally {
    cache.destroy();
  }
});

Deno.test("OptimisticUpdatesManager - create operation", async () => {
  const manager = new OptimisticUpdatesManager<{ id: string; name: string }>();

  manager.setItems([
    { id: "1", name: "item1" },
    { id: "2", name: "item2" },
  ]);

  const tempItem = { id: "temp-3", name: "temp-item" };
  const promise = Promise.resolve({ id: "3", name: "actual-item" });

  const updateId = manager.optimisticCreate(tempItem, promise);

  // Should immediately show optimistic item
  const optimisticItems = manager.getOptimisticItems();
  assertEquals(optimisticItems.length, 3);
  assertEquals(optimisticItems[2], tempItem);

  // Wait for promise resolution
  await promise;

  // Should eventually show actual item
  await new Promise((resolve) => setTimeout(resolve, 10));
  const finalItems = manager.getOptimisticItems();
  assertEquals(finalItems.length, 3);
  assertEquals(finalItems[2].id, "3");
  assertEquals(finalItems[2].name, "actual-item");
});

Deno.test("OptimisticUpdatesManager - update operation", async () => {
  const manager = new OptimisticUpdatesManager<{ id: string; name: string }>();

  manager.setItems([
    { id: "1", name: "item1" },
    { id: "2", name: "item2" },
  ]);

  const updatedItem = { id: "1", name: "updated-item" };
  const promise = Promise.resolve({ id: "1", name: "final-item" });

  manager.optimisticUpdate(updatedItem, promise);

  // Should immediately show optimistic update
  const optimisticItems = manager.getOptimisticItems();
  assertEquals(optimisticItems[0].name, "updated-item");

  // Wait for promise resolution
  await promise;
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Should show final update
  const finalItems = manager.getOptimisticItems();
  assertEquals(finalItems[0].name, "final-item");
});

Deno.test("OptimisticUpdatesManager - delete operation", async () => {
  const manager = new OptimisticUpdatesManager<{ id: string; name: string }>();

  manager.setItems([
    { id: "1", name: "item1" },
    { id: "2", name: "item2" },
  ]);

  const itemToDelete = { id: "1", name: "item1" };
  const promise = Promise.resolve();

  manager.optimisticDelete(itemToDelete, promise);

  // Should immediately hide item
  const optimisticItems = manager.getOptimisticItems();
  assertEquals(optimisticItems.length, 1);
  assertEquals(optimisticItems[0].id, "2");

  // Wait for promise resolution
  await promise;
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Should remain deleted
  const finalItems = manager.getOptimisticItems();
  assertEquals(finalItems.length, 1);
});

Deno.test("OptimisticUpdatesManager - rollback on error", async () => {
  const manager = new OptimisticUpdatesManager<{ id: string; name: string }>();

  try {
    manager.setItems([
      { id: "1", name: "item1" },
    ]);

    const tempItem = { id: "temp-2", name: "temp-item" };
    const promise = Promise.reject(new Error("API Error"));
    let rollbackCalled = false;

    manager.optimisticCreate(tempItem, promise, () => {
      rollbackCalled = true;
    });

    // Should immediately show optimistic item
    assertEquals(manager.getOptimisticItems().length, 2);

    // Wait for promise rejection
    try {
      await promise;
    } catch {
      // Expected
    }

    // Give a moment for the error handling to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should rollback to original state
    assertEquals(manager.getOptimisticItems().length, 1);
    assertEquals(rollbackCalled, true);
    assertEquals(manager.getErrors().length, 1);
  } finally {
    manager.destroy();
  }
});

Deno.test("optimisticHelpers - createOptimisticFile", () => {
  const file = new File(["content"], "test.txt", { type: "text/plain" });
  const optimisticFile = optimisticHelpers.createOptimisticFile(file, "folder-1");

  assertEquals(optimisticFile.name, "test.txt");
  assertEquals(optimisticFile.file_size, 7); // "content" length
  assertEquals(optimisticFile.mime_type, "text/plain");
  assertEquals(optimisticFile.parent_id, "folder-1");
  assertEquals(optimisticFile.object_type, "file");
  assertExists(optimisticFile.id);
  assertEquals(optimisticFile.metadata.upload_status, "uploading");
});

Deno.test("optimisticHelpers - createOptimisticFolder", () => {
  const optimisticFolder = optimisticHelpers.createOptimisticFolder("My Folder", "parent-1");

  assertEquals(optimisticFolder.name, "My Folder");
  assertEquals(optimisticFolder.parent_id, "parent-1");
  assertEquals(optimisticFolder.object_type, "folder");
  assertEquals(optimisticFolder.mime_type, "application/x-folder");
  assertEquals(optimisticFolder.file_size, 0);
  assertExists(optimisticFolder.id);
  assertEquals(optimisticFolder.metadata.creation_status, "creating");
});

Deno.test("cacheKeys - generate consistent keys", () => {
  assertEquals(cacheKeys.storageObjects(), "storage-objects:root");
  assertEquals(cacheKeys.storageObjects("folder-1"), "storage-objects:folder-1");
  assertEquals(cacheKeys.folderStructure("folder-1"), "folder-structure:folder-1");
  assertEquals(cacheKeys.thumbnail("file-1"), "thumbnail:file-1");
});

Deno.test("queryOptimizations - buildWhereClause", () => {
  const result = queryOptimizations.buildWhereClause({
    userId: "user-1",
    parentId: "folder-1",
    objectType: "file",
    mimeTypes: ["image/jpeg", "image/png"],
  });

  assertEquals(result.params[0], "user-1");
  assertEquals(result.params[1], "folder-1");
  assertEquals(result.params[2], "file");
  assertEquals(result.params[3], ["image/jpeg", "image/png"]);

  const expectedConditions = [
    "user_id = $1",
    "parent_id = $2",
    "object_type = $3",
    "mime_type = ANY($4)",
  ];
  assertEquals(result.whereClause, expectedConditions.join(" AND "));
});

Deno.test("queryOptimizations - buildOrderByClause", () => {
  const nameAsc = queryOptimizations.buildOrderByClause("name", "asc");
  assertEquals(nameAsc, "ORDER BY CASE WHEN object_type = 'folder' THEN 0 ELSE 1 END, name ASC");

  const dateDesc = queryOptimizations.buildOrderByClause("created_at", "desc");
  assertEquals(
    dateDesc,
    "ORDER BY CASE WHEN object_type = 'folder' THEN 0 ELSE 1 END, created_at DESC",
  );
});

Deno.test("queryOptimizations - buildPaginationClause", () => {
  const page1 = queryOptimizations.buildPaginationClause(1, 20);
  assertEquals(page1.clause, "LIMIT 20 OFFSET 0");
  assertEquals(page1.offset, 0);
  assertEquals(page1.limit, 20);

  const page3 = queryOptimizations.buildPaginationClause(3, 10);
  assertEquals(page3.clause, "LIMIT 10 OFFSET 20");
  assertEquals(page3.offset, 20);
  assertEquals(page3.limit, 10);
});

Deno.test("performanceMonitoring - measureQuery", async () => {
  let loggedQuery = "";
  let loggedDuration = 0;

  // Mock console.debug
  const originalDebug = console.debug;
  console.debug = (message: string) => {
    if (message.includes("Query")) {
      loggedQuery = message;
      const match = message.match(/(\d+\.\d+)ms/);
      if (match) {
        loggedDuration = parseFloat(match[1]);
      }
    }
  };

  try {
    const result = await performanceMonitoring.measureQuery(
      "test-query",
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "result";
      },
    );

    assertEquals(result, "result");
    assertEquals(loggedQuery.includes("test-query"), true);
    assertEquals(loggedDuration > 0, true);
  } finally {
    console.debug = originalDebug;
  }
});
