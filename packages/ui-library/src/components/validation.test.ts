// Validation tests for theme system integration
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { themeManager, themeUtils, type UIThemeConfig } from '../theme.ts';

// Mock DOM environment for testing
class MockDocument {
  documentElement = new MockElement();
}

class MockElement {
  style = new MockCSSStyleDeclaration();
  classList = new MockClassList();
  attributes = new Map<string, string>();
  
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  
  getAttribute(name: string) {
    return this.attributes.get(name) || null;
  }
}

class MockCSSStyleDeclaration {
  private properties = new Map<string, string>();
  
  setProperty(property: string, value: string) {
    this.properties.set(property, value);
  }
  
  getPropertyValue(property: string) {
    return this.properties.get(property) || '';
  }
}

class MockClassList {
  private classes = new Set<string>();
  
  add(className: string) {
    this.classes.add(className);
  }
  
  remove(className: string) {
    this.classes.delete(className);
  }
  
  contains(className: string) {
    return this.classes.has(className);
  }
}

class MockWindow {
  document = new MockDocument();
  localStorage = new MockLocalStorage();
  
  getComputedStyle(element: MockElement) {
    return element.style;
  }
  
  matchMedia(query: string) {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  }
}

class MockLocalStorage {
  private storage = new Map<string, string>();
  
  getItem(key: string) {
    return this.storage.get(key) || null;
  }
  
  setItem(key: string, value: string) {
    this.storage.set(key, value);
  }
  
  removeItem(key: string) {
    this.storage.delete(key);
  }
}

// Setup mock environment
const mockWindow = new MockWindow();
(globalThis as any).document = mockWindow.document;
(globalThis as any).window = mockWindow;
(globalThis as any).localStorage = mockWindow.localStorage;

Deno.test("Theme Integration - Button component theme application", () => {
  // Apply custom theme
  const customTheme: Partial<UIThemeConfig> = {
    components: {
      button: {
        primaryColor: '#e91e63',
        fontSize: {
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
        },
      },
    },
  };
  
  const result = themeManager.applyTheme(customTheme);
  assertEquals(result.success, true);
  
  // Check that theme variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-button-primary'], '#e91e63');
  assertEquals(appliedVars['--ui-button-font-sm'], '0.875rem');
  assertEquals(appliedVars['--ui-button-font-md'], '1rem');
  assertEquals(appliedVars['--ui-button-font-lg'], '1.125rem');
});

Deno.test("Theme Integration - Input component theme colors", () => {
  // Apply theme with input colors
  const inputTheme: Partial<UIThemeConfig> = {
    components: {
      input: {
        errorColor: '#dc3545',
        successColor: '#28a745',
        focusColor: '#007bff',
      },
    },
  };
  
  const result = themeManager.applyTheme(inputTheme);
  assertEquals(result.success, true);
  
  // Check that theme variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-input-error'], '#dc3545');
  assertEquals(appliedVars['--ui-input-success'], '#28a745');
  assertEquals(appliedVars['--ui-input-focus'], '#007bff');
});

Deno.test("Theme Integration - Card component theme styling", () => {
  // Apply card theme
  const cardTheme: Partial<UIThemeConfig> = {
    components: {
      card: {
        backgroundColor: '#ffffff',
        borderColor: '#e9ecef',
        shadowColor: 'rgba(0, 0, 0, 0.125)',
        borderRadius: '0.5rem',
      },
    },
  };
  
  const result = themeManager.applyTheme(cardTheme);
  assertEquals(result.success, true);
  
  // Check that theme variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-card-bg'], '#ffffff');
  assertEquals(appliedVars['--ui-card-border'], '#e9ecef');
  assertEquals(appliedVars['--ui-card-shadow'], 'rgba(0, 0, 0, 0.125)');
  assertEquals(appliedVars['--ui-card-radius'], '0.5rem');
});

Deno.test("Theme Integration - Layout responsive theme", () => {
  // Apply responsive layout theme
  const layoutTheme: Partial<UIThemeConfig> = {
    components: {
      layout: {
        maxWidth: {
          sm: '540px',
          md: '720px',
          lg: '960px',
          xl: '1140px',
        },
        breakpoints: {
          sm: '576px',
          md: '768px',
          lg: '992px',
          xl: '1200px',
        },
      },
    },
  };
  
  const result = themeManager.applyTheme(layoutTheme);
  assertEquals(result.success, true);
  
  // Check that responsive variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-layout-max-width-sm'], '540px');
  assertEquals(appliedVars['--ui-layout-max-width-md'], '720px');
  assertEquals(appliedVars['--ui-layout-max-width-lg'], '960px');
  assertEquals(appliedVars['--ui-layout-max-width-xl'], '1140px');
  assertEquals(appliedVars['--ui-layout-breakpoint-sm'], '576px');
  assertEquals(appliedVars['--ui-layout-breakpoint-md'], '768px');
  assertEquals(appliedVars['--ui-layout-breakpoint-lg'], '992px');
  assertEquals(appliedVars['--ui-layout-breakpoint-xl'], '1200px');
});

