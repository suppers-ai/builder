import { OAuthAuthClient } from "@suppers/auth-client";

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
    baseUrl: string = "http://127.0.0.1:54321/functions/v1/api/v1/admin",
  ) {
    this.authClient = authClient;
    this.baseUrl = baseUrl;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      console.log(
        "BaseApiClient makeRequest - checking authentication for:",
        `${this.baseUrl}${endpoint}`,
      );

      // Check if user is authenticated
      let authToken: string | null = null;
      let userId = "";

      if (this.authClient.isAuthenticated()) {
        const user = await this.authClient.getUser();
        const token = await this.authClient.getAccessToken();
        
        if (user && token) {
          console.log(
            "BaseApiClient - Making request with authenticated user:",
            user.email,
          );
          authToken = token;
          userId = user.id || "";
        } else {
          console.log("BaseApiClient - User not fully authenticated");
        }
      } else {
        console.log("BaseApiClient - User not authenticated");
      }

      // If no auth token, return error for admin endpoints
      if (!authToken && endpoint.includes('/admin/')) {
        return { error: "Authentication required for admin access" };
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      // Only add Authorization header if we have a valid token
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Only add X-User-ID if we have a valid user ID
      if (userId && userId !== "") {
        headers["X-User-ID"] = userId;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      console.log("BaseApiClient - Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData: any = null;

        try {
          errorData = JSON.parse(errorText);
          // Handle different error response structures
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.msg) {
            errorMessage = errorData.msg;
          }
        } catch {
          // Use default error message if JSON parsing fails
        }

        // Check if this is a session expired error
        if (response.status === 401 && errorData?.code === "token_expired") {
          // Create a session expired error that components can detect
          const sessionError = new Error(
            errorData.message || "Your session has expired. Please log in again.",
          );
          (sessionError as any).code = "token_expired";
          (sessionError as any).status = 401;
          throw sessionError;
        }

        return { error: errorMessage };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        error: error instanceof Error ? error.message : "Network request failed",
      };
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

  protected async get<T>(endpoint: string): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { method: "GET" });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  protected async delete(endpoint: string): Promise<void> {
    const response = await this.makeRequest<void>(endpoint, { method: "DELETE" });
    if (response.error) {
      throw new Error(response.error);
    }
  }
}
