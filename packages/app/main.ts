#!/usr/bin/env deno run -A
import { App, fsRoutes, staticFiles } from "fresh";
import {
  rateLimit,
  securityHeaders,
  corsMiddleware,
  validateOAuthState,
  sessionManagement,
  validateOAuthClient,
  oauthLogging,
} from "./lib/middleware.ts";
import { CleanupService } from "./lib/cleanup-service.ts";

export const app = new App()
  // Add static file serving middleware
  .use(staticFiles())
  
  // Global security headers
  .use(securityHeaders())
  
  // Session management and cleanup
  .use(sessionManagement())
  
  // OAuth-specific middleware
  .use("/oauth/*", oauthLogging())
  .use("/oauth/*", corsMiddleware([
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8001",
    // Add your production domains here
  ]))
  
  // Rate limiting for OAuth endpoints
  .use("/oauth/authorize", rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 authorization attempts per 15 minutes
  }))
  .use("/oauth/token", rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 token requests per minute
  }))
  .use("/oauth/userinfo", rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 userinfo requests per minute
  }))
  .use("/oauth/validate", rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 validation requests per minute
  }))
  .use("/oauth/revoke", rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 revocation requests per minute
  }))
  
  // OAuth state validation
  .use("/oauth/authorize", validateOAuthState())
  
  // Client validation for token and revoke endpoints
  .use("/oauth/token", validateOAuthClient())
  .use("/oauth/revoke", validateOAuthClient());

// Enable file-system based routing
await fsRoutes(app, {
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

// If this module is called directly, start the server
if (import.meta.main) {
  await app.listen();
}