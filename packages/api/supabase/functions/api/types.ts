/**
 * API Types
 * Common type definitions for API handlers
 */

export interface User {
  id: string;
  email?: string;
  role?: string;
}

export interface ApiContext {
  userId: string;
  supabase: any; // SupabaseClient type
  pathSegments?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  [key: string]: any;
}
