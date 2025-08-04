/**
 * Type Mappers Unit Tests
 * Comprehensive tests for all type mapping functions
 */

import {
  assertEquals,
  assertExists,
  assertThrows,
} from "@std/assert";
import {
  type AuthUser,
  TypeMappers,
  type User,
  type UserResponse,
  type UserResponseExtended,
} from "../utils/type-mappers.ts";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Test data
const mockUser: User = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "john.doe@example.com",
  first_name: "John",
  middle_names: "Michael",
  last_name: "Doe",
  display_name: "John Doe",
  avatar_url: "https://example.com/avatar.jpg",
  role: "user",
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
};

const mockUserMinimal: User = {
  id: "456e7890-e89b-12d3-a456-426614174001",
  email: "jane.smith@example.com",
  first_name: undefined,
  middle_names: undefined,
  last_name: undefined,
  display_name: undefined,
  avatar_url: undefined,
  role: "admin",
  created_at: "2023-01-02T00:00:00Z",
  updated_at: "2023-01-02T00:00:00Z",
};

const mockSupabaseUser: SupabaseUser = {
  id: "789e0123-e89b-12d3-a456-426614174002",
  aud: "authenticated",
  role: "authenticated",
  email: "supabase.user@example.com",
  email_confirmed_at: "2023-01-03T00:00:00Z",
  phone: "",
  confirmed_at: "2023-01-03T00:00:00Z",
  last_sign_in_at: "2023-01-03T00:00:00Z",
  app_metadata: {},
  user_metadata: {
    first_name: "Supabase",
    last_name: "User",
    display_name: "Supabase User",
    avatar_url: "https://example.com/supabase-avatar.jpg",
  },
  identities: [],
  created_at: "2023-01-03T00:00:00Z",
  updated_at: "2023-01-03T00:00:00Z",
};

Deno.test("TypeMappers - userToApiResponse", () => {
  const result = TypeMappers.userToApiResponse(mockUser);

  assertEquals(result.id, mockUser.id);
  assertEquals(result.email, mockUser.email);
  assertEquals(result.display_name, mockUser.display_name);
  assertEquals(result.avatar_url, mockUser.avatar_url);
  assertEquals(result.created_at, mockUser.created_at);

  // Should not include other fields
  assertEquals(Object.keys(result).length, 5);
});

Deno.test("TypeMappers - userToApiResponse with minimal data", () => {
  const result = TypeMappers.userToApiResponse(mockUserMinimal);

  assertEquals(result.id, mockUserMinimal.id);
  assertEquals(result.email, mockUserMinimal.email);
  assertEquals(result.display_name, undefined);
  assertEquals(result.avatar_url, undefined);
  assertEquals(result.created_at, mockUserMinimal.created_at);
});

Deno.test("TypeMappers - userToExtendedApiResponse", () => {
  const result = TypeMappers.userToExtendedApiResponse(mockUser);

  assertEquals(result.id, mockUser.id);
  assertEquals(result.email, mockUser.email);
  assertEquals(result.display_name, mockUser.display_name);
  assertEquals(result.avatar_url, mockUser.avatar_url);
  assertEquals(result.created_at, mockUser.created_at);
  assertEquals(result.full_name, "John Doe");
  assertEquals(result.initials, "JD");
});

Deno.test("TypeMappers - userToExtendedApiResponse with minimal data", () => {
  const result = TypeMappers.userToExtendedApiResponse(mockUserMinimal);

  assertEquals(result.full_name, "jane.smith");
  assertEquals(result.initials, "J");
});

Deno.test("TypeMappers - userToAuthUser", () => {
  const result = TypeMappers.userToAuthUser(mockUser);

  assertEquals(result.id, mockUser.id);
  assertEquals(result.email, mockUser.email);
  assertEquals(result.first_name, mockUser.first_name);
  assertEquals(result.last_name, mockUser.last_name);
  assertEquals(result.display_name, mockUser.display_name);
  assertEquals(result.avatar_url, mockUser.avatar_url);
  assertEquals(result.role, mockUser.role);

  // Should not include timestamps
  assertEquals(Object.keys(result).length, 7);
});

Deno.test("TypeMappers - supabaseUserToUser", () => {
  const result = TypeMappers.supabaseUserToUser(mockSupabaseUser);

  assertEquals(result.id, mockSupabaseUser.id);
  assertEquals(result.email, mockSupabaseUser.email);
  assertEquals(result.first_name, "Supabase");
  assertEquals(result.last_name, "User");
  assertEquals(result.display_name, "Supabase User");
  assertEquals(result.avatar_url, "https://example.com/supabase-avatar.jpg");
  assertEquals(result.role, "user"); // Default role
  assertExists(result.created_at);
  assertExists(result.updated_at);
});

