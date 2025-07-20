export interface AuthClientConfig {
  storeUrl: string;
  clientId?: string;
  redirectUri?: string;
  scopes?: string[];
  storageKey?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  user: AuthUser;
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

export type AuthEventType = 'login' | 'logout' | 'token_refresh' | 'error';

export interface AuthEventCallback {
  (event: AuthEventType, data?: any): void;
}