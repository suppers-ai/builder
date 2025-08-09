// Import canonical types from shared package
import type { User } from "../../shared/utils/type-mappers.ts";

export interface AuthClientConfig {
  storeUrl: string;
  clientId?: string;
  redirectUri?: string;
  scopes?: string[];
  storageKey?: string;
}

// Auth-client specific session interface (different from Supabase-based AuthSession in shared)
export interface AuthClientSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: User;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  user: User;
}

export interface AuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export interface LoginOptions {
  redirectUri?: string;
  state?: string;
  scopes?: string[];
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export type AuthEventType = "login" | "logout" | "token_refresh" | "error";

export interface AuthEventCallback {
  (event: AuthEventType, data?: unknown): void;
}
