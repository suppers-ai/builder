// Theme system for UI library components
// Implements CSS custom properties with daisyUI integration

import { ThemeConfig } from '@json-app-compiler/shared';

// Extended theme configuration with daisyUI support
export interface UIThemeConfig extends ThemeConfig {
  // daisyUI theme name or custom theme object
  daisyTheme?: string | DaisyUITheme;
  // Component-specific theme overrides
  components?: ComponentThemeOverrides;
  // CSS custom properties for advanced theming
  cssVariables?: Record<string, string>;
  // Dark mode configuration
  darkMode?: DarkModeConfig;
}

// daisyUI theme structure
export interface DaisyUITheme {
  primary?: string;
  secondary?: string;
  accent?: string;
  neutral?: string;
  'base-100'?: string;
  'base-200'?: string;
  'base-300'?: string;
  info?: string;
  success?: string;
  warning?: string;
  error?: string;
  // Additional daisyUI theme properties
  '--rounded-box'?: string;
  '--rounded-btn'?: string;
  '--rounded-badge'?: string;
  '--animation-btn'?: string;
  '--animation-input'?: string;
  '--btn-text-case'?: string;
  '--btn-focus-scale'?: string;
  '--border-btn'?: string;
  '--tab-border'?: string;
  '--tab-radius'?: string;
}

// Component-specific theme overrides
export interface ComponentThemeOverrides {
  button?: ButtonTheme;
  input?: InputTheme;
  card?: CardTheme;
  layout?: LayoutTheme;
}

// Individual component theme interfaces
export interface ButtonTheme {
  primaryColor?: string;
  secondaryColor?: string;
  dangerColor?: string;
  borderRadius?: string;
  fontSize?: Record<string, string>;
  padding?: Record<string, string>;
  transition?: string;
}

export interface InputTheme {
  borderColor?: string;
  focusColor?: string;
  errorColor?: string;
  successColor?: string;
  borderRadius?: string;
  fontSize?: Record<string, string>;
  padding?: Record<string, string>;
}

export interface CardTheme {
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
  borderRadius?: string;
  padding?: Record<string, string>;
}

export interface LayoutTheme {
  backgroundColor?: string;
  maxWidth?: Record<string, string>;
  spacing?: Record<string, string>;
  breakpoints?: Record<string, string>;
}

// Dark mode configuration
export interface DarkModeConfig {
  enabled?: boolean;
  strategy?: 'class' | 'media' | 'manual';
  storageKey?: string;
  themes?: {
    light: string | DaisyUITheme;
    dark: string | DaisyUITheme;
  };
}

// Theme application result
export interface ThemeApplicationResult {
  success: boolean;
  appliedVariables: Record<string, string>;
  errors: string[];
  warnings: string[];
}

// Default daisyUI themes
export const DAISY_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter'
] as const;

export type DaisyThemeName = typeof DAISY_THEMES[number];

// CSS custom property names used by the theme system
export const CSS_VARIABLES = {
  // Primary theme colors
  PRIMARY: '--ui-primary',
  SECONDARY: '--ui-secondary',
  ACCENT: '--ui-accent',
  NEUTRAL: '--ui-neutral',
  
  // Base colors
  BASE_100: '--ui-base-100',
  BASE_200: '--ui-base-200',
  BASE_300: '--ui-base-300',
  
  // Semantic colors
  INFO: '--ui-info',
  SUCCESS: '--ui-success',
  WARNING: '--ui-warning',
  ERROR: '--ui-error',
  
  // Typography
  FONT_FAMILY: '--ui-font-family',
  FONT_SIZE_XS: '--ui-font-size-xs',
  FONT_SIZE_SM: '--ui-font-size-sm',
  FONT_SIZE_MD: '--ui-font-size-md',
  FONT_SIZE_LG: '--ui-font-size-lg',
  FONT_SIZE_XL: '--ui-font-size-xl',
  
  // Spacing
  SPACING_XS: '--ui-spacing-xs',
  SPACING_SM: '--ui-spacing-sm',
  SPACING_MD: '--ui-spacing-md',
  SPACING_LG: '--ui-spacing-lg',
  SPACING_XL: '--ui-spacing-xl',
  
  // Border radius
  RADIUS_SM: '--ui-radius-sm',
  RADIUS_MD: '--ui-radius-md',
  RADIUS_LG: '--ui-radius-lg',
  RADIUS_XL: '--ui-radius-xl',
  RADIUS_FULL: '--ui-radius-full',
  
  // Shadows
  SHADOW_SM: '--ui-shadow-sm',
  SHADOW_MD: '--ui-shadow-md',
  SHADOW_LG: '--ui-shadow-lg',
  SHADOW_XL: '--ui-shadow-xl',
  
  // Transitions
  TRANSITION_FAST: '--ui-transition-fast',
  TRANSITION_NORMAL: '--ui-transition-normal',
  TRANSITION_SLOW: '--ui-transition-slow',
} as const;

