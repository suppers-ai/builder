import { supabase } from "./supabase-client.ts";
import type { Session, User } from "@supabase/supabase-js";
import type {
  OAuthProvider,
  ResetPasswordData,
  SignInData,
  SignUpData,
  UpdateUserData,
} from "../types/auth.ts";
import type { AuthState } from "../../shared/types/auth.ts";

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
  static async signInWithOAuth(provider: OAuthProvider, redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${globalThis.location?.origin}/auth/callback`,
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

  /**
   * Generate OAuth authorization URL for external apps
   */
  static generateOAuthUrl(provider: OAuthProvider, redirectTo: string, state?: string) {
    const params = new URLSearchParams({
      provider,
      redirect_to: redirectTo,
    });

    if (state) {
      params.set("state", state);
    }

    return `${globalThis.location?.origin}/auth/oauth?${params.toString()}`;
  }

  /**
   * Validate OAuth state parameter
   */
  static validateOAuthState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }

  /**
   * Create JWT token for external app
   */
  static async createJWTToken(
    user: User,
    clientId: string,
    scope: string = "openid email profile",
  ) {
    // This would typically use a JWT library
    // For now, return the session access token
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No active session");
    }

    return {
      access_token: session.access_token,
      token_type: "Bearer",
      expires_in: session.expires_in,
      scope,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.display_name || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
      },
    };
  }
}
