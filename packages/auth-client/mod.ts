/**
 * @fileoverview Auth Client Package
 *
 * This package provides a lightweight client for integrating with Supabase
 * authentication. It provides a clean API for authentication and user management.
 */

export * from "./src/mod.ts";

// Re-export shared types for convenience
export type {
  AuthEventCallback,
  AuthEventData,
  AuthEventType,
  AuthSession,
} from "../shared/types/auth.ts";
