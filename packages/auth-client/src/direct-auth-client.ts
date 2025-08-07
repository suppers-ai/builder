import { createClient, UserMetadata, type SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthEventCallback,
  AuthEventType,
  AuthSession,
  AuthUser,
  ResetPasswordData,
  SignInData,
  SignUpData,
  UpdateUserData,
} from "../../shared/types/auth.ts";
import { clearTheme } from "../../shared/utils/theme.ts";

/**
 * Direct authentication client for direct Supabase integration
 * This client delegates all authentication to Supabase's built-in functionality
 */
export class DirectAuthClient {
  private supabase: SupabaseClient;
  private eventCallbacks: Map<AuthEventType, AuthEventCallback[]> = new Map();
  private storageKey = "suppers_auth_user";

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    try {
      if (!createClient) {
        console.warn("DirectAuthClient: createClient not available - running in offline mode");
        this.supabase = {} as SupabaseClient;
        return;
      }
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("DirectAuthClient: Supabase URL or anon key not found");
        this.supabase = {} as SupabaseClient;
        return;
      }

      // Initialize Supabase client - let it handle all session management
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });

      // Set up auth state change listener
      this.supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Convert Supabase user to our AuthUser format and save to storage
          const currentUser = {
            id: session.user.id,
            email: session.user.email || "",
            created_at: session.user.created_at,
            updated_at: session.user.updated_at,
            user_metadata: {
              first_name: session.user.user_metadata?.first_name || "",
              last_name: session.user.user_metadata?.last_name || "",
              display_name: session.user.user_metadata?.display_name || "",
              avatar_url: session.user.user_metadata?.avatar_url || "",
              theme_id: session.user.user_metadata?.theme_id || "light",
              role: session.user.user_metadata?.role || "user",
            },
          };
          this.saveUserToStorage(currentUser);
          this.emitEvent("login", { user: currentUser });
        } else if (event === "SIGNED_OUT") {
          this.clearUserFromStorage();
          this.emitEvent("logout");
        }
      });

    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
      this.supabase = {} as SupabaseClient;
    }
  }

  /**
   * Save user to localStorage
   */
  private saveUserToStorage(user: AuthUser): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(user));
      } catch (error) {
        console.error("Failed to save user to storage:", error);
      }
    }
  }

  /**
   * Get user from localStorage
   */
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

  /**
   * Clear user from localStorage
   */
  private clearUserFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        clearTheme();
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        console.error("Failed to clear user from storage:", error);
      }
    }
  }

  /**
   * Initialize the auth client
   */
  async initialize(): Promise<void> {
    try {
      if (!this.supabase) {
        console.warn("DirectAuthClient: Supabase client not available - running in offline mode");
        return;
      }

      // Get current session - Supabase handles all the complexity
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error) {
        console.error("Failed to get session:", error);
        return;
      }

      if (session?.user) {
        // Convert Supabase user to our AuthUser format and save to storage
        const currentUser = {
          id: session.user.id,
          email: session.user.email || "",
          created_at: session.user.created_at,
          updated_at: session.user.updated_at,
          user_metadata: {
            first_name: session.user.user_metadata?.first_name || "",
            last_name: session.user.user_metadata?.last_name || "",
            display_name: session.user.user_metadata?.display_name || "",
            avatar_url: session.user.user_metadata?.avatar_url || "",
            theme_id: session.user.user_metadata?.theme_id || "light",
            role: session.user.user_metadata?.role || "user",
          },
        };
        this.saveUserToStorage(currentUser);
        this.emitEvent("login", { user: currentUser });
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
    }
  }

  /**
   * Get current user from storage
   */
  getUser(): AuthUser | null {
    return this.getUserFromStorage();
  }

  /**
   * Get current session from Supabase (async)
   */
  async getSession(): Promise<AuthSession | null> {
    if (!this.supabase) return null;
    
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) return null;
      
      const currentUser = this.getUserFromStorage();
      if (!currentUser) return null;
      
      return {
        user: currentUser,
        session,
        supabaseUser: session.user,
      };
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getUserFromStorage() !== null;
  }

  /**
   * Get access token from Supabase (async)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.supabase) return null;
    
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<{ error?: string }> {
    try {
      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      const { error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<{ error?: string }> {
    try {
      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      const { error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            display_name: data.display_name || "",
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordData): Promise<{ error?: string }> {
    try {
      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      const { error } = await this.supabase.auth.resetPasswordForEmail(data.email);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(data: UpdateUserData): Promise<{ error?: string }> {
    try {
      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { error: "Not authenticated" };
      }

      const currentUser = this.getUserFromStorage();
      if (!currentUser) {
        return { error: "Not authenticated" };
      }
      const user_metadata: UserMetadata = {
        ...currentUser.user_metadata,
        first_name: data.first_name || currentUser.user_metadata.first_name,
        last_name: data.last_name || currentUser.user_metadata.last_name,
        display_name: data.display_name || currentUser.user_metadata.display_name,
        avatar_url: data.avatar_url || currentUser.user_metadata.avatar_url,
        theme_id: data.theme_id || currentUser.user_metadata.theme_id,
      };

      // Update user metadata in Supabase Auth
      const { error } = await this.supabase.auth.updateUser({
        data: user_metadata,
      });

      if (error) {
        return { error: error.message };
      }

      const updatedUser = {
        ...currentUser,
        user_metadata,
      };
      this.saveUserToStorage(updatedUser);
      this.emitEvent("profile_change", updatedUser);

      // Broadcast the profile change to all connected clients
      // this.broadcastUserChange(updatedUser);

      return {};
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      if (this.supabase) {
        await this.supabase.auth.signOut();
      }
      this.clearUserFromStorage();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: string, redirectTo?: string): Promise<{ error?: string }> {
    try {
      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectTo || window.location.origin,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: "An unexpected error occurred" };
    }
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    return fetch(endpoint, {
      ...options,
      headers: {
        "Authorization": `Bearer ${token}`,
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
