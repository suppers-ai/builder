/**
 * Authentication Utilities
 * Common authentication helpers and permission checks
 */

import type { User } from "../types/auth.ts";

/**
 * Check if user has required permissions
 */
export function checkPermissions(
  user: User | null,
  requiredPermissions: string[],
): boolean {
  if (!user || !requiredPermissions.length) return false;

  // Admin users have all permissions
  if (user.role === "admin") return true;

  // Check if user has any of the required permissions
  return requiredPermissions.some((permission) => {
    // Check role-based permissions
    if (permission === user.role) return true;

    // Check specific permissions (if user has permissions array)
    if ("permissions" in user && Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }

    return false;
  });
}

/**
 * Check if user has a specific role
 */
export function checkRole(user: User | null, requiredRole: string): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return checkRole(user, "admin");
}

/**
 * Check if user is moderator or admin
 */
export function isModerator(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "moderator";
}

/**
 * Create redirect response to login
 */
export function redirectToLogin(req: Request): Response {
  const url = new URL(req.url);
  const loginUrl = new URL("/login", url.origin);
  loginUrl.searchParams.set("redirect", url.pathname + url.search);

  return new Response(null, {
    status: 302,
    headers: {
      "Location": loginUrl.toString(),
    },
  });
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(): Response {
  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(): Response {
  return new Response("Forbidden", {
    status: 403,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

/**
 * Extract authentication token from request
 */
export function extractAuthToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;

  // Support both "Bearer token" and "token" formats
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return authHeader;
}

/**
 * Create auth middleware for routes
 */
export function requirePermissions(permissions: string[]) {
  return (handler: (req: Request, ctx: any) => Promise<Response>) => {
    return async (req: Request, ctx: any) => {
      const user = ctx.user; // Assuming user is set in context

      if (!checkPermissions(user, permissions)) {
        return forbiddenResponse();
      }

      return handler(req, ctx);
    };
  };
}

/**
 * Create role-based middleware
 */
export function requireRole(role: string) {
  return (handler: (req: Request, ctx: any) => Promise<Response>) => {
    return async (req: Request, ctx: any) => {
      const user = ctx.user;

      if (!checkRole(user, role)) {
        return forbiddenResponse();
      }

      return handler(req, ctx);
    };
  };
}

/**
 * Optional auth middleware (doesn't block if not authenticated)
 */
export function optionalAuth(handler: (req: Request, ctx: any) => Promise<Response>) {
  return async (req: Request, ctx: any) => {
    // User may or may not be authenticated - handler decides what to do
    return handler(req, ctx);
  };
}
