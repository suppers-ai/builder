/**
 * Authentication types shared across the application
 */

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: AuthUser;
}

export interface AuthUser {
  id: string;
  email?: string;
  email_verified?: boolean;
  phone?: string;
  phone_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  role?: string;
}

export type AuthEventType = 
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY"
  | "login"
  | "logout";

export interface AuthEventData {
  SIGNED_IN: { session: AuthSession };
  SIGNED_OUT: { session: null };
  TOKEN_REFRESHED: { session: AuthSession };
  USER_UPDATED: { user: AuthUser };
  PASSWORD_RECOVERY: { user: AuthUser };
  login: { session: AuthSession };
  logout: { session: null };
}

export type AuthEventCallback = (event: AuthEventType, data?: any) => void;

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthResponse<T> {
  data?: T;
  error?: AuthError;
}