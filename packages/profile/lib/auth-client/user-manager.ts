import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ManagerDependencies,
  UserManagerInterface,
  UpdateUserData,
  AuthMethodResult,
  EventManagerInterface,
} from "./types.ts";
import {
  withSupabaseTimeout,
  handleSupabaseError,
  logError,
  logInfo,
  logWarning,
} from "./utils.ts";

/**
 * User management module for DirectAuthClient
 * Handles user profile operations and data management
 */
export class UserManager implements UserManagerInterface {
  private supabase: SupabaseClient | null = null;
  private storageKey: string = "supabase.auth.token";
  private eventManager: EventManagerInterface | null = null;

  /**
   * Initialize the user manager with dependencies
   */
  initialize(dependencies: ManagerDependencies): void {
    this.supabase = dependencies.supabase;
    this.storageKey = dependencies.storageKey;
    this.eventManager = dependencies.eventManager;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.supabase = null;
    this.eventManager = null;
  }

  /**
   * Get user ID from localStorage
   */
  private getUserIdFromStorage(): string | null {
    if (typeof window !== "undefined") {
      try {
        // The storageKey directly contains the user ID as a plain string
        const userId = window.localStorage.getItem(this.storageKey);
        if (userId) {
          // Validate it's a proper UUID
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(userId)) {
            return userId;
          }
          logWarning("UserManager", "Invalid user ID format in storage", { userId });
        }
      } catch (error) {
        logError("UserManager", "Failed to get user ID from storage", { error });
      }
    }
    return null;
  }

  /**
   * Get user data from database
   */
  async getUser(): Promise<any | null> {
    const userId = this.getUserIdFromStorage();
    if (!userId || !this.supabase) {
      logWarning("UserManager", "Cannot get user - no user ID or Supabase client");
      return null;
    }

    try {
      logInfo("UserManager", "Fetching user profile", { userId });

      const { data: user, error } = await this.supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        logError("UserManager", "Error fetching user", { error, userId });

        // If user doesn't exist, try to create the profile
        if (error.code === "PGRST116") { // No rows returned
          logInfo("UserManager", "User profile not found, attempting to create");
          const created = await this.createUserProfileIfNeeded();
          if (created) {
            // Try to fetch the user again
            const { data: newUser, error: newError } = await this.supabase
              .from("users")
              .select("*")
              .eq("id", userId)
              .single();

            if (newError) {
              logError("UserManager", "Error fetching user after creation", { error: newError });
              return null;
            }

            logInfo("UserManager", "Successfully fetched user after creation");
            return newUser;
          }
        }

        return null;
      }

      logInfo("UserManager", "Successfully fetched user profile");
      return user;
    } catch (error) {
      logError("UserManager", "Error getting user", { error });
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(data: UpdateUserData): Promise<AuthMethodResult> {
    try {
      if (!this.supabase) {
        return { error: "Supabase client not available" };
      }

      const userId = this.getUserIdFromStorage();
      if (!userId) {
        return { error: "Not authenticated" };
      }

      logInfo("UserManager", "Updating user profile", { userId, fields: Object.keys(data) });

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
        const errorMessage = handleSupabaseError(error);
        logError("UserManager", "Failed to update user profile", { error, userId });
        return { error: errorMessage };
      }

      // Emit USER_UPDATED event
      if (this.eventManager) {
        try {
          // Get updated user data to include in event
          const updatedUser = await this.getUser();
          if (updatedUser) {
            this.eventManager.emitEvent("USER_UPDATED", { user: updatedUser });
            logInfo("UserManager", "USER_UPDATED event emitted");
          }
        } catch (eventError) {
          logError("UserManager", "Error emitting USER_UPDATED event", { error: eventError });
          // Don't fail the update operation if event emission fails
        }
      }

      logInfo("UserManager", "Successfully updated user profile");
      return {};
    } catch (error) {
      const errorMessage = handleSupabaseError(error);
      logError("UserManager", "Error updating user", { error });
      return { error: errorMessage };
    }
  }

  /**
   * Ensure user profile exists in public.users table
   */
  async ensureUserProfile(supabaseUser: any): Promise<void> {
    try {
      logInfo("UserManager", "Checking if user profile exists", { userId: supabaseUser.id });

      if (!this.supabase) {
        logWarning("UserManager", "Supabase client not available for profile check");
        return;
      }

      // First, test database connection
      logInfo("UserManager", "Testing database connection");
      try {
        const { error: testError } = await this.supabase
          .from("users")
          .select("count")
          .limit(1);
        
        if (testError) {
          logError("UserManager", "Database connection test failed", { error: testError });
          return;
        }
        
        logInfo("UserManager", "Database connection successful");
      } catch (testError) {
        logError("UserManager", "Database connection test failed", { error: testError });
        return;
      }

      // Try to check if user profile exists
      let existingUser = null;
      let fetchError = null;

      try {
        const { data, error } = await this.supabase
          .from("users")
          .select("id")
          .eq("id", supabaseUser.id)
          .single();
        
        existingUser = data;
        fetchError = error;
      } catch (error) {
        logInfo("UserManager", "Profile check failed (expected for new users)", { error });
        // This is expected for new users due to RLS policies
      }

      logInfo("UserManager", "Profile check result", { existingUser, fetchError });

      if (existingUser && !fetchError) {
        logInfo("UserManager", "User profile already exists");
        return;
      }

      logInfo("UserManager", "Creating new user profile");

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

      logInfo("UserManager", "Inserting user data", { userData: newUserData });

      try {
        const { error: insertError } = await this.supabase
          .from("users")
          .insert(newUserData);

        if (insertError) {
          logError("UserManager", "Failed to create user profile", { error: insertError });

          // If RLS is blocking the insert, handle gracefully
          if (insertError.message.includes("new row violates row-level security policy")) {
            logInfo("UserManager", "RLS policy blocked insert, profile will be created on-demand");
          }
        } else {
          logInfo("UserManager", "User profile created successfully");
        }
      } catch (error) {
        logError("UserManager", "Profile insert failed", { error });
      }
    } catch (error) {
      logError("UserManager", "Error ensuring user profile", { error });
    }
  }

  /**
   * Create user profile on-demand (called when user accesses profile page)
   */
  async createUserProfileIfNeeded(): Promise<boolean> {
    try {
      const userId = this.getUserIdFromStorage();
      if (!userId || !this.supabase) {
        logWarning("UserManager", "Cannot create profile - no user ID or Supabase client");
        return false;
      }

      logInfo("UserManager", "Creating user profile on-demand", { userId });

      // Get current session to access user metadata
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.user) {
        logWarning("UserManager", "No active session for profile creation");
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

      logInfo("UserManager", "Inserting user profile on-demand", { userData: newUserData });

      const { error: insertError } = await this.supabase
        .from("users")
        .insert(newUserData);

      if (insertError) {
        logError("UserManager", "Failed to create user profile on-demand", { error: insertError });
        return false;
      } else {
        logInfo("UserManager", "User profile created successfully on-demand");
        return true;
      }
    } catch (error) {
      logError("UserManager", "Error creating user profile on-demand", { error });
      return false;
    }
  }
}