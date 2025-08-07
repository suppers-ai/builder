/**
 * Shared Authentication Types
 * Common types for authentication and user management across packages
 */

import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

// User metadata stored in auth.users.user_metadata
export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  theme_id?: string;
  role?: string;
}

// Derived Auth Types (based on Supabase auth.users with user_metadata)
export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  user_metadata: UserMetadata;
}

// Auth Session with our user type
export interface AuthSession {
  user: AuthUser;
  session: Session;
  supabaseUser: SupabaseUser;
}

// Auth State
export interface AuthState {
  user: AuthUser | null;
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
}

export type AuthEventType =
  | "login"
  | "logout"
  | "token_refresh"
  | "error"
  | "profile_change";

export interface AuthEventData {
  login?: AuthSession;
  logout?: void;
  token_refresh?: AuthSession;
  error?: { error: string; error_description?: string };
  profile_change?: AuthUser;
}

export interface AuthEventCallback {
  (event: AuthEventType, data?: AuthEventData[AuthEventType]): void;
}
