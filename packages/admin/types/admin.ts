/**
 * Admin-specific types and interfaces
 */

import type { Database } from "../../shared/generated/database-types.ts";

// Type aliases for better readability
export type ApplicationStatus = Database["public"]["Enums"]["application_status"];
export type ReviewStatus = Database["public"]["Enums"]["review_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];

export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationInsert = Database["public"]["Tables"]["applications"]["Insert"];
export type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];
export type ApplicationReview = Database["public"]["Tables"]["application_reviews"]["Row"];
export type DatabaseUser = Database["public"]["Tables"]["users"]["Row"];

/**
 * Application filtering and search options
 */
export interface ApplicationFilters {
  status?: ApplicationStatus;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: "name" | "created_at" | "updated_at" | "status";
  sortOrder?: "asc" | "desc";
}

/**
 * Extended application with metrics for admin view
 */
export interface AdminApplication extends Application {
  metrics?: {
    views: number;
    lastAccessed: string | null;
    storageUsed: number;
    bandwidth?: number;
  };
  reviews?: ApplicationReview[];
  reviewCount?: number;
  lastReviewAt?: string | null;
}

/**
 * Application creation data
 */
export interface CreateApplicationData {
  name: string;
  slug: string;
  description?: string;
  website_url?: string;
  thumbnail_url?: string;
  status?: ApplicationStatus;
}

/**
 * Application update data
 */
export interface UpdateApplicationData {
  name?: string;
  slug?: string;
  description?: string;
  website_url?: string;
  thumbnail_url?: string;
  status?: ApplicationStatus;
}

/**
 * Application review creation data
 */
export interface CreateReviewData {
  status: ReviewStatus;
  feedback?: string;
}

/**
 * Application metrics data
 */
export interface ApplicationMetrics {
  views: number;
  lastAccessed: string | null;
  storageUsed: number;
  bandwidth: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  updated: number;
  errors: string[];
  successful: string[];
}

/**
 * Application form validation errors
 */
export interface ApplicationFormErrors {
  name?: string;
  slug?: string;
  description?: string;
  website_url?: string;
  thumbnail_url?: string;
  status?: string;
}

/**
 * Application form state
 */
export interface ApplicationFormState {
  data: CreateApplicationData | UpdateApplicationData;
  errors: ApplicationFormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
}

/**
 * User status enum for admin management
 */
export type UserStatus = "active" | "suspended" | "deleted";

/**
 * User filtering and search options
 */
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: "email" | "created_at" | "last_login_at" | "storage_used";
  sortOrder?: "asc" | "desc";
}

/**
 * Extended user with additional admin information
 */
export interface AdminUser extends DatabaseUser {
  applications?: AdminApplication[];
  applicationCount?: number;
  lastLoginAt?: string | null;
  totalStorageUsed?: number;
  totalBandwidthUsed?: number;
}

/**
 * User activity tracking
 */
export interface UserActivity {
  id: string;
  userId: string;
  type:
    | "login"
    | "logout"
    | "application_created"
    | "application_updated"
    | "application_deleted"
    | "profile_updated";
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

/**
 * User storage details
 */
export interface UserStorageDetails {
  userId: string;
  storageUsed: number;
  storageLimit: number;
  bandwidthUsed: number;
  bandwidthLimit: number;
  applicationBreakdown: {
    applicationId: string;
    applicationName: string;
    storageUsed: number;
    bandwidthUsed: number;
  }[];
  lastUpdated: string;
}

/**
 * User statistics for admin dashboard
 */
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  usersByRole: {
    admin: number;
    user: number;
  };
  newUsersThisMonth: number;
  totalStorageUsed: number;
  totalBandwidthUsed: number;
  averageApplicationsPerUser: number;
}

/**
 * User list response with pagination
 */
export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * User search result
 */
export interface UserSearchResult {
  users: AdminUser[];
  total: number;
  query: string;
}

/**
 * User form validation errors
 */
export interface UserFormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: string;
  status?: string;
  storageLimit?: string;
  bandwidthLimit?: string;
}

/**
 * User form state
 */
export interface UserFormState {
  data: Partial<AdminUser>;
  errors: UserFormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
}
