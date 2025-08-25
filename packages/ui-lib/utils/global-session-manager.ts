/**
 * Global Session Management System
 *
 * This provides a centralized way to handle session expired errors
 * across all packages (admin, payments, etc.) without needing to
 * add SessionExpiredModal to every component.
 */

import { signal } from "@preact/signals";

interface SessionManagerConfig {
  onLogin?: () => void;
  onSignOut?: () => void;
  loginUrl?: string;
  homeUrl?: string;
}

class GlobalSessionManager {
  private static instance: GlobalSessionManager;

  // Global signals for session state
  public isSessionExpiredModalOpen = signal(false);

  private config: SessionManagerConfig = {
    loginUrl: "/",
    homeUrl: "/",
  };

  private constructor() {}

  public static getInstance(): GlobalSessionManager {
    if (!GlobalSessionManager.instance) {
      GlobalSessionManager.instance = new GlobalSessionManager();
    }
    return GlobalSessionManager.instance;
  }

  /**
   * Configure the global session manager
   */
  public configure(config: SessionManagerConfig) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if an error indicates a session expired
   */
  public isSessionExpiredError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error?.message || error?.error || String(error);
    const errorCode = error?.code;
    const errorStatus = error?.status;

    return (
      errorMessage?.includes("Invalid or expired token") ||
      errorMessage?.includes("token") && errorMessage?.includes("invalid") ||
      errorMessage?.includes("session") && errorMessage?.includes("expired") ||
      errorStatus === 401 ||
      errorCode === "token_expired" ||
      errorCode === "invalid_credentials"
    );
  }

  /**
   * Handle a potential session expired error
   * Returns true if the error was a session error and was handled
   */
  public handleError(error: any): boolean {
    if (this.isSessionExpiredError(error)) {
      console.log("🔒 GlobalSessionManager: Session expired error detected, showing modal");
      this.showSessionExpiredModal();
      return true;
    }
    return false;
  }

  /**
   * Show the session expired modal
   */
  public showSessionExpiredModal() {
    this.isSessionExpiredModalOpen.value = true;
  }

  /**
   * Hide the session expired modal
   */
  public hideSessionExpiredModal() {
    this.isSessionExpiredModalOpen.value = false;
  }

  /**
   * Handle user choosing to login
   */
  public handleLogin() {
    console.log("🔑 GlobalSessionManager: User chose to login");
    this.hideSessionExpiredModal();

    if (this.config.onLogin) {
      this.config.onLogin();
    } else {
      // Default behavior - redirect to login
      if (typeof window !== "undefined") {
        globalThis.location.href = this.config.loginUrl || "/";
      }
    }
  }

  /**
   * Handle user choosing to sign out or modal being closed
   */
  public handleSignOut() {
    console.log("🚪 GlobalSessionManager: User signed out");
    this.hideSessionExpiredModal();

    if (this.config.onSignOut) {
      this.config.onSignOut();
    } else {
      // Default behavior - redirect to home
      if (typeof window !== "undefined") {
        globalThis.location.href = this.config.homeUrl || "/";
      }
    }
  }

  /**
   * Enhanced error handler that suppresses normal error handling for session errors
   */
  public handleWithSessionCheck(
    error: any,
    onSessionExpired: () => void = () => {},
    onNormalError: (error: any) => void,
  ) {
    if (this.handleError(error)) {
      // Session error - call session expired callback
      onSessionExpired();
    } else {
      // Normal error - handle normally
      onNormalError(error);
    }
  }

  /**
   * Quick check for API response errors
   */
  public handleApiResponse<T>(
    response: { error?: string; data?: T },
    onSuccess: (data: T) => void,
    onError: (error: string) => void,
    onSessionExpired: () => void = () => {},
  ) {
    if (response.error) {
      if (this.handleError({ message: response.error })) {
        // Session expired
        onSessionExpired();
      } else {
        // Normal error
        onError(response.error);
      }
    } else if (response.data) {
      onSuccess(response.data);
    }
  }
}

// Export singleton instance
export const globalSessionManager = GlobalSessionManager.getInstance();

// Export convenience functions
export const {
  isSessionExpiredModalOpen,
} = globalSessionManager;

export const configureSessionManager = (config: SessionManagerConfig) => {
  globalSessionManager.configure(config);
};

export const handleSessionExpiredError = (error: any): boolean => {
  return globalSessionManager.handleError(error);
};

export const showSessionExpiredModal = () => {
  globalSessionManager.showSessionExpiredModal();
};

export const handleSessionLogin = () => {
  globalSessionManager.handleLogin();
};

export const handleSessionSignOut = () => {
  globalSessionManager.handleSignOut();
};
