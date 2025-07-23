import type { Session, User } from "@supabase/supabase-js";

// AuthState is now imported from shared package - see packages/shared/types/auth.ts
export type { AuthState } from "../../shared/types/auth.ts";

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  middleNames?: string;
  lastName?: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

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

export type OAuthProvider = "google" | "github" | "discord" | "twitter";
