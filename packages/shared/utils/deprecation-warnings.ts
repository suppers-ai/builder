/**
 * Deprecation Warning Utilities
 * Utilities for showing deprecation warnings during development
 */

// Track which warnings have been shown to avoid spam
const shownWarnings = new Set<string>();

/**
 * Show a deprecation warning in development mode
 * @param message - The deprecation message to show
 * @param key - Unique key to prevent duplicate warnings
 */
export function showDeprecationWarning(message: string, key?: string): void {
  // Only show warnings in development mode
  const isDevelopment = typeof Deno !== "undefined" ||
    (typeof globalThis !== "undefined" &&
      (globalThis.location?.hostname === "localhost" ||
        globalThis.location?.hostname === "127.0.0.1" ||
        globalThis.location?.port !== ""));

  if (!isDevelopment) return;

  const warningKey = key || message;

  // Don't show the same warning multiple times
  if (shownWarnings.has(warningKey)) return;

  shownWarnings.add(warningKey);

  console.warn(`⚠️  DEPRECATION WARNING: ${message}`);
}

/**
 * Show a type deprecation warning with migration instructions
 * @param oldType - The deprecated type name
 * @param newLocation - Where to import the new type from
 * @param packageName - The package containing the deprecated type
 */
export function showTypeDeprecationWarning(
  oldType: string,
  newLocation: string,
  packageName: string,
): void {
  const message = `Type '${oldType}' from '${packageName}' is deprecated.\n` +
    `Please import from '${newLocation}' instead.\n` +
    `See migration guide: https://github.com/your-org/your-repo/blob/main/MIGRATION.md`;

  showDeprecationWarning(message, `${packageName}:${oldType}`);
}

/**
 * Show a function deprecation warning with migration instructions
 * @param oldFunction - The deprecated function name
 * @param newFunction - The new function to use
 * @param newLocation - Where to import the new function from
 */
export function showFunctionDeprecationWarning(
  oldFunction: string,
  newFunction: string,
  newLocation: string,
): void {
  const message = `Function '${oldFunction}' is deprecated.\n` +
    `Please use '${newFunction}' from '${newLocation}' instead.\n` +
    `See migration guide: https://github.com/your-org/your-repo/blob/main/MIGRATION.md`;

  showDeprecationWarning(message, `function:${oldFunction}`);
}

/**
 * Show a package deprecation warning
 * @param packagePath - The deprecated package path
 * @param newPackagePath - The new package path to use
 */
export function showPackageDeprecationWarning(
  packagePath: string,
  newPackagePath: string,
): void {
  const message = `Package '${packagePath}' is deprecated.\n` +
    `Please import from '${newPackagePath}' instead.\n` +
    `See migration guide: https://github.com/your-org/your-repo/blob/main/MIGRATION.md`;

  showDeprecationWarning(message, `package:${packagePath}`);
}

/**
 * Clear all shown warnings (useful for testing)
 */
export function clearDeprecationWarnings(): void {
  shownWarnings.clear();
}

/**
 * Check if a warning has been shown
 * @param key - The warning key to check
 */
export function hasWarningBeenShown(key: string): boolean {
  return shownWarnings.has(key);
}
