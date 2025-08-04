/**
 * Profile synchronization utilities for real-time cross-application communication
 */

import {
  type EventValidationResult,
  type PopupFallbackOptions,
  type ProfileChangeEvent,
  ProfileChangeEventSchema,
  type ProfilePopupOptions,
  ProfilePopupOptionsSchema,
  type SerializedProfileChangeEvent,
  SerializedProfileChangeEventSchema,
} from "../schemas/profile-sync.ts";
import { profileSyncMonitor } from "./profile-sync-monitor.ts";

// Re-export types for external use
export type {
  EventValidationResult,
  ProfileChangeEvent,
  ProfilePopupOptions,
  SerializedProfileChangeEvent,
};

/**
 * Event validation utilities
 */
export class ProfileEventValidator {
  /**
   * Validate a profile change event
   */
  static validateEvent(event: unknown): EventValidationResult {
    try {
      const validatedEvent = ProfileChangeEventSchema.parse(event);
      return {
        isValid: true,
        event: validatedEvent,
        errors: [],
      };
    } catch (error) {
      const errors = error instanceof Error ? [error.message] : ["Unknown validation error"];
      return {
        isValid: false,
        errors,
      };
    }
  }

  /**
   * Validate profile popup options
   */
  static validatePopupOptions(
    options: unknown,
  ): { isValid: boolean; options?: ProfilePopupOptions; errors: string[] } {
    try {
      const validatedOptions = ProfilePopupOptionsSchema.parse(options);
      return {
        isValid: true,
        options: validatedOptions,
        errors: [],
      };
    } catch (error) {
      const errors = error instanceof Error ? [error.message] : ["Unknown validation error"];
      return {
        isValid: false,
        errors,
      };
    }
  }

  /**
   * Sanitize event data to prevent XSS and other security issues
   */
  static sanitizeEventData(data: any): any {
    if (typeof data !== "object" || data === null) {
      return data;
    }

    // Handle arrays separately to preserve array structure
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeEventData(item));
    }

    const sanitized: any = {};

    // Sanitize string values
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        // Basic HTML/script tag removal
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<[^>]*>/g, "")
          .trim();
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeEventData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

/**
 * Event serialization utilities
 */
export class ProfileEventSerializer {
  /**
   * Serialize a profile change event for storage or transmission
   */
  static serialize(event: ProfileChangeEvent): SerializedProfileChangeEvent {
    const validation = ProfileEventValidator.validateEvent(event);
    if (!validation.isValid || !validation.event) {
      throw new Error(`Cannot serialize invalid event: ${validation.errors.join(", ")}`);
    }

    const sanitizedData = ProfileEventValidator.sanitizeEventData(validation.event.data);
    const serializedData = JSON.stringify(sanitizedData);

    return {
      type: validation.event.type,
      data: serializedData,
      timestamp: validation.event.timestamp,
      source: validation.event.source,
      userId: validation.event.userId,
      checksum: this.generateChecksum(serializedData),
    };
  }

