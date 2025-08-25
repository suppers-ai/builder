import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthEventCallback,
  AuthEventType,
  AuthSession,
} from "@suppers/shared/types";
import type {
  DirectAuthClientConfig,
  SignInData,
  SignUpData,
  UpdateUserData,
  ResetPasswordData,
  AuthMethodResult,
  StorageUploadResult,
  FileListResult,
  SessionStatus,
  QuickAuthResult,
  ApiRequestOptions,
} from "./types.ts";
import { SessionManager } from "./session-manager.ts";
import { AuthMethods } from "./auth-methods.ts";
import { UserManager } from "./user-manager.ts";
import { StorageManager } from "./storage-manager.ts";
import { EventManager } from "./event-manager.ts";
import { logError, logInfo, logWarning } from "./utils.ts";

/**
 * DirectAuthClient - Main facade class that composes all auth-related managers
 * 
 * This class acts as a facade pattern that delegates functionality to specialized managers:
 * - SessionManager: Handles session state and storage
 * - AuthMethods: Handles authentication operations
 * - UserManager: Handles user profile operations
 * - StorageManager: Handles file storage operations
 * - EventManager: Handles event callbacks
 */
export class DirectAuthClient {
  private supabase: SupabaseClient;
  private storageKey: string;
  private isInitialized: boolean = false;
  private isOfflineMode: boolean = false;

  // Manager instances
  private sessionManager: SessionManager;
  private authMethods: AuthMethods;
  private userManager: UserManager;
  private storageManager: StorageManager;
  private eventManager: EventManager;

  constructor(supabaseUrl: string, supabaseAnonKey: string, storageKey?: string) {
    logInfo("DirectAuthClient", "Initializing with URL", { hasUrl: !!supabaseUrl });

    this.storageKey = storageKey || "suppers_user_id";

    try {
      if (!createClient) {
        logWarning("DirectAuthClient", "createClient not available - running in offline mode");
        this.supabase = {} as SupabaseClient;
        this.isOfflineMode = true;
      } else if (!supabaseUrl || !supabaseAnonKey) {
        logError("DirectAuthClient", "Supabase URL or anon key not found");
        this.supabase = {} as SupabaseClient;
        this.isOfflineMode = true;
      } else {
        logInfo("DirectAuthClient", "Creating Supabase client...");

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
          logError("DirectAuthClient", "Failed to create valid Supabase client");
          this.supabase = {} as SupabaseClient;
          this.isOfflineMode = true;
        } else {
          logInfo("DirectAuthClient", "Supabase client created successfully");
        }
      }
    } catch (error) {
      logError("DirectAuthClient", "Error creating Supabase client", { error });
      this.supabase = {} as SupabaseClient;
      this.isOfflineMode = true;
    }

    // Initialize all managers
    this.eventManager = new EventManager();
    this.sessionManager = new SessionManager();
    this.authMethods = new AuthMethods();
    this.userManager = new UserManager();
    this.storageManager = new StorageManager();

