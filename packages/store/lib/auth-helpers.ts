import { setGlobalTheme } from "@suppers/ui-lib";

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

      setGlobalTheme(userData.theme_id || "light");

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

  /**
   * Fetch fresh user data from API (including theme_id from database)
   */
  static async fetchCurrentUser(): Promise<StoredUser | null> {
    try {
      const session = await this.getCurrentSession();
      if (!session?.access_token) {
        console.log("❌ No access token available for API call");
        return null;
      }

      console.log("🔍 StoreAuthHelpers: Fetching fresh user data from API...");
      
      // Call the API to get current user with database fields
      const response = await fetch("http://localhost:8081/api/auth/current-user", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("❌ Failed to fetch user data:", response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      if (data.user) {
        console.log("✅ Fetched fresh user data:", {
          id: data.user.id,
          email: data.user.email,
          theme_id: data.user.theme_id,
          display_name: data.user.display_name
        });
        
        // Update stored user data with fresh data
        this.updateStoredUserData(data.user);
        return data.user;
      }

      return null;
    } catch (error) {
      console.error("❌ Error fetching current user:", error);
      return null;
    }
  }

  /**
   * Update user's theme ID
   */
  static async updateUserTheme(themeId: string): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      if (!session?.access_token) {
        console.log("❌ No access token available for theme update");
        return false;
      }

      console.log("🔍 StoreAuthHelpers: Updating user theme to:", themeId);
      
      const response = await fetch("http://localhost:8081/api/auth/update-user-metadata", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme_id: themeId
        }),
      });

      if (!response.ok) {
        console.error("❌ Failed to update user theme:", response.status, response.statusText);
        return false;
      }

      console.log("✅ Successfully updated user theme to:", themeId);
      
      // Update local stored user data
      const currentUser = session.user;
      if (currentUser) {
        currentUser.theme_id = themeId;
        this.updateStoredUserData(currentUser);
      }
      
      return true;
    } catch (error) {
      console.error("❌ Error updating user theme:", error);
      return false;
    }
  }

  /**
   * Update stored user data in localStorage
   */
  static updateStoredUserData(userData: StoredUser): void {
    if (typeof globalThis.localStorage !== "undefined") {
      globalThis.localStorage.setItem("user_data", JSON.stringify(userData));
      console.log("✅ Updated stored user data");
    }
  }

  /**
   * Get user's theme ID from stored data, or fetch fresh if needed
   */
  static async getUserThemeId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    if (user?.theme_id) {
      return user.theme_id;
    }
    
    // If no theme_id in stored data, fetch fresh data
    const freshUser = await this.fetchCurrentUser();
    return freshUser?.theme_id || null;
  }
}