Deno.test("Theme Integration - DaisyUI theme application", () => {
  // Apply daisyUI theme
  const daisyTheme: Partial<UIThemeConfig> = {
    daisyTheme: 'synthwave',
    cssVariables: {
      '--ui-primary': '#ff7ac6',
      '--ui-secondary': '#bf95f9',
      '--ui-accent': '#ffb86b',
    },
  };
  
  const result = themeManager.applyTheme(daisyTheme);
  assertEquals(result.success, true);
  
  // Test that daisyUI theme is applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['data-theme'], 'synthwave');
  assertEquals(appliedVars['--ui-primary'], '#ff7ac6');
  assertEquals(appliedVars['--ui-secondary'], '#bf95f9');
  assertEquals(appliedVars['--ui-accent'], '#ffb86b');
});

Deno.test("Theme Integration - Dark mode theme application", () => {
  // Clear localStorage to ensure clean state
  localStorage.removeItem('test-dark-mode');
  
  // Apply dark mode theme
  const darkTheme: Partial<UIThemeConfig> = {
    darkMode: {
      enabled: true,
      strategy: 'class',
      storageKey: 'test-dark-mode',
      themes: {
        light: 'light',
        dark: 'dark',
      },
    },
    cssVariables: {
      '--ui-primary': '#60a5fa',
      '--ui-base-100': '#1f2937',
      '--ui-base-200': '#374151',
    },
  };
  
  const result = themeManager.applyTheme(darkTheme);
  assertEquals(result.success, true);
  
  // Test dark mode toggle
  themeUtils.toggleDarkMode();
  assertEquals(localStorage.getItem('test-dark-mode'), 'dark');
  
  // Check that dark mode variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-primary'], '#60a5fa');
  assertEquals(appliedVars['--ui-base-100'], '#1f2937');
  assertEquals(appliedVars['--ui-base-200'], '#374151');
});

Deno.test("Theme Integration - CSS custom properties with component sizes", () => {
  // Apply theme with size variations
  const sizeTheme: Partial<UIThemeConfig> = {
    cssVariables: {
      '--ui-font-size-xs': '0.75rem',
      '--ui-font-size-sm': '0.875rem',
      '--ui-font-size-md': '1rem',
      '--ui-font-size-lg': '1.125rem',
      '--ui-font-size-xl': '1.25rem',
      '--ui-spacing-xs': '0.25rem',
      '--ui-spacing-sm': '0.5rem',
      '--ui-spacing-md': '1rem',
      '--ui-spacing-lg': '1.5rem',
      '--ui-spacing-xl': '2rem',
    },
  };
  
  const result = themeManager.applyTheme(sizeTheme);
  assertEquals(result.success, true);
  
  // Check that size variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-font-size-xs'], '0.75rem');
  assertEquals(appliedVars['--ui-font-size-sm'], '0.875rem');
  assertEquals(appliedVars['--ui-font-size-md'], '1rem');
  assertEquals(appliedVars['--ui-font-size-lg'], '1.125rem');
  assertEquals(appliedVars['--ui-font-size-xl'], '1.25rem');
  assertEquals(appliedVars['--ui-spacing-xs'], '0.25rem');
  assertEquals(appliedVars['--ui-spacing-sm'], '0.5rem');
  assertEquals(appliedVars['--ui-spacing-md'], '1rem');
  assertEquals(appliedVars['--ui-spacing-lg'], '1.5rem');
  assertEquals(appliedVars['--ui-spacing-xl'], '2rem');
});

Deno.test("Theme Integration - Theme validation with invalid values", () => {
  // Test with invalid theme values
  const invalidTheme: UIThemeConfig = {
    primaryColor: 'invalid-color',
    daisyTheme: 'non-existent-theme' as any,
    spacing: {
      md: 'invalid-spacing',
    },
    breakpoints: {
      md: 'invalid-breakpoint',
    },
  };
  
  const validation = themeUtils.validateTheme(invalidTheme);
  assertEquals(validation.valid, false);
  assertEquals(validation.errors.length > 0, true);
  
  // Theme system should still work even with invalid theme values
  // The validation catches the errors but doesn't prevent basic functionality
  assertEquals(validation.errors.length, 4); // Should have 4 validation errors
});

Deno.test("Theme Integration - CSS generation and utility functions", () => {
  // Test CSS generation
  const theme: UIThemeConfig = {
    cssVariables: {
      '--custom-primary': '#6366f1',
      '--custom-secondary': '#8b5cf6',
      '--custom-accent': '#06b6d4',
    },
  };
  
  const css = themeUtils.generateThemeCSS(theme);
  assertExists(css);
  assertEquals(css.includes(':root {'), true);
  assertEquals(css.includes('--custom-primary: #6366f1;'), true);
  assertEquals(css.includes('--custom-secondary: #8b5cf6;'), true);
  assertEquals(css.includes('--custom-accent: #06b6d4;'), true);
  assertEquals(css.includes('}'), true);
  
  // Apply the theme
  const result = themeManager.applyTheme(theme);
  assertEquals(result.success, true);
  
  // Test utility functions
  const currentTheme = themeUtils.getCurrentTheme();
  assertExists(currentTheme);
  assertExists(currentTheme.cssVariables);
  
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--custom-primary'], '#6366f1');
  assertEquals(appliedVars['--custom-secondary'], '#8b5cf6');
  assertEquals(appliedVars['--custom-accent'], '#06b6d4');
});