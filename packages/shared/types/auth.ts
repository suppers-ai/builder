/**
 * Shared Authentication Types
 * Common types for authentication and user management across packages
 */

import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

// Re-export the canonical User type from type-mappers
export type { User } from "../utils/type-mappers.ts";

// Auth Session - just contains the user ID and Supabase session
export interface AuthSession {
  userId: string;
  session: Session;
}

// Auth State - just tracks if authenticated and user ID
export interface AuthState {
  userId: string | null;
  session: Session | null;
  loading: boolean;
}

// Sign Up Data
export interface SignUpData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
}

// Sign In Data
export interface SignInData {
  email: string;
  password: string;
}

// Reset Password Data
export interface ResetPasswordData {
  email: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  theme_id?: string;
  stripe_customer_id?: string;
  role?: 'user' | 'admin';
}

export type AuthEventType =
  | "login"
  | "logout"
  | "token_refresh"
  | "error";

export interface AuthEventData {
  login?: { userId: string };
  logout?: void;
  token_refresh?: AuthSession;
  error?: { error: string; error_description?: string };
}

export interface AuthEventCallback {
  (event: AuthEventType, data?: AuthEventData[AuthEventType]): void;
}
