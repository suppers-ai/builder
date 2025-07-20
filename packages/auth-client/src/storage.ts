import type { AuthSession } from "../types/auth.ts";

export class AuthStorage {
  private storageKey: string;

  constructor(storageKey: string = "auth_session") {
    this.storageKey = storageKey;
  }

  /**
   * Get session from storage
   */
  getSession(): AuthSession | null {
    try {
      // Try localStorage first (browser)
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      }

      // Try sessionStorage (browser)
      if (typeof sessionStorage !== "undefined") {
        const stored = sessionStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      }

      // Try Deno.env for server-side
      if (typeof Deno !== "undefined") {
        const stored = Deno.env.get(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting session from storage:", error);
      return null;
    }
  }

  /**
   * Save session to storage
   */
  setSession(session: AuthSession): void {
    try {
      const serialized = JSON.stringify(session);

      // Save to localStorage (browser)
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.storageKey, serialized);
      }

      // Save to sessionStorage (browser)
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(this.storageKey, serialized);
      }

      // For server-side, we don't persist to Deno.env as it's not meant for that
    } catch (error) {
      console.error("Error saving session to storage:", error);
    }
  }

  /**
   * Remove session from storage
   */
  removeSession(): void {
    try {
      // Remove from localStorage (browser)
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(this.storageKey);
      }

      // Remove from sessionStorage (browser)
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error("Error removing session from storage:", error);
    }
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(session: AuthSession): boolean {
    const now = Date.now();
    const expiresAt = session.expiresAt;

    // Add 5 minute buffer for token refresh
    const buffer = 5 * 60 * 1000;
    return now >= (expiresAt - buffer);
  }

  /**
   * Get valid session (not expired)
   */
  getValidSession(): AuthSession | null {
    const session = this.getSession();
    if (!session) return null;

    if (this.isSessionExpired(session)) {
      this.removeSession();
      return null;
    }

    return session;
  }
}
