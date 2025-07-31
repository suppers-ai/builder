/**
 * Security configuration for OAuth and authentication endpoints
 */
import { PORTS } from "../../shared/constants/ports.ts";

export interface SecurityConfig {
  oauth: {
    stateExpiry: number;
    codeExpiry: number;
    tokenExpiry: number;
    refreshTokenExpiry: number;
    maxAuthAttempts: number;
    authAttemptWindow: number;
    blockDuration: number;
  };
  rateLimit: {
    authorize: { windowMs: number; maxRequests: number };
    token: { windowMs: number; maxRequests: number };
    userinfo: { windowMs: number; maxRequests: number };
    validate: { windowMs: number; maxRequests: number };
    revoke: { windowMs: number; maxRequests: number };
  };
  session: {
    cleanupInterval: number;
    stateExpiry: number;
  };
  security: {
    requireHttps: boolean;
    allowedOrigins: string[];
    csrfProtection: boolean;
    bruteForceProtection: boolean;
  };
}

export const SECURITY_CONFIG: SecurityConfig = {
  oauth: {
    stateExpiry: 10 * 60 * 1000, // 10 minutes
    codeExpiry: 10 * 60 * 1000, // 10 minutes
    tokenExpiry: 60 * 60 * 1000, // 1 hour
    refreshTokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxAuthAttempts: 5,
    authAttemptWindow: 60 * 1000, // 1 minute
    blockDuration: 15 * 60 * 1000, // 15 minutes
  },
  rateLimit: {
    authorize: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 minutes
    token: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per minute
    userinfo: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
    validate: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 per minute
    revoke: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
  },
  session: {
    cleanupInterval: 60 * 60 * 1000, // 1 hour
    stateExpiry: 10 * 60 * 1000, // 10 minutes
  },
  security: {
    requireHttps: Deno.env.get("DENO_ENV") === "production",
    allowedOrigins: [
      "http://localhost:3000", // Legacy support
      `http://localhost:${PORTS.STORE}`,
      `http://localhost:${PORTS.PROFILE}`,
      `http://localhost:${PORTS.DOCS}`,
      ...(Deno.env.get("ALLOWED_ORIGINS")?.split(",") || []),
    ],
    csrfProtection: true,
    bruteForceProtection: true,
  },
};

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

/**
 * OAuth error codes and descriptions
 */
export const OAUTH_ERRORS = {
  INVALID_REQUEST: {
    error: "invalid_request",
    description:
      "The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed.",
  },
  INVALID_CLIENT: {
    error: "invalid_client",
    description:
      "Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method).",
  },
  INVALID_GRANT: {
    error: "invalid_grant",
    description:
      "The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh token is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client.",
  },
  UNAUTHORIZED_CLIENT: {
    error: "unauthorized_client",
    description: "The authenticated client is not authorized to use this authorization grant type.",
  },
  UNSUPPORTED_GRANT_TYPE: {
    error: "unsupported_grant_type",
    description: "The authorization grant type is not supported by the authorization server.",
  },
  INVALID_SCOPE: {
    error: "invalid_scope",
    description: "The requested scope is invalid, unknown, or malformed.",
  },
  ACCESS_DENIED: {
    error: "access_denied",
    description: "The resource owner or authorization server denied the request.",
  },
  SERVER_ERROR: {
    error: "server_error",
    description:
      "The authorization server encountered an unexpected condition that prevented it from fulfilling the request.",
  },
  TEMPORARILY_UNAVAILABLE: {
    error: "temporarily_unavailable",
    description:
      "The authorization server is currently unable to handle the request due to a temporary overloading or maintenance of the server.",
  },
  INVALID_TOKEN: {
    error: "invalid_token",
    description:
      "The access token provided is expired, revoked, malformed, or invalid for other reasons.",
  },
  INSUFFICIENT_SCOPE: {
    error: "insufficient_scope",
    description: "The request requires higher privileges than provided by the access token.",
  },
  RATE_LIMIT_EXCEEDED: {
    error: "rate_limit_exceeded",
    description: "Too many requests. Please try again later.",
  },
  TOO_MANY_ATTEMPTS: {
    error: "too_many_attempts",
    description: "Too many failed attempts. Please try again later.",
  },
} as const;

/**
 * Validate security configuration
 */
export function validateSecurityConfig(config: SecurityConfig): void {
  if (config.oauth.stateExpiry < 60000) {
    throw new Error("State expiry must be at least 1 minute");
  }

  if (config.oauth.codeExpiry < 60000) {
    throw new Error("Code expiry must be at least 1 minute");
  }

  if (config.oauth.tokenExpiry < 300000) {
    throw new Error("Token expiry must be at least 5 minutes");
  }

  if (config.oauth.maxAuthAttempts < 1) {
    throw new Error("Max auth attempts must be at least 1");
  }

  for (const [endpoint, limits] of Object.entries(config.rateLimit)) {
    if (limits.windowMs < 1000) {
      throw new Error(`Rate limit window for ${endpoint} must be at least 1 second`);
    }
    if (limits.maxRequests < 1) {
      throw new Error(`Max requests for ${endpoint} must be at least 1`);
    }
  }
}

// Validate configuration on module load
validateSecurityConfig(SECURITY_CONFIG);
