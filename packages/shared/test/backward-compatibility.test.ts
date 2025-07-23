/**
 * Backward Compatibility Tests
 * Tests to ensure deprecated type aliases work correctly and show appropriate warnings
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { 
  clearDeprecationWarnings, 
  hasWarningBeenShown,
  showDeprecationWarning,
  showTypeDeprecationWarning,
  showFunctionDeprecationWarning,
  showPackageDeprecationWarning
} from "../utils/deprecation-warnings.ts";

// Test deprecated types from auth-client
import type { 
  AuthUser as DeprecatedAuthUser,
  AuthState as DeprecatedAuthState 
} from "../../auth-client/types/deprecated.ts";

// Test deprecated types from store
import type { 
  AuthState as StoreDeprecatedAuthState,
  UpdateUserData as StoreDeprecatedUpdateUserData
} from "../../store/types/deprecated.ts";

// Test deprecated types from ui-lib
import type { 
  User as UILibDeprecatedUser,
  UserResponse as UILibDeprecatedUserResponse
} from "../../ui-lib/types/deprecated.ts";

// Test deprecated types from ui-lib-website
import type { 
  User as WebsiteDeprecatedUser,
  AuthUser as WebsiteDeprecatedAuthUser
} from "../../ui-lib-website/types/deprecated.ts";

// Test deprecated types from api
import type { 
  UserResponse as APIDeprecatedUserResponse
} from "../../api/types/deprecated.ts";

// Import canonical types for comparison
import type { 
  AuthUser as CanonicalAuthUser,
  AuthState as CanonicalAuthState,
  UpdateUserData as CanonicalUpdateUserData
} from "../types/auth.ts";

import type { 
  User as CanonicalUser,
  UserResponse as CanonicalUserResponse
} from "../utils/type-mappers.ts";

Deno.test("Deprecation Warning Utilities", async (t) => {
  await t.step("should show deprecation warnings in development", () => {
    clearDeprecationWarnings();
    
    // Mock console.warn to capture warnings
    const originalWarn = console.warn;
    const warnings: string[] = [];
    console.warn = (message: string) => warnings.push(message);
    
    try {
      showDeprecationWarning("Test deprecation message", "test-key");
      assertEquals(warnings.length, 1);
      assertEquals(warnings[0], "⚠️  DEPRECATION WARNING: Test deprecation message");
      
      // Should not show the same warning twice
      showDeprecationWarning("Test deprecation message", "test-key");
      assertEquals(warnings.length, 1);
      
    } finally {
      console.warn = originalWarn;
    }
  });

  await t.step("should track shown warnings", () => {
    clearDeprecationWarnings();
    showDeprecationWarning("Test message", "test-tracking");
    assertEquals(hasWarningBeenShown("test-tracking"), true);
    assertEquals(hasWarningBeenShown("not-shown"), false);
  });

  await t.step("should show type deprecation warnings", () => {
    clearDeprecationWarnings();
    
    const originalWarn = console.warn;
    const warnings: string[] = [];
    console.warn = (message: string) => warnings.push(message);
    
    try {
      showTypeDeprecationWarning("OldType", "new/location", "old/package");
      assertEquals(warnings.length, 1);
      assertEquals(warnings[0].includes("Type 'OldType' from 'old/package' is deprecated"), true);
      assertEquals(warnings[0].includes("Please import from 'new/location' instead"), true);
    } finally {
      console.warn = originalWarn;
    }
  });

  await t.step("should show function deprecation warnings", () => {
    clearDeprecationWarnings();
    
    const originalWarn = console.warn;
    const warnings: string[] = [];
    console.warn = (message: string) => warnings.push(message);
    
    try {
      showFunctionDeprecationWarning("oldFunction", "newFunction", "new/location");
      assertEquals(warnings.length, 1);
      assertEquals(warnings[0].includes("Function 'oldFunction' is deprecated"), true);
      assertEquals(warnings[0].includes("Please use 'newFunction' from 'new/location' instead"), true);
    } finally {
      console.warn = originalWarn;
    }
  });

  await t.step("should show package deprecation warnings", () => {
    clearDeprecationWarnings();
    
    const originalWarn = console.warn;
    const warnings: string[] = [];
    console.warn = (message: string) => warnings.push(message);
    
    try {
      showPackageDeprecationWarning("old/package", "new/package");
      assertEquals(warnings.length, 1);
      assertEquals(warnings[0].includes("Package 'old/package' is deprecated"), true);
      assertEquals(warnings[0].includes("Please import from 'new/package' instead"), true);
    } finally {
      console.warn = originalWarn;
    }
  });
});

Deno.test("Deprecated Type Compatibility", async (t) => {
  await t.step("auth-client deprecated types should match canonical types", () => {
    // Type compatibility test - these should compile without errors
    const authUser: DeprecatedAuthUser = {
      id: "test-id",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      role: "user"
    };

    const canonicalAuthUser: CanonicalAuthUser = authUser;
    assertExists(canonicalAuthUser);

    const authState: DeprecatedAuthState = {
      user: authUser,
      session: null,
      loading: false
    };

    const canonicalAuthState: CanonicalAuthState = authState;
    assertExists(canonicalAuthState);
  });

  await t.step("store deprecated types should match canonical types", () => {
    const authState: StoreDeprecatedAuthState = {
      user: null,
      session: null,
      loading: true
    };

    const canonicalAuthState: CanonicalAuthState = authState;
    assertExists(canonicalAuthState);

    const updateUserData: StoreDeprecatedUpdateUserData = {
      firstName: "Updated",
      lastName: "Name"
    };

    const canonicalUpdateUserData: CanonicalUpdateUserData = updateUserData;
    assertExists(canonicalUpdateUserData);
  });

  await t.step("ui-lib deprecated types should match canonical types", () => {
    const user: UILibDeprecatedUser = {
      id: "test-id",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      role: "user",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z"
    };

    const canonicalUser: CanonicalUser = user;
    assertExists(canonicalUser);

    const userResponse: UILibDeprecatedUserResponse = {
      id: "test-id",
      email: "test@example.com",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      created_at: "2023-01-01T00:00:00Z"
    };

    const canonicalUserResponse: CanonicalUserResponse = userResponse;
    assertExists(canonicalUserResponse);
  });

  await t.step("ui-lib-website deprecated types should match canonical types", () => {
    const user: WebsiteDeprecatedUser = {
      id: "test-id",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      role: "user",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z"
    };

    const canonicalUser: CanonicalUser = user;
    assertExists(canonicalUser);

    const authUser: WebsiteDeprecatedAuthUser = {
      id: "test-id",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      role: "user"
    };

    const canonicalAuthUser: CanonicalAuthUser = authUser;
    assertExists(canonicalAuthUser);
  });

  await t.step("api deprecated types should match canonical types", () => {
    const userResponse: APIDeprecatedUserResponse = {
      id: "test-id",
      email: "test@example.com",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      created_at: "2023-01-01T00:00:00Z"
    };

    const canonicalUserResponse: CanonicalUserResponse = userResponse;
    assertExists(canonicalUserResponse);
  });
});

Deno.test("Deprecated Function Compatibility", async (t) => {
  await t.step("deprecated functions should show warnings", () => {
    // Test that the deprecation warning system works for functions
    clearDeprecationWarnings();
    
    const originalWarn = console.warn;
    const warnings: string[] = [];
    console.warn = (message: string) => warnings.push(message);
    
    try {
      showFunctionDeprecationWarning("oldFunction", "newFunction", "new/location");
      assertEquals(warnings.length, 1);
      assertEquals(warnings[0].includes("Function 'oldFunction' is deprecated"), true);
    } finally {
      console.warn = originalWarn;
    }
  });
});

Deno.test("Migration Guide Examples", async (t) => {
  await t.step("migration examples should compile correctly", () => {
    // Example from migration guide - should compile without errors
    
    // Before (using deprecated types)
    const deprecatedUser: UILibDeprecatedUser = {
      id: "test-id",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      display_name: "Test User",
      avatar_url: "https://example.com/avatar.jpg",
      role: "user",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z"
    };
    
    // After (using canonical types)
    const canonicalUser: CanonicalUser = deprecatedUser;
    
    // Should be the same object
    assertEquals(canonicalUser, deprecatedUser);
    assertExists(canonicalUser.id);
    assertExists(canonicalUser.email);
  });
});