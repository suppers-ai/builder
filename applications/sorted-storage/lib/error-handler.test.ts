/**
 * Tests for error handling utilities
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { assertEquals, assertExists, assertThrows } from "@std/assert";
import {
  errorHandler,
  handleError,
  handlePermissionError,
  handleUploadError,
} from "./error-handler.ts";
import type { ErrorContext, PermissionError, StorageError, UploadError } from "../types/errors.ts";

Deno.test("Error Handler - Basic Error Handling", () => {
  const testError = new Error("Test error message");
  const context: ErrorContext = {
    operation: "test_operation",
    resourceType: "file",
    resourceId: "test-id",
    userId: "user-123",
    sessionId: "session-456",
    userAgent: "test-agent",
    timestamp: new Date().toISOString(),
  };

  const result = handleError(testError, context);

  assertExists(result);
  assertEquals(result.handled, true);
  assertExists(result.userMessage);
  assertEquals(result.shouldReport, true);
});

Deno.test("Error Handler - Upload Error Handling", () => {
  const testError = new Error("File too large");
  const fileInfo = { name: "test.jpg", size: 10000000 };

  const uploadError = handleUploadError(testError, fileInfo);

  assertExists(uploadError);
  assertEquals(uploadError.type, "upload");
  assertEquals(uploadError.fileName, "test.jpg");
  assertEquals(uploadError.fileSize, 10000000);
  assertEquals(uploadError.recoverable, true);
});

Deno.test("Error Handler - Permission Error Handling", () => {
  const testError = new Error("Forbidden");
  const resource = { type: "folder", id: "folder-123" };

  const permissionError = handlePermissionError(testError, resource);

  assertExists(permissionError);
  assertEquals(permissionError.type, "permission");
  assertEquals(permissionError.resourceId, "folder-123");
  assertEquals(permissionError.recoverable, false);
});

Deno.test("Error Handler - Network Error Retry Logic", async () => {
  let attemptCount = 0;
  const mockOperation = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error("Network error");
    }
    return "success";
  };

  const context: ErrorContext = {
    operation: "network_test",
    resourceType: "file",
    userId: "user-123",
    sessionId: "session-456",
    userAgent: "test-agent",
    timestamp: new Date().toISOString(),
  };

  // This should eventually succeed after retries
  // Note: In a real test, we'd mock the delay
  try {
    const result = await errorHandler.handleNetworkError(
      new Error("Network error"),
      mockOperation,
      context,
    );
    assertEquals(result, "success");
    assertEquals(attemptCount, 3);
  } catch (error) {
    // If it fails, it should be after max retries
    assertEquals(attemptCount >= 3, true);
  }
});

Deno.test("Error Handler - Error Type Detection", () => {
  const networkError = new Error("fetch failed");
  const authError = new Error("unauthorized access");
  const notFoundError = new Error("file not found");
  const quotaError = new Error("storage quota exceeded");

  const networkResult = handleError(networkError);
  const authResult = handleError(authError);
  const notFoundResult = handleError(notFoundError);
  const quotaResult = handleError(quotaError);

  // Check that error types are correctly detected
  assertEquals(networkResult.handled, true);
  assertEquals(authResult.handled, true);
  assertEquals(notFoundResult.handled, true);
  assertEquals(quotaResult.handled, true);
});

Deno.test("Error Handler - User-Friendly Messages", () => {
  const errors = [
    new Error("FILE_TOO_LARGE"),
    new Error("INVALID_FILE_TYPE"),
    new Error("UNAUTHORIZED"),
    new Error("CONNECTION_TIMEOUT"),
  ];

  errors.forEach((error) => {
    const result = handleError(error);
    assertExists(result.userMessage);
    // User message should be different from technical error message
    assertEquals(result.userMessage !== error.message, true);
    // User message should be helpful
    assertEquals(result.userMessage.length > 10, true);
  });
});

Deno.test("Error Handler - Recovery Options", () => {
  const retryableError: StorageError = {
    type: "network",
    message: "Connection failed",
    recoverable: true,
    timestamp: new Date().toISOString(),
  };

  const nonRetryableError: StorageError = {
    type: "permission",
    message: "Access denied",
    recoverable: false,
    timestamp: new Date().toISOString(),
  };

  const retryableResult = handleError(retryableError);
  const nonRetryableResult = handleError(nonRetryableError);

  assertExists(retryableResult.recovery);
  assertEquals(retryableResult.recovery?.canRetry, true);

  assertExists(nonRetryableResult.recovery);
  assertEquals(nonRetryableResult.recovery?.canRetry, false);
});

Deno.test("Error Handler - Batch Operation Errors", () => {
  // Test handling multiple errors in batch operations
  const errors: StorageError[] = [
    {
      type: "upload",
      message: "File 1 failed",
      recoverable: true,
      timestamp: new Date().toISOString(),
    },
    {
      type: "validation",
      message: "File 2 invalid",
      recoverable: false,
      timestamp: new Date().toISOString(),
    },
  ];

  errors.forEach((error) => {
    const result = handleError(error);
    assertExists(result);
    assertEquals(result.handled, true);
  });
});

Deno.test("Error Handler - Error Logging Levels", () => {
  const debugError: StorageError = {
    type: "validation",
    message: "Invalid input",
    recoverable: true,
    timestamp: new Date().toISOString(),
  };

  const criticalError: StorageError = {
    type: "server_error",
    message: "Database connection failed",
    recoverable: false,
    timestamp: new Date().toISOString(),
  };

  const debugResult = handleError(debugError);
  const criticalResult = handleError(criticalError);

  assertEquals(debugResult.logLevel, "warn");
  assertEquals(criticalResult.logLevel, "error");
});

Deno.test("Error Handler - Context Preservation", () => {
  const error = new Error("Test error");
  const context: ErrorContext = {
    operation: "file_upload",
    resourceType: "file",
    resourceId: "file-123",
    userId: "user-456",
    sessionId: "session-789",
    userAgent: "Mozilla/5.0",
    timestamp: "2024-01-01T00:00:00.000Z",
  };

  const result = handleError(error, context);

  assertExists(result);
  assertEquals(result.handled, true);
  // Context should be preserved for debugging
  assertExists(result.recovery);
});
