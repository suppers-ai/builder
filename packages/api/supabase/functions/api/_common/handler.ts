/**
 * Request handler utilities for API
 */

import { handleOptionsRequest, addCorsHeaders } from './cors.ts';
import { errorResponse } from './response.ts';
import { getAuthContext, AuthContext, isAdmin } from './auth.ts';
import { toApiError, logError } from './errors.ts';
import { config } from './config.ts';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export interface HandlerContext {
  request: Request;
  url: URL;
  method: HttpMethod;
  pathSegments: string[];
  params: URLSearchParams;
  auth: AuthContext | null;
  origin: string | null;
}

export type RouteHandler = (context: HandlerContext) => Promise<Response> | Response;

export interface Route {
  method: HttpMethod | HttpMethod[];
  pattern: string | RegExp | ((segments: string[]) => boolean);
  handler: RouteHandler;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

/**
 * Create a request handler with routing
 */
export function createHandler(routes: Route[]): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const startTime = Date.now();
    
    try {
      // Handle OPTIONS requests
      if (request.method === 'OPTIONS') {
        return handleOptionsRequest(request);
      }

      // Parse request
      const url = new URL(request.url);
      const method = request.method as HttpMethod;
      const pathSegments = url.pathname.split('/').filter(Boolean);
      const origin = request.headers.get('origin');

      // Get auth context
      const auth = await getAuthContext(request);

      // Create context
      const context: HandlerContext = {
        request,
        url,
        method,
        pathSegments,
        params: url.searchParams,
        auth,
        origin,
      };

      // Find matching route
      const route = findRoute(routes, context);
      
      if (!route) {
        return errorResponse('Route not found', {
          status: 404,
          origin: origin || undefined,
        });
      }

      // Check authentication
      if (route.requireAuth && !auth) {
        return errorResponse('Authentication required', {
          status: 401,
          origin: origin || undefined,
        });
      }

      if (route.requireAdmin) {
        if (!auth || !auth.user?.id) {
          return errorResponse('Authentication required', {
            status: 401,
            origin: origin || undefined,
          });
        }
        const adminStatus = await isAdmin(auth.user.id);
        if (!adminStatus) {
          return errorResponse('Admin access required', {
            status: 403,
            origin: origin || undefined,
          });
        }
      }

      // Execute handler
      const response = await route.handler(context);
      
      // Add CORS headers if not already present
      if (!response.headers.has('Access-Control-Allow-Origin')) {
        return addCorsHeaders(response, request);
      }

      // Log request if in debug mode
      if (config.debug) {
        const duration = Date.now() - startTime;
        console.log(`[${method}] ${url.pathname} - ${response.status} (${duration}ms)`);
      }

      return response;
    } catch (error) {
      // Log error
      const apiError = toApiError(error);
      logError(apiError, {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries([...request.headers as any]),
      });

      // Return error response
      return errorResponse(apiError, {
        origin: request.headers.get('origin') || undefined,
      });
    }
  };
}

/**
 * Find matching route
 */
function findRoute(routes: Route[], context: HandlerContext): Route | null {
  for (const route of routes) {
    // Check method
    const methods = Array.isArray(route.method) ? route.method : [route.method];
    if (!methods.includes(context.method)) continue;

    // Check pattern
    if (matchesPattern(route.pattern, context.pathSegments)) {
      return route;
    }
  }
  return null;
}

/**
 * Check if path matches pattern
 */
function matchesPattern(
  pattern: string | RegExp | ((segments: string[]) => boolean),
  segments: string[]
): boolean {
  if (typeof pattern === 'function') {
    return pattern(segments);
  }

  if (pattern instanceof RegExp) {
    const path = '/' + segments.join('/');
    return pattern.test(path);
  }

  // String pattern with wildcards
  const patternSegments = pattern.split('/').filter(Boolean);
  
  if (patternSegments.length !== segments.length) {
    // Check for wildcard at the end
    const lastPattern = patternSegments[patternSegments.length - 1];
    if (lastPattern === '*' || lastPattern === '**') {
      return patternSegments.slice(0, -1).every((p, i) => {
        if (p === '*' || p.startsWith(':')) return true;
        return p === segments[i];
      });
    }
    return false;
  }

  return patternSegments.every((p, i) => {
    if (p === '*') return true;
    if (p.startsWith(':')) return true;
    return p === segments[i];
  });
}

/**
 * Extract path parameters
 */
export function extractPathParams(
  pattern: string,
  segments: string[]
): Record<string, string> {
  const params: Record<string, string> = {};
  const patternSegments = pattern.split('/').filter(Boolean);

  patternSegments.forEach((p, i) => {
    if (p.startsWith(':')) {
      const paramName = p.slice(1);
      params[paramName] = segments[i];
    }
  });

  return params;
}

/**
 * Create a sub-router for nested routes
 */
export function createRouter(basePath: string, routes: Route[]): Route {
  const baseSegments = basePath.split('/').filter(Boolean);
  
  return {
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    pattern: (segments) => {
      // Check if path starts with base path
      return baseSegments.every((base, i) => segments[i] === base);
    },
    handler: async (context) => {
      // Remove base path from segments
      const subSegments = context.pathSegments.slice(baseSegments.length);
      const subContext = { ...context, pathSegments: subSegments };
      
      // Find matching sub-route
      const route = findRoute(routes, subContext);
      
      if (!route) {
        return errorResponse('Route not found', {
          status: 404,
          origin: context.origin || undefined,
        });
      }

      return route.handler(subContext);
    },
  };
}

/**
 * Middleware wrapper
 */
export type Middleware = (
  context: HandlerContext,
  next: () => Promise<Response>
) => Promise<Response>;

export function withMiddleware(
  handler: RouteHandler,
  ...middleware: Middleware[]
): RouteHandler {
  return async (context: HandlerContext) => {
    let index = 0;

    const next = async (): Promise<Response> => {
      if (index >= middleware.length) {
        return handler(context);
      }
      
      const currentMiddleware = middleware[index++];
      return currentMiddleware(context, next);
    };

    return next();
  };
}

/**
 * Common middleware
 */
export const middleware = {
  /**
   * Logging middleware
   */
  logging: (context: HandlerContext, next: () => Promise<Response>) => {
    const start = Date.now();
    
    return next().then(response => {
      const duration = Date.now() - start;
      console.log(`[${context.method}] ${context.url.pathname} - ${response.status} (${duration}ms)`);
      return response;
    });
  },

  /**
   * Rate limiting middleware (simple in-memory)
   */
  rateLimit: (limit: number, window: number) => {
    const requests = new Map<string, number[]>();
    
    return (context: HandlerContext, next: () => Promise<Response>) => {
      const key = context.auth?.user.id || context.request.headers.get('x-forwarded-for') || 'anonymous';
      const now = Date.now();
      const timestamps = requests.get(key) || [];
      
      // Remove old timestamps
      const validTimestamps = timestamps.filter(t => now - t < window);
      
      if (validTimestamps.length >= limit) {
        return errorResponse('Rate limit exceeded', {
          status: 429,
          origin: context.origin || undefined,
        });
      }
      
      validTimestamps.push(now);
      requests.set(key, validTimestamps);
      
      return next();
    };
  },
};