Deno.test("TypeMappers - supabaseUserToUser with database user data", () => {
  const dbUserData = {
    first_name: "Override",
    role: "admin" as const,
    created_at: "2022-01-01T00:00:00Z",
  };

  const result = TypeMappers.supabaseUserToUser(mockSupabaseUser, dbUserData);

  assertEquals(result.first_name, "Override"); // Should use db data
  assertEquals(result.last_name, "User"); // Should use supabase data when db data not provided
  assertEquals(result.role, "admin"); // Should use db data
  assertEquals(result.created_at, "2022-01-01T00:00:00Z"); // Should use db data
});

Deno.test("TypeMappers - getFullName", () => {
  assertEquals(TypeMappers.getFullName(mockUser), "John Doe");

  const userWithoutDisplayName = { ...mockUser, display_name: undefined };
  assertEquals(TypeMappers.getFullName(userWithoutDisplayName), "John Michael Doe");

  const userWithOnlyFirstName = {
    ...mockUser,
    display_name: undefined,
    middle_names: undefined,
    last_name: undefined,
  };
  assertEquals(TypeMappers.getFullName(userWithOnlyFirstName), "John");

  assertEquals(TypeMappers.getFullName(mockUserMinimal), "jane.smith");
});

Deno.test("TypeMappers - getInitials", () => {
  assertEquals(TypeMappers.getInitials(mockUser), "JD");

  const userWithoutDisplayName = { ...mockUser, display_name: undefined };
  assertEquals(TypeMappers.getInitials(userWithoutDisplayName), "JM");

  assertEquals(TypeMappers.getInitials(mockUserMinimal), "J");
});

Deno.test("TypeMappers - isAdmin", () => {
  assertEquals(TypeMappers.isAdmin(mockUser), false);
  assertEquals(TypeMappers.isAdmin(mockUserMinimal), true);

  const authUser: AuthUser = TypeMappers.userToAuthUser(mockUserMinimal);
  assertEquals(TypeMappers.isAdmin(authUser), true);
});

Deno.test("TypeMappers - isModerator", () => {
  assertEquals(TypeMappers.isModerator(mockUser), false);
  assertEquals(TypeMappers.isModerator(mockUserMinimal), true);

  const moderatorUser = { ...mockUser, role: "moderator" as const };
  assertEquals(TypeMappers.isModerator(moderatorUser), true);
});

Deno.test("TypeMappers - getDisplayName", () => {
  assertEquals(TypeMappers.getDisplayName(mockUser), "John Doe");
  assertEquals(TypeMappers.getDisplayName(mockUserMinimal), "jane.smith");

  const userWithoutDisplayName = { ...mockUser, display_name: undefined };
  assertEquals(TypeMappers.getDisplayName(userWithoutDisplayName), "John Michael Doe");
});

Deno.test("TypeMappers - safeUserToApiResponse", () => {
  const result = TypeMappers.safeUserToApiResponse(mockUser);
  assertExists(result);
  assertEquals(result!.id, mockUser.id);

  // Test with invalid data
  assertEquals(TypeMappers.safeUserToApiResponse(null), null);
  assertEquals(TypeMappers.safeUserToApiResponse(undefined), null);
  assertEquals(TypeMappers.safeUserToApiResponse("invalid"), null);
  assertEquals(TypeMappers.safeUserToApiResponse({}), null);
  assertEquals(TypeMappers.safeUserToApiResponse({ id: "123" }), null); // Missing email
});

Deno.test("TypeMappers - safeUserToAuthUser", () => {
  const result = TypeMappers.safeUserToAuthUser(mockUser);
  assertExists(result);
  assertEquals(result!.id, mockUser.id);
  assertEquals(result!.role, mockUser.role);

  // Test with invalid data
  assertEquals(TypeMappers.safeUserToAuthUser(null), null);
  assertEquals(TypeMappers.safeUserToAuthUser(undefined), null);
  assertEquals(TypeMappers.safeUserToAuthUser("invalid"), null);
  assertEquals(TypeMappers.safeUserToAuthUser({}), null);
});

Deno.test("TypeMappers - batch operations", () => {
  const users = [mockUser, mockUserMinimal];

  const apiResponses = TypeMappers.usersToApiResponses(users);
  assertEquals(apiResponses.length, 2);
  assertEquals(apiResponses[0].id, mockUser.id);
  assertEquals(apiResponses[1].id, mockUserMinimal.id);

  const extendedResponses = TypeMappers.usersToExtendedApiResponses(users);
  assertEquals(extendedResponses.length, 2);
  assertEquals(extendedResponses[0].full_name, "John Doe");
  assertEquals(extendedResponses[1].full_name, "jane.smith");
});

Deno.test("TypeMappers - edge cases", () => {
  // Test user with empty email
  const userWithEmptyEmail = { ...mockUser, email: "" };
  assertEquals(TypeMappers.getFullName(userWithEmptyEmail), "John Doe");

  // Test user with only email
  const emailOnlyUser: User = {
    id: "test-id",
    email: "test@example.com",
    first_name: undefined,
    middle_names: undefined,
    last_name: undefined,
    display_name: undefined,
    avatar_url: undefined,
    role: "user",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  };

  assertEquals(TypeMappers.getFullName(emailOnlyUser), "test");
  assertEquals(TypeMappers.getInitials(emailOnlyUser), "T");
  assertEquals(TypeMappers.getDisplayName(emailOnlyUser), "test");
});

