/**
 * User preferences management system
 * Handles storage and synchronization of user settings
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { preferencesCache } from "./cache-manager.ts";

export interface UserPreferences {
  // Layout preferences
  defaultLayout: "default" | "timeline";
  itemSize: "small" | "medium" | "large";
  sortBy: "name" | "date" | "size" | "type";
  sortOrder: "asc" | "desc";
  showThumbnails: boolean;
  showHiddenFiles: boolean;

  // Accessibility preferences
  highContrastMode: boolean;
  keyboardNavigationMode: boolean;
  screenReaderMode: boolean;
  reducedMotion: boolean;

  // UI preferences
  theme: "light" | "dark" | "auto";
  sidebarCollapsed: boolean;
  showFileExtensions: boolean;
  showItemCount: boolean;

  // Performance preferences
  enableVirtualScrolling: boolean;
  thumbnailQuality: "low" | "medium" | "high";
  cacheEnabled: boolean;

  // Notification preferences
  showToastNotifications: boolean;
  notificationDuration: number;
  soundEnabled: boolean;

  // Upload preferences
  defaultUploadFolder: string | null;
  autoGenerateThumbnails: boolean;
  compressImages: boolean;

  // Privacy preferences
  analyticsEnabled: boolean;
  errorReportingEnabled: boolean;

  // Advanced preferences
  debugMode: boolean;
  experimentalFeatures: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  // Layout preferences
  defaultLayout: "default",
  itemSize: "medium",
  sortBy: "name",
  sortOrder: "asc",
  showThumbnails: true,
  showHiddenFiles: false,

  // Accessibility preferences
  highContrastMode: false,
  keyboardNavigationMode: false,
  screenReaderMode: false,
  reducedMotion: false,

  // UI preferences
  theme: "auto",
  sidebarCollapsed: false,
  showFileExtensions: true,
  showItemCount: true,

  // Performance preferences
  enableVirtualScrolling: true,
  thumbnailQuality: "medium",
  cacheEnabled: true,

  // Notification preferences
  showToastNotifications: true,
  notificationDuration: 5000,
  soundEnabled: false,

  // Upload preferences
  defaultUploadFolder: null,
  autoGenerateThumbnails: true,
  compressImages: true,

  // Privacy preferences
  analyticsEnabled: true,
  errorReportingEnabled: true,

  // Advanced preferences
  debugMode: false,
  experimentalFeatures: false,
};

export class UserPreferencesManager {
  private static instance: UserPreferencesManager;
  private preferences: UserPreferences;
  private listeners: Set<(preferences: UserPreferences) => void> = new Set();
  private userId: string | null = null;

  private constructor() {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.initializeFromSystem();
  }

  static getInstance(): UserPreferencesManager {
    if (!UserPreferencesManager.instance) {
      UserPreferencesManager.instance = new UserPreferencesManager();
    }
    return UserPreferencesManager.instance;
  }

  /**
   * Initialize preferences from system settings and localStorage
   */
  private initializeFromSystem(): void {
    if (typeof window === "undefined") return;

    // Detect system preferences
    if (globalThis.matchMedia) {
      // Theme preference
      const darkModeQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
      if (darkModeQuery.matches && this.preferences.theme === "auto") {
        this.preferences.theme = "dark";
      }

      // Reduced motion preference
      const reducedMotionQuery = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
      if (reducedMotionQuery.matches) {
        this.preferences.reducedMotion = true;
      }

      // High contrast preference
      const highContrastQuery = globalThis.matchMedia("(prefers-contrast: high)");
      if (highContrastQuery.matches) {
        this.preferences.highContrastMode = true;
      }

      // Listen for system preference changes
      darkModeQuery.addEventListener("change", (e) => {
        if (this.preferences.theme === "auto") {
          this.updatePreference("theme", e.matches ? "dark" : "light");
        }
      });

      reducedMotionQuery.addEventListener("change", (e) => {
        this.updatePreference("reducedMotion", e.matches);
      });

      highContrastQuery.addEventListener("change", (e) => {
        this.updatePreference("highContrastMode", e.matches);
      });
    }
  }

  /**
   * Set the current user ID for preference storage
   */
  setUserId(userId: string): void {
    this.userId = userId;
    this.loadPreferences();
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    if (!this.userId) return;

    try {
      // Try to load from cache first
      const cached = preferencesCache.get(this.userId);
      if (cached) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...cached };
        this.applyPreferences();
        this.notifyListeners();
        return;
      }

      // Load from localStorage as fallback
      const stored = localStorage.getItem(`user-preferences:${this.userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.preferences = { ...DEFAULT_PREFERENCES, ...parsed };

        // Update cache
        preferencesCache.set(this.userId, this.preferences);
      }

      this.applyPreferences();
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to load user preferences:", error);
      // Use defaults on error
      this.preferences = { ...DEFAULT_PREFERENCES };
      this.applyPreferences();
    }
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    if (!this.userId) return;

    try {
      // Save to cache
      preferencesCache.set(this.userId, this.preferences);

      // Save to localStorage as backup
      localStorage.setItem(
        `user-preferences:${this.userId}`,
        JSON.stringify(this.preferences),
      );

      // TODO: Save to server/database for cross-device sync
      // This would require an API endpoint for user preferences
    } catch (error) {
      console.error("Failed to save user preferences:", error);
    }
  }

  /**
   * Get current preferences
   */
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Get a specific preference value
   */
  getPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.preferences[key];
  }

  /**
   * Update a specific preference
   */
  async updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ): Promise<void> {
    this.preferences[key] = value;
    await this.savePreferences();
    this.applyPreferences();
    this.notifyListeners();
  }

  /**
   * Update multiple preferences at once
   */
  async updatePreferences(updates: Partial<UserPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...updates };
    await this.savePreferences();
    this.applyPreferences();
    this.notifyListeners();
  }

  /**
   * Reset preferences to defaults
   */
  async resetPreferences(): Promise<void> {
    this.preferences = { ...DEFAULT_PREFERENCES };
    await this.savePreferences();
    this.applyPreferences();
    this.notifyListeners();
  }

  /**
   * Apply preferences to the DOM and application state
   */
  private applyPreferences(): void {
    if (typeof document === "undefined") return;

    const { documentElement } = document;

    // Apply theme
    if (this.preferences.theme === "auto") {
      const isDark = globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
      documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      documentElement.setAttribute("data-theme", this.preferences.theme);
    }

    // Apply accessibility preferences
    documentElement.classList.toggle("high-contrast", this.preferences.highContrastMode);
    documentElement.classList.toggle(
      "keyboard-navigation",
      this.preferences.keyboardNavigationMode,
    );
    documentElement.classList.toggle("screen-reader-mode", this.preferences.screenReaderMode);
    documentElement.classList.toggle("reduced-motion", this.preferences.reducedMotion);

    // Apply debug mode
    documentElement.classList.toggle("debug-mode", this.preferences.debugMode);

    // Update CSS custom properties for dynamic styling
    documentElement.style.setProperty("--item-size", this.preferences.itemSize);
    documentElement.style.setProperty("--thumbnail-quality", this.preferences.thumbnailQuality);
    documentElement.style.setProperty(
      "--notification-duration",
      `${this.preferences.notificationDuration}ms`,
    );
  }

  /**
   * Subscribe to preference changes
   */
  subscribe(listener: (preferences: UserPreferences) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of preference changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.preferences);
      } catch (error) {
        console.error("Error in preference change listener:", error);
      }
    });
  }

  /**
   * Export preferences for backup/sharing
   */
  exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  /**
   * Import preferences from backup/sharing
   */
  async importPreferences(preferencesJson: string): Promise<void> {
    try {
      const imported = JSON.parse(preferencesJson);

      // Validate imported preferences
      const validatedPreferences = this.validatePreferences(imported);

      await this.updatePreferences(validatedPreferences);
    } catch (error) {
      throw new Error(`Failed to import preferences: ${(error as Error).message}`);
    }
  }

  /**
   * Validate preferences object
   */
  private validatePreferences(preferences: any): Partial<UserPreferences> {
    const validated: Partial<UserPreferences> = {};

    // Validate each preference with type checking
    Object.keys(DEFAULT_PREFERENCES).forEach((key) => {
      const typedKey = key as keyof UserPreferences;
      const defaultValue = DEFAULT_PREFERENCES[typedKey];
      const importedValue = preferences[key];

      if (importedValue !== undefined && typeof importedValue === typeof defaultValue) {
        // Additional validation for specific fields
        switch (typedKey) {
          case "defaultLayout":
            if (["default", "timeline"].includes(importedValue)) {
              validated[typedKey] = importedValue;
            }
            break;
          case "itemSize":
            if (["small", "medium", "large"].includes(importedValue)) {
              validated[typedKey] = importedValue;
            }
            break;
          case "theme":
            if (["light", "dark", "auto"].includes(importedValue)) {
              validated[typedKey] = importedValue;
            }
            break;
          case "notificationDuration":
            if (
              typeof importedValue === "number" && importedValue >= 1000 && importedValue <= 30000
            ) {
              validated[typedKey] = importedValue;
            }
            break;
          default:
            validated[typedKey] = importedValue;
        }
      }
    });

    return validated;
  }
}

// Export singleton instance
export const userPreferences = UserPreferencesManager.getInstance();

// Initialize preferences when module is loaded
if (typeof window !== "undefined") {
  // Auto-detect user ID from auth state if available
  // This would typically be done after authentication
  document.addEventListener("DOMContentLoaded", () => {
    // Check if user is authenticated and set user ID
    // This is a placeholder - actual implementation would get user ID from auth
    const userId = localStorage.getItem("user-id");
    if (userId) {
      userPreferences.setUserId(userId);
    }
  });
}
