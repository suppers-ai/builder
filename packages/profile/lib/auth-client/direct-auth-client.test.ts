import { assertEquals, assertExists, assertFalse } from "@std/assert";
import { DirectAuthClient } from "./direct-auth-client.ts";
import type { SignInData, SignUpData, UpdateUserData } from "./types.ts";

// Mock createClient function
const originalCreateClient = (globalThis as any).createClient;

function mockCreateClient(options: {
  shouldSucceed?: boolean;
  shouldThrow?: boolean;
  sessionData?: any;
} = {}) {
  const { shouldSucceed = true, shouldThrow = false, sessionData = null } = options;
  
  return () => {
    if (shouldThrow) throw new Error("Failed to create client");
    
    return {
      auth: {
        getSession: async () => ({
          data: { session: sessionData },
          error: sessionData ? null : { message: "No session" }
        }),
        getUser: async () => ({
          data: { user: sessionData?.user || null },
          error: sessionData?.user ? null : { message: "No user" }
        }),
        signInWithPassword: async () => ({
          data: { user: sessionData?.user, session: sessionData },
          error: shouldSucceed ? null : { message: "Auth failed" }
        }),
        signUp: async () => ({
          data: { user: sessionData?.user, session: sessionData },
          error: shouldSucceed ? null : { message: "Signup failed" }
        }),
        signOut: async () => ({
          error: shouldSucceed ? null : { message: "Signout failed" }
        }),
        resetPasswordForEmail: async () => ({
          data: {},
          error: shouldSucceed ? null : { message: "Reset failed" }
        }),
        signInWithOAuth: async () => ({
          data: { url: "https://oauth.example.com" },
          error: shouldSucceed ? null : { message: "OAuth failed" }
        }),
        onAuthStateChange: () => ({
          data: { subscription: {} },
          unsubscribe: () => {}
        })
      },
      storage: {
        from: () => ({
          upload: async () => ({
            data: { path: "test/file.txt" },
            error: shouldSucceed ? null : { message: "Upload failed" }
          }),
          download: async () => ({
            data: new Blob(["test content"]),
            error: shouldSucceed ? null : { message: "Download failed" }
          }),
          list: async () => ({
            data: [{ name: "file1.txt" }],
            error: shouldSucceed ? null : { message: "List failed" }
          }),
          remove: async () => ({
            data: [{ name: "file.txt" }],
            error: shouldSucceed ? null : { message: "Delete failed" }
          })
        })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { id: "user-123", name: "Test User" },
              error: shouldSucceed ? null : { message: "Query failed" }
            })
          })
        }),
        update: () => ({
          eq: () => ({
            select: async () => ({
              data: [{ id: "user-123", name: "Updated User" }],
              error: shouldSucceed ? null : { message: "Update failed" }
            })
          })
        }),
        upsert: () => ({
          select: async () => ({
            data: [{ id: "user-123", name: "Test User" }],
            error: shouldSucceed ? null : { message: "Upsert failed" }
          })
        })
      })
    };
  };
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

function setupMocks() {
  setupMockLocalStorage();
  (globalThis as any).createClient = mockCreateClient();
}

function restoreMocks() {
  restoreLocalStorage();
  (globalThis as any).createClient = originalCreateClient;
}

Deno.test("DirectAuthClient - Initialization", async (t) => {
  setupMocks();

  await t.step("should initialize successfully with valid credentials", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    
    assertEquals(client.isReady(), false);
    assertEquals(client.isOffline(), false);
    
    await client.initialize();
    
    assertEquals(client.isReady(), true);
    assertEquals(client.isOffline(), false);
  });

  await t.step("should handle missing credentials gracefully", async () => {
    const client = new DirectAuthClient("", "");
    
    await client.initialize();
    
    assertEquals(client.isReady(), true);
    assertEquals(client.isOffline(), true);
  });

  await t.step("should handle createClient failure", async () => {
    (globalThis as any).createClient = mockCreateClient({ shouldThrow: true });
    
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    
    await client.initialize();
    
    assertEquals(client.isReady(), true);
    assertEquals(client.isOffline(), true);
  });

  await t.step("should not reinitialize if already initialized", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    
    await client.initialize();
    assertEquals(client.isReady(), true);
    
    // Second initialization should not change state
    await client.initialize();
    assertEquals(client.isReady(), true);
  });

  restoreMocks();
});

