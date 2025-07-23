import type {
  AuthClientConfig,
  AuthClientSession,
  AuthError,
  AuthEventCallback,
  AuthEventType,
  AuthUser,
  LoginOptions,
  RefreshTokenResponse,
  TokenResponse,
} from "../types/auth.ts";
import { AuthStorage } from "./storage.ts";

export class AuthClient {
  private config: AuthClientConfig;
  private storage: AuthStorage;
  private eventCallbacks: Map<AuthEventType, AuthEventCallback[]> = new Map();

  constructor(config: AuthClientConfig) {
    this.config = {
      scopes: ["openid", "email", "profile"],
      storageKey: "auth_session",
      ...config,
    };
    this.storage = new AuthStorage(this.config.storageKey);
  }

  /**
   * Initialize auth client
   */
  async initialize(): Promise<void> {
    // Check for existing session
    const session = this.storage.getValidSession();
    if (session) {
      this.emitEvent("login", session);
    }

    // Check for auth callback in URL
    if (typeof window !== "undefined") {
      const url = new URL(globalThis.location.href);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        this.emitEvent("error", {
          error,
          error_description: url.searchParams.get("error_description"),
        });
        return;
      }

      if (code) {
        try {
          await this.exchangeCodeForToken(code, state);
        } catch (err) {
          this.emitEvent("error", err);
        }
      }
    }
  }

  /**
   * Start login flow
   */
  login(options: LoginOptions = {}): void {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId || "default",
      redirect_uri: options.redirectUri || this.config.redirectUri || globalThis.location.origin,
      scope: (options.scopes || this.config.scopes || []).join(" "),
    });

    if (options.state) {
      params.set("state", options.state);
    }

    const loginUrl = `${this.config.storeUrl}/login?${params.toString()}`;

    if (typeof window !== "undefined") {
      globalThis.location.href = loginUrl;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const session = this.storage.getSession();
      if (session) {
        // Call logout endpoint
        await this.apiRequest("/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear local session
      this.storage.removeSession();
      this.emitEvent("logout");
    }
  }

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    const session = this.storage.getValidSession();
    return session?.user || null;
  }

  /**
   * Get current session
   */
  getSession(): AuthClientSession | null {
    return this.storage.getValidSession();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    const session = this.storage.getValidSession();
    return session?.accessToken || null;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    const session = this.storage.getSession();
    if (!session?.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await this.apiRequest("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: session.refreshToken,
        }),
      });

      const tokenData: RefreshTokenResponse = await response.json();

      const newSession: AuthClientSession = {
        ...session,
        accessToken: tokenData.access_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
      };

      if (tokenData.refresh_token) {
        newSession.refreshToken = tokenData.refresh_token;
      }

      this.storage.setSession(newSession);
      this.emitEvent("token_refresh", newSession);
    } catch (error) {
      this.storage.removeSession();
      this.emitEvent("error", error);
      throw error;
    }
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const session = this.storage.getValidSession();

    if (!session) {
      throw new Error("No valid session available");
    }

    const url = `${this.config.storeUrl}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${session.accessToken}`);
    headers.set("Content-Type", "application/json");

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If token expired, try to refresh
    if (response.status === 401 && session.refreshToken) {
      try {
        await this.refreshToken();

        // Retry the original request
        const newSession = this.storage.getValidSession();
        if (newSession) {
          headers.set("Authorization", `Bearer ${newSession.accessToken}`);
          return await fetch(url, {
            ...options,
            headers,
          });
        }
      } catch (refreshError) {
        this.emitEvent("error", refreshError);
        throw refreshError;
      }
    }

    return response;
  }

  /**
   * Exchange authorization code for token
   */
  private async exchangeCodeForToken(code: string, state?: string | null): Promise<void> {
    const response = await fetch(`${this.config.storeUrl}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri || globalThis.location.origin,
        state,
      }),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw error;
    }

    const tokenData: TokenResponse = await response.json();

    const session: AuthClientSession = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
      user: tokenData.user,
    };

    this.storage.setSession(session);
    this.emitEvent("login", session);

    // Clean up URL
    if (typeof window !== "undefined") {
      const url = new URL(globalThis.location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      globalThis.history.replaceState({}, "", url.toString());
    }
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
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emitEvent(event: AuthEventType, data?: unknown): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event, data);
        } catch (error) {
          console.error("Error in auth event callback:", error);
        }
      });
    }
  }
}
