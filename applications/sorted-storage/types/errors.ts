/**
 * Error handling types and interfaces for sorted-storage application
 * Based on requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

// Base error interface
export interface StorageError {
  type: StorageErrorType;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
  timestamp: string;
  requestId?: string;
}

// Error types categorization (Requirement 8.1, 8.2, 8.4)
export type StorageErrorType =
  | "upload"
  | "download"
  | "delete"
  | "share"
  | "network"
  | "permission"
  | "validation"
  | "storage_quota"
  | "file_not_found"
  | "folder_not_empty"
  | "authentication"
  | "rate_limit"
  | "server_error"
  | "unknown";

// Specific error interfaces for different operations

// Upload errors (Requirement 4.1, 4.2, 8.2)
export interface UploadError extends StorageError {
  type: "upload";
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  uploadProgress?: number;
}

// Network errors (Requirement 8.1, 8.3)
export interface NetworkError extends StorageError {
  type: "network";
  statusCode?: number;
  retryable: boolean;
  retryAfter?: number;
}

// Permission errors (Requirement 1.3, 6.3, 8.4)
export interface PermissionError extends StorageError {
  type: "permission";
  requiredPermission: string;
  currentPermission?: string;
  resourceId?: string;
}

// Validation errors (Requirement 4.3, 5.1, 8.4)
export interface ValidationError extends StorageError {
  type: "validation";
  field?: string;
  validationRule: string;
  providedValue?: unknown;
}

// Storage quota errors (Requirement 8.2)
export interface StorageQuotaError extends StorageError {
  type: "storage_quota";
  currentUsage: number;
  quotaLimit: number;
  requiredSpace: number;
}

// Error recovery strategies
export interface ErrorRecovery {
  canRetry: boolean;
  retryDelay?: number;
  maxRetries?: number;
  alternativeAction?: string;
  userAction?: string;
}

// Error context for better debugging and user experience
export interface ErrorContext {
  operation: string;
  resourceType: "file" | "folder" | "share" | "user";
  resourceId?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  timestamp: string;
}

// Error handling result
export interface ErrorHandlingResult {
  handled: boolean;
  recovery?: ErrorRecovery;
  userMessage?: string;
  logLevel: "debug" | "info" | "warn" | "error" | "fatal";
  shouldReport: boolean;
}

// Error notification types for user feedback (Requirement 8.4)
export interface ErrorNotification {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  actions?: NotificationAction[];
  autoClose?: boolean;
  duration?: number;
}

export interface NotificationAction {
  label: string;
  action: () => void | Promise<void>;
  style?: "primary" | "secondary" | "danger";
}

// Retry configuration for recoverable errors (Requirement 8.3)
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: StorageErrorType[];
}

// Error aggregation for batch operations
export interface BatchOperationError {
  operation: string;
  totalItems: number;
  successCount: number;
  errorCount: number;
  errors: StorageError[];
  partialSuccess: boolean;
}

// Error reporting interface for monitoring and analytics
export interface ErrorReport {
  error: StorageError;
  context: ErrorContext;
  stackTrace?: string;
  breadcrumbs?: string[];
  userFeedback?: string;
  severity: "low" | "medium" | "high" | "critical";
}

// Common error codes for consistent error handling
export const ERROR_CODES = {
  // Upload errors
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  UPLOAD_INTERRUPTED: "UPLOAD_INTERRUPTED",
  STORAGE_QUOTA_EXCEEDED: "STORAGE_QUOTA_EXCEEDED",

  // Permission errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  SHARE_TOKEN_EXPIRED: "SHARE_TOKEN_EXPIRED",
  SHARE_TOKEN_INVALID: "SHARE_TOKEN_INVALID",

  // Network errors
  CONNECTION_TIMEOUT: "CONNECTION_TIMEOUT",
  NETWORK_UNAVAILABLE: "NETWORK_UNAVAILABLE",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",

  // Validation errors
  INVALID_FILE_NAME: "INVALID_FILE_NAME",
  INVALID_FOLDER_NAME: "INVALID_FOLDER_NAME",
  DUPLICATE_NAME: "DUPLICATE_NAME",
  INVALID_METADATA: "INVALID_METADATA",

  // Resource errors
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FOLDER_NOT_FOUND: "FOLDER_NOT_FOUND",
  FOLDER_NOT_EMPTY: "FOLDER_NOT_EMPTY",
  CIRCULAR_REFERENCE: "CIRCULAR_REFERENCE",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
