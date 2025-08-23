/**
 * Type definitions for sorted-storage application
 * Exports all core types and interfaces
 */

// Core storage types
export type {
  BreadcrumbItem,
  FileUploadOptions,
  FolderStructure,
  ItemAction,
  LayoutOptions,
  LayoutRenderer,
  LayoutType,
  NavigationState,
  SearchOptions,
  SearchResult,
  SelectionState,
  ShareInfo,
  ShareOptions,
  StorageMetadata,
  StorageObject,
  UploadProgress,
  ViewPreferences,
} from "./storage.ts";

// Error handling types
export type {
  BatchOperationError,
  ErrorCode,
  ErrorContext,
  ErrorHandlingResult,
  ErrorNotification,
  ErrorRecovery,
  ErrorReport,
  NetworkError,
  NotificationAction,
  PermissionError,
  RetryConfig,
  StorageError,
  StorageErrorType,
  StorageQuotaError,
  UploadError,
  ValidationError,
} from "./errors.ts";

// Error constants
export { ERROR_CODES } from "./errors.ts";
