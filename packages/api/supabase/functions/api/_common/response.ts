/**
 * Response utilities for consistent API responses
 */

import { getCorsHeaders } from './cors.ts';
import { ApiError } from './errors.ts';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    version?: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Create a successful JSON response
 */
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    headers?: HeadersInit;
    meta?: Record<string, unknown>;
    origin?: string;
  }
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...options?.meta,
    },
  };

  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  
  // Add CORS headers
  const corsHeaders = getCorsHeaders(options?.origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  });

  return new Response(JSON.stringify(response), {
    status: options?.status || 200,
    headers,
  });
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  error: Error | ApiError | string,
  options?: {
    status?: number;
    headers?: HeadersInit;
    details?: unknown;
    origin?: string | null;
  }
): Response {
  let errorCode = 'INTERNAL_ERROR';
  let errorMessage = 'An unexpected error occurred';
  let statusCode = options?.status || 500;

  if (error instanceof ApiError) {
    errorCode = error.code;
    errorMessage = error.message;
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      details: options?.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  
  // Add CORS headers
  const corsHeaders = getCorsHeaders(options?.origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  });

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers,
  });
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  },
  options?: {
    headers?: HeadersInit;
    meta?: Record<string, unknown>;
    origin?: string | null;
  }
): Response {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...options?.meta,
    },
  };

  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  
  // Add CORS headers
  const corsHeaders = getCorsHeaders(options?.origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  });

  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(options?: {
  headers?: HeadersInit;
  origin?: string | null;
}): Response {
  const headers = new Headers(options?.headers);
  
  // Add CORS headers
  const corsHeaders = getCorsHeaders(options?.origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  });

  return new Response(null, {
    status: 204,
    headers,
  });
}

/**
 * Create a redirect response
 */
export function redirectResponse(
  location: string,
  options?: {
    permanent?: boolean;
    headers?: HeadersInit;
    origin?: string | null;
  }
): Response {
  const headers = new Headers(options?.headers);
  headers.set('Location', location);
  
  // Add CORS headers
  const corsHeaders = getCorsHeaders(options?.origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  });

  return new Response(null, {
    status: options?.permanent ? 301 : 302,
    headers,
  });
}

/**
 * Stream response for large data
 */
export function streamResponse(
  stream: ReadableStream,
  options?: {
    contentType?: string;
    headers?: HeadersInit;
    origin?: string | null;
  }
): Response {
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', options?.contentType || 'application/octet-stream');
  
  // Add CORS headers
  const corsHeaders = getCorsHeaders(options?.origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  });

  return new Response(stream, {
    status: 200,
    headers,
  });
}

/**
 * Common error responses - convenience methods
 */
export const errorResponses = {
  badRequest: (message = 'Bad request', origin?: string | null) =>
    errorResponse(message, { status: 400, origin }),
  
  unauthorized: (message = 'Unauthorized', origin?: string | null) =>
    errorResponse(message, { status: 401, origin }),
  
  forbidden: (message = 'Forbidden', origin?: string | null) =>
    errorResponse(message, { status: 403, origin }),
  
  notFound: (message = 'Not found', origin?: string | null) =>
    errorResponse(message, { status: 404, origin }),
  
  methodNotAllowed: (message = 'Method not allowed', origin?: string | null) =>
    errorResponse(message, { status: 405, origin }),
  
  conflict: (message = 'Conflict', origin?: string | null) =>
    errorResponse(message, { status: 409, origin }),
  
  unprocessableEntity: (message = 'Unprocessable entity', origin?: string | null) =>
    errorResponse(message, { status: 422, origin }),
  
  tooManyRequests: (message = 'Too many requests', origin?: string | null) =>
    errorResponse(message, { status: 429, origin }),
  
  internalServerError: (message = 'Internal server error', origin?: string | null) =>
    errorResponse(message, { status: 500, origin }),
  
  notImplemented: (message = 'Not implemented', origin?: string | null) =>
    errorResponse(message, { status: 501, origin }),
  
  serviceUnavailable: (message = 'Service unavailable', origin?: string | null) =>
    errorResponse(message, { status: 503, origin }),
};

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse<T>(
  data: T,
  options?: {
    status?: number;
    origin?: string | null;
  }
): Response {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  // Add CORS headers
  const corsHeaders = getCorsHeaders(options?.origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  });

  return new Response(JSON.stringify(data), {
    status: options?.status || 200,
    headers,
  });
}