/**
 * API Utilities
 * Common utilities for API requests, responses, and data handling
 */

import type {
  ApiError,
  ApiResponse,
  HttpMethod,
  QueryParams,
  RequestConfig,
} from "../types/api.ts";

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  data?: T,
  success: boolean = true,
  status: number = 200,
  message?: string,
  error?: string,
): ApiResponse<T> {
  return {
    data,
    success,
    status,
    message,
    error,
  };
}

/**
 * Create a success API response
 */
export function createSuccessApiResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
): ApiResponse<T> {
  return createApiResponse(data, true, status, message);
}

/**
 * Create an error API response
 */
export function createErrorApiResponse(
  error: string,
  status: number = 500,
  details?: any,
): ApiResponse<null> {
  return {
    data: null,
    success: false,
    status,
    error,
    ...(details && { details }),
  };
}

/**
 * Create a paginated API response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string,
): ApiResponse<T[]> {
  const hasMore = (page * limit) < total;

  return {
    data,
    success: true,
    status: 200,
    message,
    meta: {
      total,
      page,
      limit,
      hasMore,
    },
  };
}

/**
 * Parse query parameters from URL
 */
export function parseQueryParams(url: string): QueryParams {
  const urlObj = new URL(url);
  const params: QueryParams = {};

  // Pagination
  const page = urlObj.searchParams.get("page");
  const limit = urlObj.searchParams.get("limit");
  const offset = urlObj.searchParams.get("offset");

  if (page) params.page = parseInt(page, 10);
  if (limit) params.limit = parseInt(limit, 10);
  if (offset) params.offset = parseInt(offset, 10);

  // Sorting
  const sortBy = urlObj.searchParams.get("sortBy");
  const sortOrder = urlObj.searchParams.get("sortOrder");

  if (sortBy) params.sortBy = sortBy;
  if (sortOrder && (sortOrder === "asc" || sortOrder === "desc")) {
    params.sortOrder = sortOrder;
  }

  // Search
  const query = urlObj.searchParams.get("query") || urlObj.searchParams.get("q");
  if (query) params.query = query;

  // Include/fields
  const include = urlObj.searchParams.get("include");
  const fields = urlObj.searchParams.get("fields");

  if (include) params.include = include.split(",").map((s) => s.trim());
  if (fields) params.fields = fields.split(",").map((s) => s.trim());

  // Custom filters (any param starting with "filter_")
  const filters: Record<string, any> = {};
  urlObj.searchParams.forEach((value, key) => {
    if (key.startsWith("filter_")) {
      const filterKey = key.substring(7); // Remove "filter_" prefix
      filters[filterKey] = value;
    }
  });
  if (Object.keys(filters).length > 0) {
    params.filters = filters;
  }

  return params;
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.set("page", params.page.toString());
  if (params.limit !== undefined) searchParams.set("limit", params.limit.toString());
  if (params.offset !== undefined) searchParams.set("offset", params.offset.toString());
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.query) searchParams.set("query", params.query);

  if (params.include) {
    searchParams.set("include", params.include.join(","));
  }
  if (params.fields) {
    searchParams.set("fields", params.fields.join(","));
  }

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      searchParams.set(`filter_${key}`, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Create HTTP error from response
 */
export function createHttpError(status: number, message: string, details?: any): ApiError {
  return {
    status,
    message,
    details,
  };
}

/**
 * Handle async API errors
 */
export async function handleApiError(error: unknown): Promise<Response> {
  console.error("API Error:", error);

  if (error instanceof Error) {
    return new Response(
      JSON.stringify(createErrorApiResponse(error.message, 500)),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify(createErrorApiResponse("Internal server error", 500)),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * Parse JSON body safely
 */
export async function parseJsonBody(request: Request): Promise<any> {
  try {
    const text = await request.text();
    if (!text.trim()) {
      return {};
    }
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Invalid JSON in request body");
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[],
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === "",
  );

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Apply default pagination values
 */
export function applyPaginationDefaults(
  params: QueryParams,
): Required<Pick<QueryParams, "page" | "limit">> {
  return {
    page: params.page ?? 1,
    limit: Math.min(params.limit ?? 10, 100), // Cap at 100 items per page
  };
}
