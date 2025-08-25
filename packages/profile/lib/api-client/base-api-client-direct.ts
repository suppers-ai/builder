import { DirectAuthClient } from "../auth-client/index.ts";
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
    baseUrl: string = `${config.apiUrl}/api/v1` || "http://127.0.0.1:54321/functions/v1/api/v1",
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

      // Get the access token directly from DirectAuthClient
      const accessToken = await this.authClient.getAccessToken();
      
      if (!accessToken) {
        throw new Error("No access token available - please sign in");
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Authorization": `Bearer ${accessToken}`,
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
          // Session expired - user needs to login again
          throw new Error("Session expired - please sign in again");
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