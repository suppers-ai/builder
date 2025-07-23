/**
 * Shared Authentication Types
 * Common types for authentication and user management across packages
 */

import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import type { UsersTable } from './database.ts';

// Derived Auth Types (based on database schema)
export type AuthUser = Pick<UsersTable, 'id' | 'email' | 'first_name' | 'last_name' | 'display_name' | 'avatar_url' | 'role'>;

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
  firstName?: string;
  middleNames?: string;
  lastName?: string;
  displayName?: string;
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

// Update User Data
export interface UpdateUserData {
  firstName?: string;
  middleNames?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
}

// OAuth Provider Types
export type OAuthProvider = "google" | "github" | "discord" | "twitter";

// User Role Types
export type UserRole = "user" | "admin" | "moderator";

// Access Level Types
export type AccessLevel = "read" | "write" | "admin";

// Auth Error Types
export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

// Auth Response Types
export interface AuthResponse<T = any> {
  data?: T;
  error?: AuthError;
  success: boolean;
}

// Session Data
export interface SessionData {
  user: AuthUser;
  session: Session;
  accessToken: string;
  refreshToken: string;
}

// Permission Types
export type Permission =
  | "read_profile"
  | "write_profile"
  | "read_applications"
  | "write_applications"
  | "delete_applications"
  | "read_users"
  | "write_users"
  | "admin_access";

// User Permissions Interface
export interface UserPermissions {
  userId: string;
  permissions: Permission[];
  role: UserRole;
}

// Auth Event Types
export type AuthEvent =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "TOKEN_REFRESHED"
  | "USER_UPDATED"
  | "PASSWORD_RECOVERY";

// Auth Event Handler
export type AuthEventHandler = (event: AuthEvent, session: Session | null) => void;
