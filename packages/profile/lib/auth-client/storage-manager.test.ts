import { assertEquals, assertExists } from "@std/assert";
import { StorageManager } from "./storage-manager.ts";
import { EventManager } from "./event-manager.ts";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock File class for testing
class MockFile extends File {
  constructor(content: string, filename: string, options?: FilePropertyBag) {
    const blob = new Blob([content], options);
    super([blob], filename, options);
  }
}

// Mock Supabase client
function createMockSupabaseClient(options: {
  shouldSucceed?: boolean;
  shouldThrow?: boolean;
  errorMessage?: string;
  uploadData?: any;
  downloadData?: any;
  listData?: any;
} = {}): SupabaseClient {
  const { 
    shouldSucceed = true,
    shouldThrow = false,
    errorMessage = "Storage error",
    uploadData = { path: "test/file.txt" },
    downloadData = new Blob(["test content"]),
    listData = [{ name: "file1.txt", id: "1" }, { name: "file2.txt", id: "2" }]
  } = options;
  
  return {
    storage: {
      from: () => ({
        upload: async () => {
          if (shouldThrow) throw new Error("Network error");
          return shouldSucceed 
            ? { data: uploadData, error: null }
            : { data: null, error: { message: errorMessage } };
        },
        download: async () => {
          if (shouldThrow) throw new Error("Network error");
          return shouldSucceed 
            ? { data: downloadData, error: null }
            : { data: null, error: { message: errorMessage } };
        },
        list: async () => {
          if (shouldThrow) throw new Error("Network error");
          return shouldSucceed 
            ? { data: listData, error: null }
            : { data: null, error: { message: errorMessage } };
        },
        getPublicUrl: () => ({
          data: { publicUrl: "https://example.com/file.txt" }
        }),
        remove: async () => {
          if (shouldThrow) throw new Error("Network error");
          return shouldSucceed 
            ? { data: [{ name: "file.txt" }], error: null }
            : { data: null, error: { message: errorMessage } };
        }
      })
    },
    auth: {
      getSession: async () => ({
        data: { 
          session: { 
            access_token: "test-token",
            user: { id: "user-123" }
          } 
        },
        error: null
      })
    }
  } as any;
}

// Mock localStorage
const mockStorage = new Map<string, string>();
const originalLocalStorage = globalThis.localStorage;

function setupMockLocalStorage() {
  globalThis.localStorage = {
    getItem: (key: string) => mockStorage.get(key) || null,
    setItem: (key: string, value: string) => mockStorage.set(key, value),
    removeItem: (key: string) => mockStorage.delete(key),
    clear: () => mockStorage.clear(),
    length: mockStorage.size,
    key: (index: number) => Array.from(mockStorage.keys())[index] || null
  } as Storage;
}

function restoreLocalStorage() {
  globalThis.localStorage = originalLocalStorage;
  mockStorage.clear();
}

Deno.test("StorageManager - Initialization", async (t) => {
  setupMockLocalStorage();

  await t.step("should initialize with dependencies", () => {
    const storageManager = new StorageManager();
    const mockSupabase = createMockSupabaseClient();
    const eventManager = new EventManager();

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // Should not throw and should be ready for operations
    assertExists(storageManager);
  });

  await t.step("should handle missing dependencies gracefully", () => {
    const storageManager = new StorageManager();
    
    // Should not throw even without initialization
    assertExists(storageManager);
  });

  restoreLocalStorage();
});

Deno.test("StorageManager - File Upload", async (t) => {
  setupMockLocalStorage();

  await t.step("should upload file successfully", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // Mock authenticated state
    mockStorage.set("test_key", "user-123");

    const file = new MockFile("test content", "test.txt", { type: "text/plain" });
    const result = await storageManager.uploadFile("test-app", file);

    assertEquals(result.success, true);
    assertEquals(result.error, undefined);
    assertExists(result.data);
  });

  await t.step("should handle upload failure", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ 
      shouldSucceed: false, 
      errorMessage: "File too large" 
    });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const file = new MockFile("test content", "test.txt");
    const result = await storageManager.uploadFile("test-app", file);

    assertEquals(result.success, false);
    assertEquals(result.error, "File too large");
  });

  await t.step("should return error when not authenticated", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient();

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // No user ID in storage
    const file = new MockFile("test content", "test.txt");
    const result = await storageManager.uploadFile("test-app", file);

    assertEquals(result.success, false);
    assertEquals(result.error, "User not authenticated");
  });

  restoreLocalStorage();
});

