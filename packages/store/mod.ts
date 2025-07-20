/**
 * @fileoverview Store Package - SSO Authentication Service
 *
 * This package serves as the centralized Single Sign-On (SSO) service for the
 * Suppers AI Builder platform. It handles authentication, user management,
 * and provides OAuth integration for other applications.
 */

// Re-export main components and utilities
export * from "./lib/mod.ts";
export * from "./types/mod.ts";

// Export main application entry point
export { default as app } from "./main.ts";
