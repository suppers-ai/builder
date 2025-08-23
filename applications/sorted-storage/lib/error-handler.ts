/**
 * Error handling utilities for sorted-storage application
 * Implements requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

import type {
  ERROR_CODES,
  ErrorCode,
  ErrorContext,
  ErrorHandlingResult,
  ErrorNotification,
  ErrorRecovery,
  NetworkError,
  NotificationAction,
  PermissionError,
  RetryConfig,
  StorageError,
  StorageErrorType,
  StorageQuotaError,
  UploadError,
  ValidationError,
} from "../types/errors.ts";
import { toastManager } from "./toast-manager.ts";

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ["network", "server_error", "rate_limit"],
};

// Error message templates for user-friendly messages
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Upload errors
  FILE_TOO_LARGE: "The file is too large. Please choose a smaller file.",
  INVALID_FILE_TYPE: "This file type is not supported. Please choose a different file.",
  UPLOAD_INTERRUPTED: "Upload was interrupted. Please try again.",
  STORAGE_QUOTA_EXCEEDED: "Storage quota exceeded. Please free up space or upgrade your plan.",

  // Permission errors
  UNAUTHORIZED: "You need to sign in to access this content.",
  FORBIDDEN: "You don't have permission to access this content.",
  SHARE_TOKEN_EXPIRED: "This share link has expired. Please request a new one.",
  SHARE_TOKEN_INVALID: "This share link is invalid or has been revoked.",

  // Network errors
  CONNECTION_TIMEOUT: "Connection timed out. Please check your internet connection.",
  NETWORK_UNAVAILABLE: "Unable to connect to the server. Please try again later.",
  RATE_LIMITED: "Too many requests. Please wait a moment before trying again.",
  SERVER_ERROR: "Server error occurred. Please try again later.",

  // Validation errors
  INVALID_FILE_NAME: "File name contains invalid characters. Please rename the file.",
  INVALID_FOLDER_NAME: "Folder name contains invalid characters. Please choose a different name.",
  DUPLICATE_NAME: "A file or folder with this name already exists.",
  INVALID_METADATA: "Invalid metadata provided. Please check your input.",

  // Resource errors
  FILE_NOT_FOUND: "The requested file could not be found.",
  FOLDER_NOT_FOUND: "The requested folder could not be found.",
  FOLDER_NOT_EMPTY: "Cannot delete folder because it contains files or subfolders.",
  CIRCULAR_REFERENCE: "Cannot move folder into itself or its subfolder.",
};

// Recovery suggestions for different error types
const RECOVERY_SUGGESTIONS: Record<StorageErrorType, string[]> = {
  upload: [
    "Check your internet connection",
    "Ensure the file is not corrupted",
    "Try uploading a smaller file",
    "Clear browser cache and try again",
  ],
  download: [
    "Check your internet connection",
    "Try refreshing the page",
    "Clear browser cache",
    "Contact support if the problem persists",
  ],
  delete: [
    "Refresh the page and try again",
    "Check if you have permission to delete this item",
    "Ensure the item is not currently being used",
  ],
  share: [
    "Check your internet connection",
    "Verify the share settings",
    "Try generating a new share link",
  ],
  network: [
    "Check your internet connection",
    "Try refreshing the page",
    "Wait a moment and try again",
    "Contact support if the problem persists",
  ],
  permission: [
    "Sign in to your account",
    "Contact the owner for access",
    "Check if the link has expired",
  ],
  validation: [
    "Check your input for errors",
    "Ensure all required fields are filled",
    "Use valid characters in names",
  ],
  storage_quota: [
    "Delete some files to free up space",
    "Upgrade your storage plan",
    "Contact support for assistance",
  ],
  file_not_found: [
    "Check if the file was moved or deleted",
    "Refresh the page",
    "Go back to the main folder",
  ],
  folder_not_empty: [
    "Delete all files in the folder first",
    "Move files to another location",
    "Use the 'Delete All' option if available",
  ],
  authentication: [
    "Sign in to your account",
    "Clear browser cookies and sign in again",
    "Contact support if you can't access your account",
  ],
  rate_limit: [
    "Wait a few minutes before trying again",
    "Reduce the frequency of your requests",
    "Contact support if you need higher limits",
  ],
  server_error: [
    "Try again in a few minutes",
    "Check our status page for updates",
    "Contact support if the problem persists",
  ],
  unknown: [
    "Try refreshing the page",
    "Clear browser cache",
    "Contact support with error details",
  ],
};

class ErrorHandler {
  private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;
  private retryAttempts = new Map<string, number>();

  /**
   * Handle any error and provide appropriate user feedback
   */
  handleError(error: Error | StorageError, context?: ErrorContext): ErrorHandlingResult {
    const storageError = this.normalizeError(error, context);
    const recovery = this.getRecoveryOptions(storageError);
    const userMessage = this.getUserFriendlyMessage(storageError);

    // Log error for debugging
    this.logError(storageError, context);

    // Show user notification
    this.showUserNotification(storageError, recovery);

    return {
      handled: true,
      recovery,
      userMessage,
      logLevel: this.getLogLevel(storageError),
      shouldReport: this.shouldReportError(storageError),
    };
  }

  /**
   * Handle network errors with retry logic
   */
  async handleNetworkError(
    error: Error,
    operation: () => Promise<any>,
    context?: ErrorContext,
  ): Promise<any> {
    const networkError = this.createNetworkError(error, context);
    const operationId = context?.operation || "unknown";

    const attempts = this.retryAttempts.get(operationId) || 0;

    if (attempts < this.retryConfig.maxAttempts && this.isRetryable(networkError)) {
      this.retryAttempts.set(operationId, attempts + 1);

      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempts),
        this.retryConfig.maxDelay,
      );

      // Show retry notification
      toastManager.info(`Retrying in ${Math.ceil(delay / 1000)} seconds...`, {
        duration: delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        const result = await operation();
        this.retryAttempts.delete(operationId);
        return result;
      } catch (retryError) {
        return this.handleNetworkError(retryError as Error, operation, context);
      }
    } else {
      // Max retries reached
      this.retryAttempts.delete(operationId);
      this.handleError(networkError, context);
      throw networkError;
    }
  }

  /**
   * Handle upload errors with specific feedback
   */
  handleUploadError(error: Error, fileInfo?: { name: string; size: number }): UploadError {
    const uploadError: UploadError = {
      type: "upload",
      message: error.message,
      details: { fileInfo },
      recoverable: true,
      timestamp: new Date().toISOString(),
      fileName: fileInfo?.name,
      fileSize: fileInfo?.size,
    };

    // Determine specific upload error type
    if (error.message.includes("size") || error.message.includes("large")) {
      uploadError.message = ERROR_MESSAGES.FILE_TOO_LARGE;
    } else if (error.message.includes("type") || error.message.includes("format")) {
      uploadError.message = ERROR_MESSAGES.INVALID_FILE_TYPE;
    } else if (error.message.includes("quota") || error.message.includes("space")) {
      uploadError.message = ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED;
    }

    this.handleError(uploadError);
    return uploadError;
  }

  /**
   * Handle permission errors
   */
  handlePermissionError(error: Error, resource?: { type: string; id: string }): PermissionError {
    const permissionError: PermissionError = {
      type: "permission",
      message: this.getPermissionErrorMessage(error),
      details: { resource },
      recoverable: false,
      timestamp: new Date().toISOString(),
      requiredPermission: "read", // Default, should be determined from context
      resourceId: resource?.id,
    };

    this.handleError(permissionError);
    return permissionError;
  }

  /**
   * Create user-friendly error notifications
   */
  private showUserNotification(error: StorageError, recovery?: ErrorRecovery): void {
    const actions: NotificationAction[] = [];

    // Add retry action if recoverable
    if (recovery?.canRetry) {
      actions.push({
        label: "Retry",
        action: () => {
          // This would trigger a retry of the failed operation
          globalThis.location.reload();
        },
        style: "primary",
      });
    }

    // Add alternative action if available
    if (recovery?.alternativeAction) {
      actions.push({
        label: recovery.alternativeAction,
        action: () => {
          // This would trigger the alternative action
          console.log("Alternative action triggered");
        },
        style: "secondary",
      });
    }

    const notification: ErrorNotification = {
      id: crypto.randomUUID(),
      type: error.type === "network" ? "warning" : "error",
      title: this.getErrorTitle(error),
      message: error.message,
      actions: actions.length > 0 ? actions : undefined,
      autoClose: error.type !== "permission", // Keep permission errors visible
      duration: error.type === "permission" ? undefined : 8000,
    };

    // Show toast notification
    toastManager.show(notification.message, {
      type: notification.type,
      duration: notification.duration,
      dismissible: true,
    });
  }

  /**
   * Normalize any error to StorageError format
   */
  private normalizeError(error: Error | StorageError, context?: ErrorContext): StorageError {
    if ("type" in error && error.type) {
      return error as StorageError;
    }

    // Determine error type from error message
    const errorType = this.determineErrorType(error as Error);

    return {
      type: errorType,
      message: error.message,
      details: { originalError: error },
      recoverable: this.isRecoverable(errorType),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Determine error type from error message and context
   */
  private determineErrorType(error: Error): StorageErrorType {
    const message = error.message.toLowerCase();

    if (
      message.includes("fetch") || message.includes("network") || message.includes("connection")
    ) {
      return "network";
    }
    if (message.includes("unauthorized") || message.includes("401")) {
      return "authentication";
    }
    if (message.includes("forbidden") || message.includes("403")) {
      return "permission";
    }
    if (message.includes("not found") || message.includes("404")) {
      return "file_not_found";
    }
    if (message.includes("quota") || message.includes("space")) {
      return "storage_quota";
    }
    if (message.includes("upload")) {
      return "upload";
    }
    if (message.includes("validation") || message.includes("invalid")) {
      return "validation";
    }

    return "unknown";
  }

  /**
   * Get recovery options for an error
   */
  private getRecoveryOptions(error: StorageError): ErrorRecovery {
    const canRetry = this.isRetryable(error);

    return {
      canRetry,
      retryDelay: canRetry ? this.retryConfig.baseDelay : undefined,
      maxRetries: canRetry ? this.retryConfig.maxAttempts : undefined,
      alternativeAction: this.getAlternativeAction(error),
      userAction: RECOVERY_SUGGESTIONS[error.type]?.[0],
    };
  }

  /**
   * Check if an error is retryable
   */
  private isRetryable(error: StorageError): boolean {
    return this.retryConfig.retryableErrors.includes(error.type);
  }

  /**
   * Check if an error type is generally recoverable
   */
  private isRecoverable(errorType: StorageErrorType): boolean {
    const nonRecoverableTypes: StorageErrorType[] = [
      "permission",
      "authentication",
      "file_not_found",
      "validation",
    ];
    return !nonRecoverableTypes.includes(errorType);
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: StorageError): string {
    // Try to find a specific message for known error codes
    const errorCode = this.extractErrorCode(error);
    if (errorCode && ERROR_MESSAGES[errorCode]) {
      return ERROR_MESSAGES[errorCode];
    }

    // Fallback to generic messages based on error type
    switch (error.type) {
      case "network":
        return "Connection problem. Please check your internet and try again.";
      case "upload":
        return "Upload failed. Please try uploading the file again.";
      case "permission":
        return "You don't have permission to perform this action.";
      case "storage_quota":
        return "Storage quota exceeded. Please free up space.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  /**
   * Extract error code from error details
   */
  private extractErrorCode(error: StorageError): ErrorCode | null {
    if (error.details?.code && typeof error.details.code === "string") {
      return error.details.code as ErrorCode;
    }
    return null;
  }

  /**
   * Get error title for notifications
   */
  private getErrorTitle(error: StorageError): string {
    switch (error.type) {
      case "upload":
        return "Upload Failed";
      case "download":
        return "Download Failed";
      case "network":
        return "Connection Problem";
      case "permission":
        return "Access Denied";
      case "storage_quota":
        return "Storage Full";
      default:
        return "Error";
    }
  }

  /**
   * Get alternative action for error recovery
   */
  private getAlternativeAction(error: StorageError): string | undefined {
    switch (error.type) {
      case "upload":
        return "Choose Different File";
      case "permission":
        return "Request Access";
      case "file_not_found":
        return "Go Back";
      default:
        return undefined;
    }
  }

  /**
   * Create network error from generic error
   */
  private createNetworkError(error: Error, context?: ErrorContext): NetworkError {
    return {
      type: "network",
      message: error.message,
      details: { originalError: error, context },
      recoverable: true,
      timestamp: new Date().toISOString(),
      retryable: true,
    };
  }

  /**
   * Get permission error message
   */
  private getPermissionErrorMessage(error: Error): string {
    if (error.message.includes("401")) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    if (error.message.includes("403")) {
      return ERROR_MESSAGES.FORBIDDEN;
    }
    if (error.message.includes("token")) {
      return ERROR_MESSAGES.SHARE_TOKEN_INVALID;
    }
    return ERROR_MESSAGES.FORBIDDEN;
  }

  /**
   * Determine log level for error
   */
  private getLogLevel(error: StorageError): "debug" | "info" | "warn" | "error" | "fatal" {
    switch (error.type) {
      case "validation":
        return "warn";
      case "permission":
      case "authentication":
        return "warn";
      case "network":
        return "info";
      case "server_error":
        return "error";
      default:
        return "error";
    }
  }

  /**
   * Determine if error should be reported to monitoring service
   */
  private shouldReportError(error: StorageError): boolean {
    const nonReportableTypes: StorageErrorType[] = [
      "validation",
      "permission",
      "authentication",
    ];
    return !nonReportableTypes.includes(error.type);
  }

  /**
   * Log error for debugging
   */
  private logError(error: StorageError, context?: ErrorContext): void {
    const logLevel = this.getLogLevel(error);
    const logData = {
      error,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? globalThis.location.href : "unknown",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    };

    switch (logLevel) {
      case "debug":
        console.debug("Storage Error:", logData);
        break;
      case "info":
        console.info("Storage Error:", logData);
        break;
      case "warn":
        console.warn("Storage Error:", logData);
        break;
      case "error":
        console.error("Storage Error:", logData);
        break;
      case "fatal":
        console.error("FATAL Storage Error:", logData);
        break;
    }
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Convenience functions for common error scenarios
export const handleError = (error: Error | StorageError, context?: ErrorContext) =>
  errorHandler.handleError(error, context);

export const handleNetworkError = (
  error: Error,
  operation: () => Promise<any>,
  context?: ErrorContext,
) => errorHandler.handleNetworkError(error, operation, context);

export const handleUploadError = (error: Error, fileInfo?: { name: string; size: number }) =>
  errorHandler.handleUploadError(error, fileInfo);

export const handlePermissionError = (error: Error, resource?: { type: string; id: string }) =>
  errorHandler.handlePermissionError(error, resource);

// Toast convenience functions (re-exported for compatibility)
export const showError = (
  message: string,
  options?: { duration?: number; recoverable?: boolean },
) => {
  return toastManager.error(message, { duration: options?.duration });
};

export const showSuccess = (message: string, options?: { duration?: number }) => {
  return toastManager.success(message, options);
};

export const showWarning = (message: string, options?: { duration?: number }) => {
  return toastManager.warning(message, options);
};

export const showInfo = (message: string, options?: { duration?: number }) => {
  return toastManager.info(message, options);
};