Deno.test("StorageManager - Content Upload", async (t) => {
  setupMockLocalStorage();

  await t.step("should upload content successfully", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await storageManager.uploadContent(
      "test-app", 
      "data/test.json", 
      '{"test": true}',
      "application/json"
    );

    assertEquals(result.success, true);
    assertEquals(result.error, undefined);
  });

  await t.step("should upload ArrayBuffer content", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const buffer = new TextEncoder().encode("binary content").buffer;
    const result = await storageManager.uploadContent(
      "test-app", 
      "data/binary.bin", 
      buffer,
      "application/octet-stream"
    );

    assertEquals(result.success, true);
    assertEquals(result.error, undefined);
  });

  restoreLocalStorage();
});

Deno.test("StorageManager - File Download", async (t) => {
  setupMockLocalStorage();

  await t.step("should download file successfully", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await storageManager.downloadFile("test-app", "data/test.txt");

    assertEquals(result.success, true);
    assertEquals(result.error, undefined);
    assertExists(result.data);
  });

  await t.step("should handle download failure", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ 
      shouldSucceed: false, 
      errorMessage: "File not found" 
    });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await storageManager.downloadFile("test-app", "nonexistent.txt");

    assertEquals(result.success, false);
    assertEquals(result.error, "File not found");
  });

  restoreLocalStorage();
});

Deno.test("StorageManager - File Listing", async (t) => {
  setupMockLocalStorage();

  await t.step("should list files successfully", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await storageManager.listFiles("test-app");

    assertEquals(result.success, true);
    assertEquals(result.error, undefined);
    assertExists(result.files);
    assertEquals(result.files?.length, 2);
  });

  await t.step("should list files in specific path", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await storageManager.listFiles("test-app", "subfolder/");

    assertEquals(result.success, true);
    assertEquals(result.error, undefined);
  });

  await t.step("should handle listing failure", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ 
      shouldSucceed: false, 
      errorMessage: "Access denied" 
    });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await storageManager.listFiles("test-app");

    assertEquals(result.success, false);
    assertEquals(result.error, "Access denied");
  });

  restoreLocalStorage();
});

Deno.test("StorageManager - File Info", async (t) => {
  setupMockLocalStorage();

  await t.step("should get file info successfully", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await storageManager.getFileInfo("test-app", "data/test.txt");

    assertEquals(result.success, true);
    assertEquals(result.error, undefined);
    assertExists(result.data);
  });

  restoreLocalStorage();
});

Deno.test("StorageManager - File Deletion", async (t) => {
  setupMockLocalStorage();

  await t.step("should delete file successfully", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await storageManager.deleteFile("test-app", "data/test.txt");

    assertEquals(result.success, true);
    assertEquals(result.error, undefined);
  });

  await t.step("should handle deletion failure", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ 
      shouldSucceed: false, 
      errorMessage: "File not found" 
    });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await storageManager.deleteFile("test-app", "nonexistent.txt");

    assertEquals(result.success, false);
    assertEquals(result.error, "File not found");
  });

  restoreLocalStorage();
});

Deno.test("StorageManager - Error Handling", async (t) => {
  setupMockLocalStorage();

  await t.step("should handle timeout errors", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    
    // Mock Supabase that takes too long
    const slowSupabase = {
      storage: {
        from: () => ({
          upload: async () => {
            await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
            return { data: null, error: null };
          }
        })
      },
      auth: {
        getSession: async () => ({
          data: { session: { access_token: "test-token", user: { id: "user-123" } } },
          error: null
        })
      }
    } as any;

    storageManager.initialize({
      supabase: slowSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const file = new MockFile("test content", "test.txt");
    const result = await storageManager.uploadFile("test-app", file);

    assertEquals(result.success, false);
    assertEquals(result.error, "Request timeout");
  });

  await t.step("should handle network errors gracefully", async () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldThrow: true });

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const file = new MockFile("test content", "test.txt");
    const result = await storageManager.uploadFile("test-app", file);

    assertEquals(result.success, false);
    assertExists(result.error);
  });

  restoreLocalStorage();
});

Deno.test("StorageManager - Cleanup", async (t) => {
  setupMockLocalStorage();

  await t.step("should destroy cleanly", () => {
    const storageManager = new StorageManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient();

    storageManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // Should not throw
    storageManager.destroy();
    assertExists(storageManager);
  });

  restoreLocalStorage();
});