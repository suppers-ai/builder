import { supabase } from "./supabase-client.ts";
import type { Session, User } from "@supabase/supabase-js";

// AuthState is now imported from shared package - see packages/shared/types/auth.ts
export type { AuthState } from "../../../shared/types/auth.ts";

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

export class AuthHelpers {
  /**
   * Sign up a new user
   */
  static async signUp(data: SignUpData) {
    const { email, password, firstName, middleNames, lastName, displayName } = data;

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          middle_names: middleNames,
          last_name: lastName,
          display_name: displayName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return authData;
  }

  /**
   * Sign in an existing user
   */
  static async signIn(data: SignInData) {
    const { email, password } = data;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return authData;
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Sign in with OAuth provider
   */
  static async signInWithOAuth(provider: "google" | "github" | "discord" | "twitter") {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${globalThis.location?.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Send password reset email
   */
  static async resetPassword(data: ResetPasswordData) {
    const { email } = data;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${globalThis.location?.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }

  /**
   * Get current session
   */
  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return session;
  }

  /**
   * Update user metadata
   */
  static async updateUser(data: UpdateUserData) {
    const { firstName, middleNames, lastName, displayName, avatarUrl } = data;

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        middle_names: middleNames,
        last_name: lastName,
        display_name: displayName,
        avatar_url: avatarUrl,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(file: File, userId: string) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}
