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

  constructor(authClient: OAuthAuthClient, baseUrl: string = "http://127.0.0.1:54321/functions/v1/api/v1/admin") {
    this.authClient = authClient;
    this.baseUrl = baseUrl;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log("BaseApiClient makeRequest - checking authentication for:", `${this.baseUrl}${endpoint}`);
      
      if (!this.authClient.isAuthenticated()) {
        console.log("BaseApiClient - User not authenticated");
        return { error: "Not authenticated" };
      }

      const user = await this.authClient.getUser();
      if (!user) {
        console.log("BaseApiClient - User not found");
        return { error: "User not found" };
      }

      const token = await this.authClient.getAccessToken();
      if (!token) {
        console.log("BaseApiClient - No access token available");
        return { error: "No access token available" };
      }

      console.log("BaseApiClient - Making request with user:", user.email, "token length:", token.length);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-User-ID": user.id || "",
          ...options.headers,
        },
      });

      console.log("BaseApiClient - Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          // Use default error message if JSON parsing fails
        }

        return { error: errorMessage };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return { 
        error: error instanceof Error ? error.message : "Network request failed" 
      };
    }
  }

  protected buildQueryParams(filters: Record<string, any>): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return params.toString();
  }
}