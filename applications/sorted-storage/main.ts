#!/usr/bin/env deno run -A
import { App, staticFiles } from "fresh";
import { initializeLayoutManager } from "./lib/layout-manager.ts";
import { initializeAccessibilitySettings } from "./components/AccessibilitySettings.tsx";
import { userPreferences as _userPreferences } from "./lib/user-preferences.ts";
import { errorMonitor } from "./lib/error-monitoring.ts";

// Initialize layout manager with default renderers
initializeLayoutManager();

// Initialize accessibility settings
if (typeof window !== "undefined") {
  initializeAccessibilitySettings();

  // Initialize user preferences system
  // This will auto-detect system preferences and load user settings

  // Initialize error monitoring
  errorMonitor.addBreadcrumb({
    category: "navigation",
    message: "Application initialized",
    level: "info",
  });
}

export const app = new App()
  .use(staticFiles())
  .fsRoutes();

if (import.meta.main) {
  await app.listen();
}
