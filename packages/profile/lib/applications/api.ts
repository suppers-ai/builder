import type {
  ApiError,
  ApiResponse,
  Application,
  CreateApplicationData,
  QueryParams,
  UpdateApplicationData,
} from "@suppers/shared";
import { HttpStatus } from "@suppers/shared";
import {
  applyPaginationDefaults,
  buildQueryString,
  createErrorApiResponse,
  createHttpError,
} from "@suppers/shared/utils";
import { getAuthClient } from "../auth.ts";
import config from "../../../../config.ts";

/**
 * Applications API error class
 */
export class ApplicationsApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: Record<string, any>;

  constructor(message: string, status: number = 500, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = "ApplicationsApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromApiError(apiError: ApiError): ApplicationsApiError {
    return new ApplicationsApiError(
      apiError.message,
      apiError.status,
      apiError.code,
      apiError.details,
    );
  }
}

/**
 * Base API client for applications operations
 */
class ApplicationsApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  /**
   * Make authenticated API request with enhanced error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    queryParams?: QueryParams,
  ): Promise<ApiResponse<T>> {
    const authClient = getAuthClient();
    const session = await authClient.getSession();

    if (!session || !session.session) {
      throw new ApplicationsApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        "AUTH_REQUIRED",
      );
    }

    // Build URL with query parameters
    let url = `${this.baseUrl}${endpoint}`;
    if (queryParams) {
      const searchParams = new URLSearchParams();
      
      // Add all query parameters manually to ensure they're included
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Use proper JWT token for authentication
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.session.access_token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data: ApiResponse<T>;

      try {
        data = await response.json();
      } catch (parseError) {
        throw new ApplicationsApiError(
          "Invalid response format from server",
          response.status,
          "INVALID_RESPONSE",
        );
      }

      if (!response.ok) {
        // Handle different error scenarios
        const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`;
        const errorCode = this.getErrorCodeFromStatus(response.status);

        throw new ApplicationsApiError(
          errorMessage,
          response.status,
          errorCode,
          data,
        );
      }

      return data;
    } catch (error) {
      // Re-throw ApplicationsApiError as-is
      if (error instanceof ApplicationsApiError) {
        throw error;
      }

      // Handle network errors and other fetch failures
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new ApplicationsApiError(
          "Network error: Unable to connect to server",
          0,
          "NETWORK_ERROR",
        );
      }

      // Handle other unexpected errors
      console.error(`API request failed: ${endpoint}`, error);
      throw new ApplicationsApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        HttpStatus.INTERNAL_SERVER_ERROR,
        "UNKNOWN_ERROR",
      );
    }
  }

  /**
   * Get error code from HTTP status
   */
  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "BAD_REQUEST";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return "VALIDATION_ERROR";
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return "SERVER_ERROR";
      default:
        return "HTTP_ERROR";
    }
  }

  /**
   * Get user's applications with optional pagination and filtering
   */
  async getApplications(queryParams?: QueryParams): Promise<Application[]> {
    const authClient = getAuthClient();
    
    // Ensure auth client is initialized and we have a valid session
    const sessionStatus = await authClient.getSessionStatus();
    if (!sessionStatus.isAuthenticated || !sessionStatus.userId) {
      throw new ApplicationsApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        "AUTH_REQUIRED",
      );
    }

    // Add owner_id to query params to get user's applications
    const params = {
      ...queryParams,
      owner_id: sessionStatus.userId,
    };

    console.log("API Debug - Fetching applications with params:", params);

    // Build URL with query parameters
    let url = `${this.baseUrl}/api/v1/applications`;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      
      // Add all query parameters manually to ensure they're included
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Get session for auth
    const session = await authClient.getSession();
    if (!session || !session.session) {
      throw new ApplicationsApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        "AUTH_REQUIRED",
      );
    }

    try {
      console.log("API Debug - Fetching from URL:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.session.access_token}`,
        },
      });

      const responseData = await response.json();
      console.log("API Debug - Fetch applications response:", responseData);

      if (!response.ok) {
        throw new ApplicationsApiError(
          responseData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        );
      }

      return responseData.applications || [];
    } catch (error) {
      if (error instanceof ApplicationsApiError) {
        throw error;
      }
      
      console.error("API Debug - Fetch applications error:", error);
      throw new ApplicationsApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        HttpStatus.INTERNAL_SERVER_ERROR,
        "UNKNOWN_ERROR",
      );
    }
  }

  /**
   * Get user's applications with pagination metadata
   */
  async getApplicationsPaginated(queryParams?: QueryParams): Promise<ApiResponse<{ applications: Application[] }>> {
    const authClient = getAuthClient();
    
    // Ensure auth client is initialized and we have a valid session
    const sessionStatus = await authClient.getSessionStatus();
    if (!sessionStatus.isAuthenticated || !sessionStatus.userId) {
      throw new ApplicationsApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        "AUTH_REQUIRED",
      );
    }

    const paginationParams = queryParams ? applyPaginationDefaults(queryParams) : {};
    const params = {
      ...paginationParams,
      owner_id: sessionStatus.userId,
    };

    return await this.makeRequest<{ applications: Application[] }>("/api/v1/applications", {}, params);
  }

  /**
   * Get a specific application by ID
   */
  async getApplication(id: string): Promise<Application> {
    if (!id || typeof id !== "string") {
      throw new ApplicationsApiError(
        "Invalid application ID",
        HttpStatus.BAD_REQUEST,
        "INVALID_ID",
      );
    }

    const authClient = getAuthClient();
    
    // Ensure auth client is initialized and we have a valid session
    const sessionStatus = await authClient.getSessionStatus();
    if (!sessionStatus.isAuthenticated || !sessionStatus.userId) {
      throw new ApplicationsApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        "AUTH_REQUIRED",
      );
    }

    // Build URL with application_id query parameter
    const url = `${this.baseUrl}/api/v1/applications?application_id=${encodeURIComponent(id)}`;

    // Get session for auth
    const session = await authClient.getSession();
    if (!session || !session.session) {
      throw new ApplicationsApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        "AUTH_REQUIRED",
      );
    }

    try {
      console.log("API Debug - Fetching application from URL:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.session.access_token}`,
        },
      });

      const responseData = await response.json();
      console.log("API Debug - Fetch application response:", responseData);

      if (!response.ok) {
        throw new ApplicationsApiError(
          responseData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        );
      }

      if (!responseData.application) {
        throw new ApplicationsApiError("Application not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
      }

      return responseData.application;
    } catch (error) {
      if (error instanceof ApplicationsApiError) {
        throw error;
      }
      
      console.error("API Debug - Fetch application error:", error);
      throw new ApplicationsApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        HttpStatus.INTERNAL_SERVER_ERROR,
        "UNKNOWN_ERROR",
      );
    }
  }

  /**
   * Create a new application using shared types
   */
  async createApplication(data: CreateApplicationData): Promise<Application> {
    if (!data.name?.trim()) {
      throw new ApplicationsApiError(
        "Application name is required",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    const authClient = getAuthClient();
    
    // Ensure auth client is initialized and we have a valid session
    const sessionStatus = await authClient.getSessionStatus();
    if (!sessionStatus.isAuthenticated || !sessionStatus.userId) {
      throw new ApplicationsApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        "AUTH_REQUIRED",
      );
    }

    // Include ownerId in request body as expected by the API
    const requestBody = {
      ...data,
      ownerId: sessionStatus.userId,
    };

    console.log("API Debug - Creating application with data:", requestBody);

    // Make direct fetch request since the backend doesn't follow ApiResponse format
    if (!sessionStatus.isAuthenticated || !sessionStatus.userId) {
      throw new ApplicationsApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        "AUTH_REQUIRED",
      );
    }

    const session = await authClient.getSession();
    if (!session || !session.session) {
      throw new ApplicationsApiError(
        "User not authenticated",
        HttpStatus.UNAUTHORIZED,
        "AUTH_REQUIRED",
      );
    }

    const url = `${this.baseUrl}/api/v1/applications`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log("API Debug - Create application response:", responseData);

      if (!response.ok) {
        throw new ApplicationsApiError(
          responseData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        );
      }

      if (!responseData.application) {
        console.error("API Debug - No application in response data:", responseData);
        throw new ApplicationsApiError(
          "Failed to create application",
          HttpStatus.INTERNAL_SERVER_ERROR,
          "CREATE_FAILED",
        );
      }

      return responseData.application;
    } catch (error) {
      if (error instanceof ApplicationsApiError) {
        throw error;
      }
      
      console.error("API Debug - Create application error:", error);
      throw new ApplicationsApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        HttpStatus.INTERNAL_SERVER_ERROR,
        "UNKNOWN_ERROR",
      );
    }
  }

  /**
   * Update an application using shared types
   */
  async updateApplication(id: string, data: UpdateApplicationData): Promise<Application> {
    if (!id || typeof id !== "string") {
      throw new ApplicationsApiError(
        "Invalid application ID",
        HttpStatus.BAD_REQUEST,
        "INVALID_ID",
      );
    }

    if (!data || Object.keys(data).length === 0) {
      throw new ApplicationsApiError(
        "Update data is required",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    // Include id in request body as expected by the API
    const requestBody = {
      ...data,
      id,
    };

    const response = await this.makeRequest<{ application: Application }>(`/api/v1/applications`, {
      method: "PUT",
      body: JSON.stringify(requestBody),
    });

    if (!response.data?.application) {
      throw new ApplicationsApiError(
        "Failed to update application",
        HttpStatus.INTERNAL_SERVER_ERROR,
        "UPDATE_FAILED",
      );
    }
    return response.data.application;
  }

  /**
   * Delete an application
   */
  async deleteApplication(id: string): Promise<void> {
    if (!id || typeof id !== "string") {
      throw new ApplicationsApiError(
        "Invalid application ID",
        HttpStatus.BAD_REQUEST,
        "INVALID_ID",
      );
    }

    await this.makeRequest(`/api/v1/applications`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Check if application name is available
   */
  async checkApplicationNameAvailability(name: string): Promise<boolean> {
    if (!name?.trim()) {
      throw new ApplicationsApiError(
        "Application name is required",
        HttpStatus.BAD_REQUEST,
        "VALIDATION_ERROR",
      );
    }

    try {
      const response = await this.makeRequest<{ available: boolean }>(
        `/api/v1/applications/check-name`,
        {},
        {
          query: name.trim(),
        },
      );
      return response.data?.available ?? false;
    } catch (error) {
      // If endpoint doesn't exist, assume name checking is not supported
      if (error instanceof ApplicationsApiError && error.status === HttpStatus.NOT_FOUND) {
        return true;
      }
      throw error;
    }
  }
}

// Create singleton instance
let apiClient: ApplicationsApiClient | null = null;

/**
 * Get the singleton API client instance
 */
export function getApiClient(): ApplicationsApiClient {
  if (!apiClient) {
    apiClient = new ApplicationsApiClient();
  }
  return apiClient;
}

/**
 * Error handling utilities following platform standards
 */
export const errorHandlers = {
  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error: unknown): string {
    if (error instanceof ApplicationsApiError) {
      switch (error.code) {
        case "AUTH_REQUIRED":
          return "Please log in to continue";
        case "FORBIDDEN":
          return "You don't have permission to perform this action";
        case "NOT_FOUND":
          return "The requested application was not found";
        case "VALIDATION_ERROR":
          return error.message || "Please check your input and try again";
        case "CONFLICT":
          return "An application with this name already exists";
        case "NETWORK_ERROR":
          return "Unable to connect to server. Please check your internet connection";
        case "SERVER_ERROR":
          return "Server error occurred. Please try again later";
        default:
          return error.message || "An unexpected error occurred";
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "An unexpected error occurred";
  },

  /**
   * Check if error is retryable
   */
  isRetryableError(error: unknown): boolean {
    if (error instanceof ApplicationsApiError) {
      return ["NETWORK_ERROR", "SERVER_ERROR", "UNKNOWN_ERROR"].includes(error.code || "");
    }
    return false;
  },

  /**
   * Check if error requires authentication
   */
  requiresAuth(error: unknown): boolean {
    if (error instanceof ApplicationsApiError) {
      return error.code === "AUTH_REQUIRED" || error.status === HttpStatus.UNAUTHORIZED;
    }
    return false;
  },
};

/**
 * Convenience functions for common operations with enhanced type safety
 */
export const api = {
  applications: {
    /**
     * List applications with optional filtering and pagination
     */
    list: (params?: QueryParams) => getApiClient().getApplications(params),

    /**
     * List applications with pagination metadata
     */
    listPaginated: (params?: QueryParams) => getApiClient().getApplicationsPaginated(params),

    /**
     * Get a specific application by ID
     */
    get: (id: string) => getApiClient().getApplication(id),

    /**
     * Create a new application
     */
    create: (data: CreateApplicationData) => getApiClient().createApplication(data),

    /**
     * Update an existing application
     */
    update: (id: string, data: UpdateApplicationData) => getApiClient().updateApplication(id, data),

    /**
     * Delete an application
     */
    delete: (id: string) => getApiClient().deleteApplication(id),

    /**
     * Check if application name is available
     */
    checkNameAvailability: (name: string) => getApiClient().checkApplicationNameAvailability(name),
  },

  /**
   * Error handling utilities
   */
  errors: errorHandlers,
};

/**
 * Type-safe wrapper for API operations with consistent error handling
 */
export class ApiOperationWrapper {
  /**
   * Execute an API operation with consistent error handling
   */
  static async execute<T>(
    operation: () => Promise<T>,
    options?: {
      retries?: number;
      retryDelay?: number;
      onError?: (error: ApplicationsApiError) => void;
    },
  ): Promise<T> {
    const { retries = 0, retryDelay = 1000, onError } = options || {};
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (onError && error instanceof ApplicationsApiError) {
          onError(error);
        }

        // Don't retry on the last attempt or if error is not retryable
        if (attempt === retries || !errorHandlers.isRetryableError(error)) {
          break;
        }

        // Wait before retrying
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw lastError;
  }
}

// Export the main API client class for advanced usage
export { ApplicationsApiClient };
