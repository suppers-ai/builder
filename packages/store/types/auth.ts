import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

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