/**
 * Response utilities for consistent API responses
 * Re-exports from common utilities for backward compatibility
 */

import {
  successResponse,
  errorResponse,
  getCorsHeaders,
} from './_common/index.ts';

// Legacy exports for backward compatibility
export const corsHeaders = getCorsHeaders();

export function createResponse<T>(data: T, status = 200): Response {
  return successResponse(data, { status });
}

export function createErrorResponse(
  error: string,
  status = 500,
  code?: string,
  message?: string
): Response {
  const details: any = {};
  if (code) details.code = code;
  if (message) details.message = message;
  
  return errorResponse(error, { status, details });
}

export function createSuccessResponse(message?: string): Response {
  return successResponse({ success: true, message });
}

export function createValidationErrorResponse(errors: Record<string, string>): Response {
  return errorResponse('Validation failed', {
    status: 400,
    details: errors,
  });
}

export function createUnauthorizedResponse(message = 'Unauthorized'): Response {
  return errorResponse(message, { status: 401 });
}

export function createForbiddenResponse(message = 'Forbidden'): Response {
  return errorResponse(message, { status: 403 });
}

export function createNotFoundResponse(message = 'Not found'): Response {
  return errorResponse(message, { status: 404 });
}

export function createSessionExpiredResponse(): Response {
  return errorResponse('Your session has expired. Please log in again.', {
    status: 401,
    details: { code: 'token_expired' },
  });
}