import { apiClient, type Session, type User } from "./api-client.ts";
import type {
  AuthState,
  OAuthProvider,
  ResetPasswordData,
  SignInData,
  SignUpData,
  UpdateUserData,
} from "@suppers/shared";

export class AuthHelpers {
  /**
   * Sign up a new user
   */
  static async signUp(data: SignUpData) {
    const { email, password, firstName, middleNames, lastName, displayName } = data;

    const { data: authData, error } = await apiClient.auth.signUp({
      email,
      password,
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

    const { data: authData, error } = await apiClient.auth.signInWithPassword({
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
    console.log("🔴 Starting logout process...");
    
    try {
      // First, call the API logout endpoint
      console.log("🔴 Calling API logout endpoint...");
      const { error } = await apiClient.auth.signOut();

      if (error) {
        console.warn("❌ API logout failed:", error.message);
      } else {
        console.log("✅ API logout successful");
      }
    } catch (error) {
      console.warn("❌ API logout error:", error);
    }
    
    // Test if logout worked by calling getCurrentUser
    try {
      console.log("🔴 Testing if logout worked - calling getCurrentUser...");
      const user = await AuthHelpers.getCurrentUser();
      if (user) {
        console.error("❌ LOGOUT FAILED - getCurrentUser still returns user:", user.email);
      } else {
        console.log("✅ Logout successful - getCurrentUser returns null");
      }
    } catch (error) {
      console.log("✅ Logout successful - getCurrentUser throws error:", error.message);
    }

    try {
      // Also clear the Supabase session directly with global scope
      const { supabase } = await import("./supabase-client.ts");
      const { error: supabaseError } = await supabase.auth.signOut({ 
        scope: 'global' // This clears all sessions everywhere
      });
      
      if (supabaseError) {
        console.warn("Supabase logout failed:", supabaseError.message);
      } else {
        console.log("✅ Supabase global logout successful");
      }
    } catch (error) {
      console.warn("Supabase logout error:", error);
    }

    // Clear any localStorage and sessionStorage tokens
    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.removeItem("access_token");
      globalThis.localStorage.removeItem("refresh_token");
      globalThis.localStorage.removeItem("expires_at");
      globalThis.localStorage.removeItem("token_type");
      globalThis.localStorage.removeItem("user_data");
      
      // Clear any Supabase-specific storage keys
      globalThis.localStorage.removeItem("supabase.auth.token");
      globalThis.localStorage.removeItem("sb-localhost-auth-token");
      
      // Clear any keys that might contain session data
      const keysToRemove = [];
      for (let i = 0; i < globalThis.localStorage.length; i++) {
        const key = globalThis.localStorage.key(i);
        if (key && (key.includes("supabase") || key.includes("auth") || key.includes("session"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => globalThis.localStorage.removeItem(key));
      
      console.log("🧹 Cleared localStorage tokens and Supabase data");
    }
    
    // Also clear sessionStorage
    if (typeof globalThis.sessionStorage !== "undefined") {
      const sessionKeysToRemove = [];
      for (let i = 0; i < globalThis.sessionStorage.length; i++) {
        const key = globalThis.sessionStorage.key(i);
        if (key && (key.includes("supabase") || key.includes("auth") || key.includes("session"))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => globalThis.sessionStorage.removeItem(key));
      
      console.log("🧹 Cleared sessionStorage auth data");
    }
    
    // Force clear the apiClient token as well
    try {
      const { apiClient } = await import("./api-client.ts");
      apiClient.setToken(null);
      console.log("🧹 Cleared apiClient token");
    } catch (error) {
      console.warn("Failed to clear apiClient token:", error);
    }
  }

  /**
   * Sign in with OAuth provider
   */
  static async signInWithOAuth(provider: OAuthProvider, redirectTo?: string) {
    const { data, error } = await apiClient.auth.signInWithOAuth(
      provider,
      redirectTo || `${globalThis.location?.origin}/auth/callback`,
    );

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

    const { error } = await apiClient.auth.resetPassword(email);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string) {
    const { error } = await apiClient.auth.updatePassword(newPassword);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await apiClient.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }

  /**
   * Get current session
   */
  static async getCurrentSession() {
    const { data: { session }, error } = await apiClient.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return session;
  }

  /**
   * Update user metadata
   */
  static async updateUser(data: UpdateUserData) {
    // Use direct Supabase client for user metadata updates
    const { supabase } = await import("./supabase-client.ts");
    
    const { error } = await supabase.auth.updateUser({
      data: data
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(file: File, userId: string) {
    // Use direct Supabase client for file uploads
    const { supabase } = await import("./supabase-client.ts");
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user metadata with avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (updateError) {
      throw new Error(updateError.message);
    }

    return publicUrl;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    // Use direct Supabase client for auth state changes
    const initAuth = async () => {
      const { supabase } = await import("./supabase-client.ts");

      return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
    };

    // Return a promise that resolves to the subscription
    return initAuth();
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
   * TODO: Implement JWT token creation through API endpoints
   */
  static async createJWTToken(
    user: User,
    clientId: string,
    scope: string = "openid email profile",
  ) {
    // JWT token creation needs to be handled by API package
    throw new Error("JWT token creation should use API package endpoints");
  }
}
