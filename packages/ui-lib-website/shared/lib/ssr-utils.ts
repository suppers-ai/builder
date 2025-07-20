/**
 * SSR (Server-Side Rendering) Utilities
 *
 * Utilities to help prevent hooks and browser-specific code from running during SSR
 */

/**
 * Checks if code is running in a browser environment
 * Use this before calling hooks or browser-specific APIs
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Checks if code is running during server-side rendering
 */
export function isSSR(): boolean {
  return !isBrowser();
}

/**
 * Hook to safely check if component is mounted and in browser
 * Returns false during SSR and true after hydration
 */
export function useIsBrowser(): boolean {
  if (isSSR()) {
    return false;
  }

  // Safe to import hooks only in browser
  const { useState, useEffect } = require("preact/hooks");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

/**
 * Creates an SSR-safe wrapper function for components
 * Returns true if it's safe to render components with hooks
 */
export function createSSRSafeComponent(): boolean {
  return isBrowser();
}
