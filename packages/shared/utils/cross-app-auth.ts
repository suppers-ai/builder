/**
 * Cross-application authentication helpers for profile synchronization
 */

import { type ProfileChangeEvent, profileSyncManager } from "./profile-sync.ts";
import { profileSyncMonitor } from "./profile-sync-monitor.ts";

export interface Session {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
  };
  expires_at?: number;
}

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  theme?: string;
  [key: string]: any;
}

/**
 * Cross-application authentication helpers
 */
export class CrossAppAuthHelpers {
  private static instance: CrossAppAuthHelpers | null = null;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;

  // Performance optimization properties
  private themeUpdateTimer: number | null = null;
  private readonly THEME_UPDATE_DEBOUNCE = 100; // ms
  private avatarCacheMap: Map<string, { url: string; timestamp: number }> = new Map();
  private readonly AVATAR_CACHE_TTL = 300000; // 5 minutes
  private uiUpdateQueue: Array<{ type: string; data: any; timestamp: number }> = [];
  private uiUpdateTimer: number | null = null;
  private readonly UI_UPDATE_BATCH_DELAY = 50; // ms
  private readonly MAX_UI_UPDATE_QUEUE = 20;
  private cleanupTimer: number | null = null;

  private constructor() {
    // Subscribe to profile changes from other applications
    profileSyncManager.subscribeToProfileChanges((event) => {
      this.handleProfileChangeEvent(event);
    });

    // Setup periodic cleanup
    this.setupPeriodicCleanup();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CrossAppAuthHelpers {
    if (!CrossAppAuthHelpers.instance) {
      CrossAppAuthHelpers.instance = new CrossAppAuthHelpers();
    }
    return CrossAppAuthHelpers.instance;
  }

  /**
   * Set current user and session
   */
  public setCurrentUser(user: User, session?: Session): void {
    this.currentUser = user;
    if (session) {
      this.currentSession = session;
    }
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  public getCurrentSession(): Session | null {
    return this.currentSession;
  }

  /**
   * Sync session across all applications
   */
  public syncSessionAcrossApps(session: Session): void {
    this.currentSession = session;
    this.currentUser = this.extractUserFromSession(session);

    // Broadcast session update (without sensitive tokens)
    const profileEvent: ProfileChangeEvent = {
      type: "profile",
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          ...session.user.user_metadata,
        },
      },
      timestamp: Date.now(),
      source: this.getAppName(),
      userId: session.user.id,
    };

    profileSyncManager.broadcastProfileChange(profileEvent);
  }

  /**
   * Clear session across all applications
   */
  public clearSessionAcrossApps(): void {
    const userId = this.currentUser?.id || "unknown";

    this.currentSession = null;
    this.currentUser = null;

    // Clear local storage
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("sb-auth-token");
      // Clear any other auth-related storage
    }

    // Broadcast sign out event
    const signOutEvent: ProfileChangeEvent = {
      type: "signOut",
      data: {
        reason: "user_initiated",
      },
      timestamp: Date.now(),
      source: this.getAppName(),
      userId,
    };

