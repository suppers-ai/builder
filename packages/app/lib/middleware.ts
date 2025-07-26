import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { OAuthService } from "./oauth-service.ts";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Function to generate rate limit key
}

interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator = (req) => getClientIP(req) } = options;

  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }

    const current = rateLimitStore.get(key);
    
    if (!current) {
      // First request from this key
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return await ctx.next();
    }

    if (current.resetTime < now) {
      // Window has expired, reset
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return await ctx.next();
    }

    if (current.count >= maxRequests) {
      // Rate limit exceeded
      return new Response(JSON.stringify({
        error: "rate_limit_exceeded",
        error_description: "Too many requests. Please try again later.",
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil((current.resetTime - now) / 1000).toString(),
          "X-RateLimit-Limit": maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(current.resetTime / 1000).toString(),
        },
      });
    }

    // Increment counter
    current.count++;
    
    const response = await ctx.next();
    
    // Add rate limit headers to response
    response.headers.set("X-RateLimit-Limit", maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", (maxRequests - current.count).toString());
    response.headers.set("X-RateLimit-Reset", Math.ceil(current.resetTime / 1000).toString());
    
    return response;
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders(customHeaders: SecurityHeaders = {}) {
  const defaultHeaders: SecurityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    ...customHeaders,
  };

  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    const response = await ctx.next();
    
    // Add security headers
    for (const [header, value] of Object.entries(defaultHeaders)) {
      response.headers.set(header, value);
    }
    
    return response;
  };
}

/**
 * CORS middleware for OAuth endpoints
 */
export function corsMiddleware(allowedOrigins: string[] = ["*"]) {
  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    const origin = req.headers.get("Origin");
    
    // Handle preflight requests
    if (req.method === "OPTIONS") {
      const response = new Response(null, { status: 204 });
      
      if (origin && (allowedOrigins.includes("*") || allowedOrigins.includes(origin))) {
        response.headers.set("Access-Control-Allow-Origin", origin);
      }
      
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
      
      return response;
    }

    const response = await ctx.next();
    
    // Add CORS headers to actual response
    if (origin && (allowedOrigins.includes("*") || allowedOrigins.includes(origin))) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    
    response.headers.set("Access-Control-Allow-Credentials", "true");
    
    return response;
  };
}

/**
 * OAuth state validation middleware
 */
export function validateOAuthState() {
  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    if (req.method === "GET" && req.url.includes("/oauth/authorize")) {
      const url = new URL(req.url);
      const state = url.searchParams.get("state");
      
      if (state) {
        // Store state in session or validate against stored state
        // For now, we'll just validate that it's a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(state)) {
          return new Response(JSON.stringify({
            error: "invalid_request",
            error_description: "Invalid state parameter format",
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }
    
    return await ctx.next();
  };
}

/**
 * Token validation middleware for protected endpoints
 */
export function requireValidToken() {
  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        error: "unauthorized",
        error_description: "Bearer token required",
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'Bearer realm="oauth"',
        },
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const user = await OAuthService.validateToken(token);
      // Add user to context for use in handlers
      ctx.state.user = user;
      return await ctx.next();
    } catch (error) {
      return new Response(JSON.stringify({
        error: "invalid_token",
        error_description: error instanceof Error ? error.message : "Invalid token",
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'Bearer realm="oauth"',
        },
      });
    }
  };
}

/**
 * Session management middleware
 */
export function sessionManagement() {
  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    // Clean up expired tokens periodically
    if (Math.random() < 0.01) { // 1% chance to run cleanup
      try {
        const { supabase } = await import("./supabase-client.ts");
        
        // Clean up expired OAuth tokens
        await supabase
          .from("oauth_tokens")
          .delete()
          .lt("expires_at", new Date().toISOString());
        
        // Clean up expired OAuth codes
        await supabase
          .from("oauth_codes")
          .delete()
          .lt("expires_at", new Date().toISOString());
      } catch (error) {
        console.error("Failed to clean up expired tokens:", error);
      }
    }
    
    return await ctx.next();
  };
}

/**
 * Client validation middleware for OAuth endpoints
 */
export function validateOAuthClient() {
  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    if (req.method === "POST" && (req.url.includes("/oauth/token") || req.url.includes("/oauth/revoke"))) {
      try {
        const contentType = req.headers.get("content-type");
        let clientId: string;
        let clientSecret: string;

        if (contentType?.includes("application/json")) {
          const body = await req.json();
          clientId = body.client_id;
          clientSecret = body.client_secret;
        } else {
          const formData = await req.formData();
          clientId = formData.get("client_id")?.toString() || "";
          clientSecret = formData.get("client_secret")?.toString() || "";
        }

        if (!clientId || !clientSecret) {
          return new Response(JSON.stringify({
            error: "invalid_request",
            error_description: "client_id and client_secret are required",
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const client = await OAuthService.validateClientCredentials(clientId, clientSecret);
        if (!client) {
          return new Response(JSON.stringify({
            error: "invalid_client",
            error_description: "Invalid client credentials",
          }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Add client to context
        ctx.state.client = client;
      } catch (error) {
        return new Response(JSON.stringify({
          error: "server_error",
          error_description: "Failed to validate client",
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    
    return await ctx.next();
  };
}

/**
 * Utility function to get client IP address
 */
function getClientIP(req: Request): string {
  // Check various headers for the real IP
  const forwarded = req.headers.get("X-Forwarded-For");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("X-Real-IP");
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get("CF-Connecting-IP");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default value since we can't get the actual IP in this context
  return "unknown";
}

/**
 * Logging middleware for OAuth endpoints
 */
export function oauthLogging() {
  return async (req: Request, ctx: MiddlewareHandlerContext) => {
    const start = Date.now();
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;
    const clientIP = getClientIP(req);
    
    console.log(`[OAuth] ${method} ${path} - IP: ${clientIP}`);
    
    const response = await ctx.next();
    
    const duration = Date.now() - start;
    const status = response.status;
    
    console.log(`[OAuth] ${method} ${path} - ${status} (${duration}ms)`);
    
    return response;
  };
}