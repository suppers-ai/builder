// Export auth clients - each package chooses which to use
export { DirectAuthClient } from "./direct-auth-client.ts";
export { SSOAuthClient } from "./sso-auth-client.ts";
export { BaseAuthClient } from "./base-auth-client.ts";

// Export storage utilities
export * from "./storage.ts";

// Export types from shared package
export type { 
  AuthUser,
  AuthSession,
  AuthState,
  SignUpData,
  SignInData,
  ResetPasswordData,
  UpdateUserData,
  AuthEventType,
  AuthEventCallback,
  AuthEventData,
} from "../../shared/types/auth.ts";
