/**
 * Unit tests for profile synchronization utilities
 */

import { assertEquals, assertExists, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  ProfileEventSerializer,
  ProfileEventValidator,
  type ProfileChangeEvent,
  type ProfilePopupOptions,
} from "./profile-sync.ts";

describe("ProfileEventValidator", () => {
  describe("validateEvent", () => {
    it("should validate a correct profile change event", () => {
      const validEvent: ProfileChangeEvent = {
        type: "theme",
        data: { theme: "dark" },
        timestamp: Date.now(),
        source: "docs",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = ProfileEventValidator.validateEvent(validEvent);

      assertEquals(result.isValid, true);
      assertEquals(result.event, validEvent);
      assertEquals(result.errors, []);
    });

    it("should reject event with invalid type", () => {
      const invalidEvent = {
        type: "invalid-type",
        data: { theme: "dark" },
        timestamp: Date.now(),
        source: "docs",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = ProfileEventValidator.validateEvent(invalidEvent);

      assertEquals(result.isValid, false);
      assertEquals(result.event, undefined);
      assertEquals(result.errors.length > 0, true);
    });

    it("should reject event with invalid userId format", () => {
      const invalidEvent = {
        type: "theme",
        data: { theme: "dark" },
        timestamp: Date.now(),
        source: "docs",
        userId: "invalid-uuid",
      };

      const result = ProfileEventValidator.validateEvent(invalidEvent);

      assertEquals(result.isValid, false);
      assertEquals(result.event, undefined);
      assertEquals(result.errors.length > 0, true);
    });

    it("should reject event with negative timestamp", () => {
      const invalidEvent = {
        type: "theme",
        data: { theme: "dark" },
        timestamp: -1,
        source: "docs",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = ProfileEventValidator.validateEvent(invalidEvent);

      assertEquals(result.isValid, false);
      assertEquals(result.event, undefined);
      assertEquals(result.errors.length > 0, true);
    });

    it("should reject event with empty source", () => {
      const invalidEvent = {
        type: "theme",
        data: { theme: "dark" },
        timestamp: Date.now(),
        source: "",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = ProfileEventValidator.validateEvent(invalidEvent);

      assertEquals(result.isValid, false);
      assertEquals(result.event, undefined);
      assertEquals(result.errors.length > 0, true);
    });
  });

  describe("validatePopupOptions", () => {
    it("should validate correct popup options", () => {
      const validOptions: ProfilePopupOptions = {
        origin: "https://example.com",
        appName: "docs",
        dimensions: { width: 600, height: 700 },
        position: "center",
      };

      const result = ProfileEventValidator.validatePopupOptions(validOptions);

      assertEquals(result.isValid, true);
      assertEquals(result.options, validOptions);
      assertEquals(result.errors, []);
    });

    it("should validate minimal popup options", () => {
      const validOptions: ProfilePopupOptions = {
        origin: "https://example.com",
        appName: "docs",
      };

      const result = ProfileEventValidator.validatePopupOptions(validOptions);

      assertEquals(result.isValid, true);
      assertEquals(result.options, validOptions);
      assertEquals(result.errors, []);
    });

    it("should reject options with invalid origin", () => {
      const invalidOptions = {
        origin: "not-a-url",
        appName: "docs",
      };

      const result = ProfileEventValidator.validatePopupOptions(invalidOptions);

      assertEquals(result.isValid, false);
      assertEquals(result.options, undefined);
      assertEquals(result.errors.length > 0, true);
    });

    it("should reject options with invalid dimensions", () => {
      const invalidOptions = {
        origin: "https://example.com",
        appName: "docs",
        dimensions: { width: -100, height: 700 },
      };

      const result = ProfileEventValidator.validatePopupOptions(invalidOptions);

      assertEquals(result.isValid, false);
      assertEquals(result.options, undefined);
      assertEquals(result.errors.length > 0, true);
    });
  });

  describe("sanitizeEventData", () => {
    it("should remove script tags from string values", () => {
      const data = {
        displayName: "John<script>alert('xss')</script>Doe",
        theme: "dark",
      };

      const sanitized = ProfileEventValidator.sanitizeEventData(data);

      assertEquals(sanitized.displayName, "JohnDoe");
      assertEquals(sanitized.theme, "dark");
    });

    it("should remove HTML tags from string values", () => {
      const data = {
        displayName: "John<b>Bold</b>Doe",
        description: "<p>Hello <em>world</em></p>",
      };

      const sanitized = ProfileEventValidator.sanitizeEventData(data);

      assertEquals(sanitized.displayName, "JohnBoldDoe");
      assertEquals(sanitized.description, "Hello world");
    });

    it("should handle nested objects", () => {
      const data = {
        user: {
          name: "John<script>alert('xss')</script>",
          profile: {
            bio: "<p>Developer</p>",
          },
        },
      };

      const sanitized = ProfileEventValidator.sanitizeEventData(data);

      assertEquals(sanitized.user.name, "John");
      assertEquals(sanitized.user.profile.bio, "Developer");
    });

    it("should handle arrays", () => {
      const data = {
        tags: ["tag1", "tag2"],
      };

      const sanitized = ProfileEventValidator.sanitizeEventData(data);

      // Test that array structure is preserved
      assertEquals(Array.isArray(sanitized.tags), true);
      assertEquals(sanitized.tags.length, 2);
      assertEquals(sanitized.tags[0], "tag1");
      assertEquals(sanitized.tags[1], "tag2");
    });

    it("should preserve non-string values", () => {
      const data = {
        count: 42,
        active: true,
        timestamp: Date.now(),
        nullValue: null,
      };

      const sanitized = ProfileEventValidator.sanitizeEventData(data);

      assertEquals(sanitized.count, 42);
      assertEquals(sanitized.active, true);
      assertEquals(sanitized.timestamp, data.timestamp);
      assertEquals(sanitized.nullValue, null);
    });
  });
});

describe("ProfileEventSerializer", () => {
  describe("serialize", () => {
    it("should serialize a valid profile change event", () => {
      const event: ProfileChangeEvent = {
        type: "theme",
        data: { theme: "dark" },
        timestamp: 1234567890,
        source: "docs",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const serialized = ProfileEventSerializer.serialize(event);

      assertEquals(serialized.type, "theme");
      assertEquals(serialized.timestamp, 1234567890);
      assertEquals(serialized.source, "docs");
      assertEquals(serialized.userId, "123e4567-e89b-12d3-a456-426614174000");
      assertEquals(JSON.parse(serialized.data), { theme: "dark" });
      assertExists(serialized.checksum);
    });

    it("should throw error for invalid event", () => {
      const invalidEvent = {
        type: "invalid-type",
        data: { theme: "dark" },
        timestamp: Date.now(),
        source: "docs",
        userId: "invalid-uuid",
      };

      assertThrows(
        () => ProfileEventSerializer.serialize(invalidEvent as any),
        Error,
        "Cannot serialize invalid event",
      );
    });

    it("should sanitize data during serialization", () => {
      const event: ProfileChangeEvent = {
        type: "displayName",
        data: { displayName: "John<script>alert('xss')</script>Doe" },
        timestamp: Date.now(),
        source: "docs",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const serialized = ProfileEventSerializer.serialize(event);
      const parsedData = JSON.parse(serialized.data);

      assertEquals(parsedData.displayName, "JohnDoe");
    });
  });

  describe("deserialize", () => {
    it("should deserialize a valid serialized event", () => {
      const originalEvent: ProfileChangeEvent = {
        type: "theme",
        data: { theme: "dark" },
        timestamp: 1234567890,
        source: "docs",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const serialized = ProfileEventSerializer.serialize(originalEvent);
      const deserialized = ProfileEventSerializer.deserialize(serialized);

      assertEquals(deserialized.type, originalEvent.type);
      assertEquals(deserialized.data, originalEvent.data);
      assertEquals(deserialized.timestamp, originalEvent.timestamp);
      assertEquals(deserialized.source, originalEvent.source);
      assertEquals(deserialized.userId, originalEvent.userId);
    });

    it("should validate checksum during deserialization", () => {
      const serialized = {
        type: "theme" as const,
        data: '{"theme":"dark"}',
        timestamp: 1234567890,
        source: "docs",
        userId: "123e4567-e89b-12d3-a456-426614174000",
        checksum: "invalid-checksum",
      };

      assertThrows(
        () => ProfileEventSerializer.deserialize(serialized),
        Error,
        "Event checksum validation failed",
      );
    });

    it("should throw error for invalid JSON data", () => {
      const serialized = {
        type: "theme" as const,
        data: "invalid-json",
        timestamp: 1234567890,
        source: "docs",
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      assertThrows(
        () => ProfileEventSerializer.deserialize(serialized),
        Error,
        "Failed to parse event data",
      );
    });
  });

  describe("createEvent", () => {
    it("should create a valid profile change event", () => {
      const event = ProfileEventSerializer.createEvent(
        "theme",
        { theme: "dark" },
        "docs",
        "123e4567-e89b-12d3-a456-426614174000",
      );

      assertEquals(event.type, "theme");
      assertEquals(event.data, { theme: "dark" });
      assertEquals(event.source, "docs");
      assertEquals(event.userId, "123e4567-e89b-12d3-a456-426614174000");
      assertEquals(typeof event.timestamp, "number");
      assertEquals(event.timestamp > 0, true);
    });

    it("should sanitize data when creating event", () => {
      const event = ProfileEventSerializer.createEvent(
        "displayName",
        { displayName: "John<script>alert('xss')</script>Doe" },
        "docs",
        "123e4567-e89b-12d3-a456-426614174000",
      );

      assertEquals(event.data.displayName, "JohnDoe");
    });

    it("should throw error for invalid event data", () => {
      assertThrows(
        () =>
          ProfileEventSerializer.createEvent(
            "invalid-type" as any,
            { theme: "dark" },
            "docs",
            "123e4567-e89b-12d3-a456-426614174000",
          ),
        Error,
        "Cannot create invalid event",
      );
    });
  });
});

// Import ProfileSyncManager for basic functionality tests
import { ProfileSyncManager } from "./profile-sync.ts";

// Test mobile device detection with basic functionality
describe("Mobile Device Detection", () => {
  it("should have mobile detection functionality", () => {
    // Test that the ProfileSyncManager has the mobile detection methods
    // This is a basic test to ensure the methods exist and return boolean values
    const manager = ProfileSyncManager.getInstance();

    assertEquals(typeof manager.isMobileDevice, "function");
    assertEquals(typeof manager.shouldUseModal, "function");
    assertEquals(typeof manager.isMobileDevice(), "boolean");
    assertEquals(typeof manager.shouldUseModal(), "boolean");
  });
});