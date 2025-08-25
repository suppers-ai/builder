import { assertEquals, assertExists, assertFalse } from "@std/assert";
import { SessionManager } from "./session-manager.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EventManager } from "./event-manager.ts";

// Mock Supabase client
function createMockSupabaseClient(options: {
  sessionData?: any;
  shouldThrow?: boolean;
  accessToken?: string;
} = {}): SupabaseClient {
  const { sessionData = null, shouldThrow = false, accessToken = "test-token" } = options;
  
  return {
    auth: {
      getSession: async () => {
        if (shouldThrow) throw new Error("Network error");
        return { 
          data: { session: sessionData }, 
          error: sessionData ? null : { message: "No session" }
        };
      },
      getUser: async () => {
        if (shouldThrow) throw new Error("Network error");
        return { 
          data: { user: sessionData?.user || null }, 
          error: sessionData?.user ? null : { message: "No user" }
        };
      }
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

Deno.test("SessionManager - Initialization", async (t) => {
  setupMockLocalStorage();

  await t.step("should initialize with dependencies", () => {
    const sessionManager = new SessionManager();
    const mockSupabase = createMockSupabaseClient();
    const eventManager = new EventManager();

    sessionManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // Should not throw and should be ready for operations
    assertEquals(sessionManager.isAuthenticated(), false);
  });

  await t.step("should handle missing dependencies gracefully", () => {
    const sessionManager = new SessionManager();
    
    // Should not throw even without initialization
    assertEquals(sessionManager.isAuthenticated(), false);
    assertEquals(sessionManager.getUserId(), null);
  });

  restoreLocalStorage();
});

Deno.test("SessionManager - Storage operations", async (t) => {
  setupMockLocalStorage();

  await t.step("should save and retrieve user ID from storage", () => {
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient(),
      storageKey: "test_key",
      eventManager
    });

    // Initially no user ID
    assertEquals(sessionManager.getUserIdFromStorage(), null);
    assertEquals(sessionManager.getUserId(), null);

    // Save user ID
    sessionManager.saveUserIdToStorage("test-user-123");
    assertEquals(sessionManager.getUserIdFromStorage(), "test-user-123");
    assertEquals(sessionManager.getUserId(), "test-user-123");

    // Clear user ID
    sessionManager.clearUserIdFromStorage();
    assertEquals(sessionManager.getUserIdFromStorage(), null);
    assertEquals(sessionManager.getUserId(), null);
  });

  await t.step("should handle storage errors gracefully", () => {
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    // Mock localStorage to throw errors
    const originalSetItem = globalThis.localStorage.setItem;
    globalThis.localStorage.setItem = () => {
      throw new Error("Storage quota exceeded");
    };

    sessionManager.initialize({
      supabase: createMockSupabaseClient(),
      storageKey: "test_key",
      eventManager
    });

    // Should not throw when storage fails
    sessionManager.saveUserIdToStorage("test-user");
    assertEquals(sessionManager.getUserId(), null);

    // Restore localStorage
    globalThis.localStorage.setItem = originalSetItem;
  });

  restoreLocalStorage();
});

Deno.test("SessionManager - Session operations", async (t) => {
  setupMockLocalStorage();

  await t.step("should get session from Supabase", async () => {
    const sessionData = {
      access_token: "test-token",
      user: { id: "user-123", email: "test@example.com" }
    };
    
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient({ sessionData }),
      storageKey: "test_key",
      eventManager
    });

    const session = await sessionManager.getSession();
    assertExists(session);
    assertEquals(session.access_token, "test-token");
    assertEquals(session.user?.id, "user-123");
  });

  await t.step("should handle session errors", async () => {
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient({ shouldThrow: true }),
      storageKey: "test_key",
      eventManager
    });

    const session = await sessionManager.getSession();
    assertEquals(session, null);
  });

  await t.step("should get session status", async () => {
    const sessionData = {
      access_token: "test-token",
      user: { id: "user-123", email: "test@example.com" }
    };
    
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient({ sessionData }),
      storageKey: "test_key",
      eventManager
    });

    const status = await sessionManager.getSessionStatus();
    assertEquals(status.isAuthenticated, true);
    assertExists(status.userId);
    assertEquals(status.userId, "user-123");
  });

  await t.step("should perform quick auth check", async () => {
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient(),
      storageKey: "test_key",
      eventManager
    });

    // Save user ID to simulate existing session
    sessionManager.saveUserIdToStorage("user-123");

    const result = await sessionManager.quickAuthCheck();
    assertEquals(result.isAuthenticated, true);
    assertEquals(result.userId, "user-123");
  });

  await t.step("should check for existing session", async () => {
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient(),
      storageKey: "test_key",
      eventManager
    });

    // Initially no session
    assertEquals(await sessionManager.hasExistingSession(), false);

    // Save user ID
    sessionManager.saveUserIdToStorage("user-123");
    assertEquals(await sessionManager.hasExistingSession(), true);
  });

  restoreLocalStorage();
});

Deno.test("SessionManager - Authentication state", async (t) => {
  setupMockLocalStorage();

  await t.step("should track authentication state", () => {
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient(),
      storageKey: "test_key",
      eventManager
    });

    // Initially not authenticated
    assertEquals(sessionManager.isAuthenticated(), false);

    // Handle successful auth
    sessionManager.handleSuccessfulAuth("user-123");
    assertEquals(sessionManager.isAuthenticated(), true);
    assertEquals(sessionManager.getUserId(), "user-123");

    // Handle sign out
    sessionManager.handleSignOut();
    assertEquals(sessionManager.isAuthenticated(), false);
    assertEquals(sessionManager.getUserId(), null);
  });

  await t.step("should get access token", async () => {
    const sessionData = {
      access_token: "test-access-token",
      user: { id: "user-123" }
    };
    
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient({ sessionData }),
      storageKey: "test_key",
      eventManager
    });

    const token = await sessionManager.getAccessToken();
    assertEquals(token, "test-access-token");
  });

  await t.step("should check connection status", async () => {
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient(),
      storageKey: "test_key",
      eventManager
    });

    const isConnected = await sessionManager.isConnected();
    assertEquals(isConnected, true);

    // Test with failing client
    const failingSessionManager = new SessionManager();
    failingSessionManager.initialize({
      supabase: createMockSupabaseClient({ shouldThrow: true }),
      storageKey: "test_key",
      eventManager
    });

    const isConnectedFailing = await failingSessionManager.isConnected();
    assertEquals(isConnectedFailing, false);
  });

  restoreLocalStorage();
});

Deno.test("SessionManager - Cleanup and lifecycle", async (t) => {
  setupMockLocalStorage();

  await t.step("should destroy cleanly", () => {
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient(),
      storageKey: "test_key",
      eventManager
    });

    sessionManager.saveUserIdToStorage("user-123");
    assertEquals(sessionManager.isAuthenticated(), true);

    sessionManager.destroy();
    
    // Should clear state but not throw
    assertEquals(sessionManager.isAuthenticated(), false);
  });

  await t.step("should validate and sync session", async () => {
    const sessionData = {
      access_token: "test-token",
      user: { id: "user-123" }
    };
    
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    
    sessionManager.initialize({
      supabase: createMockSupabaseClient({ sessionData }),
      storageKey: "test_key",
      eventManager
    });

    // Save different user ID to test sync
    sessionManager.saveUserIdToStorage("different-user");

    const isValid = await sessionManager.validateAndSyncSession();
    assertEquals(isValid, true);
    assertEquals(sessionManager.getUserId(), "user-123"); // Should sync to Supabase user
  });

  restoreLocalStorage();
});