/**
 * Shared Authentication Types
 * Common types for authentication and user management across packages
 */

import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "../generated/database-types.ts";

// Database table types
type UsersTable = Database["public"]["Tables"]["users"]["Row"];

// Derived Auth Types (based on database schema)
export type AuthUser = Pick<
  UsersTable,
  "id" | "email" | "first_name" | "last_name" | "display_name" | "avatar_url" | "role"
>;

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

export interface UpdateUserData {
  firstName?: string;
  middleNames?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
}