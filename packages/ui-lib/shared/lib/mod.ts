/**
 * UI Library Utilities Module
 */

// Database types
export type * from "./database-types.ts";

// Supabase client and types
export { supabase } from "./supabase-client.ts";
export type { Database, Tables, TablesInsert, TablesUpdate } from "./supabase-client.ts";

// Authentication helpers
export { AuthHelpers } from "./auth-helpers.ts";
export type {
  AuthState,
  ResetPasswordData,
  SignInData,
  SignUpData,
  UpdateUserData,
} from "./auth-helpers.ts";

// API helpers
export { ApiHelpers } from "./api-helpers.ts";
export type {
  Application,
  CreateApplicationData,
  GrantAccessData,
  UpdateApplicationData,
  UserAccess,
} from "./api-helpers.ts";

// SSR utilities
export { createSSRSafeComponent, isBrowser, isSSR, useIsBrowser } from "./ssr-utils.ts";

// Theme types and utilities
export type { CustomTheme } from "./theme-types.ts";
export {
  applyThemeToElement,
  createThemeVariables,
  DAISYUI_CSS_VARIABLES,
  DEFAULT_THEME_VARIABLES,
} from "./theme-types.ts";

// Hello function for testing
export function hello() {
  return "Hello from UI Library!";
}
