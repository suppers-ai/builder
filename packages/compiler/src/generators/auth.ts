/**
 * Auth Integration Generator
 * Generates route protection middleware and permission-based access control
 */

import { FileSystem } from "../utils/mod.ts";
import type { ApplicationSpec, Route } from "../types/mod.ts";

/**
 * Generate authentication utilities and middleware
 */
export async function generateAuthSystem(
  destinationRoot: string,
  spec: ApplicationSpec,
): Promise<void> {
  const routes = spec.data.routes;
  const hasProtectedRoutes = routes.some((route) =>
    route.permissions && route.permissions.length > 0
  );

  if (!hasProtectedRoutes) {
    console.log("ℹ️  No protected routes found, skipping auth generation");
    return;
  }

  console.log("🔒 Generating authentication system...");

  const libDir = FileSystem.join(destinationRoot, "lib");
  await FileSystem.ensureDir(libDir);

  // Generate auth utilities
  await generateAuthUtils(libDir);

  // Generate middleware
  await generateAuthMiddleware(libDir);

  // Generate route protection
  await generateRouteProtection(destinationRoot, routes);

  console.log("  🔐 Generated authentication system");
}

/**
 * Generate authentication utilities
 */
async function generateAuthUtils(libDir: string): Promise<void> {
  const authUtilsContent = `/**
 * Authentication Utilities
 * Provides auth helpers and permission checking
 */

import { AuthClient } from "@suppers/auth-client";
import type { AuthUser } from "@suppers/auth-client";

export interface User {
  id: string;
  email: string;
  role?: string;
  permissions?: string[];
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

// Initialize auth client
const authClient = new AuthClient({
  storeUrl: "http://localhost:8001", // This should be configurable
  clientId: "generated-app",
});

/**
 * Get current user from Auth Client
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = authClient.getUser();
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email || "",
      role: "user", // Default role, can be enhanced
      permissions: [], // Default permissions, can be enhanced
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Create auth context for the current user
 */
export async function createAuthContext(): Promise<AuthContext> {
  const user = await getCurrentUser();
  
  return {
    user,
    isAuthenticated: authClient.isAuthenticated(),
    hasPermission: (permission: string) => {
      if (!user) return false;
      return user.permissions?.includes(permission) || false;
    },
    hasRole: (role: string) => {
      if (!user) return false;
      return user.role === role;
    },
  };
}

/**
 * Check if user has required permissions
 */
export function checkPermissions(
  user: User | null,
  requiredPermissions: string[],
): boolean {
  if (!user) return false;
  if (requiredPermissions.length === 0) return true;
  
  const userPermissions = user.permissions || [];
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
}

/**
 * Check if user has required role
 */
export function checkRole(user: User | null, requiredRole: string): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

/**
 * Redirect to login page
 */
export function redirectToLogin(req: Request): Response {
  const url = new URL(req.url);
  const loginUrl = new URL("/auth/login", url.origin);
  loginUrl.searchParams.set("redirect", url.pathname);
  
  return new Response(null, {
    status: 302,
    headers: {
      "Location": loginUrl.toString(),
    },
  });
}

/**
 * Return unauthorized response
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
 * Return forbidden response
 */
export function forbiddenResponse(): Response {
  return new Response("Forbidden", {
    status: 403,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}`;

  const authUtilsPath = FileSystem.join(libDir, "auth.ts");
  await FileSystem.writeText(authUtilsPath, authUtilsContent);
}

/**
 * Generate authentication middleware
 */
