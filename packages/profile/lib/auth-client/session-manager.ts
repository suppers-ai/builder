import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthSession,
} from "@suppers/shared/types";
import type {
  ManagerDependencies,
  SessionManagerInterface,
  SessionStatus,
  QuickAuthResult,
  EventManagerInterface,
} from "./types.ts";
import {
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
  withSupabaseTimeout,
  logError,
  logInfo,
  logWarning,
  isValidUUID,
} from "./utils.ts";

/**
 * Session Manager - Handles session state, storage, and validation
 * 
 * This module is responsible for:
 * - Managing user session state and localStorage operations
 * - Validating sessions and checking authentication status
 * - Providing quick authentication checks with timeout handling
 * - Converting Supabase sessions to internal AuthSession format
 */
export class SessionManager implements SessionManagerInterface {
  private supabase: SupabaseClient;
  private storageKey: string;
  private eventManager: EventManagerInterface;

  constructor() {
    // Will be initialized via initialize() method
    this.supabase = {} as SupabaseClient;
    this.storageKey = "";
    this.eventManager = {} as EventManagerInterface;
  }

  /**
   * Initialize the session manager with dependencies
   */
  initialize(dependencies: ManagerDependencies): void {
    this.supabase = dependencies.supabase;
    this.storageKey = dependencies.storageKey;
    this.eventManager = dependencies.eventManager;
    
    logInfo("SessionManager", "Initialized successfully");
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear any pending timeouts or listeners if needed
    logInfo("SessionManager", "Destroyed");
  }

  /**
   * Save user ID to localStorage
   */
  saveUserIdToStorage(userId: string): void {
    if (!userId || !isValidUUID(userId)) {
      logWarning("SessionManager", "Invalid user ID provided for storage", { userId });
      return;
    }

    const success = safeLocalStorageSet(this.storageKey, userId);
    if (success) {
      logInfo("SessionManager", "User ID saved to storage");
    } else {
      logError("SessionManager", "Failed to save user ID to storage");
    }
  }

  /**
   * Get user ID from localStorage
   */
  getUserIdFromStorage(): string | null {
    const userId = safeLocalStorageGet(this.storageKey);
    
    if (userId && !isValidUUID(userId)) {
      logWarning("SessionManager", "Invalid user ID found in storage, clearing", { userId });
      this.clearUserIdFromStorage();
      return null;
    }
    
    return userId;
  }

  /**
   * Clear user ID from localStorage
   */
  clearUserIdFromStorage(): void {
    const success = safeLocalStorageRemove(this.storageKey);
    if (success) {
      logInfo("SessionManager", "User ID cleared from storage");
    } else {
      logError("SessionManager", "Failed to clear user ID from storage");
    }
  }

  /**
   * Get user ID (alias for getUserIdFromStorage for backward compatibility)
   */
  getUserId(): string | null {
    return this.getUserIdFromStorage();
  }

  /**
   * Check if user is authenticated based on stored user ID
   */
  isAuthenticated(): boolean {
    const userId = this.getUserIdFromStorage();
    const isAuth = userId !== null;
    
    logInfo("SessionManager", `Authentication check: ${isAuth ? "authenticated" : "not authenticated"}`);
    return isAuth;
  }

