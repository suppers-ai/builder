import {
  createClient,
  type SupabaseClient,
  type User as SupabaseUser,
} from "@supabase/supabase-js";
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
 * Direct authentication client for direct Supabase integration
 * Simplified to only store user ID and fetch user data from database when needed
 */
export class DirectAuthClient {
  private supabase: SupabaseClient;
  private eventCallbacks: Map<AuthEventType, AuthEventCallback[]> = new Map();
  private storageKey = "suppers_user_id";

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

      // Initialize Supabase client
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });

      // Set up auth state change listener
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          // Store only the user ID
          this.saveUserIdToStorage(session.user.id);
          // Ensure user profile exists in database
          await this.ensureUserProfile(session.user);
          this.emitEvent("login", { userId: session.user.id });
        } else if (event === "SIGNED_OUT") {
          this.clearUserIdFromStorage();
          this.emitEvent("logout");
        }
      });
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
      this.supabase = {} as SupabaseClient;
    }
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
   * Ensure user profile exists in public.users table
   */
  private async ensureUserProfile(supabaseUser: SupabaseUser): Promise<void> {
    try {
      console.log("DirectAuthClient: Checking if user profile exists for:", supabaseUser.id);
      
      // Check if user profile exists with timeout
      const { data: existingUser, error: fetchError } = await Promise.race([
        this.supabase
          .from("users")
          .select("id")
          .eq("id", supabaseUser.id)
          .single(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Profile fetch timeout")), 2000)
        )
      ]);

      if (existingUser && !fetchError) {
        console.log("DirectAuthClient: User profile already exists");
        return;
      }

      console.log("DirectAuthClient: Creating new user profile");
      
      // Create new user profile
      const newUserData = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        first_name: supabaseUser.user_metadata?.first_name || null,
        last_name: supabaseUser.user_metadata?.last_name || null,
        display_name: supabaseUser.user_metadata?.display_name ||
          supabaseUser.user_metadata?.full_name || null,
        avatar_url: supabaseUser.user_metadata?.avatar_url || null,
        theme_id: supabaseUser.user_metadata?.theme_id || null,
        stripe_customer_id: null,
        role: "user" as const,
      };

      const { error: insertError } = await Promise.race([
        this.supabase.from("users").insert(newUserData),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Profile insert timeout")), 2000)
        )
      ]);

      if (insertError) {
        console.error("Failed to create user profile:", insertError);
      } else {
        console.log("DirectAuthClient: User profile created successfully");
      }
    } catch (error) {
      console.error("Error ensuring user profile:", error);
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

      console.log("DirectAuthClient: Getting session...");
      // Get current session with timeout
      const { data: { session }, error } = await Promise.race([
        this.supabase.auth.getSession(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("getSession timeout")), 3000)
        )
      ]);

      if (error) {
        console.error("Failed to get session:", error);
        return;
      }

      console.log("DirectAuthClient: Session retrieved, user:", !!session?.user);
      
      if (session?.user) {
        // Store user ID and ensure profile exists
        this.saveUserIdToStorage(session.user.id);
        console.log("DirectAuthClient: Ensuring user profile...");
        
        // Don't wait for profile creation if it's slow
        this.ensureUserProfile(session.user).catch(error => {
          console.error("Failed to ensure user profile, but continuing:", error);
        });
        
        this.emitEvent("login", { userId: session.user.id });
        console.log("DirectAuthClient: Initialization complete");
      } else {
        console.log("DirectAuthClient: No active session");
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      throw error; // Re-throw so the timeout in LoginPageIsland can catch it
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
   * Get current session from Supabase
   */
  async getSession(): Promise<AuthSession | null> {
    if (!this.supabase) return null;

    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) return null;

      const userId = this.getUserIdFromStorage();
      if (!userId) return null;

      return {
        userId,
        session,
      };
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  /**
   * Get access token from Supabase
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
   * Get user data from database
   */
  async getUser(): Promise<User | null> {
    const userId = this.getUserIdFromStorage();
    if (!userId || !this.supabase) return null;

    try {
      const { data: user, error } = await this.supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error getting user:", error);
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
    } catch (_error) {
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
    } catch (_error) {
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
    } catch (_error) {
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

      const userId = this.getUserIdFromStorage();
      if (!userId) {
        return { error: "Not authenticated" };
      }

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

      // Update user profile in public.users table
      const { error } = await this.supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (_error) {
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
      this.clearUserIdFromStorage();
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
        provider: provider as "google" | "github" | "discord" | "facebook",
        options: {
          redirectTo: redirectTo || globalThis.location.origin,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (_error) {
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