async function generateAuthMiddleware(libDir: string): Promise<void> {
  const middlewareContent = `/**
 * Authentication Middleware
 * Provides route protection and permission checking
 */

import { 
  createAuthContext, 
  checkPermissions, 
  redirectToLogin, 
  unauthorizedResponse, 
  forbiddenResponse 
} from "./auth.ts";

export interface AuthMiddlewareOptions {
  requiredPermissions?: string[];
  redirectOnFailure?: boolean;
}

/**
 * Authentication middleware for Fresh handlers
 */
export async function withAuth(
  handler: (req: Request, ctx: any) => Promise<Response>,
  options: AuthMiddlewareOptions = {},
): Promise<(req: Request, ctx: any) => Promise<Response>> {
  return async (req: Request, ctx: any) => {
    const authContext = await createAuthContext();
    
    // Add auth context to the request context
    ctx.auth = authContext;
    
    // Check if user is authenticated
    if (!authContext.isAuthenticated) {
      if (options.redirectOnFailure !== false) {
        return redirectToLogin(req);
      } else {
        return unauthorizedResponse();
      }
    }
    
    // Check permissions if required
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      const hasPermission = checkPermissions(authContext.user, options.requiredPermissions);
      
      if (!hasPermission) {
        return forbiddenResponse();
      }
    }
    
    // Call the original handler
    return handler(req, ctx);
  };
}

/**
 * Permission checking middleware
 */
export function requirePermissions(permissions: string[]) {
  return (handler: (req: Request, ctx: any) => Promise<Response>) => {
    return withAuth(handler, { requiredPermissions: permissions });
  };
}

/**
 * Role checking middleware
 */
export function requireRole(role: string) {
  return (handler: (req: Request, ctx: any) => Promise<Response>) => {
    return withAuth(handler, { requiredPermissions: [role] });
  };
}

/**
 * Optional auth middleware (doesn't redirect on failure)
 */
export function optionalAuth(handler: (req: Request, ctx: any) => Promise<Response>) {
  return withAuth(handler, { redirectOnFailure: false });
}`;

  const middlewarePath = FileSystem.join(libDir, "middleware.ts");
  await FileSystem.writeText(middlewarePath, middlewareContent);
}

/**
 * Generate route protection for specific routes
 */
async function generateRouteProtection(
  destinationRoot: string,
  routes: Route[],
): Promise<void> {
  for (const route of routes) {
    if (route.permissions && route.permissions.length > 0) {
      await generateProtectedRoute(destinationRoot, route);
    }
  }
}

/**
 * Generate protection for a specific route
 */
async function generateProtectedRoute(
  destinationRoot: string,
  route: Route,
): Promise<void> {
  const routePath = route.path === "/" ? "" : route.path;
  const routeDir = FileSystem.join(destinationRoot, "routes", routePath);
  const handlerPath = FileSystem.join(routeDir, "_middleware.ts");

  const middlewareContent = `/**
 * Route Protection Middleware
 * Generated for route: ${route.path}
 * Required permissions: ${route.permissions?.join(", ")}
 */

import { HandlerContext } from "$fresh/server.ts";
import { createAuthContext, checkPermissions, redirectToLogin, forbiddenResponse } from "${
    getRelativePathToLib(routePath)
  }";

export async function handler(
  req: Request,
  ctx: HandlerContext,
): Promise<Response> {
  const authContext = await createAuthContext();
  
  // Check if user is authenticated
  if (!authContext.isAuthenticated) {
    return redirectToLogin(req);
  }
  
  // Check permissions
  const requiredPermissions = ${JSON.stringify(route.permissions)};
  const hasPermission = checkPermissions(authContext.user, requiredPermissions);
  
  if (!hasPermission) {
    return forbiddenResponse();
  }
  
  // Add auth context to state for the route handler
  ctx.state.auth = authContext;
  
  // Continue to the actual route handler
  return await ctx.next();
}`;

  await FileSystem.writeText(handlerPath, middlewareContent);
}

/**
 * Generate relative path to lib directory
 */
function getRelativePathToLib(routePath: string): string {
  const depth = routePath.split("/").filter((segment) => segment.length > 0).length;

  if (depth === 0) {
    return "../lib/auth.ts";
  }

  return "../".repeat(depth + 1) + "lib/auth.ts";
}

/**
 * Generate login page if not exists
 */
export async function generateLoginPage(destinationRoot: string): Promise<void> {
  const loginDir = FileSystem.join(destinationRoot, "routes", "login");
  const loginPath = FileSystem.join(loginDir, "index.tsx");

  if (await FileSystem.exists(loginPath)) {
    console.log("ℹ️  Login page already exists, skipping generation");
    return;
  }

  const loginContent = `/**
 * Login Page
 * Generated authentication page
 */

import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function LoginPage(props: PageProps) {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form class="mt-8 space-y-6" action="/api/auth/login" method="POST">
            <div class="rounded-md shadow-sm -space-y-px">
              <div>
                <label for="email" class="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label for="password" class="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}`;

  await FileSystem.writeText(loginPath, loginContent);
  console.log("  📄 Generated login page");
}

/**
 * Get all protected routes from the specification
 */
export function getProtectedRoutes(routes: Route[]): Route[] {
  return routes.filter((route) => route.permissions && route.permissions.length > 0);
}

/**
 * Get all required permissions from the specification
 */
export function getAllRequiredPermissions(routes: Route[]): string[] {
  const permissions = new Set<string>();

  for (const route of routes) {
    if (route.permissions) {
      for (const permission of route.permissions) {
        permissions.add(permission);
      }
    }
  }

  return Array.from(permissions);
}