  /**
   * Get current session from Supabase
   */
  async getSession(): Promise<AuthSession | null> {
    if (!this.supabase || !this.supabase.auth) {
      logWarning("SessionManager", "Supabase client not available for session retrieval");
      return null;
    }

    try {
      logInfo("SessionManager", "Retrieving session from Supabase");
      
      const { data: { session } } = await withSupabaseTimeout(
        this.supabase.auth.getSession(),
        5000,
        "Get session"
      );

      if (!session) {
        logInfo("SessionManager", "No active session found");
        return null;
      }

      logInfo("SessionManager", "Session retrieved successfully");

      // Convert Supabase session to our AuthSession type
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        expires_at: session.expires_at,
        token_type: session.token_type,
        user: session.user ? {
          id: session.user.id,
          email: session.user.email,
          email_verified: session.user.email_confirmed_at ? true : false,
          phone: session.user.phone,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at,
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata,
          role: session.user.role,
        } : undefined,
      };
    } catch (error) {
      logError("SessionManager", "Error getting session", { error });
      return null;
    }
  }

  /**
   * Get current session status without full user data
   */
  async getSessionStatus(): Promise<SessionStatus> {
    try {
      logInfo("SessionManager", "Getting session status");
      
      // First check local storage (fastest)
      const storedUserId = this.getUserIdFromStorage();
      if (storedUserId) {
        logInfo("SessionManager", "Session status: authenticated (from storage)");
        return { isAuthenticated: true, userId: storedUserId };
      }

      // If no stored ID, check Supabase session
      if (!this.supabase || !this.supabase.auth) {
        logWarning("SessionManager", "Session status: not authenticated (no Supabase client)");
        return { isAuthenticated: false };
      }

      const { data: { session } } = await withSupabaseTimeout(
        this.supabase.auth.getSession(),
        5000,
        "Get session status"
      );

      if (session?.user) {
        logInfo("SessionManager", "Session status: authenticated (from Supabase)");
        return { isAuthenticated: true, userId: session.user.id };
      }

      logInfo("SessionManager", "Session status: not authenticated");
      return { isAuthenticated: false };
    } catch (error) {
      logError("SessionManager", "Error getting session status", { error });
      return { isAuthenticated: false };
    }
  }

  /**
   * Quick check for authentication status with timeout handling
   */
  async quickAuthCheck(): Promise<QuickAuthResult> {
    try {
      logInfo("SessionManager", "Quick auth check starting");

      // Check local storage first (fastest)
      const storedUserId = this.getUserIdFromStorage();
      if (storedUserId) {
        logInfo("SessionManager", "Quick auth check: found stored user ID");
        return { isAuthenticated: true, userId: storedUserId };
      }

      // Check if client is available
      if (!this.supabase || !this.supabase.auth) {
        logWarning("SessionManager", "Quick auth check: no Supabase client");
        return { isAuthenticated: false, error: "No Supabase client" };
      }

      logInfo("SessionManager", "Quick auth check: checking Supabase session");

      // Check Supabase session with timeout
      const { data: { session } } = await withSupabaseTimeout(
        this.supabase.auth.getSession(),
        5000,
        "Quick auth check"
      );

      if (session?.user) {
        logInfo("SessionManager", "Quick auth check: found Supabase session");
        return { isAuthenticated: true, userId: session.user.id };
      }

      logInfo("SessionManager", "Quick auth check: no session found");
      return { isAuthenticated: false };
    } catch (error) {
      logError("SessionManager", "Quick auth check failed", { error });
      return {
        isAuthenticated: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if there's an existing session without full initialization
   */
  async hasExistingSession(): Promise<boolean> {
    try {
      logInfo("SessionManager", "Checking for existing session");
      
      // First check if we have a stored user ID
      const storedUserId = this.getUserIdFromStorage();
      if (storedUserId) {
        logInfo("SessionManager", "Existing session found in storage");
        return true;
      }

      // If no stored ID, check Supabase session
      if (!this.supabase || !this.supabase.auth) {
        logWarning("SessionManager", "No Supabase client available for session check");
        return false;
      }

      const { data: { session } } = await withSupabaseTimeout(
        this.supabase.auth.getSession(),
        5000,
        "Check existing session"
      );

      const hasSession = !!session?.user;
      logInfo("SessionManager", `Existing session check: ${hasSession ? "found" : "not found"}`);
      
      return hasSession;
    } catch (error) {
      logError("SessionManager", "Error checking existing session", { error });
      return false;
    }
  }

  /**
   * Get access token from Supabase session
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.supabase || !this.supabase.auth) {
      logWarning("SessionManager", "Supabase client not available for access token");
      return null;
    }

    try {
      logInfo("SessionManager", "Getting access token");
      
      const { data: { session } } = await withSupabaseTimeout(
        this.supabase.auth.getSession(),
        5000,
        "Get access token"
      );

      const token = session?.access_token || null;
      
      if (token) {
        logInfo("SessionManager", "Access token retrieved successfully");
      } else {
        logWarning("SessionManager", "No access token available");
      }
      
      return token;
    } catch (error) {
      logError("SessionManager", "Error getting access token", { error });
      return null;
    }
  }

  /**
   * Validate session and sync with storage
   * This method ensures consistency between Supabase session and local storage
   */
  async validateAndSyncSession(): Promise<boolean> {
    try {
      logInfo("SessionManager", "Validating and syncing session");
      
      const storedUserId = this.getUserIdFromStorage();
      
      if (!this.supabase || !this.supabase.auth) {
        if (storedUserId) {
          logWarning("SessionManager", "No Supabase client but stored user ID found, clearing storage");
          this.clearUserIdFromStorage();
        }
        return false;
      }

      const { data: { session } } = await withSupabaseTimeout(
        this.supabase.auth.getSession(),
        5000,
        "Validate session"
      );

      if (session?.user) {
        // We have a valid Supabase session
        if (storedUserId !== session.user.id) {
          logInfo("SessionManager", "Syncing stored user ID with Supabase session");
          this.saveUserIdToStorage(session.user.id);
        }
        return true;
      } else {
        // No valid Supabase session
        if (storedUserId) {
          logInfo("SessionManager", "No valid Supabase session, clearing stored user ID");
          this.clearUserIdFromStorage();
        }
        return false;
      }
    } catch (error) {
      logError("SessionManager", "Error validating session", { error });
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
      await withSupabaseTimeout(
        this.supabase.auth.getSession(),
        3000,
        "Connection test"
      );
      
      logInfo("SessionManager", "Supabase client connection verified");
      return true;
    } catch (error) {
      logError("SessionManager", "Supabase client connection test failed", { error });
      return false;
    }
  }

  /**
   * Emit login event when user signs in
   */
  async emitLoginEvent(): Promise<void> {
    try {
      const session = await this.getSession();
      if (session) {
        this.eventManager.emitEvent("login", { session });
        logInfo("SessionManager", "Login event emitted");
      }
    } catch (error) {
      logError("SessionManager", "Error emitting login event", { error });
    }
  }

  /**
   * Emit logout event when user signs out
   */
  emitLogoutEvent(): void {
    try {
      this.eventManager.emitEvent("logout", { session: null });
      logInfo("SessionManager", "Logout event emitted");
    } catch (error) {
      logError("SessionManager", "Error emitting logout event", { error });
    }
  }

  /**
   * Handle successful authentication - save user ID and emit login event
   */
  async handleSuccessfulAuth(userId: string): Promise<void> {
    this.saveUserIdToStorage(userId);
    await this.emitLoginEvent();
  }

  /**
   * Handle sign out - clear storage and emit logout event
   */
  handleSignOut(): void {
    this.clearUserIdFromStorage();
    this.emitLogoutEvent();
  }

  /**
   * Debug method to check session manager status
   */
  debugStatus(): void {
    console.log("SessionManager Debug Status:");
    console.log("- Supabase client exists:", !!this.supabase);
    console.log("- Supabase auth exists:", !!(this.supabase && this.supabase.auth));
    console.log("- Storage key:", this.storageKey);
    console.log("- Stored user ID:", this.getUserIdFromStorage());
    console.log("- Event manager exists:", !!this.eventManager);
  }
}