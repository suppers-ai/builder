import type {
  AuthEventCallback,
  AuthEventData,
  AuthEventType,
  AuthSession,
  ResetPasswordData,
  SignInData,
  SignUpData,
  UpdateUserData,
} from "../../shared/types/auth.ts";
import type { User } from "../../shared/utils/type-mappers.ts";

/**
 * OAuth authentication client for centralized auth hub
 * Simplified to only store user ID and fetch user data from database when needed
 */
export class OAuthAuthClient {
  private eventCallbacks: Map<AuthEventType, AuthEventCallback[]> = new Map();
  private profileServiceUrl: string;
  private clientId: string;
  private storageKey = "suppers_user_id";
  private userStorageKey = "suppers_user_data";
  private sessionStorageKey = "suppers_session_data";

  constructor(
    profileServiceUrl: string = "http://localhost:8001",
    clientId: string,
  ) {
    this.profileServiceUrl = profileServiceUrl;
    this.clientId = clientId;
  }

  /**
   * Save user ID to localStorage
   */
  private saveUserIdToStorage(userId: string): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.storageKey, userId);
      } catch (error) {
        console.error("Failed to save user ID to storage:", error);
      }
    }
  }

  /**
   * Get user ID from localStorage
   */
  private getUserIdFromStorage(): string | null {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(this.storageKey);
      } catch (error) {
        console.error("Failed to get user ID from storage:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear user ID from localStorage
   */
  private clearUserIdFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        console.error("Failed to clear user ID from storage:", error);
      }
    }
  }

  /**
   * Save user data to localStorage
   */
  saveUserDataToStorage(userData: User): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.userStorageKey, JSON.stringify(userData));
      } catch (error) {
        console.error("Failed to save user data to storage:", error);
      }
    }
  }

  /**
   * Get user data from localStorage
   */
  private getUserDataFromStorage(): User | null {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.userStorageKey);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.error("Failed to get user data from storage:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear user data from localStorage
   */
  private clearUserDataFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.userStorageKey);
      } catch (error) {
        console.error("Failed to clear user data from storage:", error);
      }
    }
  }

  /**
   * Save session data to localStorage
   */
  private saveSessionToStorage(session: AuthSession): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
      } catch (error) {
        console.error("Failed to save session to storage:", error);
      }
    }
  }

  /**
   * Get session data from localStorage
   */
  private getSessionFromStorage(): AuthSession | null {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.sessionStorageKey);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.error("Failed to get session from storage:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear session data from localStorage
   */
  private clearSessionFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.sessionStorageKey);
      } catch (error) {
        console.error("Failed to clear session from storage:", error);
      }
    }
  }

  /**
   * Ensure user profile exists in public.users table via profile service
   */
  private async ensureUserProfile(
    oauthUser: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  ): Promise<void> {
    try {
      // Check if user profile exists
      const response = await this.apiRequest(`/api/users/${oauthUser.id}`);

      if (response.ok) {
        // User profile already exists
        return;
      }

      // Create new user profile
      const newUserData = {
        id: oauthUser.id,
        email: oauthUser.email || "",
        first_name: oauthUser.user_metadata?.first_name || null,
        last_name: oauthUser.user_metadata?.last_name || null,
        display_name: oauthUser.user_metadata?.display_name || oauthUser.user_metadata?.full_name ||
          null,
        avatar_url: oauthUser.user_metadata?.avatar_url || null,
        theme_id: oauthUser.user_metadata?.theme_id || null,
        stripe_customer_id: null,
        role: "user" as const,
      };

      const createResponse = await this.apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(newUserData),
      });

      if (!createResponse.ok) {
        console.error("Failed to create user profile via profile service");
      }
    } catch (error) {
      console.error("Error ensuring user profile via profile service:", error);
    }
  }

  /**
   * Initialize the OAuth auth client
   */
  initialize(): Promise<void> {
    try {
      // Check if user ID exists in storage
      const userId = this.getUserIdFromStorage();
      if (userId) {
        console.log("Found stored user ID, emitting login event");
        this.emitEvent("login", { userId });
        return Promise.resolve();
      }
      console.log("No stored user ID found");
      return Promise.resolve();
    } catch (error) {
      console.error("OAuth auth initialization failed:", error);
      return Promise.resolve();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getUserIdFromStorage() !== null;
  }

  /**
   * Get user ID from storage
   */
  getUserId(): string | null {
    return this.getUserIdFromStorage();
  }

  /**
   * Get current session from localStorage
   */
  getSession(): Promise<AuthSession | null> {
    const session = this.getSessionFromStorage();
    return Promise.resolve(session);
  }

  /**
   * Get access token from stored session
   */
  getAccessToken(): Promise<string | null> {
    const session = this.getSessionFromStorage();
    return Promise.resolve(session?.session?.access_token || null);
  }

  /**
   * Get user data from localStorage (passed via postMessage from profile page)
   */
  getUser(): Promise<User | null> {
    const userId = this.getUserIdFromStorage();
    if (!userId) return Promise.resolve(null);

    // Return user data from localStorage - this is set via postMessage from profile page
    return Promise.resolve(this.getUserDataFromStorage());
  }

  /**
   * Sign in - opens login popup
   */
  signIn(_data?: SignInData): Promise<{ error?: string }> {
    this.showLoginModal();
    return Promise.resolve({});
  }

  /**
   * Show login modal/popup
   */
  showLoginModal(): void {
    console.log("showLoginModal called");

    // Open login page directly in popup
    const loginUrl = new URL("/auth/login", this.profileServiceUrl);
    loginUrl.searchParams.set("modal", "true");

    console.log("Opening login popup:", loginUrl.toString());

    // Open in a popup window
    const popup = globalThis.open(
      loginUrl.toString(),
      "oauth-login",
      "width=480,height=600,scrollbars=yes,resizable=yes,status=yes",
    );

    if (!popup) {
      console.error("Failed to open popup - might be blocked by popup blocker");
      return;
    }

    console.log("Popup opened successfully, setting up message listener");

    // Listen for postMessage from popup
    const messageHandler = (event: MessageEvent) => {
      console.log("Received postMessage:", event.data);

      if (event.data.type === "SSO_AUTH_SUCCESS") {
        console.log("Login popup success, user authenticated");

        // Store user ID, user data, and session from the profile page
        this.saveUserIdToStorage(event.data.user.id);
        this.saveUserDataToStorage(event.data.user);

        // Store session if provided
        if (event.data.session) {
          this.saveSessionToStorage(event.data.session);
          console.log("Session token stored for API authentication");
        }

        this.emitEvent("login", { userId: event.data.user.id });
        console.log("OAuth popup login completed successfully");

        // Clean up
        globalThis.removeEventListener("message", messageHandler);
      } else if (event.data.type === "OAUTH_ERROR") {
        console.error("OAuth popup error:", event.data.error);
        this.emitEvent("error", { error: event.data.error });
        globalThis.removeEventListener("message", messageHandler);
      }
    };

    addEventListener("message", messageHandler);
  }

  /**
   * Sign up - opens login popup
   */
  signUp(_data: SignUpData): Promise<{ error?: string }> {
    // Use the popup login modal for sign up as well
    this.showLoginModal();
    return Promise.resolve({});
  }

  /**
   * Reset password - redirects to authorization server
   */
  resetPassword(data: ResetPasswordData): Promise<{ error?: string }> {
    const resetUrl = new URL("/auth/reset-password", this.profileServiceUrl);
    resetUrl.searchParams.set("email", data.email);

    globalThis.location.href = resetUrl.toString();
    return Promise.resolve({});
  }

  /**
   * Update user profile
   */
  async updateUser(data: UpdateUserData): Promise<{ error?: string }> {
    const userId = this.getUserIdFromStorage();
    if (!userId) {
      return { error: "Not authenticated" };
    }

    try {
      // Prepare update data for public.users table
      const updateData: Record<string, unknown> = {};
      if (data.first_name !== undefined) updateData.first_name = data.first_name;
      if (data.last_name !== undefined) updateData.last_name = data.last_name;
      if (data.display_name !== undefined) updateData.display_name = data.display_name;
      if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
      if (data.theme_id !== undefined) updateData.theme_id = data.theme_id;
      if (data.stripe_customer_id !== undefined) {
        updateData.stripe_customer_id = data.stripe_customer_id;
      }
      if (data.role !== undefined) updateData.role = data.role;

      // Update user profile in public.users table via profile service
      const response = await this.apiRequest(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.message || "Failed to update profile" };
      }

      return {};
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { error: "An unexpected error occurred" };
    }
  }

  /**
   * Sign out
   */
  signOut(): Promise<void> {
    // Clear local state and storage
    this.clearUserIdFromStorage();

    // Open logout popup to clear profile localStorage
    try {
      const logoutUrl = new URL("/auth/logout", this.profileServiceUrl);
      logoutUrl.searchParams.set("popup", "true");

      console.log("Opening logout popup:", logoutUrl.toString());

      const popup = globalThis.open(
        logoutUrl.toString(),
        "oauth-logout",
        "width=400,height=300,scrollbars=no,resizable=no,status=no",
      );

      if (popup) {
        // Listen for logout completion
        const messageHandler = (event: MessageEvent) => {
          if (event.data.type === "OAUTH_LOGOUT_SUCCESS") {
            console.log("Profile logout completed");
            removeEventListener("message", messageHandler);
          }
        };

        addEventListener("message", messageHandler);

        // Auto-close popup after 3 seconds if no response
        setTimeout(() => {
          if (popup && !popup.closed) {
            popup.close();
          }
          removeEventListener("message", messageHandler);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to open logout popup:", error);
    }

    // Clear local storage
    this.clearUserIdFromStorage();
    this.clearUserDataFromStorage();
    this.clearSessionFromStorage();

    this.emitEvent("logout");
    return Promise.resolve();
  }

  /**
   * Sign in with OAuth provider
   */
  signInWithOAuth(_provider: string): Promise<{ error?: string }> {
    this.showLoginModal();
    return Promise.resolve({});
  }

  /**
   * Make authenticated API request to the profile service
   */
  apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Construct full URL if endpoint is relative
    const url = endpoint.startsWith("http") ? endpoint : `${this.profileServiceUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers as Record<string, string>,
    };

    // Add authentication headers if user is authenticated
    const userId = this.getUserIdFromStorage();
    const session = this.getSessionFromStorage();

    if (userId) {
      headers["X-User-ID"] = userId;

      // Include session token if available
      if (session?.session?.access_token) {
        headers["Authorization"] = `Bearer ${session.session.access_token}`;
      }
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Add event listener
   */
  addEventListener(event: AuthEventType, callback: AuthEventCallback): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: AuthEventType, callback: AuthEventCallback): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: AuthEventType, data?: AuthEventData[AuthEventType]): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event, data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.eventCallbacks.clear();
  }
}
