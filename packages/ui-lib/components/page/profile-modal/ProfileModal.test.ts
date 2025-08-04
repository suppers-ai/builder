import { assertEquals, assertExists } from "@std/assert";
import {
  ProfileModalPropsSchema,
  ProfileUpdateDataSchema,
  UserSchema,
} from "./ProfileModal.schema.ts";

Deno.test("ProfileModal Schema Tests", async (t) => {
  await t.step("should validate correct user object", () => {
    const validUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      user_metadata: {
        firstName: "John",
        lastName: "Doe",
        displayName: "John Doe",
        avatar_url: "https://example.com/avatar.jpg",
        theme: "dark",
      },
      first_name: "John",
      last_name: "Doe",
      display_name: "John Doe",
      avatar_url: "https://example.com/avatar.jpg",
      theme_id: "dark",
      role: "user",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
    };

    const result = UserSchema.safeParse(validUser);
    assertEquals(result.success, true);
  });

  await t.step("should validate minimal user object", () => {
    const minimalUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = UserSchema.safeParse(minimalUser);
    assertEquals(result.success, true);
  });

  await t.step("should reject user with invalid email", () => {
    const invalidUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "invalid-email",
    };

    const result = UserSchema.safeParse(invalidUser);
    assertEquals(result.success, false);
  });

  await t.step("should validate profile update data", () => {
    const updateData = {
      firstName: "Jane",
      lastName: "Smith",
      displayName: "Jane Smith",
      theme: "light",
    };

    const result = ProfileUpdateDataSchema.safeParse(updateData);
    assertEquals(result.success, true);
  });

  await t.step("should validate partial profile update data", () => {
    const partialUpdateData = {
      theme: "dark",
    };

    const result = ProfileUpdateDataSchema.safeParse(partialUpdateData);
    assertEquals(result.success, true);
  });

  await t.step("should validate ProfileModal props with required fields", () => {
    const props = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
      },
      isOpen: true,
      onClose: () => {},
    };

    const result = ProfileModalPropsSchema.safeParse(props);
    assertEquals(result.success, true);
  });

  await t.step("should validate ProfileModal props with all optional fields", () => {
    const props = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        user_metadata: {
          firstName: "John",
          lastName: "Doe",
          displayName: "John Doe",
          theme: "dark",
        },
      },
      isOpen: true,
      onClose: () => {},
      isLoading: false,
      error: null,
      success: "Profile updated!",
      isMobile: true,
      enableRealTimeSync: true,
      syncSource: "profile-modal",
      isPopupMode: true,
      parentOrigin: "https://example.com",
      onPopupClose: () => {},
      onProfileChange: () => {},
      onUpdateProfile: async () => ({ success: true }),
      onUploadAvatar: async () => {},
      onSignOut: () => {},
      onChangePassword: async () => {},
    };

    const result = ProfileModalPropsSchema.safeParse(props);
    assertEquals(result.success, true);
  });

  await t.step("should reject ProfileModal props with missing required fields", () => {
    const props = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
      },
      isOpen: true,
      // Missing onClose
    };

    const result = ProfileModalPropsSchema.safeParse(props);
    assertEquals(result.success, false);
  });

  await t.step("should validate null user", () => {
    const props = {
      user: null,
      isOpen: true,
      onClose: () => {},
    };

    const result = ProfileModalPropsSchema.safeParse(props);
    assertEquals(result.success, true);
  });
});

Deno.test("ProfileModal Mobile Detection", async (t) => {
  await t.step("should handle mobile-specific props", () => {
    const mobileProps = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
      },
      isOpen: true,
      onClose: () => {},
      isMobile: true,
    };

    const result = ProfileModalPropsSchema.safeParse(mobileProps);
    assertEquals(result.success, true);

    if (result.success) {
      assertEquals(result.data.isMobile, true);
    }
  });

  await t.step("should default isMobile to false", () => {
    const props = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
      },
      isOpen: true,
      onClose: () => {},
    };

    const result = ProfileModalPropsSchema.safeParse(props);
    assertEquals(result.success, true);

    if (result.success) {
      assertEquals(result.data.isMobile, false);
    }
  });
});

Deno.test("ProfileModal Real-time Sync", async (t) => {
  await t.step("should handle real-time sync props", () => {
    const syncProps = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
      },
      isOpen: true,
      onClose: () => {},
      enableRealTimeSync: true,
      syncSource: "test-app",
      onProfileChange: () => {},
    };

    const result = ProfileModalPropsSchema.safeParse(syncProps);
    assertEquals(result.success, true);

    if (result.success) {
      assertEquals(result.data.enableRealTimeSync, true);
      assertEquals(result.data.syncSource, "test-app");
    }
  });

  await t.step("should handle popup mode props", () => {
    const popupProps = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
      },
      isOpen: true,
      onClose: () => {},
      isPopupMode: true,
      parentOrigin: "https://docs.example.com",
      onPopupClose: () => {},
    };

    const result = ProfileModalPropsSchema.safeParse(popupProps);
    assertEquals(result.success, true);

    if (result.success) {
      assertEquals(result.data.isPopupMode, true);
      assertEquals(result.data.parentOrigin, "https://docs.example.com");
    }
  });
});
