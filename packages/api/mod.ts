/**
 * Supabase Package
 *
 * This package contains the Supabase backend configuration and Edge Functions.
 * The actual client-side integration is in @suppers/ui-lib.
 */

// Re-export the main Supabase client and helpers from ui-lib
export {
  type Database,
  type Enums,
  supabase,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from "../ui-lib/src/lib/supabase-client.ts";

export { AuthHelpers } from "../ui-lib/src/lib/auth-helpers.ts";
export { ApiHelpers, UserNameHelpers } from "../ui-lib/src/lib/api-helpers.ts";

export type {
  AuthState,
  ResetPasswordData,
  SignInData,
  SignUpData,
  UpdateUserData,
} from "../ui-lib/src/lib/auth-helpers.ts";

export type {
  Application,
  CreateApplicationData,
  GrantAccessData,
  UpdateApplicationData,
  UpdateUserData,
  User,
  UserAccess,
} from "../ui-lib/src/lib/api-helpers.ts";

// Export the AuthProvider and hook
export { AuthProvider, useAuth } from "../ui-lib/src/providers/AuthProvider.tsx";

/**
 * Package metadata
 */
export const packageInfo = {
  name: "@suppers/supabase",
  version: "1.0.0",
  description: "Supabase backend integration with Edge Functions and database schema",
  features: [
    "Complete database schema with RLS policies",
    "Edge Functions for API endpoints",
    "Authentication & authorization",
    "Application management",
    "User access control",
    "File storage for avatars",
    "OAuth server for external apps",
    "Comprehensive SSO support",
  ],
} as const;
