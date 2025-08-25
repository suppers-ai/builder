/**
 * DirectAuthClient - Main export file
 * 
 * This file provides the public API surface for the DirectAuthClient package.
 * It exports the main DirectAuthClient class and all necessary type definitions.
 */

// Main DirectAuthClient class
export { DirectAuthClient } from "./direct-auth-client.ts";

// Type definitions - Public API types
export type {
  SignInData,
  SignUpData,
  UpdateUserData,
  ResetPasswordData,
  DirectAuthClientConfig,
  AuthMethodResult,
  StorageUploadResult,
  FileListResult,
  FileInfo,
  SessionStatus,
  QuickAuthResult,
  ApiRequestOptions,
} from "./types.ts";

// Re-export shared types that are part of the public API
export type {
  AuthEventCallback,
  AuthEventType,
  AuthSession,
} from "@suppers/shared/types";