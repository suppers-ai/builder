import type {
  AuthEventCallback,
  AuthEventData,
  AuthEventType,
  AuthSession,
} from "../../shared/types/auth.ts";

/**
 * Base class for authentication clients
 */
export abstract class BaseAuthClient {
  protected eventCallbacks: Map<AuthEventType, AuthEventCallback[]> = new Map();

  /**
   * Initialize the auth client
   */
  abstract initialize(): Promise<void>;

  /**
   * Get current user
   */
  abstract getUser(): unknown | null;

  /**
   * Get current session
   */
  abstract getSession(): AuthSession | null;

  /**
   * Check if user is authenticated
   */
  abstract isAuthenticated(): boolean;

  /**
   * Get access token
   */
  abstract getAccessToken(): string | null;

  /**
   * Get current theme
   */
  abstract getTheme(): "light" | "dark";

  /**
   * Get preferences
   */
  abstract getPreferences(): Record<string, unknown>;

  /**
   * Start login flow
   */
  abstract login(redirectUri?: string): void;

  /**
   * Logout user
   */
  abstract logout(): Promise<void>;

  /**
   * Refresh token
   */
  abstract refreshToken(): Promise<void>;

  /**
   * Make authenticated API request
   */
  abstract apiRequest(endpoint: string, options?: RequestInit): Promise<Response>;

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
  protected emitEvent(event: AuthEventType, data?: AuthEventData[AuthEventType]): void {
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
  abstract destroy(): void;
}
