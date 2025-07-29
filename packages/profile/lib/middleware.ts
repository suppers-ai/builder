// Fresh 2.0 middleware types
type FreshContext = {
  next(): Promise<Response>;
  state: Record<string, unknown>;
};

type MiddlewareHandler = (req: Request, ctx: FreshContext) => Promise<Response>;
import { OAuthService } from "./oauth-service.ts";
import { OAUTH_ERRORS, SECURITY_CONFIG, SECURITY_HEADERS } from "./security-config.ts";

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Session state store for CSRF protection (in production, use Redis or similar)
const sessionStateStore = new Map<string, { state: string; timestamp: number }>();
const STATE_EXPIRY_MS = SECURITY_CONFIG.session.stateExpiry;

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
export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  const { windowMs, maxRequests, keyGenerator = (req) => getClientIP(req) } = options;

  return async (req: Request, ctx: FreshContext) => {
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
      return new Response(
        JSON.stringify({
          error: "rate_limit_exceeded",
          error_description: "Too many requests. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((current.resetTime - now) / 1000).toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(current.resetTime / 1000).toString(),
          },
        },
      );
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
export const securityHeaders = (customHeaders: SecurityHeaders = {}) => {
  const defaultHeaders: SecurityHeaders = {
    ...SECURITY_HEADERS,
    ...customHeaders,
  };

  return async (req: Request, ctx: any) => {
    const response = await ctx.next();

    // Add security headers
    for (const [header, value] of Object.entries(defaultHeaders)) {
      response.headers.set(header, value);
    }

    // Add HTTPS enforcement in production
    if (SECURITY_CONFIG.security.requireHttps && !req.url.startsWith("https://")) {
      const httpsUrl = req.url.replace("http://", "https://");
      return Response.redirect(httpsUrl, 301);
    }

    return response;
  };
};

/**
 * CORS middleware for OAuth endpoints
 */
export function corsMiddleware(allowedOrigins: string[] = ["*"]): MiddlewareHandler {
  return async (req: Request, ctx: FreshContext) => {
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
 * OAuth state validation middleware with CSRF protection
 */
export function validateOAuthState(): MiddlewareHandler {
  return async (req: Request, ctx: FreshContext) => {
    if (req.method === "GET" && req.url.includes("/oauth/authorize")) {
      const url = new URL(req.url);
      const state = url.searchParams.get("state");

      if (state) {
        // Validate state parameter format (should be a UUID for CSRF protection)
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(state)) {
          return new Response(
            JSON.stringify({
              error: "invalid_request",
              error_description:
                "Invalid state parameter format. State must be a valid UUID for CSRF protection.",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // Store state in session for validation during callback
        const sessionId = getSessionId(req);
        if (sessionId) {
          await storeStateForSession(sessionId, state);
        }
      } else {
        // State parameter is required for CSRF protection
        return new Response(
          JSON.stringify({
            error: "invalid_request",
            error_description: "State parameter is required for CSRF protection",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // Validate state on callback
    if (req.method === "POST" && req.url.includes("/oauth/authorize")) {
      const formData = await req.clone().formData();
      const state = formData.get("state")?.toString();

      if (state) {
        const sessionId = getSessionId(req);
        if (sessionId) {
          const isValidState = await validateStateForSession(sessionId, state);
          if (!isValidState) {
            return new Response(
              JSON.stringify({
                error: "invalid_request",
                error_description: "Invalid state parameter - possible CSRF attack",
              }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
          // Clean up used state
          await clearStateForSession(sessionId);
        }
      }
    }

    return await ctx.next();
  };
}

/**
 * Token validation middleware for protected endpoints
 */
export function requireValidToken(): MiddlewareHandler {
  return async (req: Request, ctx: FreshContext) => {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "unauthorized",
          error_description: "Bearer token required",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "WWW-Authenticate": 'Bearer realm="oauth"',
          },
        },
      );
    }

    const token = authHeader.substring(7);

    try {
      const user = await OAuthService.validateToken(token);
      // Add user to context for use in handlers
      ctx.state.user = user;
      return await ctx.next();
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "invalid_token",
          error_description: error instanceof Error ? error.message : "Invalid token",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "WWW-Authenticate": 'Bearer realm="oauth"',
          },
        },
      );
    }
  };
}

/**
 * Session management middleware
 */
export function sessionManagement(): MiddlewareHandler {
  return async (req: Request, ctx: FreshContext) => {
    // Clean up expired tokens periodically
    if (Math.random() < 0.01) { // 1% chance to run cleanup
      try {
        // TODO: Replace with API client calls
        const { apiClient } = await import("./api-client.ts");

        // TODO: Implement cleanup through API endpoints
        // Clean up expired OAuth tokens and codes should use API endpoints
        console.log("TODO: Implement token cleanup through API endpoints");
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
export function validateOAuthClient(): MiddlewareHandler {
  return async (req: Request, ctx: FreshContext) => {
    if (
      req.method === "POST" &&
      (req.url.includes("/oauth/token") || req.url.includes("/oauth/revoke"))
    ) {
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
          return new Response(
            JSON.stringify({
              error: "invalid_request",
              error_description: "client_id and client_secret are required",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const client = await OAuthService.validateClientCredentials(clientId, clientSecret);
        if (!client) {
          return new Response(
            JSON.stringify({
              error: "invalid_client",
              error_description: "Invalid client credentials",
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // Add client to context
        ctx.state.client = client;
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "server_error",
            error_description: "Failed to validate client",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
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
 * Session state management functions for CSRF protection
 */
function getSessionId(req: Request): string | null {
  // Try to get session ID from cookie or create a temporary one based on IP + User-Agent
  const cookies = req.headers.get("Cookie");
  if (cookies) {
    const sessionMatch = cookies.match(/session_id=([^;]+)/);
    if (sessionMatch) {
      return sessionMatch[1];
    }
  }

  // Fallback: create temporary session ID based on client info
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get("User-Agent") || "";
  return btoa(`${clientIP}:${userAgent}`).replace(/[^a-zA-Z0-9]/g, "").substring(0, 32);
}

async function storeStateForSession(sessionId: string, state: string): Promise<void> {
  // Clean up expired states
  const now = Date.now();
  for (const [key, value] of sessionStateStore.entries()) {
    if (value.timestamp + STATE_EXPIRY_MS < now) {
      sessionStateStore.delete(key);
    }
  }

  sessionStateStore.set(sessionId, { state, timestamp: now });
}

async function validateStateForSession(sessionId: string, state: string): Promise<boolean> {
  const stored = sessionStateStore.get(sessionId);
  if (!stored) {
    return false;
  }

  // Check if state has expired
  if (stored.timestamp + STATE_EXPIRY_MS < Date.now()) {
    sessionStateStore.delete(sessionId);
    return false;
  }

  return stored.state === state;
}

async function clearStateForSession(sessionId: string): Promise<void> {
  sessionStateStore.delete(sessionId);
}

/**
 * Enhanced session management middleware with token expiration and refresh logic
 */
export function enhancedSessionManagement(): MiddlewareHandler {
  return async (req: Request, ctx: FreshContext) => {
    // Clean up expired tokens and session states periodically
    if (Math.random() < 0.01) { // 1% chance to run cleanup
      try {
        // TODO: Replace with API client calls
        const { TokenManager } = await import("./token-manager.ts");

        // Clean up expired OAuth tokens and codes
        await TokenManager.cleanupExpiredTokens();

        // Clean up expired session states
        const now = Date.now();
        for (const [key, value] of sessionStateStore.entries()) {
          if (value.timestamp + STATE_EXPIRY_MS < now) {
            sessionStateStore.delete(key);
          }
        }
      } catch (error) {
        console.error("Failed to clean up expired tokens and states:", error);
      }
    }

    return await ctx.next();
  };
}

/**
 * Token expiration and refresh middleware
 */
export function tokenExpirationMiddleware(): MiddlewareHandler {
  return async (req: Request, ctx: FreshContext) => {
    const authHeader = req.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        const { TokenManager } = await import("./token-manager.ts");
        const validation = await TokenManager.validateTokenWithTiming(token);

        if (validation.valid && validation.shouldRefresh) {
          // Add refresh suggestion to response headers
          const response = await ctx.next();
          response.headers.set("X-Token-Refresh-Suggested", "true");
          response.headers.set("X-Token-Expires-In", validation.expiresIn?.toString() || "0");
          return response;
        }
      } catch (error) {
        // Token validation failed, let the next middleware handle it
      }
    }

    return await ctx.next();
  };
}

/**
 * Brute force protection middleware for authentication endpoints
 */
export function bruteForceProtection(): MiddlewareHandler {
  const attemptStore = new Map<
    string,
    { attempts: number; lastAttempt: number; blockedUntil?: number }
  >();
  const MAX_ATTEMPTS = SECURITY_CONFIG.oauth.maxAuthAttempts;
  const BLOCK_DURATION_MS = SECURITY_CONFIG.oauth.blockDuration;
  const ATTEMPT_WINDOW_MS = SECURITY_CONFIG.oauth.authAttemptWindow;

  return async (req: Request, ctx: FreshContext) => {
    if (req.method === "POST" && (req.url.includes("/login") || req.url.includes("/oauth/token"))) {
      const clientIP = getClientIP(req);
      const now = Date.now();
      const attempts = attemptStore.get(clientIP);

      // Check if IP is currently blocked
      if (attempts?.blockedUntil && attempts.blockedUntil > now) {
        return new Response(
          JSON.stringify({
            error: "too_many_attempts",
            error_description: "Too many failed attempts. Please try again later.",
            retry_after: Math.ceil((attempts.blockedUntil - now) / 1000),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": Math.ceil((attempts.blockedUntil - now) / 1000).toString(),
            },
          },
        );
      }

      const response = await ctx.next();

      // Track failed attempts (4xx responses except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        const current = attemptStore.get(clientIP) || { attempts: 0, lastAttempt: 0 };

        // Reset attempts if last attempt was more than the window ago
        if (now - current.lastAttempt > ATTEMPT_WINDOW_MS) {
          current.attempts = 1;
        } else {
          current.attempts++;
        }

        current.lastAttempt = now;

        // Block if too many attempts
        if (current.attempts >= MAX_ATTEMPTS) {
          current.blockedUntil = now + BLOCK_DURATION_MS;
        }

        attemptStore.set(clientIP, current);
      } else if (response.status >= 200 && response.status < 300) {
        // Clear attempts on successful authentication
        attemptStore.delete(clientIP);
      }

      return response;
    }

    return await ctx.next();
  };
}

/**
 * Logging middleware for OAuth endpoints
 */
export function oauthLogging(): MiddlewareHandler {
  return async (req: Request, ctx: FreshContext) => {
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
