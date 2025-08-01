// Simple user interface for stored token data (based on store package pattern)
export interface StoredUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  aud: string;
  created_at?: string;
  updated_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  // Database user fields
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  theme_id?: string;
}

interface StoredSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: StoredUser;
}

export class DocsAuthHelpers {
  /**
   * Get current user from stored session
   */
  static async getCurrentUser(): Promise<StoredUser | null> {
    console.log("🔍 DocsAuthHelpers: Getting current user...");
    const session = await this.getCurrentSession();
    return session?.user || null;
  }

  /**
   * Get current session from stored tokens (no Supabase dependency)
   */
  static async getCurrentSession(): Promise<StoredSession | null> {
    try {
      console.log("🔍 DocsAuthHelpers: Getting current session from localStorage...");

      // Get stored tokens
      const accessToken = globalThis.localStorage?.getItem("docs_access_token");
      const refreshToken = globalThis.localStorage?.getItem("docs_refresh_token");
      const expiresAt = globalThis.localStorage?.getItem("docs_expires_at");
      const tokenType = globalThis.localStorage?.getItem("docs_token_type") || "bearer";
      const userDataStr = globalThis.localStorage?.getItem("docs_user_data");

      console.log("🔍 Stored tokens:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUserData: !!userDataStr,
        expiresAt: expiresAt ? new Date(parseInt(expiresAt)).toISOString() : "none"
      });

      if (!accessToken || !userDataStr) {
        console.log("❌ No stored session found");
        // Clear incomplete session data
        if (accessToken && !userDataStr) {
          console.log("🧹 Clearing incomplete session data (token without user data)");
          this.clearStoredTokens();
        }
        return null;
      }

      // Check if token is expired
      if (expiresAt) {
        const expirationTime = parseInt(expiresAt);
        const currentTime = Date.now();
        if (currentTime >= expirationTime) {
          console.log("⏰ Stored tokens are expired");
          this.clearStoredTokens();
          return null;
        }
      }

      // Parse stored user data
      let userData: StoredUser;
      try {
        userData = JSON.parse(userDataStr);
      } catch (err) {
        console.error("❌ Failed to parse stored user data:", err);
        this.clearStoredTokens();
        return null;
      }

      const session: StoredSession = {
        access_token: accessToken,
        refresh_token: refreshToken || "",
        expires_in: expiresAt ? Math.floor((parseInt(expiresAt) - Date.now()) / 1000) : 3600,
        expires_at: expiresAt ? parseInt(expiresAt) : undefined,
        token_type: tokenType,
        user: userData
      };

      console.log("✅ Found valid stored session for user:", userData.email);
      return session;
    } catch (error) {
      console.error("❌ Error getting current session:", error);
      return null;
    }
  }

  /**
   * Store session data from SSO popup
   */
  static storeSession(accessToken: string, refreshToken: string, user: StoredUser, expiresIn: number): void {
    console.log("💾 DocsAuthHelpers: Storing session data...");
    
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    globalThis.localStorage?.setItem("docs_access_token", accessToken);
    globalThis.localStorage?.setItem("docs_refresh_token", refreshToken);
    globalThis.localStorage?.setItem("docs_expires_at", expiresAt.toString());
    globalThis.localStorage?.setItem("docs_token_type", "bearer");
    globalThis.localStorage?.setItem("docs_user_data", JSON.stringify(user));
    
    console.log("✅ Session stored successfully for user:", user.email);
    
    // Set user's theme if available
    this.setUserTheme(user);
  }

  /**
   * Sign out and clear stored tokens
   */
  static async signOut(): Promise<void> {
    console.log("🚪 DocsAuthHelpers: Signing out...");
    this.clearStoredTokens();
  }

  /**
   * Clear all stored authentication tokens
   */
  static clearStoredTokens(): void {
    console.log("🧹 DocsAuthHelpers: Clearing stored tokens...");
    globalThis.localStorage?.removeItem("docs_access_token");
    globalThis.localStorage?.removeItem("docs_refresh_token");
    globalThis.localStorage?.removeItem("docs_expires_at");
    globalThis.localStorage?.removeItem("docs_token_type");
    globalThis.localStorage?.removeItem("docs_user_data");
  }

  /**
   * Set user's theme from their stored preferences
   */
  static setUserTheme(user: StoredUser): void {
    if (user.theme_id && typeof document !== "undefined") {
      console.log("🎨 DocsAuthHelpers: Setting user theme to:", user.theme_id);
      
      // Set the theme in localStorage
      globalThis.localStorage?.setItem("theme", user.theme_id);
      
      // Apply the theme to the document
      document.documentElement.setAttribute("data-theme", user.theme_id);
      
      console.log("✅ User theme applied:", user.theme_id);
    } else {
      console.log("ℹ️ DocsAuthHelpers: No theme preference found for user");
    }
  }

  /**
   * Get user's theme ID from stored data
   */
  static async getUserThemeId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.theme_id || null;
  }
}