    profileSyncManager.broadcastProfileChange(signOutEvent);
  }

  /**
   * Sync theme across all applications with debouncing
   */
  public syncThemeAcrossApps(theme: string): void {
    if (!this.currentUser) return;

    // Update current user immediately
    this.currentUser.theme = theme;

    // Apply theme locally with debouncing
    this.applyThemeDebounced(theme);

    // Broadcast theme change using optimized method
    const themeEvent: ProfileChangeEvent = {
      type: "theme",
      data: { theme },
      timestamp: Date.now(),
      source: this.getAppName(),
      userId: this.currentUser.id,
    };

    profileSyncManager.broadcastProfileChangeOptimized(themeEvent);
  }

  /**
   * Sync user data across all applications
   */
  public syncUserDataAcrossApps(userData: Partial<User>): void {
    if (!this.currentUser) return;

    // Update current user
    this.currentUser = { ...this.currentUser, ...userData };

    // Broadcast user data change using optimized method
    const userDataEvent: ProfileChangeEvent = {
      type: userData.avatarUrl
        ? "avatar"
        : (userData.displayName || userData.firstName || userData.lastName)
        ? "displayName"
        : "profile",
      data: {
        ...userData,
        user: this.currentUser,
      },
      timestamp: Date.now(),
      source: this.getAppName(),
      userId: this.currentUser.id,
    };

    profileSyncManager.broadcastProfileChangeOptimized(userDataEvent);
  }

  /**
   * Handle profile change events from other applications
   */
  public handleProfileChangeEvent(event: ProfileChangeEvent): void {
    const startTime = performance.now();
    
    // Don't handle events from the same source
    if (event.source === this.getAppName()) return;

    try {
      switch (event.type) {
        case "theme":
          if (event.data.theme) {
            this.applyTheme(event.data.theme);
            if (this.currentUser) {
              this.currentUser.theme = event.data.theme;
            }
            // Record theme application performance
            profileSyncMonitor.recordPerformance('theme_application', performance.now() - startTime);
          }
          break;

        case "avatar":
          if (event.data.avatarUrl && this.currentUser) {
            this.currentUser.avatarUrl = event.data.avatarUrl;
            this.updateUIElements({ avatarUrl: event.data.avatarUrl });
            // Record avatar update performance
            profileSyncMonitor.recordPerformance('avatar_update', performance.now() - startTime);
          }
          break;

        case "displayName":
          if (this.currentUser) {
            if (event.data.displayName) this.currentUser.displayName = event.data.displayName;
            if (event.data.firstName) this.currentUser.firstName = event.data.firstName;
            if (event.data.lastName) this.currentUser.lastName = event.data.lastName;

            this.updateUIElements({
              displayName: this.currentUser.displayName,
              firstName: this.currentUser.firstName,
              lastName: this.currentUser.lastName,
            });
            // Record display name update performance
            profileSyncMonitor.recordPerformance('display_name_update', performance.now() - startTime);
          }
          break;

        case "profile":
          if (event.data.user && this.currentUser) {
            this.currentUser = { ...this.currentUser, ...event.data.user };
            this.updateUIElements(event.data.user);
            // Record profile update performance
            profileSyncMonitor.recordPerformance('profile_update', performance.now() - startTime);
          }
          break;

        case "signOut":
          this.handleSignOut();
          // Record sign out performance
          profileSyncMonitor.recordPerformance('sign_out_handling', performance.now() - startTime);
          break;
      }
    } catch (error) {
      // Record error in handling profile change event
      profileSyncMonitor.recordError(
        `Failed to handle ${event.type} event: ${error instanceof Error ? error.message : String(error)}`,
        event.type,
        undefined,
        { source: event.source, appName: this.getAppName() }
      );
    }
  }

  /**
   * Apply theme to current document with debouncing
   */
  private applyThemeDebounced(theme: string): void {
    // Clear existing timer
    if (this.themeUpdateTimer) {
      clearTimeout(this.themeUpdateTimer);
    }

    // Set new debounced timer
    this.themeUpdateTimer = setTimeout(() => {
      this.applyTheme(theme);
      this.themeUpdateTimer = null;
    }, this.THEME_UPDATE_DEBOUNCE);
  }

  /**
   * Apply theme to current document
   */
  private applyTheme(theme: string): void {
    if (typeof document === "undefined") return;

    // Update data-theme attribute on html element
    document.documentElement.setAttribute("data-theme", theme);

    // Store theme in localStorage
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", theme);
    }

    // Dispatch custom event for components that need to react to theme changes
    const themeChangeEvent = new CustomEvent("themeChange", {
      detail: { theme },
    });
    document.dispatchEvent(themeChangeEvent);
  }

  /**
   * Setup periodic cleanup for performance optimization
   */
  private setupPeriodicCleanup(): void {
    // Clean up every 5 minutes
    setInterval(() => {
      this.performCleanup();
    }, 300000);
  }

  /**
   * Perform cleanup operations
   */
  private performCleanup(): void {
    const now = Date.now();

    // Clean up expired avatar cache entries
    for (const [key, cache] of this.avatarCacheMap.entries()) {
      if (now - cache.timestamp > this.AVATAR_CACHE_TTL) {
        this.avatarCacheMap.delete(key);
      }
    }

    // Clean up old UI update queue entries
    this.uiUpdateQueue = this.uiUpdateQueue.filter(
      update => now - update.timestamp < 60000 // Keep only last minute
    );
  }

  /**
   * Update UI elements with new user data using batching
   */
  private updateUIElements(userData: Partial<User>): void {
    // Add to UI update queue for batching
    this.queueUIUpdate('userDataUpdate', { userData, user: this.currentUser });

    // Handle avatar URL cache invalidation immediately for visual consistency
    if (userData.avatarUrl) {
      this.invalidateAvatarCacheOptimized(userData.avatarUrl);
    }
  }

  /**
   * Queue UI update for batching
   */
  private queueUIUpdate(type: string, data: any): void {
    // Remove any existing update of the same type to avoid duplicates
    this.uiUpdateQueue = this.uiUpdateQueue.filter(update => update.type !== type);

    // Add new update
    this.uiUpdateQueue.push({
      type,
      data,
      timestamp: Date.now(),
    });

    // Enforce queue size limit
    if (this.uiUpdateQueue.length > this.MAX_UI_UPDATE_QUEUE) {
      this.uiUpdateQueue.shift();
    }

    // Set or reset batch timer
    if (this.uiUpdateTimer) {
      clearTimeout(this.uiUpdateTimer);
    }

    this.uiUpdateTimer = setTimeout(() => {
      this.processUIUpdateQueue();
    }, this.UI_UPDATE_BATCH_DELAY);
  }

  /**
   * Process queued UI updates
   */
  private processUIUpdateQueue(): void {
    if (this.uiUpdateQueue.length === 0) return;

    const updatesToProcess = [...this.uiUpdateQueue];
    this.uiUpdateQueue = [];

    if (this.uiUpdateTimer) {
      clearTimeout(this.uiUpdateTimer);
      this.uiUpdateTimer = null;
    }

    // Process all updates in a single batch
    if (typeof document !== "undefined") {
      // Use requestAnimationFrame for smooth UI updates
      requestAnimationFrame(() => {
        for (const update of updatesToProcess) {
          const event = new CustomEvent(update.type, {
            detail: update.data,
          });
          document.dispatchEvent(event);
        }
      });
    }
  }

  /**
   * Optimized avatar cache invalidation with caching and throttling
   */
  private invalidateAvatarCacheOptimized(avatarUrl: string): void {
    if (typeof document === "undefined") return;

    const now = Date.now();
    const cacheKey = avatarUrl;

    // Check if we've recently processed this avatar URL
    const cached = this.avatarCacheMap.get(cacheKey);
    if (cached && now - cached.timestamp < 1000) {
      // Skip if we've processed this URL within the last second
      return;
    }

    // Update cache
    this.avatarCacheMap.set(cacheKey, { url: avatarUrl, timestamp: now });

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      this.invalidateAvatarCache(avatarUrl);
    });
  }

  /**
   * Invalidate avatar cache to ensure fresh images are loaded
   */
  private invalidateAvatarCache(avatarUrl: string): void {
    if (typeof document === "undefined") return;

    // Find all avatar images in the document and update their src to force reload
    const avatarImages = document.querySelectorAll(
      'img[src*="avatar"], img[alt*="avatar"], img[class*="avatar"]',
    );

    avatarImages.forEach((img) => {
      const imgElement = img as HTMLImageElement;

      // Update all avatar images with the new URL and cache buster
      const separator = avatarUrl.includes("?") ? "&" : "?";
      const cacheBuster = `${separator}_cb=${Date.now()}`;
      imgElement.src = avatarUrl + cacheBuster;
    });

    // Also dispatch a specific avatar update event for components that need it
    const avatarUpdateEvent = new CustomEvent("avatarUpdate", {
      detail: { avatarUrl, cacheBuster: Date.now() },
    });
    document.dispatchEvent(avatarUpdateEvent);
  }

  /**
   * Get performance metrics for monitoring
   */
  public getPerformanceMetrics(): {
    avatarCacheSize: number;
    uiUpdateQueueSize: number;
    hasActiveThemeTimer: boolean;
    hasActiveUITimer: boolean;
  } {
    return {
      avatarCacheSize: this.avatarCacheMap.size,
      uiUpdateQueueSize: this.uiUpdateQueue.length,
      hasActiveThemeTimer: this.themeUpdateTimer !== null,
      hasActiveUITimer: this.uiUpdateTimer !== null,
    };
  }

  /**
   * Force cleanup for testing or manual intervention
   */
  public forceCleanup(): void {
    this.performCleanup();
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.avatarCacheMap.clear();
    this.uiUpdateQueue = [];
    
    if (this.themeUpdateTimer) {
      clearTimeout(this.themeUpdateTimer);
      this.themeUpdateTimer = null;
    }
    
    if (this.uiUpdateTimer) {
      clearTimeout(this.uiUpdateTimer);
      this.uiUpdateTimer = null;
    }
  }

  /**
   * Cleanup all resources and timers
   */
  public cleanup(): void {
    this.clearCache();
    this.currentUser = null;
    this.currentSession = null;
  }

  /**
   * Handle sign out event
   */
  private handleSignOut(): void {
    this.currentSession = null;
    this.currentUser = null;

    // Clear local storage
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("sb-auth-token");
    }

    // Redirect to login or refresh page
    if (typeof window !== "undefined") {
      // Dispatch sign out event for components to handle
      const signOutEvent = new CustomEvent("userSignOut");
      document.dispatchEvent(signOutEvent);
    }
  }

  /**
   * Extract user data from session
   */
  private extractUserFromSession(session: Session): User {
    const metadata = session.user.user_metadata || {};

    return {
      id: session.user.id,
      email: session.user.email,
      displayName: metadata.display_name || metadata.full_name,
      firstName: metadata.first_name,
      lastName: metadata.last_name,
      avatarUrl: metadata.avatar_url,
      theme: metadata.theme || "light",
      ...metadata,
    };
  }

  /**
   * Get current application name
   */
  private getAppName(): string {
    if (typeof window === "undefined") return "server";

    const hostname = window.location.hostname;

    // Map hostnames to app names
    if (hostname.includes("docs")) return "docs";
    if (hostname.includes("store")) return "store";
    if (hostname.includes("profile")) return "profile";
    if (hostname.includes("cdn")) return "cdn";

    // For development, check port
    const port = window.location.port;
    if (port === "8000") return "docs";
    if (port === "8001") return "store";
    if (port === "8002") return "profile";
    if (port === "8003") return "cdn";

    return "unknown";
  }
}

// Export singleton instance
export const crossAppAuthHelpers = CrossAppAuthHelpers.getInstance();