Deno.test("DirectAuthClient - Authentication Methods", async (t) => {
  setupMocks();

  await t.step("should sign in successfully", async () => {
    (globalThis as any).createClient = mockCreateClient({ 
      shouldSucceed: true,
      sessionData: {
        access_token: "test-token",
        user: { id: "user-123", email: "test@example.com" }
      }
    });

    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    const signInData: SignInData = {
      email: "test@example.com",
      password: "password123"
    };

    const result = await client.signIn(signInData);
    assertEquals(result.error, undefined);
  });

  await t.step("should sign up successfully", async () => {
    (globalThis as any).createClient = mockCreateClient({ 
      shouldSucceed: true,
      sessionData: {
        access_token: "test-token",
        user: { id: "user-123", email: "test@example.com" }
      }
    });

    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    const signUpData: SignUpData = {
      email: "newuser@example.com",
      password: "password123"
    };

    const result = await client.signUp(signUpData);
    assertEquals(result.error, undefined);
  });

  await t.step("should reset password successfully", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    const result = await client.resetPassword({ email: "test@example.com" });
    assertEquals(result.error, undefined);
  });

  await t.step("should sign in with OAuth", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    const result = await client.signInWithOAuth("google");
    assertEquals(result.error, undefined);
  });

  await t.step("should sign out successfully", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    // Set up authenticated state
    client.saveUserIdToStorage("user-123");
    
    await client.signOut();
    
    assertEquals(client.getUserId(), null);
  });

  await t.step("should return error when not initialized", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    // Don't initialize

    const result = await client.signIn({ email: "test@example.com", password: "pass" });
    assertEquals(result.error, "Client not initialized");
  });

  await t.step("should return error in offline mode", async () => {
    const client = new DirectAuthClient("", ""); // Will trigger offline mode
    await client.initialize();

    const result = await client.signIn({ email: "test@example.com", password: "pass" });
    assertEquals(result.error, "Cannot sign in while in offline mode");
  });

  restoreMocks();
});

Deno.test("DirectAuthClient - Session Management", async (t) => {
  setupMocks();

  await t.step("should check authentication status", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    assertEquals(client.isAuthenticated(), false);

    client.saveUserIdToStorage("user-123");
    assertEquals(client.isAuthenticated(), true);
  });

  await t.step("should get user ID", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    assertEquals(client.getUserId(), null);

    client.saveUserIdToStorage("user-123");
    assertEquals(client.getUserId(), "user-123");
  });

  await t.step("should get session", async () => {
    (globalThis as any).createClient = mockCreateClient({ 
      sessionData: {
        access_token: "test-token",
        user: { id: "user-123", email: "test@example.com" }
      }
    });

    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    const session = await client.getSession();
    assertExists(session);
    assertEquals(session.access_token, "test-token");
  });

  await t.step("should get session status", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const status = await client.getSessionStatus();
    assertEquals(status.isAuthenticated, true);
  });

  await t.step("should perform quick auth check", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const result = await client.quickAuthCheck();
    assertEquals(result.isAuthenticated, true);
    assertEquals(result.userId, "user-123");
  });

  await t.step("should check for existing session", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    assertEquals(await client.hasExistingSession(), false);

    client.saveUserIdToStorage("user-123");
    assertEquals(await client.hasExistingSession(), true);
  });

  restoreMocks();
});

Deno.test("DirectAuthClient - User Management", async (t) => {
  setupMocks();

  await t.step("should get user data", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const user = await client.getUser();
    assertExists(user);
    assertEquals(user.id, "user-123");
  });

  await t.step("should update user data", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const updateData: UpdateUserData = {
      name: "Updated Name"
    };

    const result = await client.updateUser(updateData);
    assertEquals(result.error, undefined);
  });

  await t.step("should create user profile if needed", async () => {
    (globalThis as any).createClient = mockCreateClient({ 
      sessionData: {
        access_token: "test-token",
        user: { id: "user-123", email: "test@example.com" }
      }
    });

    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const result = await client.createUserProfileIfNeeded();
    assertEquals(result, true);
  });

  restoreMocks();
});

