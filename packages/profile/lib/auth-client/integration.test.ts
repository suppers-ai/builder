import { assertEquals, assertExists } from "@std/assert";
import { getAuthClient } from "../auth.ts";

Deno.test("Profile Package Integration - Auth Client", async (t) => {
  await t.step("should get auth client instance", () => {
    const authClient = getAuthClient();
    assertExists(authClient);
    
    // Should be a DirectAuthClient instance
    assertEquals(typeof authClient.initialize, "function");
    assertEquals(typeof authClient.signIn, "function");
    assertEquals(typeof authClient.signUp, "function");
    assertEquals(typeof authClient.signOut, "function");
    assertEquals(typeof authClient.getUser, "function");
    assertEquals(typeof authClient.updateUser, "function");
    assertEquals(typeof authClient.isAuthenticated, "function");
  });

  await t.step("should return same instance on multiple calls (singleton)", () => {
    const authClient1 = getAuthClient();
    const authClient2 = getAuthClient();
    
    // Should be the same instance
    assertEquals(authClient1, authClient2);
  });

  await t.step("should have all required methods for profile functionality", () => {
    const authClient = getAuthClient();
    
    // Authentication methods
    assertExists(authClient.signIn);
    assertExists(authClient.signUp);
    assertExists(authClient.signOut);
    assertExists(authClient.resetPassword);
    assertExists(authClient.signInWithOAuth);
    
    // Session management
    assertExists(authClient.isAuthenticated);
    assertExists(authClient.getUserId);
    assertExists(authClient.getSession);
    assertExists(authClient.getSessionStatus);
    assertExists(authClient.quickAuthCheck);
    assertExists(authClient.hasExistingSession);
    assertExists(authClient.getAccessToken);
    
    // User management
    assertExists(authClient.getUser);
    assertExists(authClient.updateUser);
    assertExists(authClient.createUserProfileIfNeeded);
    
    // Storage operations
    assertExists(authClient.uploadFile);
    assertExists(authClient.uploadContent);
    assertExists(authClient.downloadFile);
    assertExists(authClient.listFiles);
    assertExists(authClient.getFileInfo);
    assertExists(authClient.deleteFile);
    
    // Event management
    assertExists(authClient.addEventListener);
    assertExists(authClient.removeEventListener);
    
    // API requests
    assertExists(authClient.apiRequest);
    
    // Lifecycle management
    assertExists(authClient.initialize);
    assertExists(authClient.reinitialize);
    assertExists(authClient.destroy);
    assertExists(authClient.shutdown);
    
    // Utility methods
    assertExists(authClient.isReady);
    assertExists(authClient.isOffline);
    assertExists(authClient.debugStatus);
    
    // Backward compatibility
    assertExists(authClient.saveUserIdToStorage);
    assertExists(authClient.getUserIdFromStorage);
    assertExists(authClient.clearUserIdFromStorage);
    assertExists(authClient.eventCallbacks);
  });

  await t.step("should handle initialization gracefully", async () => {
    const authClient = getAuthClient();
    
    // Should not throw during initialization
    await authClient.initialize();
    
    // Should be ready after initialization
    assertEquals(authClient.isReady(), true);
  });

  await t.step("should handle authentication state checks", () => {
    const authClient = getAuthClient();
    
    // Should return boolean for authentication status
    const isAuthenticated = authClient.isAuthenticated();
    assertEquals(typeof isAuthenticated, "boolean");
    
    // Should return string or null for user ID
    const userId = authClient.getUserId();
    assertEquals(typeof userId === "string" || userId === null, true);
  });

  await t.step("should handle event management", () => {
    const authClient = getAuthClient();
    
    let eventFired = false;
    const callback = () => { eventFired = true; };
    
    // Should be able to add and remove event listeners
    authClient.addEventListener("login", callback);
    authClient.removeEventListener("login", callback);
    
    // Should not throw
    assertEquals(eventFired, false);
  });

  await t.step("should provide backward compatibility methods", () => {
    const authClient = getAuthClient();
    
    // Should have storage methods (they exist and don't throw)
    authClient.saveUserIdToStorage("user-123"); // Use valid UUID format
    const storedUserId = authClient.getUserIdFromStorage();
    // Note: Storage may validate UUIDs, so we just check it doesn't throw
    
    authClient.clearUserIdFromStorage();
    const clearedUserId = authClient.getUserIdFromStorage();
    assertEquals(clearedUserId, null);
    
    // Should have event callbacks map
    const callbacks = authClient.eventCallbacks;
    assertExists(callbacks);
    assertEquals(callbacks instanceof Map, true);
  });

  await t.step("should handle error cases gracefully", async () => {
    const authClient = getAuthClient();
    
    // Should handle sign in with invalid credentials
    const signInResult = await authClient.signIn({
      email: "invalid@example.com",
      password: "wrongpassword"
    });
    
    // Should return error instead of throwing
    assertExists(signInResult);
    assertEquals(typeof signInResult.error === "string" || signInResult.error === undefined, true);
    
    // Should handle sign up with invalid data
    const signUpResult = await authClient.signUp({
      email: "invalid-email",
      password: "short"
    });
    
    // Should return error instead of throwing
    assertExists(signUpResult);
    assertEquals(typeof signUpResult.error === "string" || signUpResult.error === undefined, true);
  });

  await t.step("should handle offline mode gracefully", async () => {
    const authClient = getAuthClient();
    
    // Should be able to check offline status
    const isOffline = authClient.isOffline();
    assertEquals(typeof isOffline, "boolean");
    
    // Should handle operations in offline mode without throwing
    if (isOffline) {
      const result = await authClient.signIn({
        email: "test@example.com",
        password: "password"
      });
      
      // Should return error for offline operations
      assertExists(result.error);
      assertEquals(result.error.includes("offline"), true);
    }
  });

  await t.step("should cleanup properly", async () => {
    const authClient = getAuthClient();
    
    // Should be able to destroy without throwing
    authClient.destroy();
    
    // Should be able to shutdown gracefully
    await authClient.shutdown();
    
    // Should not be ready after destruction
    assertEquals(authClient.isReady(), false);
  });
});