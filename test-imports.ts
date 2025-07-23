#!/usr/bin/env -S deno run --allow-read

/**
 * Test to verify that the imports work correctly
 */

import type { AuthUser } from "./packages/shared/types/auth.ts";
import { TypeMappers } from "./packages/shared/utils/type-mappers.ts";

// Test that the imports work
const testUser: AuthUser = {
  id: "123",
  email: "test@example.com",
  first_name: "John",
  last_name: "Doe",
  display_name: "John Doe",
  avatar_url: "https://example.com/avatar.jpg",
  role: "user",
};

console.log("✅ AuthUser type imported successfully");
console.log("✅ TypeMappers imported successfully");
console.log("✅ Display name:", TypeMappers.getDisplayName(testUser));
console.log("✅ All imports working correctly!");