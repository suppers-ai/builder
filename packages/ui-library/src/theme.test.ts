// Tests for theme system functionality
import { assertEquals, assertExists, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { 
  ThemeManager, 
  themeManager, 
  themeUtils, 
  DEFAULT_THEME, 
  DAISY_THEMES, 
  CSS_VARIABLES,
  type UIThemeConfig,
  type DaisyUITheme,
  type ThemeApplicationResult
} from './theme.ts';

// Mock DOM environment for testing
class MockDocument {
  documentElement = new MockElement();
  
  createElement(tagName: string) {
    return new MockElement();
  }
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
  
  removeAttribute(name: string) {
    this.attributes.delete(name);
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
  
  removeProperty(property: string) {
    this.properties.delete(property);
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
  
  toggle(className: string) {
    if (this.classes.has(className)) {
      this.classes.delete(className);
      return false;
    } else {
      this.classes.add(className);
      return true;
    }
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
  
  clear() {
    this.storage.clear();
  }
}

class MockWindow {
  localStorage = new MockLocalStorage();
  
  matchMedia(query: string) {
    return {
      matches: false, // Default to light mode for testing
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  }
}

// Setup mock environment
const mockDocument = new MockDocument();
const mockWindow = new MockWindow();

// Override global objects for testing
(globalThis as any).document = mockDocument;
(globalThis as any).window = mockWindow;
(globalThis as any).localStorage = mockWindow.localStorage;

// Ensure localStorage is properly accessible
if (typeof localStorage === 'undefined') {
  (globalThis as any).localStorage = mockWindow.localStorage;
}

Deno.test("ThemeManager - Constructor", () => {
  const manager = new ThemeManager();
  const currentTheme = manager.getCurrentTheme();
  
  assertEquals(currentTheme.primaryColor, DEFAULT_THEME.primaryColor);
  assertEquals(currentTheme.daisyTheme, DEFAULT_THEME.daisyTheme);
});

Deno.test("ThemeManager - Constructor with custom theme", () => {
  const customTheme: UIThemeConfig = {
    primaryColor: '#ff0000',
    daisyTheme: 'dark',
  };
  
  const manager = new ThemeManager(customTheme);
  const currentTheme = manager.getCurrentTheme();
  
  assertEquals(currentTheme.primaryColor, '#ff0000');
  assertEquals(currentTheme.daisyTheme, 'dark');
});

Deno.test("ThemeManager - Apply basic theme", () => {
  const manager = new ThemeManager();
  const result = manager.applyTheme();
  
  assertEquals(result.success, true);
  assertEquals(result.errors.length, 0);
  assertExists(result.appliedVariables);
});

Deno.test("ThemeManager - Apply theme with CSS variables", () => {
  const manager = new ThemeManager();
  const customTheme: Partial<UIThemeConfig> = {
    cssVariables: {
      '--custom-color': '#123456',
      '--custom-size': '2rem',
    },
  };
  
  const result = manager.applyTheme(customTheme);
  
  assertEquals(result.success, true);
  assertEquals(result.appliedVariables['--custom-color'], '#123456');
  assertEquals(result.appliedVariables['--custom-size'], '2rem');
});

Deno.test("ThemeManager - Apply daisyUI string theme", () => {
  const manager = new ThemeManager();
  const result = manager.applyTheme({ daisyTheme: 'dark' });
  
  assertEquals(result.success, true);
  assertEquals(result.appliedVariables['data-theme'], 'dark');
});

Deno.test("ThemeManager - Apply daisyUI object theme", () => {
  const manager = new ThemeManager();
  const daisyTheme: DaisyUITheme = {
    primary: '#ff0000',
    secondary: '#00ff00',
    '--rounded-btn': '0.5rem',
  };
  
  const result = manager.applyTheme({ daisyTheme });
  
  assertEquals(result.success, true);
  assertEquals(result.appliedVariables['--primary'], '#ff0000');
  assertEquals(result.appliedVariables['--secondary'], '#00ff00');
  assertEquals(result.appliedVariables['--rounded-btn'], '0.5rem');
});

Deno.test("ThemeManager - Apply component themes", () => {
  const manager = new ThemeManager();
  const result = manager.applyTheme({
    components: {
      button: {
        primaryColor: '#ff0000',
        borderRadius: '8px',
      },
      input: {
        borderColor: '#cccccc',
        focusColor: '#0066cc',
      },
    },
  });
  
  assertEquals(result.success, true);
  assertEquals(result.appliedVariables['--ui-button-primary'], '#ff0000');
  assertEquals(result.appliedVariables['--ui-button-radius'], '8px');
  assertEquals(result.appliedVariables['--ui-input-border'], '#cccccc');
  assertEquals(result.appliedVariables['--ui-input-focus'], '#0066cc');
});

Deno.test("ThemeManager - Apply dark mode configuration", () => {
  const manager = new ThemeManager();
  const result = manager.applyTheme({
    darkMode: {
      enabled: true,
      strategy: 'class',
      themes: {
        light: 'light',
        dark: 'dark',
      },
    },
  });
  
  assertEquals(result.success, true);
  assertEquals(result.appliedVariables['dark-mode-strategy'], 'class');
});

Deno.test("ThemeManager - Toggle dark mode", () => {
  // Test localStorage mock first
  localStorage.setItem('test-key', 'test-value');
  assertEquals(localStorage.getItem('test-key'), 'test-value');
  localStorage.removeItem('test-key');
  
  const manager = new ThemeManager({
    ...DEFAULT_THEME,
    darkMode: {
      enabled: true,
      strategy: 'class',
      storageKey: 'test-theme-mode',
    },
  });
  
  // Clear any existing storage
  localStorage.removeItem('test-theme-mode');
  
  // Initial state should be light
  assertEquals(localStorage.getItem('test-theme-mode'), null);
  
  // Toggle to dark
  manager.toggleDarkMode();
  
  // Check that localStorage was updated
  const storedValue = localStorage.getItem('test-theme-mode');
  assertEquals(storedValue, 'dark');
  
  // Toggle back to light
  manager.toggleDarkMode();
  assertEquals(localStorage.getItem('test-theme-mode'), 'light');
});

Deno.test("ThemeManager - Validate valid theme", () => {
  const validTheme: UIThemeConfig = {
    primaryColor: '#3b82f6',
    secondaryColor: '#6b7280',
    daisyTheme: 'light',
    spacing: {
      sm: '0.5rem',
      md: '1rem',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
    },
  };
  
  const result = ThemeManager.validateTheme(validTheme);
  assertEquals(result.valid, true);
  assertEquals(result.errors.length, 0);
});

Deno.test("ThemeManager - Validate invalid theme colors", () => {
  const invalidTheme: UIThemeConfig = {
    primaryColor: 'invalid-color',
    secondaryColor: '#xyz',
  };
  
  const result = ThemeManager.validateTheme(invalidTheme);
  assertEquals(result.valid, false);
  assertEquals(result.errors.length, 2);
  assertStringIncludes(result.errors[0], 'Invalid primary color format');
  assertStringIncludes(result.errors[1], 'Invalid secondary color format');
});

Deno.test("ThemeManager - Validate invalid daisyUI theme", () => {
  const invalidTheme: UIThemeConfig = {
    daisyTheme: 'invalid-theme',
  };
  
  const result = ThemeManager.validateTheme(invalidTheme);
  assertEquals(result.valid, false);
  assertEquals(result.errors.length, 1);
  assertStringIncludes(result.errors[0], 'Invalid daisyUI theme');
});

Deno.test("ThemeManager - Validate invalid spacing", () => {
  const invalidTheme: UIThemeConfig = {
    spacing: {
      sm: 'invalid-spacing',
      md: '1',
    },
  };
  
  const result = ThemeManager.validateTheme(invalidTheme);
  assertEquals(result.valid, false);
  assertEquals(result.errors.length, 2);
  assertStringIncludes(result.errors[0], 'Invalid spacing value');
  assertStringIncludes(result.errors[1], 'Invalid spacing value');
});

Deno.test("ThemeManager - Validate invalid breakpoints", () => {
  const invalidTheme: UIThemeConfig = {
    breakpoints: {
      sm: '640',
      md: '768rem',
    },
  };
  
  const result = ThemeManager.validateTheme(invalidTheme);
  assertEquals(result.valid, false);
  assertEquals(result.errors.length, 2);
  assertStringIncludes(result.errors[0], 'Invalid breakpoint value');
  assertStringIncludes(result.errors[1], 'Invalid breakpoint value');
});

Deno.test("themeUtils - Apply theme", () => {
  const result = themeUtils.applyTheme({ primaryColor: '#ff0000' });
  assertEquals(result.success, true);
});

Deno.test("themeUtils - Get current theme", () => {
  const theme = themeUtils.getCurrentTheme();
  assertExists(theme);
  assertExists(theme.primaryColor);
});

Deno.test("themeUtils - Validate theme", () => {
  const result = themeUtils.validateTheme(DEFAULT_THEME);
  assertEquals(result.valid, true);
});

Deno.test("themeUtils - Generate theme CSS", () => {
  const theme: UIThemeConfig = {
    cssVariables: {
      '--primary': '#3b82f6',
      '--secondary': '#6b7280',
    },
  };
  
  const css = themeUtils.generateThemeCSS(theme);
  assertStringIncludes(css, ':root {');
  assertStringIncludes(css, '--primary: #3b82f6;');
  assertStringIncludes(css, '--secondary: #6b7280;');
  assertStringIncludes(css, '}');
});

Deno.test("CSS_VARIABLES - Contains expected variables", () => {
  assertEquals(CSS_VARIABLES.PRIMARY, '--ui-primary');
  assertEquals(CSS_VARIABLES.SECONDARY, '--ui-secondary');
  assertEquals(CSS_VARIABLES.FONT_FAMILY, '--ui-font-family');
  assertEquals(CSS_VARIABLES.SPACING_MD, '--ui-spacing-md');
  assertEquals(CSS_VARIABLES.RADIUS_MD, '--ui-radius-md');
});

Deno.test("DAISY_THEMES - Contains expected themes", () => {
  assertEquals(DAISY_THEMES.includes('light'), true);
  assertEquals(DAISY_THEMES.includes('dark'), true);
  assertEquals(DAISY_THEMES.includes('cupcake'), true);
  assertEquals(DAISY_THEMES.includes('cyberpunk'), true);
});

Deno.test("DEFAULT_THEME - Has expected structure", () => {
  assertExists(DEFAULT_THEME.primaryColor);
  assertExists(DEFAULT_THEME.secondaryColor);
  assertExists(DEFAULT_THEME.daisyTheme);
  assertExists(DEFAULT_THEME.cssVariables);
  assertExists(DEFAULT_THEME.darkMode);
  assertEquals(DEFAULT_THEME.daisyTheme, 'light');
  assertEquals(DEFAULT_THEME.darkMode?.enabled, true);
});

Deno.test("ThemeManager - Component theme size variations", () => {
  const manager = new ThemeManager();
  const result = manager.applyTheme({
    components: {
      button: {
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
        },
        padding: {
          xs: '0.25rem 0.5rem',
          sm: '0.5rem 0.75rem',
          md: '0.75rem 1rem',
        },
      },
    },
  });
  
  assertEquals(result.success, true);
  assertEquals(result.appliedVariables['--ui-button-font-xs'], '0.75rem');
  assertEquals(result.appliedVariables['--ui-button-font-sm'], '0.875rem');
  assertEquals(result.appliedVariables['--ui-button-font-md'], '1rem');
  assertEquals(result.appliedVariables['--ui-button-padding-xs'], '0.25rem 0.5rem');
  assertEquals(result.appliedVariables['--ui-button-padding-sm'], '0.5rem 0.75rem');
  assertEquals(result.appliedVariables['--ui-button-padding-md'], '0.75rem 1rem');
});

Deno.test("ThemeManager - Layout theme with breakpoints", () => {
  const manager = new ThemeManager();
  const result = manager.applyTheme({
    components: {
      layout: {
        backgroundColor: '#f8f9fa',
        maxWidth: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
        },
        breakpoints: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
        },
      },
    },
  });
  
  assertEquals(result.success, true);
  assertEquals(result.appliedVariables['--ui-layout-bg'], '#f8f9fa');
  assertEquals(result.appliedVariables['--ui-layout-max-width-sm'], '640px');
  assertEquals(result.appliedVariables['--ui-layout-max-width-md'], '768px');
  assertEquals(result.appliedVariables['--ui-layout-max-width-lg'], '1024px');
  assertEquals(result.appliedVariables['--ui-layout-breakpoint-sm'], '640px');
  assertEquals(result.appliedVariables['--ui-layout-breakpoint-md'], '768px');
  assertEquals(result.appliedVariables['--ui-layout-breakpoint-lg'], '1024px');
});

Deno.test("ThemeManager - Error handling for invalid operations", () => {
  // Test with undefined document
  const originalDocument = (globalThis as any).document;
  (globalThis as any).document = undefined;
  
  const manager = new ThemeManager();
  const result = manager.applyTheme({ primaryColor: '#ff0000' });
  
  assertEquals(result.success, true);
  assertEquals(result.warnings.length > 0, true);
  assertStringIncludes(result.warnings[0], 'Document not available');
  
  // Restore document
  (globalThis as any).document = originalDocument;
});

Deno.test("ThemeManager - Media query dark mode strategy", () => {
  const manager = new ThemeManager();
  const result = manager.applyTheme({
    darkMode: {
      enabled: true,
      strategy: 'media',
      themes: {
        light: 'light',
        dark: 'dark',
      },
    },
  });
  
  assertEquals(result.success, true);
  assertEquals(result.appliedVariables['dark-mode-strategy'], 'media');
});