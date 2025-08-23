import { OAuthAuthClient } from "@suppers/auth-client";
import { handleSessionExpiredError } from "@suppers/ui-lib";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading?: boolean;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponseWithPagination<T> {
  data?: PaginatedApiResponse<T>;
  error?: string;
  loading?: boolean;
}

export abstract class BaseApiClient {
  protected authClient: OAuthAuthClient;
  protected baseUrl: string;

  constructor(
    authClient: OAuthAuthClient,
    baseUrl: string = "http://127.0.0.1:54321/functions/v1/api/v1",
  ) {
    this.authClient = authClient;
    this.baseUrl = baseUrl;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      if (!this.authClient.isAuthenticated()) {
        throw new Error("Not authenticated");
      }

      const user = await this.authClient.getUser();
      if (!user) {
        throw new Error("User not found");
      }

      const token = await this.authClient.getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      console.log("headers", {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-User-ID": user.id || "",
        ...options.headers,
      });

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-User-ID": user.id || "",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          // Use default error message if JSON parsing fails
        }

        // Check if this is a session expired error
        const sessionError = new Error(errorMessage);
        (sessionError as any).status = response.status;
        if (handleSessionExpiredError(sessionError)) {
          // Session expired error was handled by the global session manager
          throw sessionError;
        }

        throw new Error(errorMessage);
      }

      // Handle empty responses (like DELETE operations)
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  protected buildQueryParams(filters: Record<string, any>): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    return params.toString();
  }
}
