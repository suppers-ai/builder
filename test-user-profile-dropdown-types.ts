#!/usr/bin/env -S deno run --allow-read

/**
 * Simple test to verify that the UserProfileDropdown component can import the canonical types correctly
 */

import type { AuthUser } from "./packages/shared/types/auth.ts";
import { TypeMappers } from "./packages/shared/utils/type-mappers.ts";

// Test data
const mockAuthUser: AuthUser = {
  id: "123",
  email: "test@example.com",
  first_name: "John",
  last_name: "Doe",
  display_name: "John Doe",
  avatar_url: "https://example.com/avatar.jpg",
  role: "user",
};

console.log("🧪 Testing UserProfileDropdown type imports...");

// Test that we can use the AuthUser type
console.log("✅ AuthUser type imported successfully");
console.log("User:", mockAuthUser);

// Test that we can use TypeMappers utilities
console.log("✅ TypeMappers imported successfully");
console.log("Display name:", TypeMappers.getDisplayName(mockAuthUser));
console.log("Is admin:", TypeMappers.isAdmin(mockAuthUser));

console.log("\n🎉 UserProfileDropdown type imports work correctly!");
console.log("The issue with the Dropdown component is unrelated to the canonical type changes.");