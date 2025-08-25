import { assertEquals, assertExists } from "@std/assert";
import { UserManager } from "./user-manager.ts";
import { EventManager } from "./event-manager.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UpdateUserData } from "./types.ts";

// Mock Supabase client
function createMockSupabaseClient(options: {
  userData?: any;
  shouldThrow?: boolean;
  shouldSucceed?: boolean;
  errorMessage?: string;
} = {}): SupabaseClient {
  const { 
    userData = { id: "user-123", email: "test@example.com", name: "Test User" },
    shouldThrow = false,
    shouldSucceed = true,
    errorMessage = "Database error"
  } = options;
  
  return {
    auth: {
      getUser: async () => {
        if (shouldThrow) throw new Error("Network error");
        return shouldSucceed 
          ? { data: { user: userData }, error: null }
          : { data: { user: null }, error: { message: errorMessage } };
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            if (shouldThrow) throw new Error("Database error");
            return shouldSucceed 
              ? { data: userData, error: null }
              : { data: null, error: { message: errorMessage } };
          }
        })
      }),
      insert: () => ({
        select: async () => {
          if (shouldThrow) throw new Error("Database error");
          return shouldSucceed 
            ? { data: [userData], error: null }
            : { data: null, error: { message: errorMessage } };
        }
      }),
      update: () => ({
        eq: () => ({
          select: async () => {
            if (shouldThrow) throw new Error("Database error");
            return shouldSucceed 
              ? { data: [{ ...userData, updated_at: new Date().toISOString() }], error: null }
              : { data: null, error: { message: errorMessage } };
          }
        })
      }),
      upsert: () => ({
        select: async () => {
          if (shouldThrow) throw new Error("Database error");
          return shouldSucceed 
            ? { data: [userData], error: null }
            : { data: null, error: { message: errorMessage } };
        }
      })
    })
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

Deno.test("UserManager - Initialization", async (t) => {
  setupMockLocalStorage();

  await t.step("should initialize with dependencies", () => {
    const userManager = new UserManager();
    const mockSupabase = createMockSupabaseClient();
    const eventManager = new EventManager();

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // Should not throw and should be ready for operations
    assertExists(userManager);
  });

  await t.step("should handle missing dependencies gracefully", () => {
    const userManager = new UserManager();
    
    // Should not throw even without initialization
    assertExists(userManager);
  });

  restoreLocalStorage();
});

Deno.test("UserManager - Get User", async (t) => {
  setupMockLocalStorage();

  await t.step("should get user data successfully", async () => {
    const userData = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      avatar_url: "https://example.com/avatar.jpg"
    };

    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ userData, shouldSucceed: true });

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // Mock authenticated state
    mockStorage.set("test_key", "user-123");

    const user = await userManager.getUser();
    assertExists(user);
    assertEquals(user.id, "user-123");
    assertEquals(user.email, "test@example.com");
    assertEquals(user.name, "Test User");
  });

  await t.step("should return null when not authenticated", async () => {
    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient();

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // No user ID in storage
    const user = await userManager.getUser();
    assertEquals(user, null);
  });

  await t.step("should handle database errors", async () => {
    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldThrow: true });

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const user = await userManager.getUser();
    assertEquals(user, null);
  });

  restoreLocalStorage();
});

Deno.test("UserManager - Update User", async (t) => {
  setupMockLocalStorage();

  await t.step("should update user successfully", async () => {
    const userData = {
      id: "user-123",
      email: "test@example.com",
      name: "Updated Name",
      avatar_url: "https://example.com/new-avatar.jpg"
    };

    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ userData, shouldSucceed: true });

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const updateData: UpdateUserData = {
      name: "Updated Name",
      avatar_url: "https://example.com/new-avatar.jpg"
    };

    const result = await userManager.updateUser(updateData);
    assertEquals(result.error, undefined);
  });

  await t.step("should handle update failure", async () => {
    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ 
      shouldSucceed: false, 
      errorMessage: "Validation error" 
    });

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const updateData: UpdateUserData = {
      name: ""  // Invalid empty name
    };

    const result = await userManager.updateUser(updateData);
    assertEquals(result.error, "Validation error");
  });

  await t.step("should return error when not authenticated", async () => {
    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient();

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // No user ID in storage
    const updateData: UpdateUserData = {
      name: "New Name"
    };

    const result = await userManager.updateUser(updateData);
    assertEquals(result.error, "User not authenticated");
  });

  restoreLocalStorage();
});

Deno.test("UserManager - Profile Creation", async (t) => {
  setupMockLocalStorage();

  await t.step("should ensure user profile exists", async () => {
    const authUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: { name: "Test User" }
    };

    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    await userManager.ensureUserProfile(authUser);
    // Should not throw
  });

  await t.step("should handle profile creation failure", async () => {
    const authUser = {
      id: "user-123",
      email: "test@example.com"
    };

    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldThrow: true });

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    try {
      await userManager.ensureUserProfile(authUser);
    } catch (error) {
      // Should handle errors gracefully
      assertExists(error);
    }
  });

  await t.step("should create user profile if needed", async () => {
    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const result = await userManager.createUserProfileIfNeeded();
    assertEquals(result, true);
  });

  await t.step("should return false when not authenticated for profile creation", async () => {
    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient();

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // No user ID in storage
    const result = await userManager.createUserProfileIfNeeded();
    assertEquals(result, false);
  });

  restoreLocalStorage();
});

Deno.test("UserManager - Error Handling", async (t) => {
  setupMockLocalStorage();

  await t.step("should handle timeout errors", async () => {
    const userManager = new UserManager();
    const eventManager = new EventManager();
    
    // Mock Supabase that takes too long
    const slowSupabase = {
      auth: {
        getUser: async () => {
          await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
          return { data: { user: null }, error: null };
        }
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => {
              await new Promise(resolve => setTimeout(resolve, 15000));
              return { data: null, error: null };
            }
          })
        })
      })
    } as any;

    userManager.initialize({
      supabase: slowSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    const user = await userManager.getUser();
    assertEquals(user, null);
  });

  await t.step("should handle network errors gracefully", async () => {
    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldThrow: true });

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    mockStorage.set("test_key", "user-123");

    // Should not throw
    const user = await userManager.getUser();
    assertEquals(user, null);

    const updateResult = await userManager.updateUser({ name: "Test" });
    assertExists(updateResult.error);
  });

  restoreLocalStorage();
});

Deno.test("UserManager - Cleanup", async (t) => {
  setupMockLocalStorage();

  await t.step("should destroy cleanly", () => {
    const userManager = new UserManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient();

    userManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // Should not throw
    userManager.destroy();
    assertExists(userManager);
  });

  restoreLocalStorage();
});