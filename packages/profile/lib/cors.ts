import config from "../../../config.ts";

/**
 * Get allowed origins for CORS headers
 * Currently reads from config.ts, future enhancement could check applications table
 */
function getAllowedOrigins(): string[] {
  // TODO: Add functionality to check applications table in database for dynamic origins
  const staticOrigins = [
    config.profileUrl, // http://localhost:8001
    config.docsUrl, // http://localhost:8002
    config.storeUrl, // http://localhost:8000
    config.cdnUrl, // http://localhost:8003
  ];

  return staticOrigins;
}

/**
 * Create CORS headers with proper origin validation
 * When credentials are included, specific origins must be used instead of wildcards
 */
export function createCORSHeaders(requestOrigin?: string | null): HeadersInit {
  const allowedOrigins = getAllowedOrigins();

  // Check if request origin is in allowed list
  const isAllowedOrigin = requestOrigin && allowedOrigins.includes(requestOrigin);

  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": isAllowedOrigin ? requestOrigin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

/**
 * Create CORS headers for preflight OPTIONS requests
 */
export function createPreflightCORSHeaders(requestOrigin?: string | null): HeadersInit {
  const corsHeaders = createCORSHeaders(requestOrigin);
  // Remove Content-Type for preflight
  delete (corsHeaders as any)["Content-Type"];
  return corsHeaders;
}
