import type { 
  AuthEventType, 
  AuthEventCallback,
  AuthUser,
  SignInData,
  SignUpData,
  ResetPasswordData,
  UpdateUserData
} from "../../shared/types/auth.ts";

/**
 * OAuth authentication client for centralized auth hub
 * This client communicates with the profile service for authentication
 */
export class OAuthAuthClient {
  private eventCallbacks: Map<AuthEventType, AuthEventCallback[]> = new Map();
  private currentUser: AuthUser | null = null;
  private profileServiceUrl: string;
  private clientId: string;

  constructor(
    profileServiceUrl: string = "http://localhost:8001",
    clientId: string
  ) {
    this.profileServiceUrl = profileServiceUrl;
    this.clientId = clientId;
  }

  /**
   * Initialize the OAuth auth client
   */
  async initialize(): Promise<void> {
    try {
      // First check localStorage for existing user
      const storedUser = this.getUserFromStorage();
      if (storedUser) {
        console.log("🔍 Found stored user, setting current user");
        this.currentUser = storedUser;
        this.emitEvent("login", { user: this.currentUser });

        // TODO: we could save a expire at, then notify session as expired
        return;
      }
      console.log("🔍 No stored user found, initializing auth client");
    } catch (error) {
      console.error("OAuth auth initialization failed:", error);
    }
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Get current session (returns null for OAuth clients as they don't have Supabase sessions)
   */
  getSession(): any {
    return null; // OAuth clients don't have Supabase sessions
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get access token (not used in centralized auth hub)
   */
  getAccessToken(): string | null {
    return null; // Access tokens are managed by the profile service
  }

  /**
   * Sign in - opens login popup
   */
  async signIn(data?: SignInData): Promise<{ error?: string }> {
    this.showLoginModal();
    return {};
  }

  /**
   * Show login modal/popup
   */
  showLoginModal(): void {
    console.log("🔍 showLoginModal called");
    
    // Open login page directly in popup
    const loginUrl = new URL("/auth/login", this.profileServiceUrl);
    loginUrl.searchParams.set("modal", "true");
    
    console.log("🔍 Opening login popup:", loginUrl.toString());

    // Open in a popup window
    const popup = window.open(
      loginUrl.toString(),
      'oauth-login',
      'width=480,height=600,scrollbars=yes,resizable=yes,status=yes'
    );

    if (!popup) {
      console.error("Failed to open popup - might be blocked by popup blocker");
      return;
    }

    console.log("🔍 Popup opened successfully, setting up message listener");

    // Listen for postMessage from popup
    const messageHandler = (event: MessageEvent) => {
      console.log("🔍 Received postMessage:", event.data);

      if (event.data.type === 'SSO_AUTH_SUCCESS') {
        console.log("✅ Login popup success, user authenticated");
        
        // Set the user from the popup and save to storage
        this.currentUser = event.data.user;
        this.saveUserToStorage(this.currentUser);
        this.emitEvent("login", { user: this.currentUser });
        console.log("✅ OAuth popup login completed successfully");

        // Clean up
        window.removeEventListener("message", messageHandler);
      } else if (event.data.type === 'OAUTH_ERROR') {
        console.error("OAuth popup error:", event.data.error);
        this.emitEvent("error", { error: event.data.error });
        window.removeEventListener("message", messageHandler);
      }
    };

    window.addEventListener("message", messageHandler);
  }

  /**
   * Sign up - opens login popup
   */
  async signUp(data: SignUpData): Promise<{ error?: string }> {
    // Use the popup login modal for sign up as well
    this.showLoginModal();
    return {};
  }

  /**
   * Reset password - redirects to authorization server
   */
  async resetPassword(data: ResetPasswordData): Promise<{ error?: string }> {
    const resetUrl = new URL("/auth/reset-password", this.profileServiceUrl);
    resetUrl.searchParams.set("email", data.email);
    
    window.location.href = resetUrl.toString();
    return {};
  }

  /**
   * Update user profile
   */
  async updateUser(data: UpdateUserData): Promise<{ error?: string }> {
    if (!this.currentUser) {
      return { error: "Not authenticated" };
    }

    try {
      // In the centralized auth hub, this would go through the profile service
      // For now, just update the local user object
      this.currentUser = {
        ...this.currentUser,
        user_metadata: {
          ...this.currentUser.user_metadata,
          first_name: data.first_name || this.currentUser.user_metadata.first_name,
          last_name: data.last_name || this.currentUser.user_metadata.last_name,
          display_name: data.display_name || this.currentUser.user_metadata.display_name,
          avatar_url: data.avatar_url || this.currentUser.user_metadata.avatar_url,
          theme_id: data.theme_id || this.currentUser.user_metadata.theme_id,
        },
      };
      
      this.emitEvent("profile_change", this.currentUser);
      return {};
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    // Clear local state and storage
    this.currentUser = null;
    this.clearUserFromStorage();

    // Open logout popup to clear profile localStorage
    try {
      const logoutUrl = new URL("/auth/logout", this.profileServiceUrl);
      logoutUrl.searchParams.set("popup", "true");
      
      console.log("🔍 Opening logout popup:", logoutUrl.toString());
      
      const popup = window.open(
        logoutUrl.toString(),
        'oauth-logout',
        'width=400,height=300,scrollbars=no,resizable=no,status=no'
      );
      
      if (popup) {
        // Listen for logout completion
        const messageHandler = (event: MessageEvent) => {
          if (event.data.type === 'OAUTH_LOGOUT_SUCCESS') {
            console.log("✅ Profile logout completed");
            window.removeEventListener("message", messageHandler);
          }
        };
        
        window.addEventListener("message", messageHandler);
        
        // Auto-close popup after 3 seconds if no response
        setTimeout(() => {
          if (popup && !popup.closed) {
            popup.close();
          }
          window.removeEventListener("message", messageHandler);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to open logout popup:", error);
    }

    this.emitEvent("logout");
  }

  /**
   * Make authenticated API request
   * In the centralized auth hub, this would proxy through the profile service
   */
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.currentUser) {
      throw new Error("Not authenticated");
    }

    // In the centralized auth hub, this would include a session ID
    // For now, just make the request directly
    return fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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
  private emitEvent(event: AuthEventType, data?: any): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
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

  private storageKey = "suppers_oauth_user";

  private saveUserToStorage(user: AuthUser | null): void {
    if (typeof window !== "undefined") {
      try {
        if (user) {
          localStorage.setItem(this.storageKey, JSON.stringify(user));
        } else {
          localStorage.removeItem(this.storageKey);
        }
      } catch (error) {
        console.error("Failed to save user to storage:", error);
      }
    }
  }

  private getUserFromStorage(): AuthUser | null {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.error("Failed to get user from storage:", error);
        return null;
      }
    }
    return null;
  }

  private clearUserFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        console.error("Failed to clear user from storage:", error);
      }
    }
  }
} 