Deno.test("TypeMappers - application mapping", () => {
  const mockApplication = {
    id: "app-123",
    name: "Test App",
    description: "A test application",
    template_id: "template-1",
    configuration: { theme: "dark" },
    status: "published" as const,
    owner_id: "user-123",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  };

  const apiResponse = TypeMappers.applicationToApiResponse(mockApplication);
  assertEquals(apiResponse.id, mockApplication.id);
  assertEquals(apiResponse.name, mockApplication.name);
  assertEquals(apiResponse.description, mockApplication.description);
  assertEquals(apiResponse.status, mockApplication.status);
  assertEquals(apiResponse.created_at, mockApplication.created_at);
  assertEquals(apiResponse.updated_at, mockApplication.updated_at);

  // Should not include template_id, configuration, owner_id
  assertEquals(Object.keys(apiResponse).length, 6);

  const extendedResponse = TypeMappers.applicationToExtendedApiResponse(
    mockApplication,
    "John Doe",
    5,
  );
  assertEquals(extendedResponse.owner_name, "John Doe");
  assertEquals(extendedResponse.review_count, 5);
});

// Additional comprehensive tests for error handling and edge cases
Deno.test("TypeMappers - error handling in supabaseUserToUser", () => {
  // Test with minimal supabase user data
  const minimalSupabaseUser: SupabaseUser = {
    id: "minimal-id",
    aud: "authenticated",
    role: "authenticated",
    email: undefined, // Email can be undefined in some cases
    email_confirmed_at: undefined,
    phone: "",
    confirmed_at: undefined,
    last_sign_in_at: undefined,
    app_metadata: {},
    user_metadata: {},
    identities: [],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  };

  const result = TypeMappers.supabaseUserToUser(minimalSupabaseUser);
  assertEquals(result.id, "minimal-id");
  assertEquals(result.email, ""); // Should default to empty string
  assertEquals(result.role, "user"); // Should default to user role
  assertExists(result.created_at);
  assertExists(result.updated_at);
});

Deno.test("TypeMappers - type safety with malformed data", () => {
  // Test safe conversion with objects missing required fields
  const malformedUser = {
    id: "test-id",
    // Missing email
    first_name: "Test",
  };

  assertEquals(TypeMappers.safeUserToApiResponse(malformedUser), null);
  assertEquals(TypeMappers.safeUserToAuthUser(malformedUser), null);
});

Deno.test("TypeMappers - initials with special characters", () => {
  const userWithSpecialChars: User = {
    ...mockUser,
    display_name: undefined,
    first_name: "José",
    last_name: "María-González",
  };

  assertEquals(TypeMappers.getInitials(userWithSpecialChars), "JM");
  assertEquals(TypeMappers.getFullName(userWithSpecialChars), "José Michael María-González");
});

Deno.test("TypeMappers - empty and whitespace handling", () => {
  const userWithWhitespace: User = {
    ...mockUser,
    first_name: "  ",
    middle_names: "",
    last_name: "   ",
    display_name: undefined,
  };

  // Should fall back to email local part when names are empty/whitespace
  assertEquals(TypeMappers.getFullName(userWithWhitespace), "john.doe");
  assertEquals(TypeMappers.getInitials(userWithWhitespace), "J");
});

Deno.test("TypeMappers - role validation helpers", () => {
  const users = [
    { ...mockUser, role: "user" as const },
    { ...mockUser, role: "admin" as const },
    { ...mockUser, role: "moderator" as const },
  ];

  assertEquals(TypeMappers.isAdmin(users[0]), false);
  assertEquals(TypeMappers.isAdmin(users[1]), true);
  assertEquals(TypeMappers.isAdmin(users[2]), false);

  assertEquals(TypeMappers.isModerator(users[0]), false);
  assertEquals(TypeMappers.isModerator(users[1]), true);
  assertEquals(TypeMappers.isModerator(users[2]), true);
});

Deno.test("TypeMappers - batch operations with empty arrays", () => {
  assertEquals(TypeMappers.usersToApiResponses([]), []);
  assertEquals(TypeMappers.usersToExtendedApiResponses([]), []);
  assertEquals(TypeMappers.applicationsToApiResponses([]), []);
});

Deno.test("TypeMappers - application mapping with minimal data", () => {
  const minimalApp = {
    id: "app-minimal",
    name: "Minimal App",
    description: undefined,
    template_id: "template-1",
    configuration: {},
    status: "draft" as const,
    owner_id: "user-1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  };

  const result = TypeMappers.applicationToApiResponse(minimalApp);
  assertEquals(result.description, undefined);
  assertEquals(result.status, "draft");

  const extended = TypeMappers.applicationToExtendedApiResponse(minimalApp);
  assertEquals(extended.owner_name, undefined);
  assertEquals(extended.review_count, undefined);
});
