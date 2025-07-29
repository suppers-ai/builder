#!/usr/bin/env deno run -A
import { App, fsRoutes, staticFiles } from "fresh";
import {
  bruteForceProtection,
  corsMiddleware,
  enhancedSessionManagement,
  oauthLogging,
  rateLimit,
  securityHeaders,
  sessionManagement,
  tokenExpirationMiddleware,
  validateOAuthClient,
  validateOAuthState,
} from "./lib/middleware.ts";
import { CleanupService } from "./lib/cleanup-service.ts";
import { SECURITY_CONFIG } from "./lib/security-config.ts";

export const app = new App()
  // Add static file serving middleware
  .use(staticFiles());

// Global security headers (temporarily disabled for testing)
// .use(securityHeaders())

// Enhanced session management with token cleanup (temporarily disabled)
// .use(enhancedSessionManagement())

// Brute force protection for authentication endpoints (temporarily disabled)
// .use(bruteForceProtection())

// Token expiration middleware for protected endpoints (temporarily disabled)
// .use("/oauth/userinfo", tokenExpirationMiddleware())
// .use("/oauth/validate", tokenExpirationMiddleware())

// OAuth-specific middleware (temporarily disabled)
// .use("/oauth/*", oauthLogging())
// .use("/oauth/*", corsMiddleware(SECURITY_CONFIG.security.allowedOrigins))

// All custom middleware temporarily disabled for debugging
// .use("/oauth/authorize", rateLimit(SECURITY_CONFIG.rateLimit.authorize))
// .use("/oauth/token", rateLimit(SECURITY_CONFIG.rateLimit.token))
// .use("/oauth/userinfo", rateLimit(SECURITY_CONFIG.rateLimit.userinfo))
// .use("/oauth/validate", rateLimit(SECURITY_CONFIG.rateLimit.validate))
// .use("/oauth/revoke", rateLimit(SECURITY_CONFIG.rateLimit.revoke))
// .use("/oauth/authorize", validateOAuthState())
// .use("/oauth/token", validateOAuthClient())
// .use("/oauth/revoke", validateOAuthClient());

// Enable file-system based routing
await fsRoutes(app, {
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

// If this module is called directly, start the server
if (import.meta.main) {
  // TODO: Cleanup service disabled until token manager is refactored to use API client
  // const cleanupService = CleanupService.getInstance();
  // cleanupService.start();

  // Graceful shutdown handlers
  const shutdown = () => {
    console.log("Shutting down gracefully...");
    // cleanupService.stop();
    Deno.exit(0);
  };

  Deno.addSignalListener("SIGINT", shutdown);
  Deno.addSignalListener("SIGTERM", shutdown);

  // Configure port from environment variable (default to 8001)
  const port = parseInt(Deno.env.get("APP_PORT") || "8001");
  const hostname = Deno.env.get("APP_HOST") || "localhost";

  console.log(`🚀 App package starting on http://${hostname}:${port}`);
  await app.listen({ port, hostname });
}
