/**
 * @fileoverview Auth Client Package
 *
 * This package provides a lightweight client for integrating with Supabase
 * authentication. It provides a clean API for authentication and user management.
 */

export * from "./src/mod.ts";
export * from "./src/storage.ts";

// Re-export shared types for convenience
export type {
  AuthEventCallback,
  AuthEventData,
  AuthEventType,
  AuthSession,
  AuthState,
  AuthUser,
  ResetPasswordData,
  SignInData,
  SignUpData,
  UpdateUserData,
} from "../shared/types/auth.ts";
