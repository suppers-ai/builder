// Export auth clients - each package chooses which to use
export { OAuthAuthClient } from "./oauth-auth-client.ts";
export { BaseAuthClient } from "./base-auth-client.ts";

// Export types from shared package
export type {
  AuthEventCallback,
  AuthEventData,
  AuthEventType,
  AuthSession,
} from "../../shared/types/auth.ts";

// Export User type as AuthUser to avoid conflicts
export type { User as AuthUser } from "../../shared/utils/type-mappers.ts";
