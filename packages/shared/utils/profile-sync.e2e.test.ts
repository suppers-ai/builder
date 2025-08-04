/**
 * End-to-end tests for complete profile synchronization user workflows
 */

import { assertEquals, assertExists } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";

import {
  ProfileEventSerializer,
  ProfileSyncManager,
  type ProfileChangeEvent,
  type ProfilePopupOptions,
} from "./profile-sync.ts";
import { CrossAppAuthHelpers, type Session, type User } from "./cross-app-auth.ts";

// Mock complete browser environment for E2E tests
const mockCompleteEnvironment = () => {
  // Mock localStorage with event simulation
  const storage: Record<string, string> = {};
  const storageListeners: ((event: StorageEvent) => void)[] = [];

  (globalThis as any).localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      const oldValue = storage[key] || null;
      storage[key] = value;
      
      // Simulate storage event for cross-tab communication
      const event = new StorageEvent("storage", {
        key,
        newValue: value,
        oldValue,
        storageArea: (globalThis as any).localStorage,
      });
      
      storageListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error("Storage event listener error:", error);
        }
      });
    },
    removeItem: (key: string) => {
      const oldValue = storage[key] || null;
      delete storage[key];
      
      const event = new StorageEvent("storage", {
        key,
        newValue: null,
        oldValue,
        storageArea: (globalThis as any).localStorage,
      });
      
      storageListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error("Storage event listener error:", error);
        }
      });
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
  };

  // Mock window with comprehensive event handling
  const windowListeners: Record<string, Function[]> = {};
  const customEvents: CustomEvent[] = [];

  (globalThis as any).window = {
    addEventListener: (type: string, listener: Function) => {
      if (!windowListeners[type]) windowListeners[type] = [];
      windowListeners[type].push(listener);
      
      if (type === "storage") {
        storageListeners.push(listener as (event: StorageEvent) => void);
      }
    },
    removeEventListener: (type: string, listener: Function) => {
      if (windowListeners[type]) {
        const index = windowListeners[type].indexOf(listener);
        if (index > -1) windowListeners[type].splice(index, 1);
      }
      
      if (type === "storage") {
        const index = storageListeners.indexOf(listener as (event: StorageEvent) => void);
        if (index > -1) storageListeners.splice(index, 1);
      }
    },
    dispatchEvent: (event: Event) => {
      if (event instanceof CustomEvent) {
        customEvents.push(event);
      }
      
      const listeners = windowListeners[event.type] || [];
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error("Window event listener error:", error);
        }
      });
      return true;
    },
    location: { 
      hostname: "docs.example.com", 
      port: "443",
      origin: "https://docs.example.com"
    },
    screen: { availWidth: 1920, availHeight: 1080, width: 1920, height: 1080 },
    innerWidth: 1920,
    innerHeight: 1080,
    open: (url: string, name: string, features: string) => {
      // Simulate successful popup creation
      const mockPopup = {
        closed: false,
        location: { href: url },
        focus: () => {},
        close: () => { mockPopup.closed = true; },
        postMessage: (message: any, origin: string) => {
          // Simulate message received by popup
          console.log(`Popup received message:`, message, `from origin:`, origin);
        },
        outerWidth: 600,
        outerHeight: 700,
        document: {},
      };
      return mockPopup;
    },
  };

  // Mock navigator
  (globalThis as any).navigator = {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    onLine: true,
  };

  // Mock document with DOM manipulation
  const documentListeners: Record<string, Function[]> = {};
  const mockElements: any[] = [];

  (globalThis as any).document = {
    documentElement: {
      setAttribute: (name: string, value: string) => {
        console.log(`Document element attribute set: ${name}=${value}`);
      },
      getAttribute: (name: string) => {
        if (name === "data-theme") return "light";
        return null;
      },
    },
    addEventListener: (type: string, listener: Function) => {
      if (!documentListeners[type]) documentListeners[type] = [];
      documentListeners[type].push(listener);
    },
    removeEventListener: (type: string, listener: Function) => {
      if (documentListeners[type]) {
        const index = documentListeners[type].indexOf(listener);
        if (index > -1) documentListeners[type].splice(index, 1);
      }
    },
    dispatchEvent: (event: Event) => {
      const listeners = documentListeners[event.type] || [];
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error("Document event listener error:", error);
        }
      });
      return true;
    },
    querySelectorAll: (selector: string) => {
      if (selector.includes("avatar")) {
        return mockElements.filter(el => el.className?.includes("avatar") || el.alt?.includes("avatar"));
      }
      return [];
    },
    createElement: (tagName: string) => {
      const element = {
        tagName: tagName.toUpperCase(),
        className: "",
        src: "",
        alt: "",
        setAttribute: function(name: string, value: string) {
          (this as any)[name] = value;
        },
        getAttribute: function(name: string) {
          return (this as any)[name] || null;
        },
      };
      mockElements.push(element);
      return element;
    },
  };

  // Mock BroadcastChannel with cross-tab simulation
  const channels: Record<string, any[]> = {};

  (globalThis as any).BroadcastChannel = class MockBroadcastChannel {
    private name: string;
    private listeners: Function[] = [];
    private closed = false;

    constructor(name: string) {
      this.name = name;
      if (!channels[name]) channels[name] = [];
      channels[name].push(this);
    }

    addEventListener(type: string, listener: Function) {
      if (type === "message" && !this.closed) {
        this.listeners.push(listener);
      }
    }

    removeEventListener(type: string, listener: Function) {
      if (type === "message") {
        const index = this.listeners.indexOf(listener);
        if (index > -1) this.listeners.splice(index, 1);
      }
    }

    postMessage(data: any) {
      if (this.closed) return;
      
      // Simulate async message delivery to other tabs
      setTimeout(() => {
        channels[this.name].forEach(channel => {
          if (channel !== this && !channel.closed) {
            channel.listeners.forEach((listener: Function) => {
              try {
                listener({ data, type: "message" });
              } catch (error) {
                console.error("BroadcastChannel listener error:", error);
              }
            });
          }
        });
      }, 0);
    }

    close() {
      this.closed = true;
      const channelList = channels[this.name];
      if (channelList) {
        const index = channelList.indexOf(this);
        if (index > -1) channelList.splice(index, 1);
      }
    }
  };

  return { 
    storage, 
    storageListeners, 
    windowListeners, 
    documentListeners, 
    customEvents, 
    mockElements, 
    channels 
  };
};

