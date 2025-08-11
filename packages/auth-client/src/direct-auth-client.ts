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
    console.log("DirectAuthClient: Initializing with URL:", supabaseUrl ? "provided" : "missing");
    
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

      console.log("DirectAuthClient: Creating Supabase client...");
      
      // Initialize Supabase client
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });

      // Verify the client was created properly
      if (!this.supabase || !this.supabase.auth) {
        console.error("DirectAuthClient: Failed to create valid Supabase client");
        this.supabase = {} as SupabaseClient;
        return;
      }

      console.log("DirectAuthClient: Supabase client created successfully");

      // Set up auth state change listener
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("DirectAuthClient: Auth state change:", event);
        if (event === "SIGNED_IN" && session?.user) {
          // Store only the user ID
          this.saveUserIdToStorage(session.user.id);
          // Don't block on profile creation - let it happen on-demand
          this.ensureUserProfile(session.user).catch(error => {
            console.error("Failed to ensure user profile, but continuing:", error);
          });
          this.emitEvent("login", { userId: session.user.id });
        } else if (event === "SIGNED_OUT") {
          this.clearUserIdFromStorage();
          this.emitEvent("logout");
        }
      });

      console.log("DirectAuthClient: Initialized successfully");
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
      
      if (!this.supabase || !this.supabase.auth) {
        console.warn("DirectAuthClient: Supabase client not available for profile check");
        return;
      }
      
      // First, let's test if we can connect to the database at all
      console.log("DirectAuthClient: Testing database connection...");
      try {
        const testQuery = await this.supabase
          .from("users")
          .select("count")
          .limit(1);
        console.log("DirectAuthClient: Database connection test result:", testQuery);
      } catch (testError) {
        console.error("DirectAuthClient: Database connection test failed:", testError);
        return;
      }
      
      console.log("DirectAuthClient: Database connection successful, checking user profile...");
      
      // Try to check if user profile exists - this might fail due to RLS if user doesn't exist yet
      let existingUser = null;
      let fetchError = null;
      
      try {
        const profileCheckPromise = this.supabase
          .from("users")
          .select("id")
          .eq("id", supabaseUser.id)
          .single();
          
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Profile check timeout")), 5000);
        });

        const result = await Promise.race([profileCheckPromise, timeoutPromise]);
        existingUser = result.data;
        fetchError = result.error;
      } catch (error) {
        console.log("DirectAuthClient: Profile check failed (expected for new users):", error);
        // This is expected for new users due to RLS policies
      }

      console.log("DirectAuthClient: Profile check result:", { existingUser, fetchError });

      if (existingUser && !fetchError) {
        console.log("DirectAuthClient: User profile already exists");
        return;
      }

      console.log("DirectAuthClient: Creating new user profile");
      
      // Create new user profile - this should work because the user is authenticated
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

      console.log("DirectAuthClient: Inserting user data:", newUserData);

      try {
        const insertPromise = this.supabase.from("users").insert(newUserData);
        const insertTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Profile insert timeout")), 10000);
        });

        const { error: insertError } = await Promise.race([
          insertPromise,
          insertTimeoutPromise
        ]);

        if (insertError) {
          console.error("Failed to create user profile:", insertError);
          
          // If RLS is blocking the insert, we might need to handle this differently
          if (insertError.message.includes("new row violates row-level security policy")) {
            console.log("DirectAuthClient: RLS policy blocked insert, this might be expected for new users");
            // The profile will be created when the user first accesses their profile
          }
        } else {
          console.log("DirectAuthClient: User profile created successfully");
        }
      } catch (error) {
        console.error("DirectAuthClient: Profile insert failed:", error);
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
      console.log("DirectAuthClient: Starting initialization...");
      
      if (!this.supabase || !this.supabase.auth) {
        console.warn("DirectAuthClient: Supabase client not available - running in offline mode");
        return;
      }

      console.log("DirectAuthClient: Supabase client available, checking session...");
      
      // Check if we already have a user ID in storage first
      const storedUserId = this.getUserIdFromStorage();
      if (storedUserId) {
        console.log("DirectAuthClient: Found stored user ID:", storedUserId);
        // Emit login event for stored user
        this.emitEvent("login", { userId: storedUserId });
        console.log("DirectAuthClient: Initialization complete with stored user");
        return;
      }

      console.log("DirectAuthClient: No stored user ID, checking Supabase session...");
      
      // Get current session from Supabase with a reasonable timeout
      const sessionPromise = this.supabase.auth.getSession();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Session check timeout")), 10000);
      });

      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);

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
      // Don't re-throw the error, just log it and continue
      // This prevents the timeout in LoginPageIsland from catching it
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getUserIdFromStorage() !== null;
  }

  /**
   * Check if there's an existing session without full initialization
   */
  async hasExistingSession(): Promise<boolean> {
    try {
      // First check if we have a stored user ID
      const storedUserId = this.getUserIdFromStorage();
      if (storedUserId) {
        return true;
      }

      // If no stored ID, check Supabase session
      if (!this.supabase || !this.supabase.auth) {
        return false;
      }

      const { data: { session } } = await this.supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error("Error checking existing session:", error);
      return false;
    }
  }

  /**
   * Check if Supabase client is properly connected
   */
  async isConnected(): Promise<boolean> {
    try {
      if (!this.supabase || !this.supabase.auth) {
        return false;
      }

      // Try a simple operation to test connectivity
      const { data: { session } } = await this.supabase.auth.getSession();
      return true; // If we get here, the client is working
    } catch (error) {
      console.error("Supabase client connection test failed:", error);
      return false;
    }
  }

  /**
   * Debug method to check client status
   */
  debugStatus(): void {
    console.log("DirectAuthClient Debug Status:");
    console.log("- Supabase client exists:", !!this.supabase);
    console.log("- Supabase auth exists:", !!(this.supabase && this.supabase.auth));
    console.log("- Stored user ID:", this.getUserIdFromStorage());
    console.log("- Event callbacks:", this.eventCallbacks.size);
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
    if (!this.supabase || !this.supabase.auth) return null;

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
   * Get current session status without full user data
   */
  async getSessionStatus(): Promise<{ isAuthenticated: boolean; userId?: string }> {
    try {
      // First check local storage
      const storedUserId = this.getUserIdFromStorage();
      if (storedUserId) {
        return { isAuthenticated: true, userId: storedUserId };
      }

      // If no stored ID, check Supabase session
      if (!this.supabase || !this.supabase.auth) {
        return { isAuthenticated: false };
      }

      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.user) {
        return { isAuthenticated: true, userId: session.user.id };
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error("Error getting session status:", error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Quick check for authentication status
   */
  async quickAuthCheck(): Promise<{ isAuthenticated: boolean; userId?: string; error?: string }> {
    try {
      console.log("DirectAuthClient: Quick auth check starting...");
      
      // Check local storage first (fastest)
      const storedUserId = this.getUserIdFromStorage();
      if (storedUserId) {
        console.log("DirectAuthClient: Quick auth check - found stored user ID");
        return { isAuthenticated: true, userId: storedUserId };
      }

      // Check if client is available
      if (!this.supabase || !this.supabase.auth) {
        console.log("DirectAuthClient: Quick auth check - no Supabase client");
        return { isAuthenticated: false, error: "No Supabase client" };
      }

      console.log("DirectAuthClient: Quick auth check - checking Supabase session...");
      
      // Check Supabase session with timeout
      const sessionPromise = this.supabase.auth.getSession();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Quick auth check timeout")), 5000);
      });

      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (session?.user) {
        console.log("DirectAuthClient: Quick auth check - found Supabase session");
        return { isAuthenticated: true, userId: session.user.id };
      }

      console.log("DirectAuthClient: Quick auth check - no session found");
      return { isAuthenticated: false };
    } catch (error) {
      console.error("Quick auth check failed:", error);
      return { isAuthenticated: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Get access token from Supabase
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.supabase || !this.supabase.auth) return null;

    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  /**
   * Create user profile on-demand (called when user accesses profile page)
   */
  async createUserProfileIfNeeded(): Promise<boolean> {
    try {
      const userId = this.getUserIdFromStorage();
      if (!userId || !this.supabase) {
        return false;
      }

      console.log("DirectAuthClient: Creating user profile on-demand for:", userId);

      // Get current session to access user metadata
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session?.user) {
        console.log("DirectAuthClient: No active session for profile creation");
        return false;
      }

      const supabaseUser = session.user;

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

      console.log("DirectAuthClient: Inserting user profile on-demand:", newUserData);

      const { error: insertError } = await this.supabase.from("users").insert(newUserData);

      if (insertError) {
        console.error("Failed to create user profile on-demand:", insertError);
        return false;
      } else {
        console.log("DirectAuthClient: User profile created successfully on-demand");
        return true;
      }
    } catch (error) {
      console.error("Error creating user profile on-demand:", error);
      return false;
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
        
        // If user doesn't exist, try to create the profile
        if (error.code === 'PGRST116') { // No rows returned
          console.log("DirectAuthClient: User profile not found, attempting to create...");
          const created = await this.createUserProfileIfNeeded();
          if (created) {
            // Try to fetch the user again
            const { data: newUser, error: newError } = await this.supabase
              .from("users")
              .select("*")
              .eq("id", userId)
              .single();
              
            if (newError) {
              console.error("Error fetching user after creation:", newError);
              return null;
            }
            
            return newUser;
          }
        }
        
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
