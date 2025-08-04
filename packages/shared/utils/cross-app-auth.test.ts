/**
 * Unit tests for cross-application authentication helpers
 */

import { assertEquals, assertExists } from "@std/assert";
import { describe, it, afterEach } from "@std/testing/bdd";

import {
  CrossAppAuthHelpers,
  type Session,
  type User,
} from "./cross-app-auth.ts";

describe("CrossAppAuthHelpers", () => {
  afterEach(() => {
    // Clean up timers and resources after each test
    const authHelpers = CrossAppAuthHelpers.getInstance();
    authHelpers.cleanup();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = CrossAppAuthHelpers.getInstance();
      const instance2 = CrossAppAuthHelpers.getInstance();

      assertEquals(instance1, instance2);
    });
  });

  describe("setCurrentUser and getCurrentUser", () => {
    it("should set and get current user", () => {
      const authHelpers = CrossAppAuthHelpers.getInstance();
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        displayName: "Test User",
        theme: "dark",
      };

      authHelpers.setCurrentUser(user);

      assertEquals(authHelpers.getCurrentUser(), user);
    });

    it("should set user and session together", () => {
      const authHelpers = CrossAppAuthHelpers.getInstance();
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        displayName: "Test User",
      };

      const session: Session = {
        access_token: "token123",
        user: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "test@example.com",
        },
      };

      authHelpers.setCurrentUser(user, session);

      assertEquals(authHelpers.getCurrentUser(), user);
      assertEquals(authHelpers.getCurrentSession(), session);
    });
  });

  describe("user data management", () => {
    it("should handle user data updates", () => {
      const authHelpers = CrossAppAuthHelpers.getInstance();
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        displayName: "Test User",
      };

      authHelpers.setCurrentUser(user);

      // Test that the user data can be updated
      const updatedData = {
        displayName: "Updated User",
        firstName: "Updated",
      };

      // This should not throw an error
      authHelpers.syncUserDataAcrossApps(updatedData);

      const currentUser = authHelpers.getCurrentUser();
      assertEquals(currentUser?.displayName, "Updated User");
      assertEquals(currentUser?.firstName, "Updated");
    });

    it("should handle theme synchronization", () => {
      const authHelpers = CrossAppAuthHelpers.getInstance();
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        displayName: "Test User",
        theme: "light",
      };

      authHelpers.setCurrentUser(user);

      // This should not throw an error
      authHelpers.syncThemeAcrossApps("dark");

      assertEquals(authHelpers.getCurrentUser()?.theme, "dark");
    });
  });

  describe("session management", () => {
    it("should handle session synchronization", () => {
      const authHelpers = CrossAppAuthHelpers.getInstance();
      const session: Session = {
        access_token: "token123",
        user: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "test@example.com",
          user_metadata: {
            display_name: "Test User",
            theme: "dark",
          },
        },
      };

      // This should not throw an error
      authHelpers.syncSessionAcrossApps(session);

      const currentUser = authHelpers.getCurrentUser();
      assertEquals(currentUser?.displayName, "Test User");
      assertEquals(currentUser?.theme, "dark");
    });

    it("should handle session clearing", () => {
      const authHelpers = CrossAppAuthHelpers.getInstance();
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        displayName: "Test User",
      };

      authHelpers.setCurrentUser(user);

      // This should not throw an error
      authHelpers.clearSessionAcrossApps();

      assertEquals(authHelpers.getCurrentUser(), null);
      assertEquals(authHelpers.getCurrentSession(), null);
    });
  });

  describe("profile change event handling", () => {
    it("should handle profile change events without errors", () => {
      const authHelpers = CrossAppAuthHelpers.getInstance();
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        displayName: "Test User",
        theme: "light",
      };

      authHelpers.setCurrentUser(user);

      // Test theme change event
      const themeEvent = {
        type: "theme" as const,
        data: { theme: "dark" },
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      // This should not throw an error
      authHelpers.handleProfileChangeEvent(themeEvent);

      // Test avatar change event
      const avatarEvent = {
        type: "avatar" as const,
        data: { avatarUrl: "https://example.com/new-avatar.jpg" },
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      // This should not throw an error
      authHelpers.handleProfileChangeEvent(avatarEvent);

      // Test display name change event
      const displayNameEvent = {
        type: "displayName" as const,
        data: {
          displayName: "Updated User",
          firstName: "Updated",
          lastName: "User",
        },
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      // This should not throw an error
      authHelpers.handleProfileChangeEvent(displayNameEvent);

      // Test sign out event
      const signOutEvent = {
        type: "signOut" as const,
        data: { reason: "session_expired" },
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      // This should not throw an error
      authHelpers.handleProfileChangeEvent(signOutEvent);

      assertEquals(authHelpers.getCurrentUser(), null);
      assertEquals(authHelpers.getCurrentSession(), null);
    });
  });

  describe("utility methods", () => {
    it("should have required methods", () => {
      const authHelpers = CrossAppAuthHelpers.getInstance();

      // Test that all required methods exist
      assertEquals(typeof authHelpers.setCurrentUser, "function");
      assertEquals(typeof authHelpers.getCurrentUser, "function");
      assertEquals(typeof authHelpers.getCurrentSession, "function");
      assertEquals(typeof authHelpers.syncSessionAcrossApps, "function");
      assertEquals(typeof authHelpers.clearSessionAcrossApps, "function");
      assertEquals(typeof authHelpers.syncThemeAcrossApps, "function");
      assertEquals(typeof authHelpers.syncUserDataAcrossApps, "function");
      assertEquals(typeof authHelpers.handleProfileChangeEvent, "function");
    });
  });
});