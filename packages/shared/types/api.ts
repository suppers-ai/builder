/**
 * Shared API Types
 * Common types for API requests, responses, and data structures
 */

import type { UsersTable, ApplicationsTable } from './database.ts';

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

// Derived API Response Types (based on database schema)
export type UserResponse = Pick<UsersTable, 'id' | 'email' | 'display_name' | 'avatar_url' | 'created_at'>;

export interface UserResponseExtended extends UserResponse {
  full_name: string;
  initials: string;
}

export type ApplicationResponse = Pick<ApplicationsTable, 'id' | 'name' | 'description' | 'status' | 'created_at' | 'updated_at'>;

export interface ApplicationResponseExtended extends ApplicationResponse {
  owner_name?: string;
  review_count?: number;
}

// Update Data Types (derived from database schema)
export type UserUpdateData = Pick<UsersTable, 'first_name' | 'middle_names' | 'last_name' | 'display_name' | 'avatar_url'>;
export type ApplicationUpdateData = Pick<ApplicationsTable, 'name' | 'description' | 'configuration' | 'status'>;

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

// Application Data Types
export interface Application {
  id: string;
  name: string;
  description?: string;
  template_id: string;
  configuration: Record<string, unknown>;
  status: "draft" | "pending" | "published" | "archived";
  owner_id: string;
  created_at: string;
  updated_at: string;
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

// User Data Types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  middle_names?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  role: "user" | "admin" | "moderator";
  created_at: string;
  updated_at: string;
}

// User Access Types
export interface UserAccess {
  id: string;
  application_id: string;
  user_id: string;
  access_level: "read" | "write" | "admin";
  granted_by: string;
  granted_at: string;
}

export interface GrantAccessData {
  applicationId: string;
  userId: string;
  accessLevel: "read" | "write" | "admin";
}

// Application Review Types
export interface ApplicationReview {
  id: string;
  application_id: string;
  reviewer_id: string;
  action: "approved" | "rejected";
  feedback?: string;
  reviewed_at: string;
}

export interface CreateReviewData {
  applicationId: string;
  action: "approved" | "rejected";
  feedback?: string;
}

// Custom Theme Types
export interface CustomTheme {
  id: string;
  name: string;
  label: string;
  description?: string;
  variables: Record<string, string | number>;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
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
