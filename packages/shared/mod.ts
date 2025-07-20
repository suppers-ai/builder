/**
 * Suppers Shared Package
 * Common types, utilities, and functions shared across the Suppers AI Builder ecosystem
 */

// Re-export all modules for easy access
export * from "./types/mod.ts";
export * from "./utils/mod.ts";
export * from "./constants/mod.ts";
export * from "./schemas/mod.ts";

// Version and package info
export const SHARED_VERSION = "1.0.0";
export const PACKAGE_NAME = "@suppers/shared";