  /**
   * Deserialize a profile change event from storage or transmission
   */
  static deserialize(serializedEvent: SerializedProfileChangeEvent): ProfileChangeEvent {
    const validation = SerializedProfileChangeEventSchema.safeParse(serializedEvent);
    if (!validation.success) {
      throw new Error(`Cannot deserialize invalid serialized event: ${validation.error.message}`);
    }

    const { data: serializedData, checksum, ...eventProps } = validation.data;

    // Verify checksum if provided
    if (checksum && this.generateChecksum(serializedData) !== checksum) {
      throw new Error("Event checksum validation failed - data may be corrupted");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(serializedData);
    } catch (error) {
      throw new Error(
        `Failed to parse event data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    const event: ProfileChangeEvent = {
      ...eventProps,
      data: parsedData,
    };

    // Final validation of deserialized event
    const eventValidation = ProfileEventValidator.validateEvent(event);
    if (!eventValidation.isValid || !eventValidation.event) {
      throw new Error(`Deserialized event is invalid: ${eventValidation.errors.join(", ")}`);
    }

    return eventValidation.event;
  }

  /**
   * Generate a simple checksum for data integrity
   */
  private static generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Create a profile change event with current timestamp
   */
  static createEvent(
    type: ProfileChangeEvent["type"],
    data: ProfileChangeEvent["data"],
    source: string,
    userId: string,
  ): ProfileChangeEvent {
    const event: ProfileChangeEvent = {
      type,
      data: ProfileEventValidator.sanitizeEventData(data),
      timestamp: Date.now(),
      source,
      userId,
    };

    const validation = ProfileEventValidator.validateEvent(event);
    if (!validation.isValid || !validation.event) {
      throw new Error(`Cannot create invalid event: ${validation.errors.join(", ")}`);
    }

    return validation.event;
  }
}

export interface ProfilePopupHandle {
  window: Window | null;
  close: () => void;
  postMessage: (message: any) => void;
  onMessage: (callback: (event: MessageEvent) => void) => () => void;
  isBlocked: boolean;
  isClosed: boolean;
  checkStatus: () => { isBlocked: boolean; isClosed: boolean };
}

export type ProfileChangeCallback = (event: ProfileChangeEvent) => void;

/**
 * Core profile synchronization manager
 */
export class ProfileSyncManager {
  private static instance: ProfileSyncManager | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private subscribers: Set<ProfileChangeCallback> = new Set();
  private popupHandles: Map<string, ProfilePopupHandle> = new Map();
  private readonly CHANNEL_NAME = "suppers-profile-sync";
  private storageEventListener: ((event: StorageEvent) => void) | null = null;
  private broadcastChannelListener: ((event: MessageEvent) => void) | null = null;
  private isInitialized = false;

  // Enhanced throttling and queue management
  private eventQueue: ProfileChangeEvent[] = [];
  private throttleTimers: Map<string, number> = new Map();
  private debounceTimers: Map<string, number> = new Map();
  private readonly THROTTLE_DELAY = 300; // ms
  private readonly DEBOUNCE_DELAY = 150; // ms for high-frequency events
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_BASE_DELAY = 1000; // ms
  private isOnline = true;
  private onlineListener: (() => void) | null = null;
  private offlineListener: (() => void) | null = null;

  // Performance optimization properties
  private eventBatch: ProfileChangeEvent[] = [];
  private batchTimer: number | null = null;
  private readonly BATCH_DELAY = 50; // ms
  private readonly MAX_BATCH_SIZE = 10;
  private memoryCleanupInterval: number | null = null;
  private readonly MEMORY_CLEANUP_INTERVAL = 60000; // 1 minute
  private lastCleanupTime = 0;
  
  // Event frequency tracking for adaptive throttling
  private eventFrequency: Map<string, { count: number; lastReset: number }> = new Map();
  private readonly FREQUENCY_WINDOW = 5000; // 5 seconds
  private readonly HIGH_FREQUENCY_THRESHOLD = 10; // events per window

  private constructor() {
    this.initializeBroadcastChannel();
    this.setupStorageEventFallback();
    this.setupOnlineOfflineDetection();
    this.setupMemoryCleanup();
    this.isInitialized = true;
  }

  /**
   * Get singleton instance of ProfileSyncManager
   */
  public static getInstance(): ProfileSyncManager {
    if (!ProfileSyncManager.instance) {
      ProfileSyncManager.instance = new ProfileSyncManager();
    }
    return ProfileSyncManager.instance;
  }

  /**
   * Initialize BroadcastChannel for cross-tab communication
   */
  private initializeBroadcastChannel(): void {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        this.broadcastChannel = new BroadcastChannel(this.CHANNEL_NAME);
        this.broadcastChannelListener = (event) => {
          this.handleBroadcastMessage(event.data);
        };
        this.broadcastChannel.addEventListener("message", this.broadcastChannelListener);
      }
    } catch (error) {
      console.warn("BroadcastChannel not supported, falling back to localStorage events", error);
    }
  }

  /**
   * Setup localStorage event fallback for browsers without BroadcastChannel
   */
  private setupStorageEventFallback(): void {
    if (typeof window !== "undefined") {
      this.storageEventListener = (event: StorageEvent) => {
        if (event.key === this.CHANNEL_NAME && event.newValue) {
          try {
            const serializedEvent = JSON.parse(event.newValue);
            // Try to deserialize if it's a serialized event, otherwise treat as direct event
            let profileEvent: ProfileChangeEvent;

            if (serializedEvent.checksum !== undefined) {
              // This is a serialized event, deserialize it
              profileEvent = ProfileEventSerializer.deserialize(serializedEvent);
            } else {
              // This is a direct event (backward compatibility)
              profileEvent = serializedEvent as ProfileChangeEvent;
            }

            this.handleBroadcastMessage(profileEvent);
          } catch (error) {
            console.error("Failed to parse storage event data:", error);
          }
        }
      };

      window.addEventListener("storage", this.storageEventListener);
    }
  }

  /**
   * Handle incoming broadcast messages
   */
  private handleBroadcastMessage(event: unknown): void {
    const startTime = performance.now();
    const communicationMethod = this.getCommunicationMethod();
    
    // Validate event structure using the new validator
    const validation = ProfileEventValidator.validateEvent(event);
    if (!validation.isValid || !validation.event) {
      console.warn("Invalid profile change event received:", event, "Errors:", validation.errors);
      
      // Record invalid event
      profileSyncMonitor.recordError(
        `Invalid event received: ${validation.errors.join(", ")}`,
        undefined,
        communicationMethod,
        { rawEvent: event }
      );
      return;
    }

    const validatedEvent = validation.event;
    
    try {
      // Notify all subscribers with the validated event
      this.subscribers.forEach((callback) => {
        try {
          callback(validatedEvent);
        } catch (error) {
          console.error("Error in profile change callback:", error);
          profileSyncMonitor.recordError(
            `Callback error: ${error instanceof Error ? error.message : String(error)}`,
            validatedEvent.type,
            communicationMethod
          );
        }
      });
      
      // Record successful receive
      const latency = performance.now() - startTime;
      profileSyncMonitor.recordReceive(validatedEvent.type, true, latency, communicationMethod);
      
    } catch (error) {
      // Record failed receive
      const latency = performance.now() - startTime;
      profileSyncMonitor.recordReceive(
        validatedEvent.type, 
        false, 
        latency, 
        communicationMethod,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Broadcast profile change event to all connected applications
   */
  public broadcastProfileChange(change: ProfileChangeEvent): void {
    try {
      // Validate the event before broadcasting
      const validation = ProfileEventValidator.validateEvent(change);
      if (!validation.isValid || !validation.event) {
        console.error("Cannot broadcast invalid profile change event:", validation.errors);
        return;
      }

      const validatedEvent = validation.event;

      // Broadcast via BroadcastChannel if available
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(validatedEvent);
      } else {
        // Fallback to localStorage with serialization
        if (typeof localStorage !== "undefined") {
          const serialized = ProfileEventSerializer.serialize(validatedEvent);
          localStorage.setItem(this.CHANNEL_NAME, JSON.stringify(serialized));
          // Clear immediately to allow repeated events
          setTimeout(() => {
            localStorage.removeItem(this.CHANNEL_NAME);
          }, 100);
        }
      }
    } catch (error) {
      console.error("Failed to broadcast profile change:", error);
    }
  }

  /**
   * Subscribe to profile change events
   */
  public subscribeToProfileChanges(callback: ProfileChangeCallback): () => void {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Check if a callback is currently subscribed
   */
  public isSubscribed(callback: ProfileChangeCallback): boolean {
    return this.subscribers.has(callback);
  }

  /**
   * Get the number of active subscribers
   */
  public getSubscriberCount(): number {
    return this.subscribers.size;
  }

  /**
   * Unsubscribe all callbacks
   */
  public unsubscribeAll(): void {
    this.subscribers.clear();
  }

  /**
   * Check if the manager is properly initialized
   */
  public isReady(): boolean {
    return this.isInitialized &&
      (this.broadcastChannel !== null || this.storageEventListener !== null);
  }

  /**
   * Get current communication method being used
   */
  public getCommunicationMethod(): "BroadcastChannel" | "localStorage" | "none" {
    if (this.broadcastChannel) {
      return "BroadcastChannel";
    } else if (this.storageEventListener) {
      return "localStorage";
    } else {
      return "none";
    }
  }

  /**
   * Detect if device is mobile
   */
  public isMobileDevice(): boolean {
    if (typeof navigator === "undefined") return false;

    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      "android",
      "webos",
      "iphone",
      "ipad",
      "ipod",
      "blackberry",
      "windows phone",
      "mobile",
    ];

    return mobileKeywords.some((keyword) => userAgent.includes(keyword)) ||
      (typeof window !== "undefined" && window.innerWidth <= 768);
  }

  /**
   * Determine if modal should be used instead of popup
   */
  public shouldUseModal(): boolean {
    return this.isMobileDevice() || this.isPopupBlocked();
  }

  /**
   * Check if popups are likely to be blocked
   */
  private isPopupBlocked(): boolean {
    // This is a heuristic check - actual popup blocking can only be detected after attempting to open
    if (typeof window === "undefined") return true;

    // Check for common popup blocker indicators
    return false; // Will be determined during actual popup attempt
  }

  /**
   * Open profile popup window with enhanced blocking detection and fallback strategies
   */
  public openProfilePopup(
    options: ProfilePopupOptions,
    fallbackOptions?: PopupFallbackOptions,
  ): ProfilePopupHandle {
    // Validate popup options
    const validation = ProfileEventValidator.validatePopupOptions(options);
    if (!validation.isValid || !validation.options) {
      throw new Error(`Invalid popup options: ${validation.errors.join(", ")}`);
    }

    const validatedOptions = validation.options;
    const defaultDimensions = { width: 600, height: 700 };
    const dimensions = validatedOptions.dimensions || defaultDimensions;
    const position = validatedOptions.position || "center";

    // Check if we should use modal instead of popup
    if (this.shouldUseModal()) {
      const reason = this.isMobileDevice() ? "mobile" : "blocked";
      if (fallbackOptions?.onFallback) {
        fallbackOptions.onFallback(reason);
      }

      // Return a mock handle for modal scenarios
      return this.createModalHandle(validatedOptions, fallbackOptions);
    }

    // Calculate popup position with screen bounds checking
    const screenWidth = window.screen.availWidth || window.screen.width;
    const screenHeight = window.screen.availHeight || window.screen.height;

    let left: number;
    switch (position) {
      case "center":
        left = Math.max(0, (screenWidth - dimensions.width) / 2);
        break;
      case "right":
        left = Math.max(0, screenWidth - dimensions.width - 50);
        break;
      case "left":
      default:
        left = 50;
        break;
    }

    const top = Math.max(0, (screenHeight - dimensions.height) / 2);

    // Popup features with enhanced configuration
    const features = [
      `width=${Math.min(dimensions.width, screenWidth)}`,
      `height=${Math.min(dimensions.height, screenHeight)}`,
      `left=${left}`,
      `top=${top}`,
      "scrollbars=yes",
      "resizable=yes",
      "menubar=no",
      "toolbar=no",
      "location=no",
      "status=no",
      "directories=no",
      "copyhistory=no",
    ].join(",");

    // Construct profile URL
    const profileUrl = new URL("/profile", validatedOptions.origin);
    profileUrl.searchParams.set("popup", "true");
    profileUrl.searchParams.set("source", validatedOptions.appName);

    // Attempt to open popup
    let popupWindow: Window | null = null;
    try {
      popupWindow = window.open(profileUrl.toString(), "profile-popup", features);
    } catch (error) {
      console.error("Failed to open popup window:", error);
      if (fallbackOptions?.onFallback) {
        fallbackOptions.onFallback("failed");
      }
      return this.createFailedHandle(validatedOptions, fallbackOptions);
    }

    // Enhanced popup blocking detection
    const isBlocked = this.detectPopupBlocked(popupWindow);
    let isClosed = false;

    // Create message event listeners
    const messageListeners: ((event: MessageEvent) => void)[] = [];

    const handle: ProfilePopupHandle = {
      window: popupWindow,
      isBlocked,
      isClosed,
      checkStatus: () => {
        const currentClosed = !popupWindow || popupWindow.closed;
        if (currentClosed !== isClosed) {
          isClosed = currentClosed;
        }
        return { isBlocked, isClosed };
      },
      close: () => {
        if (popupWindow && !popupWindow.closed) {
          try {
            popupWindow.close();
          } catch (error) {
            console.warn("Failed to close popup:", error);
          }
        }
        isClosed = true;

        // Clean up message listeners
        messageListeners.forEach((listener) => {
          window.removeEventListener("message", listener);
        });
        this.popupHandles.delete(validatedOptions.appName);
      },
      postMessage: (message: any) => {
        if (popupWindow && !popupWindow.closed && !isBlocked) {
          try {
            popupWindow.postMessage(message, validatedOptions.origin);
          } catch (error) {
            console.error("Failed to send message to popup:", error);
          }
        }
      },
      onMessage: (callback: (event: MessageEvent) => void) => {
        const listener = (event: MessageEvent) => {
          // Enhanced origin validation for security
          if (this.validateMessageOrigin(event, validatedOptions.origin, popupWindow)) {
            callback(event);
          }
        };
        messageListeners.push(listener);
        window.addEventListener("message", listener);

        // Return cleanup function
        return () => {
          const index = messageListeners.indexOf(listener);
          if (index > -1) {
            messageListeners.splice(index, 1);
            window.removeEventListener("message", listener);
          }
        };
      },
    };

    // Store handle for cleanup
    this.popupHandles.set(validatedOptions.appName, handle);

    // Handle popup blocking with enhanced detection
    if (isBlocked) {
      console.warn("Popup was blocked by browser");
      if (fallbackOptions?.onFallback) {
        fallbackOptions.onFallback("blocked");
      }

      // Execute fallback strategies
      this.executeFallbackStrategies(validatedOptions, fallbackOptions);
    } else {
      // Monitor popup status
      this.monitorPopupStatus(handle, validatedOptions, fallbackOptions);
    }

    return handle;
  }

  /**
   * Enhanced popup blocking detection with multiple detection methods
   */
  private detectPopupBlocked(popupWindow: Window | null): boolean {
    if (!popupWindow) {
      return true;
    }

    try {
      // Method 1: Check if popup window is immediately closed
      if (popupWindow.closed) {
        return true;
      }

      // Method 2: Check if popup window has no location (common with blockers)
      if (!popupWindow.location) {
        return true;
      }

      // Method 3: Try to access popup properties (will throw if blocked)
      try {
        const _ = popupWindow.location.href;
      } catch (locationError) {
        // Cross-origin access might be restricted, but popup could still be valid
        // Only consider blocked if we can't access basic properties
        if (!popupWindow.document) {
          return true;
        }
      }

      // Method 4: Check window dimensions (blocked popups often have 0 dimensions)
      if (popupWindow.outerWidth === 0 || popupWindow.outerHeight === 0) {
        return true;
      }

      // Method 5: Check if popup has focus capability (blocked popups often don't)
      if (typeof popupWindow.focus === "function") {
        try {
          popupWindow.focus();
          // If focus succeeds and window is still accessible, likely not blocked
          return popupWindow.closed;
        } catch (focusError) {
          return true;
        }
      }

      return false;
    } catch (error) {
      // If we can't access popup properties at all, it's likely blocked
      return true;
    }
  }

  /**
   * Advanced popup blocking detection with delayed verification
   */
  private async detectPopupBlockedAdvanced(popupWindow: Window | null): Promise<boolean> {
    if (!popupWindow) {
      return true;
    }

    // Initial quick check
    const initialCheck = this.detectPopupBlocked(popupWindow);
    if (initialCheck) {
      return true;
    }

    // Delayed verification - some popup blockers take time to activate
    return new Promise((resolve) => {
      const checkDelay = 100; // ms
      const maxChecks = 5;
      let checkCount = 0;

      const delayedCheck = () => {
        checkCount++;
        
        if (this.detectPopupBlocked(popupWindow)) {
          resolve(true);
          return;
        }

        if (checkCount < maxChecks) {
          setTimeout(delayedCheck, checkDelay);
        } else {
          resolve(false);
        }
      };

      setTimeout(delayedCheck, checkDelay);
    });
  }

  /**
   * Validate message origin for enhanced security
   */
  private validateMessageOrigin(
    event: MessageEvent,
    expectedOrigin: string,
    expectedSource: Window | null,
  ): boolean {
    // Check origin matches
    if (event.origin !== expectedOrigin) {
      console.warn("Message from unexpected origin:", event.origin, "expected:", expectedOrigin);
      return false;
    }

    // Check source window matches (if available)
    if (expectedSource && event.source !== expectedSource) {
      console.warn("Message from unexpected source window");
      return false;
    }

    return true;
  }

  /**
   * Monitor popup status for changes
   */
  private monitorPopupStatus(
    handle: ProfilePopupHandle,
    options: ProfilePopupOptions,
    fallbackOptions?: PopupFallbackOptions,
  ): void {
    const checkInterval = setInterval(() => {
      const status = handle.checkStatus();

      if (status.isClosed) {
        clearInterval(checkInterval);
        return;
      }

      // Check if popup became blocked after opening
      if (!status.isBlocked && handle.window && this.detectPopupBlocked(handle.window)) {
        handle.isBlocked = true;
        if (fallbackOptions?.onFallback) {
          fallbackOptions.onFallback("blocked");
        }
        this.executeFallbackStrategies(options, fallbackOptions);
        clearInterval(checkInterval);
      }
    }, 1000);

    // Clean up interval after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 30000);
  }

  /**
   * Execute fallback strategies when popup fails
   */
  private executeFallbackStrategies(
    options: ProfilePopupOptions,
    fallbackOptions?: PopupFallbackOptions,
  ): void {
    if (fallbackOptions?.showNotification !== false) {
      this.showPopupBlockedNotification();
    }

    if (fallbackOptions?.openInNewTab) {
      this.openProfileInNewTab(options);
    }

    if (fallbackOptions?.useModal) {
      // This would trigger modal display in the UI layer
      console.log("Modal fallback requested");
    }
  }

  /**
   * Show popup blocked notification with enhanced user guidance
   */
  private showPopupBlockedNotification(): void {
    const message = "Popup blocked. Please allow popups for this site to view your profile.";
    console.warn(message);

    // Dispatch detailed custom event for the UI to handle
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("popup-blocked", {
          detail: {
            message,
            title: "Popup Blocked",
            type: "warning",
            actions: [
              {
                label: "Allow Popups",
                action: "allow-popups",
                description: "Enable popups in your browser settings for this site",
              },
              {
                label: "Open in New Tab",
                action: "open-new-tab",
                description: "Open profile in a new browser tab instead",
              },
              {
                label: "Use Modal",
                action: "use-modal",
                description: "View profile in an overlay modal",
              },
            ],
            timestamp: Date.now(),
          },
        }),
      );
    }

    // Also try to show a basic browser notification if available
    this.showBrowserNotification(message);
  }

  /**
   * Show browser notification if permission is granted
   */
  private showBrowserNotification(message: string): void {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification("Profile Access", {
          body: message,
          icon: "/favicon.ico",
          tag: "popup-blocked",
          requireInteraction: false,
        });
      } catch (error) {
        console.warn("Failed to show browser notification:", error);
      }
    }
  }

  /**
   * Request notification permission for better user experience
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof Notification === "undefined") {
      return "denied";
    }

    if (Notification.permission === "default") {
      try {
        return await Notification.requestPermission();
      } catch (error) {
        console.warn("Failed to request notification permission:", error);
        return "denied";
      }
    }

    return Notification.permission;
  }

  /**
   * Open profile in new tab as fallback
   */
  private openProfileInNewTab(options: ProfilePopupOptions): void {
    const profileUrl = new URL("/profile", options.origin);
    profileUrl.searchParams.set("tab", "true");
    profileUrl.searchParams.set("source", options.appName);

    try {
      window.open(profileUrl.toString(), "_blank");
    } catch (error) {
      console.error("Failed to open profile in new tab:", error);
    }
  }

  /**
   * Create modal handle for mobile/blocked scenarios
   */
  private createModalHandle(
    options: ProfilePopupOptions,
    fallbackOptions?: PopupFallbackOptions,
  ): ProfilePopupHandle {
    return {
      window: null,
      isBlocked: false,
      isClosed: false,
      checkStatus: () => ({ isBlocked: false, isClosed: false }),
      close: () => {
        // Modal close would be handled by the UI layer
        this.popupHandles.delete(options.appName);
      },
      postMessage: (message: any) => {
        // Modal communication would be handled differently
        console.log("Modal message:", message);
      },
      onMessage: (callback: (event: MessageEvent) => void) => {
        // Modal message handling would be different
        return () => {}; // No-op cleanup
      },
    };
  }

  /**
   * Create failed handle for error scenarios
   */
  private createFailedHandle(
    options: ProfilePopupOptions,
    fallbackOptions?: PopupFallbackOptions,
  ): ProfilePopupHandle {
    // Execute fallback strategies immediately
    this.executeFallbackStrategies(options, fallbackOptions);

    return {
      window: null,
      isBlocked: true,
      isClosed: true,
      checkStatus: () => ({ isBlocked: true, isClosed: true }),
      close: () => {
        this.popupHandles.delete(options.appName);
      },
      postMessage: () => {
        console.warn("Cannot send message to failed popup");
      },
      onMessage: () => {
        return () => {}; // No-op cleanup
      },
    };
  }

  /**
   * Close profile popup
   */
  public closeProfilePopup(handle: ProfilePopupHandle): void {
    handle.close();
  }

  /**
   * Get popup handle by app name
   */
  public getPopupHandle(appName: string): ProfilePopupHandle | undefined {
    return this.popupHandles.get(appName);
  }

  /**
   * Enhanced online/offline detection with connection quality monitoring
   */
  private setupOnlineOfflineDetection(): void {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      // Initialize online status with enhanced detection
      this.isOnline = this.detectOnlineStatus();

      // Setup event listeners with enhanced handling
      this.onlineListener = () => {
        console.log("Network connection restored");
        this.handleOnlineStatusChange(true);
      };

      this.offlineListener = () => {
        console.log("Network connection lost");
        this.handleOnlineStatusChange(false);
      };

      window.addEventListener("online", this.onlineListener);
      window.addEventListener("offline", this.offlineListener);

      // Additional connection monitoring for more accurate detection
      this.setupConnectionQualityMonitoring();
    }
  }

  /**
   * Setup memory cleanup to prevent memory leaks
   */
  private setupMemoryCleanup(): void {
    this.memoryCleanupInterval = setInterval(() => {
      this.performMemoryCleanup();
    }, this.MEMORY_CLEANUP_INTERVAL);

    // Initial cleanup
    this.performMemoryCleanup();
  }

  /**
   * Perform memory cleanup operations
   */
  private performMemoryCleanup(): void {
    const now = Date.now();
    this.lastCleanupTime = now;

    // Clean up expired throttle timers
    this.cleanupExpiredTimers();

    // Clean up old event frequency data
    this.cleanupEventFrequencyData(now);

    // Clean up old error logs (keep only recent ones)
    this.cleanupErrorLog();

    // Clean up old failed events (keep only recent ones)
    this.cleanupFailedEvents(now);

    // Force garbage collection if available (development only)
    if (typeof window !== "undefined" && (window as any).gc && typeof (window as any).gc === "function") {
      try {
        (window as any).gc();
      } catch (error) {
        // Ignore errors - gc() is not always available
      }
    }
  }

  /**
   * Clean up expired throttle and debounce timers
   */
  private cleanupExpiredTimers(): void {
    // Clear completed throttle timers
    for (const [key, timerId] of this.throttleTimers.entries()) {
      // Check if timer is still active by trying to clear it
      try {
        clearTimeout(timerId);
        this.throttleTimers.delete(key);
      } catch (error) {
        // Timer was already cleared
        this.throttleTimers.delete(key);
      }
    }

    // Clear completed debounce timers
    for (const [key, timerId] of this.debounceTimers.entries()) {
      try {
        clearTimeout(timerId);
        this.debounceTimers.delete(key);
      } catch (error) {
        this.debounceTimers.delete(key);
      }
    }
  }

  /**
   * Clean up old event frequency tracking data
   */
  private cleanupEventFrequencyData(now: number): void {
    for (const [key, data] of this.eventFrequency.entries()) {
      if (now - data.lastReset > this.FREQUENCY_WINDOW * 2) {
        this.eventFrequency.delete(key);
      }
    }
  }

  /**
   * Clean up old error log entries
   */
  private cleanupErrorLog(): void {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    this.errorLog = this.errorLog.filter(error => 
      now - error.timestamp < maxAge
    );
  }

  /**
   * Clean up old failed events
   */
  private cleanupFailedEvents(now: number): void {
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    this.failedEvents = this.failedEvents.filter(failed => 
      now - failed.timestamp < maxAge
    );
  }

  /**
   * Enhanced broadcast with adaptive throttling and batching
   */
  public broadcastProfileChangeOptimized(change: ProfileChangeEvent): void {
    // Validate the event before processing
    const validation = ProfileEventValidator.validateEvent(change);
    if (!validation.isValid || !validation.event) {
      console.error("Cannot broadcast invalid profile change event:", validation.errors);
      return;
    }

    const validatedEvent = validation.event;
    
    // Track event frequency for adaptive throttling
    this.trackEventFrequency(validatedEvent);
    
    // Determine if we should use batching or immediate broadcast
    if (this.shouldBatchEvent(validatedEvent)) {
      this.addToBatch(validatedEvent);
    } else {
      this.broadcastWithAdaptiveThrottling(validatedEvent);
    }
  }

  /**
   * Track event frequency for adaptive throttling
   */
  private trackEventFrequency(event: ProfileChangeEvent): void {
    const key = `${event.type}-${event.userId}`;
    const now = Date.now();
    
    const existing = this.eventFrequency.get(key);
    if (!existing || now - existing.lastReset > this.FREQUENCY_WINDOW) {
      this.eventFrequency.set(key, { count: 1, lastReset: now });
    } else {
      existing.count++;
    }
  }

  /**
   * Determine if event should be batched
   */
  private shouldBatchEvent(event: ProfileChangeEvent): boolean {
    // Batch high-frequency events like theme changes during rapid switching
    const key = `${event.type}-${event.userId}`;
    const frequency = this.eventFrequency.get(key);
    
    return frequency !== undefined && frequency.count > this.HIGH_FREQUENCY_THRESHOLD / 2;
  }

  /**
   * Add event to batch for processing
   */
  private addToBatch(event: ProfileChangeEvent): void {
    // Remove any existing event of the same type and user to avoid duplicates
    this.eventBatch = this.eventBatch.filter(
      batchedEvent => !(batchedEvent.type === event.type && batchedEvent.userId === event.userId)
    );
    
    // Add new event
    this.eventBatch.push(event);
    
    // Enforce batch size limit
    if (this.eventBatch.length > this.MAX_BATCH_SIZE) {
      this.processBatch();
      return;
    }
    
    // Set or reset batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  /**
   * Process batched events
   */
  private processBatch(): void {
    if (this.eventBatch.length === 0) return;
    
    const eventsToProcess = [...this.eventBatch];
    this.eventBatch = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Process events with optimized broadcasting
    for (const event of eventsToProcess) {
      this.broadcastEventImmediately(event);
    }
  }

  /**
   * Broadcast with adaptive throttling based on event frequency
   */
  private broadcastWithAdaptiveThrottling(event: ProfileChangeEvent): void {
    const key = `${event.type}-${event.userId}`;
    const frequency = this.eventFrequency.get(key);
    
    // Use debouncing for high-frequency events
    if (frequency && frequency.count > this.HIGH_FREQUENCY_THRESHOLD) {
      this.broadcastWithDebounce(event);
    } else {
      // Use regular throttling for normal frequency events
      this.broadcastProfileChangeThrottled(event);
    }
  }

  /**
   * Broadcast with debouncing for high-frequency events
   */
  private broadcastWithDebounce(event: ProfileChangeEvent): void {
    const key = `${event.type}-${event.userId}`;
    
    // Clear existing debounce timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }
    
    // Set new debounce timer
    const timerId = setTimeout(() => {
      this.debounceTimers.delete(key);
      
      if (!this.isOnline) {
        this.queueEvent(event);
        return;
      }
      
      this.broadcastEventImmediately(event);
    }, this.DEBOUNCE_DELAY);
    
    this.debounceTimers.set(key, timerId);
  }

  /**
   * Get performance metrics for monitoring
   */
  public getPerformanceMetrics(): {
    eventQueueSize: number;
    batchSize: number;
    activeThrottleTimers: number;
    activeDebounceTimers: number;
    eventFrequencyEntries: number;
    failedEventsCount: number;
    errorLogSize: number;
    memoryCleanupLastRun: number;
    communicationMethod: string;
    isOnline: boolean;
  } {
    const metrics = {
      eventQueueSize: this.eventQueue.length,
      batchSize: this.eventBatch.length,
      activeThrottleTimers: this.throttleTimers.size,
      activeDebounceTimers: this.debounceTimers.size,
      eventFrequencyEntries: this.eventFrequency.size,
      failedEventsCount: this.failedEvents.length,
      errorLogSize: this.errorLog.length,
      memoryCleanupLastRun: this.lastCleanupTime,
      communicationMethod: this.getCommunicationMethod(),
      isOnline: this.isOnline,
    };

    // Update monitoring system with current performance metrics
    profileSyncMonitor.updatePerformanceMetrics({
      eventQueueSize: metrics.eventQueueSize,
      activeConnections: this.subscribers.size,
      throttledEvents: metrics.activeThrottleTimers,
      batchedEvents: metrics.batchSize,
      cacheHitRate: this.calculateCacheHitRate(),
      averageProcessingTime: this.calculateAverageProcessingTime(),
    });

    return metrics;
  }

  /**
   * Calculate cache hit rate for performance monitoring
   */
  private calculateCacheHitRate(): number {
    // This is a simplified calculation - in a real implementation,
    // you would track actual cache hits vs misses
    const totalEvents = this.eventFrequency.size;
    const throttledEvents = this.throttleTimers.size;
    
    if (totalEvents === 0) return 1;
    return Math.max(0, 1 - (throttledEvents / totalEvents));
  }

  /**
   * Calculate average processing time for performance monitoring
   */
  private calculateAverageProcessingTime(): number {
    // This would typically be calculated from actual timing data
    // For now, we'll estimate based on queue size and throttling
    const baseTime = 10; // Base processing time in ms
    const queuePenalty = this.eventQueue.length * 2; // Additional time per queued event
    const throttlePenalty = this.throttleTimers.size * 5; // Additional time per throttled event
    
    return baseTime + queuePenalty + throttlePenalty;
  }

  /**
   * Force cleanup for testing or manual intervention
   */
  public forceMemoryCleanup(): void {
    this.performMemoryCleanup();
  }

  /**
   * Clear all batched events
   */
  public clearBatch(): void {
    this.eventBatch = [];
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Get current batch contents for debugging
   */
  public getCurrentBatch(): ProfileChangeEvent[] {
    return [...this.eventBatch];
  }

  /**
   * Enhanced online status detection
   */
  private detectOnlineStatus(): boolean {
    if (typeof navigator === "undefined") {
      return true; // Assume online in non-browser environments
    }

    // Basic navigator.onLine check
    if (!navigator.onLine) {
      return false;
    }

    // Enhanced detection using connection API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType === 'slow-2g') {
        // Consider very slow connections as effectively offline for sync purposes
        return false;
      }
    }

    return true;
  }

  /**
   * Setup connection quality monitoring for better offline detection
   */
  private connectionMonitorInterval: number | null = null;
  private lastConnectionCheck = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly CONNECTION_TIMEOUT = 5000; // 5 seconds

  private setupConnectionQualityMonitoring(): void {
    // Periodic connection quality check
    this.connectionMonitorInterval = setInterval(() => {
      this.checkConnectionQuality();
    }, this.CONNECTION_CHECK_INTERVAL);

    // Initial check
    this.checkConnectionQuality();
  }

  /**
   * Check actual connection quality by attempting a lightweight request
   */
  private async checkConnectionQuality(): Promise<void> {
    if (!this.isOnline) {
      return; // Skip if already detected as offline
    }

    const now = Date.now();
    if (now - this.lastConnectionCheck < this.CONNECTION_CHECK_INTERVAL / 2) {
      return; // Avoid too frequent checks
    }

    this.lastConnectionCheck = now;

    try {
      // Use a lightweight request to check connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.CONNECTION_TIMEOUT);

      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok && this.isOnline) {
        console.warn("Connection quality check failed, but navigator.onLine is true");
        // Don't immediately mark as offline, but log for monitoring
        this.reportCommunicationError(
          new Error(`Connection check failed: ${response.status}`),
          'connection-quality-check'
        );
      }
    } catch (error) {
      if (this.isOnline) {
        console.warn("Connection quality check failed:", error);
        // Consider marking as offline if multiple checks fail
        this.handlePotentialConnectionLoss();
      }
    }
  }

  /**
   * Handle potential connection loss detected by quality monitoring
   */
  private connectionFailureCount = 0;
  private readonly MAX_CONNECTION_FAILURES = 3;

  private handlePotentialConnectionLoss(): void {
    this.connectionFailureCount++;

    if (this.connectionFailureCount >= this.MAX_CONNECTION_FAILURES) {
      console.warn("Multiple connection failures detected, treating as offline");
      this.handleOnlineStatusChange(false);
      this.connectionFailureCount = 0;
    }
  }

  /**
   * Handle online/offline status changes with enhanced recovery
   */
  private handleOnlineStatusChange(isOnline: boolean): void {
    const wasOnline = this.isOnline;
    this.isOnline = isOnline;

    if (isOnline && !wasOnline) {
      // Coming back online
      this.connectionFailureCount = 0;
      this.notifyConnectionRestored();
      this.performSyncRecovery();
    } else if (!isOnline && wasOnline) {
      // Going offline
      this.notifyConnectionLost();
    }

    // Dispatch status change event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("profile-sync-connectivity", {
          detail: {
            isOnline,
            wasOnline,
            timestamp: Date.now(),
            queueSize: this.eventQueue.length,
          },
        }),
      );
    }
  }

  /**
   * Notify about connection restoration
   */
  private notifyConnectionRestored(): void {
    console.log("Connection restored, processing queued events");
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("profile-sync-online", {
          detail: {
            message: "Connection restored",
            queuedEvents: this.eventQueue.length,
            timestamp: Date.now(),
          },
        }),
      );
    }
  }

  /**
   * Notify about connection loss
   */
  private notifyConnectionLost(): void {
    console.log("Connection lost, events will be queued");
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("profile-sync-offline", {
          detail: {
            message: "Connection lost - changes will be synchronized when connection is restored",
            timestamp: Date.now(),
          },
        }),
      );
    }
  }

  /**
   * Perform comprehensive sync recovery when connection is restored
   */
  private async performSyncRecovery(): Promise<void> {
    try {
      // Process queued events
      await this.processEventQueue();

      // Retry any failed events
      await this.retryFailedEvents();

      // Verify sync state by requesting a sync check from the server
      await this.requestSyncVerification();

      console.log("Sync recovery completed successfully");
    } catch (error) {
      console.error("Sync recovery failed:", error);
      this.reportCommunicationError(error, "sync-recovery");
    }
  }

  /**
   * Request sync verification from the server (placeholder for future implementation)
   */
  private async requestSyncVerification(): Promise<void> {
    // This would typically make a request to verify the current sync state
    // For now, we'll just log that verification was requested
    console.log("Sync verification requested (placeholder)");
    
    // In a full implementation, this might:
    // 1. Request current user profile state from server
    // 2. Compare with local state
    // 3. Broadcast any differences to ensure all tabs are in sync
  }

  /**
   * Broadcast profile change event with throttling and queue management
   */
  public broadcastProfileChangeThrottled(change: ProfileChangeEvent): void {
    // Validate the event before processing
    const validation = ProfileEventValidator.validateEvent(change);
    if (!validation.isValid || !validation.event) {
      console.error("Cannot broadcast invalid profile change event:", validation.errors);
      return;
    }

    const validatedEvent = validation.event;
    const throttleKey = `${validatedEvent.type}-${validatedEvent.userId}`;

    // If offline, queue the event
    if (!this.isOnline) {
      this.queueEvent(validatedEvent);
      return;
    }

    // Check if this event type is currently throttled
    if (this.throttleTimers.has(throttleKey)) {
      // Update the queued event with the latest data
      this.updateQueuedEvent(validatedEvent);
      return;
    }

    // Broadcast immediately and set throttle timer
    this.broadcastEventImmediately(validatedEvent);
    this.setThrottleTimer(throttleKey, validatedEvent);
  }

  /**
   * Broadcast event immediately without throttling
   */
  private broadcastEventImmediately(event: ProfileChangeEvent): void {
    const startTime = performance.now();
    const communicationMethod = this.getCommunicationMethod();
    
    try {
      // Broadcast via BroadcastChannel if available
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(event);
      } else {
        // Fallback to localStorage with serialization
        if (typeof localStorage !== "undefined") {
          const serialized = ProfileEventSerializer.serialize(event);
          localStorage.setItem(this.CHANNEL_NAME, JSON.stringify(serialized));
          // Clear immediately to allow repeated events
          setTimeout(() => {
            localStorage.removeItem(this.CHANNEL_NAME);
          }, 100);
        }
      }
      
      // Record successful broadcast
      const latency = performance.now() - startTime;
      profileSyncMonitor.recordBroadcast(event.type, true, latency, communicationMethod);
      
    } catch (error) {
      console.error("Failed to broadcast profile change:", error);
      
      // Record failed broadcast
      const latency = performance.now() - startTime;
      profileSyncMonitor.recordBroadcast(
        event.type, 
        false, 
        latency, 
        communicationMethod, 
        error instanceof Error ? error.message : String(error)
      );
      
      // If broadcast fails, queue the event for retry
      this.queueEvent(event);
    }
  }

  /**
   * Set throttle timer for event type
   */
  private setThrottleTimer(throttleKey: string, event: ProfileChangeEvent): void {
    const timerId = setTimeout(() => {
      this.throttleTimers.delete(throttleKey);
      // Check if there's a queued event of this type to broadcast
      const queuedEvent = this.findQueuedEvent(event.type, event.userId);
      if (queuedEvent) {
        this.removeFromQueue(queuedEvent);
        this.broadcastEventImmediately(queuedEvent);
        this.setThrottleTimer(throttleKey, queuedEvent);
      }
    }, this.THROTTLE_DELAY);

    this.throttleTimers.set(throttleKey, timerId);
  }

  /**
   * Queue event for later processing
   */
  private queueEvent(event: ProfileChangeEvent): void {
    // Remove any existing event of the same type and user to avoid duplicates
    this.eventQueue = this.eventQueue.filter(
      (queuedEvent) => !(queuedEvent.type === event.type && queuedEvent.userId === event.userId),
    );

    // Add new event to queue
    this.eventQueue.push(event);

    // Enforce queue size limit
    if (this.eventQueue.length > this.MAX_QUEUE_SIZE) {
      this.eventQueue.shift(); // Remove oldest event
    }
  }

  /**
   * Update queued event with latest data
   */
  private updateQueuedEvent(event: ProfileChangeEvent): void {
    const existingIndex = this.eventQueue.findIndex(
      (queuedEvent) => queuedEvent.type === event.type && queuedEvent.userId === event.userId,
    );

    if (existingIndex !== -1) {
      // Update existing queued event
      this.eventQueue[existingIndex] = event;
    } else {
      // Add to queue if not found
      this.queueEvent(event);
    }
  }

  /**
   * Find queued event by type and user ID
   */
  private findQueuedEvent(
    type: ProfileChangeEvent["type"],
    userId: string,
  ): ProfileChangeEvent | null {
    return this.eventQueue.find((event) => event.type === type && event.userId === userId) || null;
  }

  /**
   * Remove event from queue
   */
  private removeFromQueue(eventToRemove: ProfileChangeEvent): void {
    this.eventQueue = this.eventQueue.filter((event) => event !== eventToRemove);
  }

  /**
   * Process queued events when coming back online
   */
  private async processEventQueue(): Promise<void> {
    if (!this.isOnline || this.eventQueue.length === 0) {
      return;
    }

    // Process events with retry logic
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of eventsToProcess) {
      await this.broadcastWithRetry(event);
    }
  }

  /**
   * Broadcast event with exponential backoff retry logic and enhanced error handling
   */
  private async broadcastWithRetry(event: ProfileChangeEvent, attempt = 1): Promise<void> {
    try {
      await this.broadcastEventWithFallback(event);
    } catch (error) {
      this.reportCommunicationError(error, `broadcast-attempt-${attempt}`);
      
      if (attempt < this.MAX_RETRY_ATTEMPTS) {
        const delay = this.RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
        console.warn(
          `Broadcast failed, retrying in ${delay}ms (attempt ${attempt}/${this.MAX_RETRY_ATTEMPTS})`,
          error,
        );

        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              await this.broadcastWithRetry(event, attempt + 1);
              resolve();
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      } else {
        console.error("Failed to broadcast event after maximum retry attempts:", error);
        this.handleBroadcastFailure(event, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    }
  }

  /**
   * Broadcast event with automatic fallback to alternative communication methods
   */
  private async broadcastEventWithFallback(event: ProfileChangeEvent): Promise<void> {
    let lastError: Error | null = null;

    // Try BroadcastChannel first
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
        return; // Success
      } catch (error) {
        lastError = error as Error;
        console.warn("BroadcastChannel failed, trying localStorage fallback:", error);
      }
    }

    // Fallback to localStorage events
    if (typeof localStorage !== "undefined") {
      try {
        const serialized = ProfileEventSerializer.serialize(event);
        localStorage.setItem(this.CHANNEL_NAME, JSON.stringify(serialized));
        
        // Clear after a short delay to allow other tabs to receive the event
        setTimeout(() => {
          try {
            localStorage.removeItem(this.CHANNEL_NAME);
          } catch (clearError) {
            console.warn("Failed to clear localStorage after broadcast:", clearError);
          }
        }, 100);
        
        return; // Success
      } catch (error) {
        lastError = error as Error;
        console.warn("localStorage fallback failed:", error);
      }
    }

    // If all methods failed, throw the last error
    throw lastError || new Error("All communication methods failed");
  }

  /**
   * Handle broadcast failure with user notification and recovery options
   */
  private handleBroadcastFailure(event: ProfileChangeEvent, error: Error): void {
    // Dispatch failure event for UI to handle
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("profile-sync-failure", {
          detail: {
            event,
            error: error.message,
            timestamp: Date.now(),
            recoveryOptions: [
              {
                label: "Retry Now",
                action: "retry-broadcast",
                data: event,
              },
              {
                label: "Refresh Page",
                action: "refresh-page",
                description: "Refresh to restore synchronization",
              },
            ],
          },
        }),
      );
    }

    // Store failed event for potential manual retry
    this.storeFailedEvent(event, error);
  }

  /**
   * Store failed events for potential recovery
   */
  private failedEvents: Array<{ event: ProfileChangeEvent; error: Error; timestamp: number }> = [];
  private readonly MAX_FAILED_EVENTS = 50;

  private storeFailedEvent(event: ProfileChangeEvent, error: Error): void {
    this.failedEvents.push({
      event,
      error,
      timestamp: Date.now(),
    });

    // Limit the number of stored failed events
    if (this.failedEvents.length > this.MAX_FAILED_EVENTS) {
      this.failedEvents.shift();
    }
  }

  /**
   * Get failed events for debugging or recovery
   */
  public getFailedEvents(): Array<{ event: ProfileChangeEvent; error: Error; timestamp: number }> {
    return [...this.failedEvents];
  }

  /**
   * Retry all failed events
   */
  public async retryFailedEvents(): Promise<void> {
    const eventsToRetry = [...this.failedEvents];
    this.failedEvents = [];

    for (const { event } of eventsToRetry) {
      try {
        await this.broadcastWithRetry(event);
      } catch (error) {
        console.warn("Failed to retry event:", event, error);
      }
    }
  }

  /**
   * Clear failed events
   */
  public clearFailedEvents(): void {
    this.failedEvents = [];
  }

  /**
   * Report communication errors for monitoring and debugging
   */
  private reportCommunicationError(error: Error | unknown, context: string): void {
    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      context,
      timestamp: Date.now(),
      communicationMethod: this.getCommunicationMethod(),
      isOnline: this.isOnline,
      queueSize: this.eventQueue.length,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    };

    console.error("Communication error:", errorInfo);

    // Record error in monitoring system
    profileSyncMonitor.recordError(
      errorInfo.message,
      undefined,
      errorInfo.communicationMethod,
      {
        context: errorInfo.context,
        isOnline: errorInfo.isOnline,
        queueSize: errorInfo.queueSize,
        userAgent: errorInfo.userAgent,
      }
    );

    // Dispatch error event for external monitoring systems
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("profile-sync-error", {
          detail: errorInfo,
        }),
      );
    }

    // Store error for debugging (limit storage)
    this.storeErrorForDebugging(errorInfo);
  }

  /**
   * Store errors for debugging purposes
   */
  private errorLog: Array<{
    message: string;
    context: string;
    timestamp: number;
    communicationMethod: string;
    isOnline: boolean;
    queueSize: number;
    userAgent: string;
  }> = [];
  private readonly MAX_ERROR_LOG_SIZE = 100;

  private storeErrorForDebugging(errorInfo: any): void {
    this.errorLog.push(errorInfo);

    // Limit error log size
    if (this.errorLog.length > this.MAX_ERROR_LOG_SIZE) {
      this.errorLog.shift();
    }
  }

  /**
   * Get error log for debugging
   */
  public getErrorLog(): typeof this.errorLog {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get current online status
   */
  public isOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get current queue size
   */
  public getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Get queued events (for debugging/monitoring)
   */
  public getQueuedEvents(): ProfileChangeEvent[] {
    return [...this.eventQueue];
  }

  /**
   * Clear event queue
   */
  public clearQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Get active throttle timers count
   */
  public getActiveThrottleCount(): number {
    return this.throttleTimers.size;
  }

  /**
   * Force process queue (for testing or manual intervention)
   */
  public async forceProcessQueue(): Promise<void> {
    await this.processEventQueue();
  }

  /**
   * Clean up all resources
   */
  public cleanup(): void {
    // Close all popups
    this.popupHandles.forEach((handle) => handle.close());
    this.popupHandles.clear();

    // Clear subscribers
    this.subscribers.clear();

    // Clear event queue and throttle timers
    this.eventQueue = [];
    this.throttleTimers.forEach((timerId) => clearTimeout(timerId));
    this.throttleTimers.clear();

    // Clear debounce timers
    this.debounceTimers.forEach((timerId) => clearTimeout(timerId));
    this.debounceTimers.clear();

    // Clear batch processing
    this.clearBatch();
    this.eventBatch = [];

    // Clear performance tracking data
    this.eventFrequency.clear();

    // Clear failed events and error log
    this.failedEvents = [];
    this.errorLog = [];

    // Clear connection monitoring
    if (this.connectionMonitorInterval) {
      clearInterval(this.connectionMonitorInterval);
      this.connectionMonitorInterval = null;
    }

    // Clear memory cleanup interval
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval);
      this.memoryCleanupInterval = null;
    }

    // Remove online/offline listeners
    if (this.onlineListener && this.offlineListener && typeof window !== "undefined") {
      window.removeEventListener("online", this.onlineListener);
      window.removeEventListener("offline", this.offlineListener);
      this.onlineListener = null;
      this.offlineListener = null;
    }

    // Remove storage event listener
    if (this.storageEventListener && typeof window !== "undefined") {
      window.removeEventListener("storage", this.storageEventListener);
      this.storageEventListener = null;
    }

    // Close broadcast channel and remove listener
    if (this.broadcastChannel) {
      if (this.broadcastChannelListener) {
        this.broadcastChannel.removeEventListener("message", this.broadcastChannelListener);
        this.broadcastChannelListener = null;
      }
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    this.isInitialized = false;
  }

  /**
   * Get comprehensive status information for debugging
   */
  public getStatus(): {
    isInitialized: boolean;
    isOnline: boolean;
    communicationMethod: string;
    subscriberCount: number;
    queueSize: number;
    failedEventsCount: number;
    errorLogSize: number;
    activeThrottleCount: number;
    popupHandlesCount: number;
  } {
    return {
      isInitialized: this.isInitialized,
      isOnline: this.isOnline,
      communicationMethod: this.getCommunicationMethod(),
      subscriberCount: this.getSubscriberCount(),
      queueSize: this.getQueueSize(),
      failedEventsCount: this.failedEvents.length,
      errorLogSize: this.errorLog.length,
      activeThrottleCount: this.getActiveThrottleCount(),
      popupHandlesCount: this.popupHandles.size,
    };
  }
}

// Export singleton instance
export const profileSyncManager = ProfileSyncManager.getInstance();
