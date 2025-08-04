import { assertEquals, assertExists } from "@std/assert";
import {
  ProfileCardPropsSchema,
  ProfileUpdateDataSchema,
  UserSchema,
} from "./ProfileCard.schema.ts";

Deno.test("ProfileCard Schema Tests", async (t) => {
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

  await t.step("should validate ProfileCard props with basic fields", () => {
    const props = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
      },
    };

    const result = ProfileCardPropsSchema.safeParse(props);
    assertEquals(result.success, true);
  });

  await t.step("should validate ProfileCard props with real-time sync options", () => {
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
      enableRealTimeSync: true,
      syncSource: "profile-card",
      onProfileChange: () => {},
      onUpdateProfile: async () => ({ success: true }),
      onUploadAvatar: async () => {},
      onSignOut: () => {},
      onChangePassword: async () => {},
    };

    const result = ProfileCardPropsSchema.safeParse(props);
    assertEquals(result.success, true);
  });

  await t.step("should validate ProfileCard props with popup mode options", () => {
    const props = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
      },
      isPopupMode: true,
      parentOrigin: "https://docs.example.com",
      onPopupClose: () => {},
    };

    const result = ProfileCardPropsSchema.safeParse(props);
    assertEquals(result.success, true);
  });

  await t.step("should validate null user", () => {
    const props = {
      user: null,
    };

    const result = ProfileCardPropsSchema.safeParse(props);
    assertEquals(result.success, true);
  });

  await t.step("should default boolean props correctly", () => {
    const props = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
      },
    };

    const result = ProfileCardPropsSchema.safeParse(props);
    assertEquals(result.success, true);

    if (result.success) {
      assertEquals(result.data.isLoading, false);
      assertEquals(result.data.enableRealTimeSync, false);
      assertEquals(result.data.isPopupMode, false);
    }
  });
});

Deno.test("ProfileCard Real-time Sync Features", async (t) => {
  await t.step("should handle real-time sync props", () => {
    const syncProps = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
      },
      enableRealTimeSync: true,
      syncSource: "test-app",
      onProfileChange: () => {},
    };

    const result = ProfileCardPropsSchema.safeParse(syncProps);
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
      isPopupMode: true,
      parentOrigin: "https://docs.example.com",
      onPopupClose: () => {},
    };

    const result = ProfileCardPropsSchema.safeParse(popupProps);
    assertEquals(result.success, true);

    if (result.success) {
      assertEquals(result.data.isPopupMode, true);
      assertEquals(result.data.parentOrigin, "https://docs.example.com");
    }
  });

  await t.step("should handle combined real-time sync and popup mode", () => {
    const combinedProps = {
      user: {
        id: "123e4567-e89b-12d3-a456-426614174000",
      },
      enableRealTimeSync: true,
      syncSource: "profile-popup",
      isPopupMode: true,
      parentOrigin: "https://store.example.com",
      onPopupClose: () => {},
      onProfileChange: () => {},
    };

    const result = ProfileCardPropsSchema.safeParse(combinedProps);
    assertEquals(result.success, true);

    if (result.success) {
      assertEquals(result.data.enableRealTimeSync, true);
      assertEquals(result.data.isPopupMode, true);
      assertEquals(result.data.syncSource, "profile-popup");
      assertEquals(result.data.parentOrigin, "https://store.example.com");
    }
  });
});
