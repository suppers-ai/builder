/**
 * CORS Utilities
 * Common CORS headers and response helpers for API endpoints
 */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
};

export const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

/**
 * Handle CORS preflight requests
 */
export function handleCorsOptions(): Response {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * Create a JSON response with CORS headers
 */
export function createJsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders,
  });
}

/**
 * Create an error response with CORS headers
 */
export function createErrorResponse(message: string, status: number = 500, details?: any): Response {
  return new Response(JSON.stringify({
    error: message,
    details,
  }), {
    status,
    headers: jsonHeaders,
  });
}

/**
 * Create a success response with CORS headers
 */
export function createSuccessResponse(data: any, message?: string): Response {
  return new Response(JSON.stringify({
    success: true,
    data,
    message,
  }), {
    status: 200,
    headers: jsonHeaders,
  });
}