    // Set up auth state change listener if not in offline mode
    if (!this.isOfflineMode && this.supabase.auth) {
      this.setupAuthStateListener();
    }
  }

  /**
   * Set up Supabase auth state change listener
   */
  private setupAuthStateListener(): void {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      logInfo("DirectAuthClient", "Auth state change", { event });
      
      if (event === "SIGNED_IN" && session?.user) {
        // Handle successful authentication
        await this.sessionManager.handleSuccessfulAuth(session.user.id);
        
        // Don't block on profile creation - let it happen on-demand
        this.userManager.ensureUserProfile(session.user).catch((error) => {
          logError("DirectAuthClient", "Failed to ensure user profile, but continuing", { error });
        });
      } else if (event === "SIGNED_OUT") {
        // Handle sign out
        this.sessionManager.handleSignOut();
      }
    });
  }

  /**
   * Initialize the auth client and all managers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logInfo("DirectAuthClient", "Already initialized");
      return;
    }

    try {
      logInfo("DirectAuthClient", "Starting initialization...");

      // Handle offline mode gracefully
      if (this.isOfflineMode) {
        logWarning("DirectAuthClient", "Running in offline mode - limited functionality available");
        this.isInitialized = true;
        return;
      }

      // Test Supabase connection before proceeding
      const isConnected = await this.testConnection();
      if (!isConnected) {
        logWarning("DirectAuthClient", "Supabase connection failed - enabling offline mode");
        this.isOfflineMode = true;
        this.isInitialized = true;
        return;
      }

      const dependencies = {
        supabase: this.supabase,
        storageKey: this.storageKey,
        eventManager: this.eventManager,
      };

      // Initialize all managers in order
      logInfo("DirectAuthClient", "Initializing managers...");
      
      this.sessionManager.initialize(dependencies);
      this.authMethods.initialize(dependencies);
      this.userManager.initialize(dependencies);
      this.storageManager.initialize(dependencies);

      // Set up cross-manager dependencies
      this.authMethods.setSessionManager(this.sessionManager);

      // Check for existing session and validate
      logInfo("DirectAuthClient", "Checking existing session...");
      const hasSession = await this.sessionManager.hasExistingSession();
      if (hasSession) {
        logInfo("DirectAuthClient", "Found existing session during initialization");
        
        // Validate and sync session state
        const isValid = await this.sessionManager.validateAndSyncSession();
        if (!isValid) {
          logWarning("DirectAuthClient", "Existing session was invalid and has been cleared");
        }
      } else {
        logInfo("DirectAuthClient", "No existing session found");
      }

      this.isInitialized = true;
      logInfo("DirectAuthClient", "Initialization complete");

      // Emit login event if we have a session
      if (hasSession) {
        const session = await this.sessionManager.getSession();
        if (session) {
          this.eventManager.emitEvent("login", { session });
        }
      }

    } catch (error) {
      logError("DirectAuthClient", "Initialization failed", { error });
      
      // Try to continue in offline mode if initialization fails
      logWarning("DirectAuthClient", "Falling back to offline mode due to initialization error");
      this.isOfflineMode = true;
      this.isInitialized = true;
      
      // Log initialization error but don't emit unsupported event
      logError("DirectAuthClient", "Initialization failed, running in offline mode", { 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Test connection to Supabase
   */
  private async testConnection(): Promise<boolean> {
    try {
      if (!this.supabase || !this.supabase.auth) {
        return false;
      }

      // Try a simple operation with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        await this.supabase.auth.getSession();
        clearTimeout(timeoutId);
        logInfo("DirectAuthClient", "Supabase connection test successful");
        return true;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          logError("DirectAuthClient", "Supabase connection test timed out");
        } else {
          logError("DirectAuthClient", "Supabase connection test failed", { error });
        }
        return false;
      }
    } catch (error) {
      logError("DirectAuthClient", "Connection test error", { error });
      return false;
    }
  }

  /**
   * Reinitialize the client (useful for recovering from offline mode)
   */
  async reinitialize(): Promise<void> {
    logInfo("DirectAuthClient", "Reinitializing client...");
    
    // Reset initialization state
    this.isInitialized = false;
    this.isOfflineMode = false;
    
    // Attempt to reinitialize
    await this.initialize();
  }

  /**
   * Check if the client is properly initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if the client is running in offline mode
   */
  isOffline(): boolean {
    return this.isOfflineMode;
  }

  // ========================================
  // Session Management Methods
  // ========================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.isInitialized) {
      logWarning("DirectAuthClient", "Client not initialized, returning false for isAuthenticated");
      return false;
    }
    return this.sessionManager.isAuthenticated();
  }

  /**
   * Get user ID from storage
   */
  getUserId(): string | null {
    if (!this.isInitialized) {
      logWarning("DirectAuthClient", "Client not initialized, returning null for getUserId");
      return null;
    }
    return this.sessionManager.getUserId();
  }

  /**
   * Get current session from Supabase
   */
  async getSession(): Promise<AuthSession | null> {
    if (!this.isInitialized) {
      logWarning("DirectAuthClient", "Client not initialized");
      return null;
    }
    if (this.isOfflineMode) {
      logWarning("DirectAuthClient", "Cannot get session in offline mode");
      return null;
    }
    return await this.sessionManager.getSession();
  }

  /**
   * Get current session status without full user data
   */
  async getSessionStatus(): Promise<SessionStatus> {
    if (!this.isInitialized) {
      return { isAuthenticated: false };
    }
    return await this.sessionManager.getSessionStatus();
  }

  /**
   * Quick check for authentication status
   */
  async quickAuthCheck(): Promise<QuickAuthResult> {
    if (!this.isInitialized) {
      return { isAuthenticated: false, error: "Client not initialized" };
    }
    return await this.sessionManager.quickAuthCheck();
  }

  /**
   * Check if there's an existing session without full initialization
   */
  async hasExistingSession(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }
    return await this.sessionManager.hasExistingSession();
  }

  /**
   * Get access token from Supabase
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.isInitialized || this.isOfflineMode) {
      return null;
    }
    return await this.sessionManager.getAccessToken();
  }

  /**
   * Check if Supabase client is properly connected
   */
  async isConnected(): Promise<boolean> {
    if (!this.isInitialized || this.isOfflineMode) {
      return false;
    }
    return await this.sessionManager.isConnected();
  }

  // ========================================
  // Authentication Methods
  // ========================================

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<AuthMethodResult> {
    if (!this.isInitialized) {
      return { error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { error: "Cannot sign in while in offline mode" };
    }
    return await this.authMethods.signIn(data);
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<AuthMethodResult> {
    if (!this.isInitialized) {
      return { error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { error: "Cannot sign up while in offline mode" };
    }
    return await this.authMethods.signUp(data);
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordData): Promise<AuthMethodResult> {
    if (!this.isInitialized) {
      return { error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { error: "Cannot reset password while in offline mode" };
    }
    return await this.authMethods.resetPassword(data);
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.isInitialized) {
      logWarning("DirectAuthClient", "Client not initialized for sign out");
      return;
    }
    // Allow sign out even in offline mode to clear local storage
    await this.authMethods.signOut();
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: string, redirectTo?: string): Promise<AuthMethodResult> {
    if (!this.isInitialized) {
      return { error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { error: "Cannot sign in with OAuth while in offline mode" };
    }
    return await this.authMethods.signInWithOAuth(provider, redirectTo);
  }

  // ========================================
  // User Management Methods
  // ========================================

  /**
   * Get user data from database
   */
  async getUser(): Promise<any | null> {
    if (!this.isInitialized) {
      logWarning("DirectAuthClient", "Client not initialized");
      return null;
    }
    if (this.isOfflineMode) {
      logWarning("DirectAuthClient", "Cannot get user data in offline mode");
      return null;
    }
    return await this.userManager.getUser();
  }

  /**
   * Update user profile
   */
  async updateUser(data: UpdateUserData): Promise<AuthMethodResult> {
    if (!this.isInitialized) {
      return { error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { error: "Cannot update user profile while in offline mode" };
    }
    return await this.userManager.updateUser(data);
  }

  /**
   * Create user profile on-demand (called when user accesses profile page)
   */
  async createUserProfileIfNeeded(): Promise<boolean> {
    if (!this.isInitialized || this.isOfflineMode) {
      return false;
    }
    return await this.userManager.createUserProfileIfNeeded();
  }

  // ========================================
  // Storage Methods
  // ========================================

  /**
   * Upload file to application storage
   */
  async uploadFile(
    applicationSlug: string,
    file: File,
    filePath?: string
  ): Promise<StorageUploadResult> {
    if (!this.isInitialized) {
      return { success: false, error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { success: false, error: "Cannot upload files while in offline mode" };
    }
    return await this.storageManager.uploadFile(applicationSlug, file, filePath);
  }

  /**
   * Upload raw content to application storage
   */
  async uploadContent(
    applicationSlug: string,
    filePath: string,
    content: string | ArrayBuffer,
    contentType?: string
  ): Promise<StorageUploadResult> {
    if (!this.isInitialized) {
      return { success: false, error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { success: false, error: "Cannot upload content while in offline mode" };
    }
    return await this.storageManager.uploadContent(applicationSlug, filePath, content, contentType);
  }

  /**
   * Download file content from application storage
   */
  async downloadFile(
    applicationSlug: string,
    filePath: string
  ): Promise<StorageUploadResult> {
    if (!this.isInitialized) {
      return { success: false, error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { success: false, error: "Cannot download files while in offline mode" };
    }
    return await this.storageManager.downloadFile(applicationSlug, filePath);
  }

  /**
   * List files in application storage
   */
  async listFiles(
    applicationSlug: string,
    path?: string
  ): Promise<FileListResult> {
    if (!this.isInitialized) {
      return { success: false, error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { success: false, error: "Cannot list files while in offline mode" };
    }
    return await this.storageManager.listFiles(applicationSlug, path);
  }

  /**
   * Get file metadata from application storage
   */
  async getFileInfo(
    applicationSlug: string,
    filePath: string
  ): Promise<StorageUploadResult> {
    if (!this.isInitialized) {
      return { success: false, error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { success: false, error: "Cannot get file info while in offline mode" };
    }
    return await this.storageManager.getFileInfo(applicationSlug, filePath);
  }

  /**
   * Delete file from application storage
   */
  async deleteFile(
    applicationSlug: string,
    filePath: string
  ): Promise<StorageUploadResult> {
    if (!this.isInitialized) {
      return { success: false, error: "Client not initialized" };
    }
    if (this.isOfflineMode) {
      return { success: false, error: "Cannot delete files while in offline mode" };
    }
    return await this.storageManager.deleteFile(applicationSlug, filePath);
  }

  // ========================================
  // API Request Methods
  // ========================================

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint: string, options: ApiRequestOptions = {}): Promise<Response> {
    if (!this.isInitialized) {
      throw new Error("Client not initialized");
    }
    if (this.isOfflineMode) {
      throw new Error("Cannot make API requests while in offline mode");
    }

    const token = await this.getAccessToken();
    if (!token) {
      throw new Error("No access token available");
    }

    const { timeout = 10000, ...fetchOptions } = options;

    // Set up timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, {
        ...fetchOptions,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  // ========================================
  // Event Management Methods
  // ========================================

  /**
   * Add event listener
   */
  addEventListener(event: AuthEventType, callback: AuthEventCallback): void {
    this.eventManager.addEventListener(event, callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: AuthEventType, callback: AuthEventCallback): void {
    this.eventManager.removeEventListener(event, callback);
  }

  // ========================================
  // Backward Compatibility Methods
  // ========================================

  /**
   * Get event callbacks map (for backward compatibility)
   */
  get eventCallbacks(): Map<AuthEventType, AuthEventCallback[]> {
    // Return a read-only view of the event callbacks
    const callbacks = new Map<AuthEventType, AuthEventCallback[]>();
    if (this.eventManager) {
      const events = this.eventManager.getRegisteredEvents();
      for (const event of events) {
        const count = this.eventManager.getListenerCount(event);
        if (count > 0) {
          // We can't expose the actual callbacks for security reasons,
          // but we can indicate that callbacks exist
          callbacks.set(event, new Array(count).fill(() => {}));
        }
      }
    }
    return callbacks;
  }

  /**
   * Save user ID to storage (for backward compatibility)
   */
  saveUserIdToStorage(userId: string): void {
    if (this.sessionManager) {
      this.sessionManager.saveUserIdToStorage(userId);
    }
  }

  /**
   * Get user ID from storage (for backward compatibility)
   */
  getUserIdFromStorage(): string | null {
    if (this.sessionManager) {
      return this.sessionManager.getUserIdFromStorage();
    }
    return null;
  }

  /**
   * Clear user ID from storage (for backward compatibility)
   */
  clearUserIdFromStorage(): void {
    if (this.sessionManager) {
      this.sessionManager.clearUserIdFromStorage();
    }
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Debug method to check client status
   */
  debugStatus(): void {
    console.log("DirectAuthClient Debug Status:");
    console.log("- Initialized:", this.isInitialized);
    console.log("- Offline mode:", this.isOfflineMode);
    console.log("- Ready:", this.isReady());
    console.log("- Supabase client exists:", !!this.supabase);
    console.log("- Supabase auth exists:", !!(this.supabase && this.supabase.auth));
    console.log("- Storage key:", this.storageKey);
    console.log("- Authenticated:", this.isAuthenticated());
    console.log("- User ID:", this.getUserId());
    
    // Manager status
    console.log("- Session manager exists:", !!this.sessionManager);
    console.log("- Auth methods exists:", !!this.authMethods);
    console.log("- User manager exists:", !!this.userManager);
    console.log("- Storage manager exists:", !!this.storageManager);
    console.log("- Event manager exists:", !!this.eventManager);
    
    // Delegate to session manager for additional debug info
    if (this.sessionManager && this.isInitialized) {
      this.sessionManager.debugStatus();
    }
  }

  /**
   * Cleanup all managers and resources
   */
  destroy(): void {
    logInfo("DirectAuthClient", "Destroying client and cleaning up resources");

    try {
      // Emit logout event before cleanup if authenticated
      if (this.eventManager && this.isAuthenticated()) {
        this.eventManager.emitEvent("logout", { session: null });
      }

      // Destroy all managers safely
      try {
        this.sessionManager?.destroy();
      } catch (error) {
        logError("DirectAuthClient", "Error destroying session manager", { error });
      }

      try {
        this.authMethods?.destroy();
      } catch (error) {
        logError("DirectAuthClient", "Error destroying auth methods", { error });
      }

      try {
        this.userManager?.destroy();
      } catch (error) {
        logError("DirectAuthClient", "Error destroying user manager", { error });
      }

      try {
        this.storageManager?.destroy();
      } catch (error) {
        logError("DirectAuthClient", "Error destroying storage manager", { error });
      }

      // Destroy event manager last
      try {
        this.eventManager?.destroy();
      } catch (error) {
        logError("DirectAuthClient", "Error destroying event manager", { error });
      }

      // Reset state
      this.isInitialized = false;
      this.isOfflineMode = false;

      logInfo("DirectAuthClient", "Cleanup complete");
    } catch (error) {
      logError("DirectAuthClient", "Error during cleanup", { error });
    }
  }

  /**
   * Graceful shutdown with cleanup
   */
  async shutdown(): Promise<void> {
    logInfo("DirectAuthClient", "Starting graceful shutdown...");

    try {
      // Sign out if authenticated
      if (this.isAuthenticated()) {
        logInfo("DirectAuthClient", "Signing out user before shutdown");
        await this.signOut();
      }

      // Wait a moment for any pending operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Destroy the client
      this.destroy();

      logInfo("DirectAuthClient", "Graceful shutdown complete");
    } catch (error) {
      logError("DirectAuthClient", "Error during graceful shutdown", { error });
      // Still destroy even if shutdown fails
      this.destroy();
    }
  }
}