// Default theme values
export const DEFAULT_THEME: UIThemeConfig = {
  daisyTheme: 'light',
  primaryColor: '#3b82f6',
  secondaryColor: '#6b7280',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  cssVariables: {
    [CSS_VARIABLES.PRIMARY]: '#3b82f6',
    [CSS_VARIABLES.SECONDARY]: '#6b7280',
    [CSS_VARIABLES.ACCENT]: '#8b5cf6',
    [CSS_VARIABLES.NEUTRAL]: '#374151',
    [CSS_VARIABLES.BASE_100]: '#ffffff',
    [CSS_VARIABLES.BASE_200]: '#f9fafb',
    [CSS_VARIABLES.BASE_300]: '#f3f4f6',
    [CSS_VARIABLES.INFO]: '#0ea5e9',
    [CSS_VARIABLES.SUCCESS]: '#10b981',
    [CSS_VARIABLES.WARNING]: '#f59e0b',
    [CSS_VARIABLES.ERROR]: '#ef4444',
    [CSS_VARIABLES.FONT_FAMILY]: 'system-ui, -apple-system, sans-serif',
    [CSS_VARIABLES.FONT_SIZE_XS]: '0.75rem',
    [CSS_VARIABLES.FONT_SIZE_SM]: '0.875rem',
    [CSS_VARIABLES.FONT_SIZE_MD]: '1rem',
    [CSS_VARIABLES.FONT_SIZE_LG]: '1.125rem',
    [CSS_VARIABLES.FONT_SIZE_XL]: '1.25rem',
    [CSS_VARIABLES.SPACING_XS]: '0.5rem',
    [CSS_VARIABLES.SPACING_SM]: '0.75rem',
    [CSS_VARIABLES.SPACING_MD]: '1rem',
    [CSS_VARIABLES.SPACING_LG]: '1.5rem',
    [CSS_VARIABLES.SPACING_XL]: '2rem',
    [CSS_VARIABLES.RADIUS_SM]: '0.125rem',
    [CSS_VARIABLES.RADIUS_MD]: '0.375rem',
    [CSS_VARIABLES.RADIUS_LG]: '0.5rem',
    [CSS_VARIABLES.RADIUS_XL]: '0.75rem',
    [CSS_VARIABLES.RADIUS_FULL]: '9999px',
    [CSS_VARIABLES.SHADOW_SM]: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    [CSS_VARIABLES.SHADOW_MD]: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    [CSS_VARIABLES.SHADOW_LG]: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    [CSS_VARIABLES.SHADOW_XL]: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    [CSS_VARIABLES.TRANSITION_FAST]: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    [CSS_VARIABLES.TRANSITION_NORMAL]: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    [CSS_VARIABLES.TRANSITION_SLOW]: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  darkMode: {
    enabled: true,
    strategy: 'class',
    storageKey: 'ui-theme-mode',
    themes: {
      light: 'light',
      dark: 'dark',
    },
  },
};

// Theme utility class
export class ThemeManager {
  private currentTheme: UIThemeConfig;
  private appliedVariables: Record<string, string> = {};

  constructor(initialTheme: UIThemeConfig = DEFAULT_THEME) {
    this.currentTheme = { ...DEFAULT_THEME, ...initialTheme };
  }

  // Apply theme to the document
  applyTheme(theme?: Partial<UIThemeConfig>): ThemeApplicationResult {
    if (theme) {
      this.currentTheme = { ...this.currentTheme, ...theme };
    }

    const result: ThemeApplicationResult = {
      success: true,
      appliedVariables: {},
      errors: [],
      warnings: [],
    };

    try {
      // Apply CSS custom properties
      if (this.currentTheme.cssVariables) {
        this.applyCSSVariables(this.currentTheme.cssVariables, result);
      }

      // Apply daisyUI theme
      if (this.currentTheme.daisyTheme) {
        this.applyDaisyTheme(this.currentTheme.daisyTheme, result);
      }

      // Apply component-specific overrides
      if (this.currentTheme.components) {
        this.applyComponentThemes(this.currentTheme.components, result);
      }

      // Apply dark mode configuration
      if (this.currentTheme.darkMode?.enabled) {
        this.applyDarkMode(this.currentTheme.darkMode, result);
      }

      this.appliedVariables = result.appliedVariables;
    } catch (error) {
      result.success = false;
      result.errors.push(`Theme application failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  // Apply CSS custom properties to document root
  private applyCSSVariables(variables: Record<string, string>, result: ThemeApplicationResult): void {
    if (typeof document === 'undefined') {
      result.warnings.push('Document not available, CSS variables not applied');
      return;
    }

    const root = document.documentElement;
    
    for (const [property, value] of Object.entries(variables)) {
      try {
        root.style.setProperty(property, value);
        result.appliedVariables[property] = value;
      } catch (error) {
        result.errors.push(`Failed to set CSS variable ${property}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // Apply daisyUI theme
  private applyDaisyTheme(theme: string | DaisyUITheme, result: ThemeApplicationResult): void {
    if (typeof document === 'undefined') {
      result.warnings.push('Document not available, daisyUI theme not applied');
      return;
    }

    try {
      if (typeof theme === 'string') {
        // Apply predefined daisyUI theme
        document.documentElement.setAttribute('data-theme', theme);
        result.appliedVariables['data-theme'] = theme;
      } else {
        // Apply custom daisyUI theme object
        const root = document.documentElement;
        for (const [property, value] of Object.entries(theme)) {
          const cssProperty = property.startsWith('--') ? property : `--${property}`;
          root.style.setProperty(cssProperty, value);
          result.appliedVariables[cssProperty] = value;
        }
      }
    } catch (error) {
      result.errors.push(`Failed to apply daisyUI theme: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Apply component-specific theme overrides
  private applyComponentThemes(components: ComponentThemeOverrides, result: ThemeApplicationResult): void {
    if (typeof document === 'undefined') {
      result.warnings.push('Document not available, component themes not applied');
      return;
    }

    const root = document.documentElement;

    try {
      // Apply button theme
      if (components.button) {
        this.applyButtonTheme(components.button, root, result);
      }

      // Apply input theme
      if (components.input) {
        this.applyInputTheme(components.input, root, result);
      }

      // Apply card theme
      if (components.card) {
        this.applyCardTheme(components.card, root, result);
      }

      // Apply layout theme
      if (components.layout) {
        this.applyLayoutTheme(components.layout, root, result);
      }
    } catch (error) {
      result.errors.push(`Failed to apply component themes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Apply button-specific theme
  private applyButtonTheme(theme: ButtonTheme, root: HTMLElement, result: ThemeApplicationResult): void {
    const buttonVariables: Record<string, string | undefined> = {
      '--ui-button-primary': theme.primaryColor,
      '--ui-button-secondary': theme.secondaryColor,
      '--ui-button-danger': theme.dangerColor,
      '--ui-button-radius': theme.borderRadius,
      '--ui-button-transition': theme.transition,
    };

    // Apply size-specific variables
    if (theme.fontSize) {
      for (const [size, value] of Object.entries(theme.fontSize)) {
        buttonVariables[`--ui-button-font-${size}`] = value;
      }
    }

    if (theme.padding) {
      for (const [size, value] of Object.entries(theme.padding)) {
        buttonVariables[`--ui-button-padding-${size}`] = value;
      }
    }

    for (const [property, value] of Object.entries(buttonVariables)) {
      if (value) {
        root.style.setProperty(property, value);
        result.appliedVariables[property] = value;
      }
    }
  }

  // Apply input-specific theme
  private applyInputTheme(theme: InputTheme, root: HTMLElement, result: ThemeApplicationResult): void {
    const inputVariables: Record<string, string | undefined> = {
      '--ui-input-border': theme.borderColor,
      '--ui-input-focus': theme.focusColor,
      '--ui-input-error': theme.errorColor,
      '--ui-input-success': theme.successColor,
      '--ui-input-radius': theme.borderRadius,
    };

    // Apply size-specific variables
    if (theme.fontSize) {
      for (const [size, value] of Object.entries(theme.fontSize)) {
        inputVariables[`--ui-input-font-${size}`] = value;
      }
    }

    if (theme.padding) {
      for (const [size, value] of Object.entries(theme.padding)) {
        inputVariables[`--ui-input-padding-${size}`] = value;
      }
    }

    for (const [property, value] of Object.entries(inputVariables)) {
      if (value) {
        root.style.setProperty(property, value);
        result.appliedVariables[property] = value;
      }
    }
  }

  // Apply card-specific theme
  private applyCardTheme(theme: CardTheme, root: HTMLElement, result: ThemeApplicationResult): void {
    const cardVariables: Record<string, string | undefined> = {
      '--ui-card-bg': theme.backgroundColor,
      '--ui-card-border': theme.borderColor,
      '--ui-card-shadow': theme.shadowColor,
      '--ui-card-radius': theme.borderRadius,
    };

    if (theme.padding) {
      for (const [size, value] of Object.entries(theme.padding)) {
        cardVariables[`--ui-card-padding-${size}`] = value;
      }
    }

    for (const [property, value] of Object.entries(cardVariables)) {
      if (value) {
        root.style.setProperty(property, value);
        result.appliedVariables[property] = value;
      }
    }
  }

  // Apply layout-specific theme
  private applyLayoutTheme(theme: LayoutTheme, root: HTMLElement, result: ThemeApplicationResult): void {
    const layoutVariables: Record<string, string | undefined> = {
      '--ui-layout-bg': theme.backgroundColor,
    };

    if (theme.maxWidth) {
      for (const [size, value] of Object.entries(theme.maxWidth)) {
        layoutVariables[`--ui-layout-max-width-${size}`] = value;
      }
    }

    if (theme.spacing) {
      for (const [size, value] of Object.entries(theme.spacing)) {
        layoutVariables[`--ui-layout-spacing-${size}`] = value;
      }
    }

    if (theme.breakpoints) {
      for (const [size, value] of Object.entries(theme.breakpoints)) {
        layoutVariables[`--ui-layout-breakpoint-${size}`] = value;
      }
    }

    for (const [property, value] of Object.entries(layoutVariables)) {
      if (value) {
        root.style.setProperty(property, value);
        result.appliedVariables[property] = value;
      }
    }
  }

  // Apply dark mode configuration
  private applyDarkMode(config: DarkModeConfig, result: ThemeApplicationResult): void {
    if (typeof document === 'undefined') {
      result.warnings.push('Document not available, dark mode not configured');
      return;
    }

    try {
      if (config.strategy === 'class') {
        // Use class-based dark mode
        const isDark = this.getDarkModePreference(config.storageKey);
        if (isDark) {
          document.documentElement.classList.add('dark');
          if (typeof config.themes?.dark === 'string') {
            document.documentElement.setAttribute('data-theme', config.themes.dark);
          }
        } else {
          document.documentElement.classList.remove('dark');
          if (typeof config.themes?.light === 'string') {
            document.documentElement.setAttribute('data-theme', config.themes.light);
          }
        }
        result.appliedVariables['dark-mode-strategy'] = 'class';
      } else if (config.strategy === 'media') {
        // Use media query-based dark mode
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applyMediaTheme = (e: MediaQueryListEvent | MediaQueryList) => {
          if (e.matches) {
            if (typeof config.themes?.dark === 'string') {
              document.documentElement.setAttribute('data-theme', config.themes.dark);
            }
          } else {
            if (typeof config.themes?.light === 'string') {
              document.documentElement.setAttribute('data-theme', config.themes.light);
            }
          }
        };
        
        applyMediaTheme(mediaQuery);
        mediaQuery.addEventListener('change', applyMediaTheme);
        result.appliedVariables['dark-mode-strategy'] = 'media';
      }
    } catch (error) {
      result.errors.push(`Failed to apply dark mode: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get dark mode preference from storage
  private getDarkModePreference(storageKey = 'ui-theme-mode'): boolean {
    if (typeof localStorage === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return stored === 'dark';
      
      // Fallback to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }

  // Toggle dark mode
  toggleDarkMode(): void {
    if (!this.currentTheme.darkMode?.enabled) return;
    
    const config = this.currentTheme.darkMode;
    const isDark = this.getDarkModePreference(config.storageKey);
    const newMode = !isDark;
    
    if (typeof localStorage !== 'undefined' && config.storageKey) {
      localStorage.setItem(config.storageKey, newMode ? 'dark' : 'light');
    }
    
    this.applyTheme();
  }

  // Get current theme
  getCurrentTheme(): UIThemeConfig {
    return { ...this.currentTheme };
  }

  // Get applied CSS variables
  getAppliedVariables(): Record<string, string> {
    return { ...this.appliedVariables };
  }

  // Validate theme configuration
  static validateTheme(theme: UIThemeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate daisyUI theme
    if (theme.daisyTheme && typeof theme.daisyTheme === 'string') {
      if (!DAISY_THEMES.includes(theme.daisyTheme as DaisyThemeName)) {
        errors.push(`Invalid daisyUI theme: ${theme.daisyTheme}`);
      }
    }

    // Validate colors
    const colorPattern = /^#[0-9a-fA-F]{6}$|^rgb\(\d+,\s*\d+,\s*\d+\)$|^hsl\(\d+,\s*\d+%,\s*\d+%\)$/;
    if (theme.primaryColor && !colorPattern.test(theme.primaryColor)) {
      errors.push(`Invalid primary color format: ${theme.primaryColor}`);
    }
    if (theme.secondaryColor && !colorPattern.test(theme.secondaryColor)) {
      errors.push(`Invalid secondary color format: ${theme.secondaryColor}`);
    }

    // Validate spacing values
    if (theme.spacing) {
      const spacingPattern = /^\d+(\.\d+)?(px|rem|em|%|vh|vw)$/;
      for (const [key, value] of Object.entries(theme.spacing)) {
        if (!spacingPattern.test(value)) {
          errors.push(`Invalid spacing value for ${key}: ${value}`);
        }
      }
    }

    // Validate breakpoints
    if (theme.breakpoints) {
      const breakpointPattern = /^\d+px$/;
      for (const [key, value] of Object.entries(theme.breakpoints)) {
        if (!breakpointPattern.test(value)) {
          errors.push(`Invalid breakpoint value for ${key}: ${value}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Create default theme manager instance
export const themeManager = new ThemeManager();

// Utility functions for theme management
export const themeUtils = {
  // Apply theme to document
  applyTheme: (theme: Partial<UIThemeConfig>) => themeManager.applyTheme(theme),
  
  // Toggle dark mode
  toggleDarkMode: () => themeManager.toggleDarkMode(),
  
  // Get current theme
  getCurrentTheme: () => themeManager.getCurrentTheme(),
  
  // Validate theme
  validateTheme: (theme: UIThemeConfig) => ThemeManager.validateTheme(theme),
  
  // Get CSS variable value
  getCSSVariable: (variable: string): string => {
    if (typeof document === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
  },
  
  // Set CSS variable
  setCSSVariable: (variable: string, value: string): void => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(variable, value);
  },
  
  // Generate theme CSS
  generateThemeCSS: (theme: UIThemeConfig): string => {
    const variables = theme.cssVariables || {};
    const cssRules = Object.entries(variables)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');
    
    return `:root {\n${cssRules}\n}`;
  },
};