/**
 * API client wrapper that automatically handles session expired errors
 * and triggers the session expired modal
 */

interface SessionExpiredHandler {
  handleSessionExpiredError: (error: any) => boolean;
}

interface ApiClientOptions {
  baseUrl?: string;
  onSessionExpired?: () => void;
}

export class ApiClientWithSessionHandling {
  private baseUrl: string;
  private sessionHandler?: SessionExpiredHandler;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || "";
  }

  setSessionHandler(handler: SessionExpiredHandler) {
    this.sessionHandler = handler;
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, options);

      // Check if response indicates session expired
      if (response.status === 401) {
        const errorData = await response.clone().json().catch(() => null);

        if (
          errorData?.code === "token_expired" ||
          errorData?.error?.includes("token") ||
          errorData?.message?.includes("session") ||
          errorData?.message?.includes("expired")
        ) {
          // Create error object that the session handler can recognize
          const sessionError = {
            status: 401,
            code: errorData?.code || "token_expired",
            message: errorData?.message || errorData?.error || "Session expired",
          };

          // If we have a session handler, let it handle the error
          if (this.sessionHandler?.handleSessionExpiredError(sessionError)) {
            // Session handler dealt with it, throw a clean error
            throw new Error("Session expired");
          }
        }
      }

      return response;
    } catch (error: any) {
      // Also check fetch errors that might indicate session issues
      if (this.sessionHandler?.handleSessionExpiredError(error)) {
        // Session handler dealt with it, re-throw
        throw error;
      }

      throw error;
    }
  }

  async get(url: string, options: RequestInit = {}) {
    return this.fetch(url, { ...options, method: "GET" });
  }

  async post(url: string, data?: any, options: RequestInit = {}) {
    return this.fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any, options: RequestInit = {}) {
    return this.fetch(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, options: RequestInit = {}) {
    return this.fetch(url, { ...options, method: "DELETE" });
  }
}

// Global instance that can be used throughout the app
export const apiClient = new ApiClientWithSessionHandling();
