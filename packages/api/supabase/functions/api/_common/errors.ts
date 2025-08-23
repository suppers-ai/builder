/**
 * Error handling utilities for API
 */

/**
 * Custom API Error class with status codes and error codes
 */
export class ApiError extends Error {
  public code: string;
  public statusCode: number;
  public details?: unknown;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Common API errors
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFLICT', 409, details);
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, details);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
  }
}

/**
 * Error handler wrapper for async functions
 */
export async function handleAsync<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: Error) => Error | void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      const handled = errorHandler(error as Error);
      if (handled) throw handled;
    }
    throw error;
  }
}

/**
 * Convert unknown errors to ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('duplicate key')) {
      return new ConflictError('Resource already exists');
    }
    if (error.message.includes('violates foreign key')) {
      return new ValidationError('Invalid reference');
    }
    if (error.message.includes('JWT')) {
      return new UnauthorizedError('Invalid authentication token');
    }

    return new InternalServerError(error.message);
  }

  if (typeof error === 'string') {
    return new InternalServerError(error);
  }

  return new InternalServerError('An unexpected error occurred');
}

/**
 * Error logging utility
 */
export function logError(error: Error | ApiError, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    error: {
      name: error.name,
      message: error.message,
      code: error instanceof ApiError ? error.code : 'UNKNOWN',
      statusCode: error instanceof ApiError ? error.statusCode : 500,
      stack: error.stack,
    },
    context,
  };

  if (error instanceof ApiError && error.statusCode >= 500) {
    console.error('API Error:', JSON.stringify(errorInfo, null, 2));
  } else {
    console.warn('API Warning:', JSON.stringify(errorInfo, null, 2));
  }
}