// Export auth clients - each package chooses which to use
export { DirectAuthClient } from "./direct-auth-client.ts";
export { OAuthAuthClient } from "./oauth-auth-client.ts";
export { BaseAuthClient } from "./base-auth-client.ts";

// Export storage utilities
export * from "./storage.ts";

// Export types from shared package
export type {
  AuthEventCallback,
  AuthEventData,
  AuthEventType,
  AuthSession,
  AuthState,
  ResetPasswordData,
  SignInData,
  SignUpData,
  UpdateUserData,
  User,
} from "../../shared/types/auth.ts";
