import { assertEquals, assertExists } from "@std/assert";
import { AuthMethods } from "./auth-methods.ts";
import { SessionManager } from "./session-manager.ts";
import { EventManager } from "./event-manager.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SignInData, SignUpData, ResetPasswordData } from "./types.ts";

// Mock Supabase client
function createMockSupabaseClient(options: {
  shouldSucceed?: boolean;
  shouldThrow?: boolean;
  errorMessage?: string;
  userData?: any;
} = {}): SupabaseClient {
  const { 
    shouldSucceed = true, 
    shouldThrow = false, 
    errorMessage = "Auth error",
    userData = { id: "user-123", email: "test@example.com" }
  } = options;
  
  return {
    auth: {
      signInWithPassword: async () => {
        if (shouldThrow) throw new Error("Network error");
        return shouldSucceed 
          ? { data: { user: userData, session: { access_token: "token" } }, error: null }
          : { data: { user: null, session: null }, error: { message: errorMessage } };
      },
      signUp: async () => {
        if (shouldThrow) throw new Error("Network error");
        return shouldSucceed 
          ? { data: { user: userData, session: { access_token: "token" } }, error: null }
          : { data: { user: null, session: null }, error: { message: errorMessage } };
      },
      resetPasswordForEmail: async () => {
        if (shouldThrow) throw new Error("Network error");
        return shouldSucceed 
          ? { data: {}, error: null }
          : { data: {}, error: { message: errorMessage } };
      },
      signOut: async () => {
        if (shouldThrow) throw new Error("Network error");
        return shouldSucceed 
          ? { error: null }
          : { error: { message: errorMessage } };
      },
      signInWithOAuth: async () => {
        if (shouldThrow) throw new Error("Network error");
        return shouldSucceed 
          ? { data: { url: "https://oauth.example.com" }, error: null }
          : { data: { url: null }, error: { message: errorMessage } };
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

Deno.test("AuthMethods - Initialization", async (t) => {
  setupMockLocalStorage();

  await t.step("should initialize with dependencies", () => {
    const authMethods = new AuthMethods();
    const mockSupabase = createMockSupabaseClient();
    const eventManager = new EventManager();

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // Should not throw and should be ready for operations
    assertExists(authMethods);
  });

  await t.step("should set session manager", () => {
    const authMethods = new AuthMethods();
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();

    sessionManager.initialize({
      supabase: createMockSupabaseClient(),
      storageKey: "test_key",
      eventManager
    });

    authMethods.setSessionManager(sessionManager);
    
    // Should not throw
    assertExists(authMethods);
  });

  restoreLocalStorage();
});

Deno.test("AuthMethods - Sign In", async (t) => {
  setupMockLocalStorage();

  await t.step("should sign in successfully", async () => {
    const authMethods = new AuthMethods();
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    sessionManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    authMethods.setSessionManager(sessionManager);

    const signInData: SignInData = {
      email: "test@example.com",
      password: "password123"
    };

    const result = await authMethods.signIn(signInData);
    assertEquals(result.error, undefined);
  });

  await t.step("should handle sign in failure", async () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ 
      shouldSucceed: false, 
      errorMessage: "Invalid credentials" 
    });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    const signInData: SignInData = {
      email: "test@example.com",
      password: "wrongpassword"
    };

    const result = await authMethods.signIn(signInData);
    assertEquals(result.error, "Invalid credentials");
  });

  await t.step("should handle network errors during sign in", async () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldThrow: true });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    const signInData: SignInData = {
      email: "test@example.com",
      password: "password123"
    };

    const result = await authMethods.signIn(signInData);
    assertExists(result.error);
  });

  await t.step("should handle timeout during sign in", async () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    
    // Mock Supabase that takes too long
    const slowSupabase = {
      auth: {
        signInWithPassword: async () => {
          await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
          return { data: { user: null }, error: null };
        }
      }
    } as any;

    authMethods.initialize({
      supabase: slowSupabase,
      storageKey: "test_key",
      eventManager
    });

    const signInData: SignInData = {
      email: "test@example.com",
      password: "password123"
    };

    const result = await authMethods.signIn(signInData);
    assertEquals(result.error, "Request timeout");
  });

  restoreLocalStorage();
});

Deno.test("AuthMethods - Sign Up", async (t) => {
  setupMockLocalStorage();

  await t.step("should sign up successfully", async () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    const signUpData: SignUpData = {
      email: "newuser@example.com",
      password: "password123"
    };

    const result = await authMethods.signUp(signUpData);
    assertEquals(result.error, undefined);
  });

  await t.step("should handle sign up failure", async () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ 
      shouldSucceed: false, 
      errorMessage: "Email already registered" 
    });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    const signUpData: SignUpData = {
      email: "existing@example.com",
      password: "password123"
    };

    const result = await authMethods.signUp(signUpData);
    assertEquals(result.error, "Email already registered");
  });

  restoreLocalStorage();
});

Deno.test("AuthMethods - Password Reset", async (t) => {
  setupMockLocalStorage();

  await t.step("should reset password successfully", async () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    const resetData: ResetPasswordData = {
      email: "user@example.com"
    };

    const result = await authMethods.resetPassword(resetData);
    assertEquals(result.error, undefined);
  });

  await t.step("should handle password reset failure", async () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ 
      shouldSucceed: false, 
      errorMessage: "Email not found" 
    });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    const resetData: ResetPasswordData = {
      email: "nonexistent@example.com"
    };

    const result = await authMethods.resetPassword(resetData);
    assertEquals(result.error, "Email not found");
  });

  restoreLocalStorage();
});

Deno.test("AuthMethods - OAuth", async (t) => {
  setupMockLocalStorage();

  await t.step("should initiate OAuth sign in", async () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    const result = await authMethods.signInWithOAuth("google");
    assertEquals(result.error, undefined);
  });

  await t.step("should handle OAuth failure", async () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ 
      shouldSucceed: false, 
      errorMessage: "OAuth provider not configured" 
    });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    const result = await authMethods.signInWithOAuth("invalid-provider");
    assertEquals(result.error, "OAuth provider not configured");
  });

  restoreLocalStorage();
});

Deno.test("AuthMethods - Sign Out", async (t) => {
  setupMockLocalStorage();

  await t.step("should sign out successfully", async () => {
    const authMethods = new AuthMethods();
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldSucceed: true });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    sessionManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    authMethods.setSessionManager(sessionManager);

    // Set up authenticated state
    sessionManager.saveUserIdToStorage("user-123");

    await authMethods.signOut();
    
    // Should clear local storage
    assertEquals(sessionManager.getUserId(), null);
  });

  await t.step("should handle sign out errors gracefully", async () => {
    const authMethods = new AuthMethods();
    const sessionManager = new SessionManager();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient({ shouldThrow: true });

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    sessionManager.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    authMethods.setSessionManager(sessionManager);

    // Should not throw even if Supabase fails
    await authMethods.signOut();
    
    // Should still clear local storage
    assertEquals(sessionManager.getUserId(), null);
  });

  restoreLocalStorage();
});

Deno.test("AuthMethods - Cleanup", async (t) => {
  setupMockLocalStorage();

  await t.step("should destroy cleanly", () => {
    const authMethods = new AuthMethods();
    const eventManager = new EventManager();
    const mockSupabase = createMockSupabaseClient();

    authMethods.initialize({
      supabase: mockSupabase,
      storageKey: "test_key",
      eventManager
    });

    // Should not throw
    authMethods.destroy();
    assertExists(authMethods);
  });

  restoreLocalStorage();
});