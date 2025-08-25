/**
 * CORS utilities for API handlers
 */

import { config, configManager } from './config.ts';

/**
 * Generate CORS headers based on configuration
 */
export function getCorsHeaders(origin?: string | null): HeadersInit {
  const allowedOrigins = config.cors.allowedOrigins;
  
  // Default headers
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (configManager.isDevelopment() && origin?.startsWith('http://localhost')) {
    // In development, allow any localhost origin
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * Handle preflight OPTIONS requests
 */
export function handleOptionsRequest(request: Request): Response {
  const origin = request.headers.get('origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * Add CORS headers to an existing response
 */
export function addCorsHeaders(response: Response, request: Request): Response {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Clone the response and add CORS headers
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (typeof value === 'string') {
      newHeaders.set(key, value);
    }
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// Legacy export for backward compatibility
export const corsHeaders = getCorsHeaders();