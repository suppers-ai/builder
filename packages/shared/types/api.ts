/**
 * Shared API Types
 * Common types for API requests, responses, and data structures
 */

// Generic API Response
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  status: number;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}
// API Error Response
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: Record<string, any>;
}

// Pagination Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Sorting Parameters
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Search Parameters
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
}

// Combined Query Parameters
export interface QueryParams extends PaginationParams, SortParams, SearchParams {
  include?: string[];
  fields?: string[];
}

// HTTP Methods
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

// Request Configuration
export interface RequestConfig {
  url?: string;
  endpoint: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number>;
  timeout?: number;
}
export interface CreateApplicationData {
  name: string;
  description?: string;
  templateId: string;
  configuration: Record<string, unknown>;
  status?: "draft" | "pending" | "published" | "archived";
}

export interface UpdateApplicationData {
  name?: string;
  description?: string;
  templateId?: string;
  configuration?: Record<string, unknown>;
  status?: "draft" | "pending" | "published" | "archived";
}


export interface GrantAccessData {
  applicationId: string;
  userId: string;
  accessLevel: "read" | "write" | "admin";
}

export interface CreateReviewData {
  applicationId: string;
  action: "approved" | "rejected";
  feedback?: string;
}

export interface CreateCustomThemeData {
  name: string;
  label: string;
  description?: string;
  variables: Record<string, string | number>;
  is_public?: boolean;
}

export interface UpdateCustomThemeData {
  name?: string;
  label?: string;
  description?: string;
  variables?: Record<string, string | number>;
  is_public?: boolean;
}

// File Upload Types
export interface FileUploadData {
  file: File;
  path?: string;
  bucket?: string;
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  };
}

export interface FileUploadResponse {
  path: string;
  publicUrl: string;
  signedUrl?: string;
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: string;
  signature?: string;
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}
