// Simple user interface for stored token data
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
}

interface StoredSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: StoredUser;
}

export class StoreAuthHelpers {
  /**
   * Get current user from stored session
   */
  static async getCurrentUser(): Promise<StoredUser | null> {
    console.log("🔍 StoreAuthHelpers: Getting current user...");
    const session = await this.getCurrentSession();
    return session?.user || null;
  }

  /**
   * Get current session from stored tokens (no Supabase dependency)
   */
  static async getCurrentSession(): Promise<StoredSession | null> {
    try {
      console.log("🔍 StoreAuthHelpers: Getting current session from localStorage...");

      // Get stored tokens
      const accessToken = globalThis.localStorage?.getItem("access_token");
      const refreshToken = globalThis.localStorage?.getItem("refresh_token");
      const expiresAt = globalThis.localStorage?.getItem("expires_at");
      const tokenType = globalThis.localStorage?.getItem("token_type") || "bearer";
      const userDataStr = globalThis.localStorage?.getItem("user_data");

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
   * Sign out the user (clear stored tokens and sign out from profile package)
   */
  static async signOut(): Promise<void> {
    console.log("-------------------------------------------");
    console.log("🔍 StoreAuthHelpers: Signing out...");

    try {
      // Get the access token before clearing it
      const accessToken = globalThis.localStorage?.getItem("access_token");

      if (accessToken) {
        // Call the profile package's logout endpoint  
        const profileLogoutUrl = "http://localhost:8001/auth/logout";
        console.log("🔍 StoreAuthHelpers: Calling profile package logout endpoint...");

        try {
          const response = await fetch(profileLogoutUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            credentials: 'include' // Include cookies for proper logout
          });
          
          if (response.ok) {
            console.log("✅ StoreAuthHelpers: Successfully signed out from profile package");
          } else {
            console.warn("⚠️ StoreAuthHelpers: Profile logout returned status:", response.status);
          }
        } catch (fetchError) {
          console.warn("⚠️ StoreAuthHelpers: Profile logout fetch failed:", fetchError);
        }
      }
    } catch (error) {
      console.warn("⚠️ StoreAuthHelpers: Failed to sign out from profile package:", error);
      // Continue with local cleanup even if remote logout fails
    }

    // Always clear local tokens regardless of API call success
    this.clearStoredTokens();
  }

  /**
   * Clear stored authentication tokens
   */
  static clearStoredTokens(): void {
    console.log("🔍 StoreAuthHelpers: Clearing stored tokens...");
    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.removeItem("access_token");
      globalThis.localStorage.removeItem("refresh_token");
      globalThis.localStorage.removeItem("expires_at");
      globalThis.localStorage.removeItem("token_type");
      globalThis.localStorage.removeItem("user_data");
    }
  }

  /**
   * Store authentication session (called by callback handler)
   */
  static storeSession(accessToken: string, refreshToken: string, user: StoredUser, expiresIn?: number): void {
    console.log("🔍 StoreAuthHelpers: Storing session for user:", user.email);
    console.log("🔍 StoreAuthHelpers: User data being stored:", user);

    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.setItem("access_token", accessToken);
      globalThis.localStorage.setItem("refresh_token", refreshToken);
      globalThis.localStorage.setItem("token_type", "bearer");
      globalThis.localStorage.setItem("user_data", JSON.stringify(user));

      if (expiresIn) {
        const expiresAt = Date.now() + (expiresIn * 1000);
        globalThis.localStorage.setItem("expires_at", expiresAt.toString());
        console.log("🔍 StoreAuthHelpers: Token expires at:", new Date(expiresAt));
      }

      // Verify storage worked
      const storedUserData = globalThis.localStorage.getItem("user_data");
      console.log("✅ StoreAuthHelpers: Session stored successfully, verification:", {
        hasAccessToken: !!globalThis.localStorage.getItem("access_token"),
        hasUserData: !!storedUserData,
        userDataLength: storedUserData?.length || 0
      });
    } else {
      console.error("❌ StoreAuthHelpers: localStorage not available!");
    }
  }

  /**
   * Listen to auth state changes (simplified - no Supabase dependency)
   */
  static onAuthStateChange(callback: (event: string, session: StoredSession | null) => void) {
    console.log("🔍 StoreAuthHelpers: Setting up auth state listener...");

    // Return a dummy subscription since we don't have real-time auth state changes
    // Auth state will be managed manually through login/logout actions
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            console.log("🔍 StoreAuthHelpers: Auth state listener unsubscribed");
          }
        }
      }
    };
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session?.user;
  }
}