import { DirectAuthClient } from "@suppers/auth-client";
import config from "../../../../config.ts";

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

export abstract class BaseApiClientDirect {
  protected authClient: DirectAuthClient;
  protected baseUrl: string;

  constructor(
    authClient: DirectAuthClient,
    baseUrl: string = config.apiUrl || "http://127.0.0.1:54321/functions/v1/api/v1",
  ) {
    this.authClient = authClient;
    this.baseUrl = baseUrl;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      // Get the current user and session from DirectAuthClient
      const user = await this.authClient.getUser();
      if (!user) {
        throw new Error("User not found - please sign in");
      }

      // Get the Supabase client and session
      const supabase = this.authClient.getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No access token available - please sign in");
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
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
          if (errorText) {
            errorMessage = errorText;
          }
        }

        // Handle session expired errors
        if (response.status === 401) {
          // Try to refresh the session
          const { data: { session: newSession } } = await supabase.auth.refreshSession();
          if (!newSession) {
            // Session refresh failed, user needs to login again
            throw new Error("Session expired - please sign in again");
          }
          // Retry the request with new token
          return this.makeRequest<T>(endpoint, options);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  protected async makeRequestWithResponse<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const data = await this.makeRequest<T>(endpoint, options);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Request failed" };
    }
  }
}