describe("Profile Sync End-to-End Tests", () => {
  let mockEnv: ReturnType<typeof mockCompleteEnvironment>;

  beforeEach(() => {
    // Reset singleton instances for clean tests
    (ProfileSyncManager as any).instance = null;
    (CrossAppAuthHelpers as any).instance = null;

    // Setup complete mock environment
    mockEnv = mockCompleteEnvironment();
  });

  describe("Complete user login and profile sync workflow", () => {
    it("should handle complete user authentication and profile setup", () => {
      const syncManager = ProfileSyncManager.getInstance();
      const authHelpers = CrossAppAuthHelpers.getInstance();

      // Step 1: User logs in and session is established
      const session: Session = {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refresh_token: "refresh_token_123",
        user: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "john.doe@example.com",
          user_metadata: {
            display_name: "John Doe",
            first_name: "John",
            last_name: "Doe",
            avatar_url: "https://example.com/avatars/john-doe.jpg",
            theme: "light",
            preferences: {
              notifications: true,
              language: "en",
            },
          },
        },
        expires_at: Date.now() + 3600000, // 1 hour from now
      };

      // Sync session across applications
      authHelpers.syncSessionAcrossApps(session);

      // Verify user is properly set up
      const currentUser = authHelpers.getCurrentUser();
      const currentSession = authHelpers.getCurrentSession();

      assertExists(currentUser);
      assertExists(currentSession);
      assertEquals(currentUser.displayName, "John Doe");
      assertEquals(currentUser.email, "john.doe@example.com");
      assertEquals(currentUser.theme, "light");
      assertEquals(currentSession.access_token, session.access_token);

      // Step 2: Verify communication system is ready
      assertEquals(syncManager.isReady(), true);
      assertEquals(syncManager.getCommunicationMethod() !== "none", true);
    });

    it("should handle user profile updates from profile application", () => {
      const syncManager = ProfileSyncManager.getInstance();
      const authHelpers = CrossAppAuthHelpers.getInstance();

      // Setup initial user
      const initialUser: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "john.doe@example.com",
        displayName: "John Doe",
        firstName: "John",
        lastName: "Doe",
        avatarUrl: "https://example.com/avatars/john-doe.jpg",
        theme: "light",
      };

      authHelpers.setCurrentUser(initialUser);

      // Step 1: User changes theme in profile application
      const themeChangeEvent: ProfileChangeEvent = {
        type: "theme",
        data: { theme: "dark" },
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      // Simulate receiving theme change from profile app
      authHelpers.handleProfileChangeEvent(themeChangeEvent);

      // Verify theme was updated
      assertEquals(authHelpers.getCurrentUser()?.theme, "dark");

      // Step 2: User updates display name
      const nameChangeEvent: ProfileChangeEvent = {
        type: "displayName",
        data: {
          displayName: "John Smith",
          firstName: "John",
          lastName: "Smith",
        },
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      authHelpers.handleProfileChangeEvent(nameChangeEvent);

      const updatedUser = authHelpers.getCurrentUser();
      assertEquals(updatedUser?.displayName, "John Smith");
      assertEquals(updatedUser?.lastName, "Smith");

      // Step 3: User uploads new avatar
      const avatarChangeEvent: ProfileChangeEvent = {
        type: "avatar",
        data: { avatarUrl: "https://example.com/avatars/john-smith-new.jpg" },
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      authHelpers.handleProfileChangeEvent(avatarChangeEvent);

      assertEquals(authHelpers.getCurrentUser()?.avatarUrl, "https://example.com/avatars/john-smith-new.jpg");
    });

    it("should handle user sign out workflow", () => {
      const syncManager = ProfileSyncManager.getInstance();
      const authHelpers = CrossAppAuthHelpers.getInstance();

      // Setup user session
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "john.doe@example.com",
        displayName: "John Doe",
        theme: "dark",
      };

      const session: Session = {
        access_token: "token123",
        user: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "john.doe@example.com",
        },
      };

      authHelpers.setCurrentUser(user, session);

      // Verify user is logged in
      assertExists(authHelpers.getCurrentUser());
      assertExists(authHelpers.getCurrentSession());

      // Step 1: User initiates sign out
      authHelpers.clearSessionAcrossApps();

      // Verify user is signed out
      assertEquals(authHelpers.getCurrentUser(), null);
      assertEquals(authHelpers.getCurrentSession(), null);

      // Step 2: Simulate sign out event from another application
      const signOutEvent: ProfileChangeEvent = {
        type: "signOut",
        data: { reason: "user_initiated" },
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      // Reset user for testing event handling
      authHelpers.setCurrentUser(user, session);
      assertExists(authHelpers.getCurrentUser());

      // Handle sign out event
      authHelpers.handleProfileChangeEvent(signOutEvent);

      // Verify user is signed out
      assertEquals(authHelpers.getCurrentUser(), null);
      assertEquals(authHelpers.getCurrentSession(), null);
    });
  });

  describe("Cross-application communication workflows", () => {
    it("should simulate multi-tab profile synchronization", async () => {
      // Simulate two browser tabs
      const syncManager1 = ProfileSyncManager.getInstance();
      
      // Reset and create second instance (simulating different tab)
      (ProfileSyncManager as any).instance = null;
      const syncManager2 = ProfileSyncManager.getInstance();

      let tab2ReceivedEvents: ProfileChangeEvent[] = [];

      // Subscribe to events in "tab 2"
      const unsubscribe = syncManager2.subscribeToProfileChanges((event) => {
        tab2ReceivedEvents.push(event);
      });

      // Broadcast theme change from "tab 1"
      const themeEvent: ProfileChangeEvent = {
        type: "theme",
        data: { theme: "dark" },
        timestamp: Date.now(),
        source: "docs",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      syncManager1.broadcastProfileChange(themeEvent);

      // Wait for async message delivery
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify event was received in tab 2
      assertEquals(tab2ReceivedEvents.length, 1);
      assertEquals(tab2ReceivedEvents[0].type, "theme");
      assertEquals(tab2ReceivedEvents[0].data.theme, "dark");

      unsubscribe();
    });

    it("should handle popup-based profile editing workflow", () => {
      const syncManager = ProfileSyncManager.getInstance();

      // Step 1: User clicks "View Profile" in docs application
      const popupOptions: ProfilePopupOptions = {
        origin: "https://profile.example.com",
        appName: "docs",
        dimensions: { width: 600, height: 700 },
        position: "center",
      };

      const popupHandle = syncManager.openProfilePopup(popupOptions);

      // Verify popup was created successfully
      assertExists(popupHandle);
      assertEquals(popupHandle.isBlocked, false);
      assertExists(popupHandle.window);

      // Step 2: Simulate profile changes in popup
      const profileUpdateMessage = {
        type: "profile-updated",
        data: {
          displayName: "Updated Name",
          theme: "dark",
        },
      };

      // Simulate message from popup to parent
      popupHandle.postMessage(profileUpdateMessage);

      // Step 3: Simulate popup closing
      popupHandle.close();
      assertEquals(popupHandle.checkStatus().isClosed, true);
    });

    it("should handle mobile device workflow with modal fallback", () => {
      // Mock mobile environment by replacing navigator entirely
      const originalNavigator = globalThis.navigator;
      (globalThis as any).navigator = {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
        onLine: true,
      };
      (globalThis as any).window.innerWidth = 375;

      try {
        // Create new sync manager to pick up mobile detection
        (ProfileSyncManager as any).instance = null;
        const syncManager = ProfileSyncManager.getInstance();

        // Verify mobile detection
        assertEquals(syncManager.isMobileDevice(), true);
        assertEquals(syncManager.shouldUseModal(), true);

        // Attempt to open profile popup (should use modal instead)
        const popupOptions: ProfilePopupOptions = {
          origin: "https://profile.example.com",
          appName: "docs",
        };

        const handle = syncManager.openProfilePopup(popupOptions);

        // Verify modal handle is returned (no actual window)
        assertExists(handle);
        assertEquals(handle.window, null);
        assertEquals(handle.isBlocked, false);

        handle.close();
      } finally {
        // Restore original navigator
        (globalThis as any).navigator = originalNavigator;
      }
    });
  });

  describe("Error recovery and resilience workflows", () => {
    it("should handle network connectivity issues", () => {
      const syncManager = ProfileSyncManager.getInstance();
      const authHelpers = CrossAppAuthHelpers.getInstance();

      // Setup user
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "john.doe@example.com",
        displayName: "John Doe",
        theme: "light",
      };
      authHelpers.setCurrentUser(user);

      // Simulate network going offline
      (globalThis as any).navigator.onLine = false;

      // User tries to sync theme change while offline
      authHelpers.syncThemeAcrossApps("dark");

      // Verify local state is updated even when offline
      assertEquals(authHelpers.getCurrentUser()?.theme, "dark");

      // Simulate network coming back online
      (globalThis as any).navigator.onLine = true;

      // System should be ready to sync when online
      assertEquals(syncManager.isReady(), true);
    });

    it("should handle popup blocking gracefully", () => {
      const syncManager = ProfileSyncManager.getInstance();

      // Mock popup blocking
      (globalThis as any).window.open = () => null;

      const popupOptions: ProfilePopupOptions = {
        origin: "https://profile.example.com",
        appName: "docs",
      };

      const handle = syncManager.openProfilePopup(popupOptions);

      // Verify popup blocking is detected
      assertEquals(handle.isBlocked, true);
      assertEquals(handle.window, null);

      // System should still provide fallback functionality
      assertExists(handle.close);
      assertExists(handle.postMessage);
      assertExists(handle.onMessage);

      handle.close();
    });

    it("should handle malformed data gracefully", () => {
      const syncManager = ProfileSyncManager.getInstance();

      // Attempt to broadcast malformed event
      const malformedEvent = {
        type: "invalid-type",
        data: { theme: "dark" },
        timestamp: "not-a-number",
        source: "",
        userId: "not-a-uuid",
      };

      // This should not throw an error
      syncManager.broadcastProfileChange(malformedEvent as any);

      // System should remain functional
      assertEquals(syncManager.isReady(), true);
      assertEquals(typeof syncManager.getSubscriberCount(), "number");
    });

    it("should handle storage quota exceeded", () => {
      const authHelpers = CrossAppAuthHelpers.getInstance();

      // Mock storage quota exceeded
      const originalSetItem = (globalThis as any).localStorage.setItem;
      (globalThis as any).localStorage.setItem = () => {
        throw new Error("QuotaExceededError");
      };

      // User tries to sync theme (should not throw)
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "john.doe@example.com",
        displayName: "John Doe",
        theme: "light",
      };
      authHelpers.setCurrentUser(user);

      // This should not throw an error
      authHelpers.syncThemeAcrossApps("dark");

      // Restore original setItem
      (globalThis as any).localStorage.setItem = originalSetItem;
    });
  });

  describe("Performance and scalability workflows", () => {
    it("should handle multiple rapid profile changes", () => {
      const syncManager = ProfileSyncManager.getInstance();
      const authHelpers = CrossAppAuthHelpers.getInstance();

      // Setup user
      const user: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "john.doe@example.com",
        displayName: "John Doe",
        theme: "light",
      };
      authHelpers.setCurrentUser(user);

      // Simulate rapid theme changes
      const themes = ["dark", "light", "auto", "dark", "light"];
      
      themes.forEach((theme, index) => {
        authHelpers.syncThemeAcrossApps(theme);
        assertEquals(authHelpers.getCurrentUser()?.theme, theme);
      });

      // System should handle rapid changes without issues
      assertEquals(syncManager.isReady(), true);
    });

    it("should handle many subscribers efficiently", () => {
      const syncManager = ProfileSyncManager.getInstance();

      const subscribers: (() => void)[] = [];
      const receivedEvents: ProfileChangeEvent[][] = [];

      // Add many subscribers
      for (let i = 0; i < 50; i++) {
        const events: ProfileChangeEvent[] = [];
        receivedEvents.push(events);
        
        const unsubscribe = syncManager.subscribeToProfileChanges((event) => {
          events.push(event);
        });
        subscribers.push(unsubscribe);
      }

      assertEquals(syncManager.getSubscriberCount(), 50);

      // Broadcast an event
      const testEvent: ProfileChangeEvent = {
        type: "theme",
        data: { theme: "dark" },
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      syncManager.broadcastProfileChange(testEvent);

      // Clean up subscribers
      subscribers.forEach(unsubscribe => unsubscribe());
      assertEquals(syncManager.getSubscriberCount(), 0);
    });

    it("should handle large profile data efficiently", () => {
      const largeProfileData = {
        user: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          displayName: "John Doe",
          email: "john.doe@example.com",
          bio: "A".repeat(1000), // Large bio
          preferences: {
            theme: "dark",
            language: "en",
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            privacy: {
              profileVisible: true,
              emailVisible: false,
              phoneVisible: false,
            },
            customFields: Array.from({ length: 100 }, (_, i) => ({
              key: `field_${i}`,
              value: `value_${i}`,
            })),
          },
        },
      };

      const largeEvent: ProfileChangeEvent = {
        type: "profile",
        data: largeProfileData,
        timestamp: Date.now(),
        source: "profile",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      // Should handle large data without issues
      const serialized = ProfileEventSerializer.serialize(largeEvent);
      assertExists(serialized.checksum);

      const deserialized = ProfileEventSerializer.deserialize(serialized);
      assertEquals(deserialized.data.user?.bio?.length, 1000);
      assertEquals(deserialized.data.user?.preferences?.customFields?.length, 100);
    });
  });
});