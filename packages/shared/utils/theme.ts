/**
 * Shared theme utilities for consistent theme management across all packages
 */

import { THEME_NAMES, DEFAULT_THEME, User } from "@suppers/shared";

export type ThemeId = string;
export const AVAILABLE_THEMES: ThemeId[] = THEME_NAMES;


/**
 * Get system theme preference
 */
function getSystemTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  
  try {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches 
      ? "dark" 
      : "light";
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Get theme from localStorage
 */
function getSavedTheme(): ThemeId | null {
  if (typeof window === "undefined") return null;
  
  try {
    const saved = localStorage.getItem("theme");
    return saved && AVAILABLE_THEMES.includes(saved as ThemeId) ? saved as ThemeId : null;
  } catch {
    return null;
  }
}

/**
 * Get theme from user metadata
 */
function getUserTheme(user: { user_metadata?: { theme_id?: string } } | null): ThemeId | null {
  if (!user?.user_metadata?.theme_id) return null;
  
  const themeId = user.user_metadata.theme_id;
  return AVAILABLE_THEMES.includes(themeId as ThemeId) ? themeId as ThemeId : null;
}

/**
 * Determine the current theme based on priority:
 * 1. User metadata theme_id (if authenticated)
 * 2. Saved theme in localStorage
 * 3. System preference
 * 4. Default theme
 */
export function getCurrentTheme(user?: User | null): ThemeId {
  // Priority 1: User metadata
  const userTheme = getUserTheme(user || null);
  if (userTheme) return userTheme;
  
  // Priority 2: Saved theme
  const savedTheme = getSavedTheme();
  if (savedTheme) return savedTheme;
  
  // Priority 3: System preference
  const systemTheme = getSystemTheme();
  if (systemTheme) return systemTheme;
  
  // Priority 4: Default
  return DEFAULT_THEME;
}

export function clearTheme() {
  if (typeof document === "undefined") return;
  document.documentElement.removeAttribute("data-theme");
  localStorage.removeItem("theme");
}

/**
 * Apply theme to DOM and save to localStorage
 */
export function applyTheme(theme: ThemeId): void {
  if (typeof document === "undefined") return;
  
  try {
    // Apply to DOM
    document.documentElement.setAttribute("data-theme", theme);
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent("theme-changed", { 
      detail: { theme } 
    }));
  } catch (error) {
    console.warn("Failed to apply theme:", error);
  }
}

/**
 * Generate an inline script that applies theme early during page load to prevent flicker
 * This should be included in the HTML <head> section
 */
export function generateEarlyThemeScript(): string {
  return `
    (function() {
      try {
        // Available themes list (sync with THEME_NAMES)
        const AVAILABLE_THEMES = ${JSON.stringify(AVAILABLE_THEMES)};
        const DEFAULT_THEME = "${DEFAULT_THEME}";
        
        // Check auth storage for user theme
        let userTheme = null;
        const authKeys = ["suppers_oauth_user", "suppers_auth_user"];
        
        for (const key of authKeys) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const user = JSON.parse(stored);
              if (user?.user_metadata?.theme_id && AVAILABLE_THEMES.includes(user.user_metadata.theme_id)) {
                userTheme = user.user_metadata.theme_id;
                break;
              }
            }
          } catch (e) {}
        }
        
        // Fallback to saved theme or system theme
        let theme = getCurrentTheme();
        if (!theme) {
          const saved = localStorage.getItem("theme");
          theme = saved && AVAILABLE_THEMES.includes(saved) ? saved : null;
        }
        if (!theme) {
          theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        theme = theme || DEFAULT_THEME;
        
        // Apply theme immediately
        document.documentElement.setAttribute("data-theme", theme);
        console.log('🎯 Early theme applied:', theme, userTheme ? '(from user)' : '(fallback)');
      } catch (error) {
        console.warn("Early theme application failed:", error);
        document.documentElement.setAttribute("data-theme", "${DEFAULT_THEME}");
      }
    })();
  `.trim();
}

