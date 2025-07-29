/**
 * @fileoverview Store Package - Application Marketplace
 *
 * This package serves as the application marketplace and generator interface for the
 * Suppers AI Builder platform. It provides a web interface for creating and managing
 * applications using the compiler, with template galleries and visual builders.
 */

// Re-export main components and utilities
export * from "./lib/mod.ts";
export * from "./types/mod.ts";

// Export main application entry point
export { default as app } from "./main.ts";
