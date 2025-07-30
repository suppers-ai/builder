#!/usr/bin/env deno run -A --watch=static/,lib/
/**
 * Development server for CDN package
 * Same as main.ts but with environment variable loading
 */

// Import and run the main server
await import("./main.ts");