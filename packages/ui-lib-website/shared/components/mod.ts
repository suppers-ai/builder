/**
 * Components module exports
 *
 * This module provides organized exports for all shared components.
 * Components are grouped by functionality for easier imports.
 *
 * Note: Stateful components (ThemeSelector, CustomThemeCreator) are now Islands
 * and should be imported directly from the islands/ directory.
 */

// Application Components
export { ApplicationCard } from "./ApplicationCard.tsx";
export { ApplicationForm } from "./ApplicationForm.tsx";

// Authentication Components
export { ProtectedRoute } from "./ProtectedRoute.tsx";
export { SSOLogin } from "./SSOLogin.tsx";
export { SSOCallback } from "./SSOCallback.tsx";

// Navigation Components
export { ExampleNavigation } from "./ExampleNavigation.tsx";

// User Components
export { UserAvatar } from "./UserAvatar.tsx";

// UI Components
export { EnhancedSearchBar } from "./EnhancedSearchBar.tsx";
export { LoaderSpinner } from "./LoaderSpinner.tsx";

// Theme Display Components (for server-side rendering)
// Note: For interactive theme components, use the Islands:
// - import ThemeSelector from "../islands/ThemeSelector.tsx"
// - import CustomThemeCreator from "../islands/CustomThemeCreator.tsx"
export { ThemeSelector as ThemeSelectorDisplay } from "./ThemeSelector.tsx";
export { CustomThemeCreator as CustomThemeCreatorDisplay } from "./CustomThemeCreator.tsx";