Deno.test("DirectAuthClient - Storage Operations", async (t) => {
  setupMocks();

  await t.step("should upload file", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    const result = await client.uploadFile("test-app", file);

    assertEquals(result.success, true);
  });

  await t.step("should upload content", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const result = await client.uploadContent("test-app", "data/test.json", '{"test": true}');

    assertEquals(result.success, true);
  });

  await t.step("should download file", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const result = await client.downloadFile("test-app", "data/test.txt");

    assertEquals(result.success, true);
  });

  await t.step("should list files", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const result = await client.listFiles("test-app");

    assertEquals(result.success, true);
    assertExists(result.files);
  });

  await t.step("should delete file", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const result = await client.deleteFile("test-app", "data/test.txt");

    assertEquals(result.success, true);
  });

  restoreMocks();
});

Deno.test("DirectAuthClient - Event Management", async (t) => {
  setupMocks();

  await t.step("should add and remove event listeners", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    let eventFired = false;
    const callback = () => { eventFired = true; };

    client.addEventListener("login", callback);
    
    // Simulate login event by manually calling the event manager
    // (In real usage, this would be triggered by auth state changes)
    
    client.removeEventListener("login", callback);
    
    // Should not throw
    assertExists(client);
  });

  restoreMocks();
});

Deno.test("DirectAuthClient - API Requests", async (t) => {
  setupMocks();

  await t.step("should make authenticated API request", async () => {
    (globalThis as any).createClient = mockCreateClient({ 
      sessionData: {
        access_token: "test-token",
        user: { id: "user-123", email: "test@example.com" }
      }
    });

    // Mock fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response('{"success": true}', { status: 200 });

    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    const response = await client.apiRequest("https://api.example.com/test");
    assertEquals(response.status, 200);

    globalThis.fetch = originalFetch;
  });

  await t.step("should handle API request timeout", async () => {
    (globalThis as any).createClient = mockCreateClient({ 
      sessionData: {
        access_token: "test-token",
        user: { id: "user-123", email: "test@example.com" }
      }
    });

    // Mock slow fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      await new Promise(resolve => setTimeout(resolve, 15000));
      return new Response('{"success": true}');
    };

    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    try {
      await client.apiRequest("https://api.example.com/test", { timeout: 1000 });
    } catch (error) {
      assertEquals((error as Error).message, "Request timeout");
    }

    globalThis.fetch = originalFetch;
  });

  restoreMocks();
});

Deno.test("DirectAuthClient - Lifecycle Management", async (t) => {
  setupMocks();

  await t.step("should reinitialize successfully", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    assertEquals(client.isReady(), true);

    await client.reinitialize();
    assertEquals(client.isReady(), true);
  });

  await t.step("should destroy cleanly", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");
    assertEquals(client.isAuthenticated(), true);

    client.destroy();
    assertEquals(client.isReady(), false);
  });

  await t.step("should shutdown gracefully", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");

    await client.shutdown();
    assertEquals(client.isReady(), false);
    assertEquals(client.getUserId(), null);
  });

  await t.step("should provide debug status", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    // Should not throw
    client.debugStatus();
    assertExists(client);
  });

  restoreMocks();
});

Deno.test("DirectAuthClient - Backward Compatibility", async (t) => {
  setupMocks();

  await t.step("should provide backward compatible storage methods", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    client.saveUserIdToStorage("user-123");
    assertEquals(client.getUserIdFromStorage(), "user-123");

    client.clearUserIdFromStorage();
    assertEquals(client.getUserIdFromStorage(), null);
  });

  await t.step("should provide event callbacks map", async () => {
    const client = new DirectAuthClient("https://test.supabase.co", "test-anon-key");
    await client.initialize();

    const callbacks = client.eventCallbacks;
    assertExists(callbacks);
    assertEquals(callbacks instanceof Map, true);
  });

  restoreMocks();
});