// Integration tests for theme system with components
import { assertEquals, assertExists, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { render } from "https://esm.sh/@testing-library/preact@3.2.3";
import { signal } from "@preact/signals";
import Button from './Button.tsx';
import Input from './Input.tsx';
import Card from './Card.tsx';
import Layout from './Layout.tsx';
import { themeManager, themeUtils, type UIThemeConfig } from '../theme.ts';

// Mock DOM environment for testing
class MockDocument {
  documentElement = new MockElement();
  head = new MockElement();
  body = new MockElement();
  
  createElement(tagName: string) {
    return new MockElement();
  }
  
  createTextNode(text: string) {
    return { textContent: text };
  }
  
  querySelector(selector: string) {
    return new MockElement();
  }
  
  querySelectorAll(selector: string) {
    return [new MockElement()];
  }
}

class MockElement {
  style = new MockCSSStyleDeclaration();
  classList = new MockClassList();
  attributes = new Map<string, string>();
  children: MockElement[] = [];
  textContent = '';
  innerHTML = '';
  
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  
  getAttribute(name: string) {
    return this.attributes.get(name) || null;
  }
  
  appendChild(child: MockElement) {
    this.children.push(child);
    return child;
  }
  
  removeChild(child: MockElement) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return child;
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
}

class MockWindow {
  document = new MockDocument();
  localStorage = new MockLocalStorage();
  
  getComputedStyle(element: MockElement) {
    return element.style;
  }
  
  matchMedia(query: string) {
    return {
      matches: query.includes('dark'),
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
}

// Setup mock environment
const mockWindow = new MockWindow();
(globalThis as any).window = mockWindow;
(globalThis as any).document = mockWindow.document;
(globalThis as any).localStorage = mockWindow.localStorage;

Deno.test("Theme Integration - Button component with custom theme", async () => {
  // Apply custom theme
  const customTheme: Partial<UIThemeConfig> = {
    components: {
      button: {
        primaryColor: '#ff6b6b',
        borderRadius: '12px',
        fontSize: {
          md: '1.1rem',
        },
      },
    },
  };
  
  const result = themeManager.applyTheme(customTheme);
  assertEquals(result.success, true);
  
  // Render button component
  const { container } = render(
    <Button variant="primary" size="md">
      Test Button
    </Button>
  );
  
  assertExists(container);
  
  // Check that CSS variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-button-primary'], '#ff6b6b');
  assertEquals(appliedVars['--ui-button-radius'], '12px');
  assertEquals(appliedVars['--ui-button-font-md'], '1.1rem');
});

Deno.test("Theme Integration - Input component with error theme", async () => {
  // Apply custom theme with input styling
  const customTheme: Partial<UIThemeConfig> = {
    components: {
      input: {
        errorColor: '#e74c3c',
        focusColor: '#3498db',
        borderRadius: '8px',
      },
    },
  };
  
  const result = themeManager.applyTheme(customTheme);
  assertEquals(result.success, true);
  
  // Render input component with error state
  const { container } = render(
    <Input 
      variant="error" 
      placeholder="Test input"
      errorText="This field is required"
    />
  );
  
  assertExists(container);
  
  // Check that CSS variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-input-error'], '#e74c3c');
  assertEquals(appliedVars['--ui-input-focus'], '#3498db');
  assertEquals(appliedVars['--ui-input-radius'], '8px');
});

Deno.test("Theme Integration - Card component with custom styling", async () => {
  // Apply custom theme with card styling
  const customTheme: Partial<UIThemeConfig> = {
    components: {
      card: {
        backgroundColor: '#f8f9fa',
        borderColor: '#dee2e6',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
        padding: {
          md: '2rem',
        },
      },
    },
  };
  
  const result = themeManager.applyTheme(customTheme);
  assertEquals(result.success, true);
  
  // Render card component
  const { container } = render(
    <Card 
      variant="default" 
      padding="md"
      title="Test Card"
      subtitle="Card subtitle"
    >
      Card content
    </Card>
  );
  
  assertExists(container);
  
  // Check that CSS variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-card-bg'], '#f8f9fa');
  assertEquals(appliedVars['--ui-card-border'], '#dee2e6');
  assertEquals(appliedVars['--ui-card-shadow'], 'rgba(0, 0, 0, 0.1)');
  assertEquals(appliedVars['--ui-card-radius'], '16px');
  assertEquals(appliedVars['--ui-card-padding-md'], '2rem');
});

Deno.test("Theme Integration - Layout component with responsive theme", async () => {
  // Apply custom theme with layout styling
  const customTheme: Partial<UIThemeConfig> = {
    components: {
      layout: {
        backgroundColor: '#ffffff',
        maxWidth: {
          sm: '600px',
          md: '800px',
          lg: '1200px',
        },
        spacing: {
          md: '2rem',
        },
        breakpoints: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
        },
      },
    },
  };
  
  const result = themeManager.applyTheme(customTheme);
  assertEquals(result.success, true);
  
  // Render layout component
  const { container } = render(
    <Layout 
      variant="default" 
      maxWidth="lg"
      padding="md"
    >
      Layout content
    </Layout>
  );
  
  assertExists(container);
  
  // Check that CSS variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-layout-bg'], '#ffffff');
  assertEquals(appliedVars['--ui-layout-max-width-sm'], '600px');
  assertEquals(appliedVars['--ui-layout-max-width-md'], '800px');
  assertEquals(appliedVars['--ui-layout-max-width-lg'], '1200px');
  assertEquals(appliedVars['--ui-layout-spacing-md'], '2rem');
});

Deno.test("Theme Integration - DaisyUI theme application", async () => {
  // Apply daisyUI theme
  const daisyTheme: Partial<UIThemeConfig> = {
    daisyTheme: 'cyberpunk',
  };
  
  const result = themeManager.applyTheme(daisyTheme);
  assertEquals(result.success, true);
  
  // Check that data-theme attribute is set
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['data-theme'], 'cyberpunk');
  
  // Render components to ensure they work with daisyUI theme
  const { container: buttonContainer } = render(
    <Button variant="primary">DaisyUI Button</Button>
  );
  
  const { container: cardContainer } = render(
    <Card title="DaisyUI Card">Card with daisyUI theme</Card>
  );
  
  assertExists(buttonContainer);
  assertExists(cardContainer);
});

Deno.test("Theme Integration - Dark mode toggle", async () => {
  // Setup dark mode theme
  const darkModeTheme: Partial<UIThemeConfig> = {
    darkMode: {
      enabled: true,
      strategy: 'class',
      storageKey: 'test-dark-mode',
      themes: {
        light: 'light',
        dark: 'dark',
      },
    },
  };
  
  const result = themeManager.applyTheme(darkModeTheme);
  assertEquals(result.success, true);
  
  // Test initial state (should be light)
  assertEquals(mockWindow.localStorage.getItem('test-dark-mode'), null);
  
  // Toggle to dark mode
  themeUtils.toggleDarkMode();
  assertEquals(mockWindow.localStorage.getItem('test-dark-mode'), 'dark');
  
  // Render components in dark mode
  const { container } = render(
    <div>
      <Button variant="primary">Dark Mode Button</Button>
      <Input placeholder="Dark mode input" />
      <Card title="Dark Mode Card">Dark mode content</Card>
    </div>
  );
  
  assertExists(container);
  
  // Toggle back to light mode
  themeUtils.toggleDarkMode();
  assertEquals(mockWindow.localStorage.getItem('test-dark-mode'), 'light');
});

Deno.test("Theme Integration - CSS custom properties inheritance", async () => {
  // Apply theme with CSS custom properties
  const customTheme: Partial<UIThemeConfig> = {
    cssVariables: {
      '--ui-primary': '#e91e63',
      '--ui-secondary': '#9c27b0',
      '--ui-font-family': 'Inter, sans-serif',
      '--ui-spacing-md': '1.5rem',
      '--ui-radius-md': '10px',
    },
  };
  
  const result = themeManager.applyTheme(customTheme);
  assertEquals(result.success, true);
  
  // Check that variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-primary'], '#e91e63');
  assertEquals(appliedVars['--ui-secondary'], '#9c27b0');
  assertEquals(appliedVars['--ui-font-family'], 'Inter, sans-serif');
  assertEquals(appliedVars['--ui-spacing-md'], '1.5rem');
  assertEquals(appliedVars['--ui-radius-md'], '10px');
  
  // Render components that should inherit these variables
  const { container } = render(
    <div>
      <Button variant="primary" size="md">Primary Button</Button>
      <Button variant="secondary" size="md">Secondary Button</Button>
      <Input size="md" placeholder="Styled input" />
      <Card padding="md" rounded="md">Styled card</Card>
    </div>
  );
  
  assertExists(container);
});

Deno.test("Theme Integration - Component state with theming", async () => {
  // Apply theme
  const result = themeManager.applyTheme({
    components: {
      button: {
        primaryColor: '#2196f3',
      },
    },
  });
  assertEquals(result.success, true);
  
  // Test button with loading state
  const { container: loadingContainer } = render(
    <Button variant="primary" loading={true}>
      Loading Button
    </Button>
  );
  
  assertExists(loadingContainer);
  
  // Test button with disabled state
  const { container: disabledContainer } = render(
    <Button variant="primary" disabled={true}>
      Disabled Button
    </Button>
  );
  
  assertExists(disabledContainer);
  
  // Test input with focus state (using signal for state management)
  const focusedSignal = signal(false);
  const { container: inputContainer } = render(
    <Input 
      placeholder="Focusable input"
      onFocus={() => focusedSignal.value = true}
      onBlur={() => focusedSignal.value = false}
    />
  );
  
  assertExists(inputContainer);
});

Deno.test("Theme Integration - Responsive theme application", async () => {
  // Apply responsive theme
  const responsiveTheme: Partial<UIThemeConfig> = {
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    components: {
      layout: {
        maxWidth: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
    },
  };
  
  const result = themeManager.applyTheme(responsiveTheme);
  assertEquals(result.success, true);
  
  // Test layout at different breakpoints
  const layouts = ['sm', 'md', 'lg', 'xl'] as const;
  
  for (const size of layouts) {
    const { container } = render(
      <Layout maxWidth={size} variant="default">
        Content for {size} layout
      </Layout>
    );
    
    assertExists(container);
  }
  
  // Check that responsive variables are applied
  const appliedVars = themeManager.getAppliedVariables();
  assertEquals(appliedVars['--ui-layout-max-width-sm'], '640px');
  assertEquals(appliedVars['--ui-layout-max-width-md'], '768px');
  assertEquals(appliedVars['--ui-layout-max-width-lg'], '1024px');
  assertEquals(appliedVars['--ui-layout-max-width-xl'], '1280px');
});

Deno.test("Theme Integration - Theme validation with components", async () => {
  // Test with invalid theme
  const invalidTheme: UIThemeConfig = {
    primaryColor: 'invalid-color',
    daisyTheme: 'non-existent-theme' as any,
    spacing: {
      md: 'invalid-spacing',
    },
  };
  
  const validation = themeUtils.validateTheme(invalidTheme);
  assertEquals(validation.valid, false);
  assertEquals(validation.errors.length > 0, true);
  
  // Components should still render even with invalid theme
  const { container } = render(
    <div>
      <Button variant="primary">Button with invalid theme</Button>
      <Input placeholder="Input with invalid theme" />
      <Card>Card with invalid theme</Card>
    </div>
  );
  
  assertExists(container);
});

Deno.test("Theme Integration - CSS generation and application", async () => {
  // Generate CSS from theme
  const theme: UIThemeConfig = {
    cssVariables: {
      '--custom-primary': '#ff5722',
      '--custom-secondary': '#795548',
      '--custom-font': 'Roboto, sans-serif',
    },
  };
  
  const css = themeUtils.generateThemeCSS(theme);
  
  assertStringIncludes(css, ':root {');
  assertStringIncludes(css, '--custom-primary: #ff5722;');
  assertStringIncludes(css, '--custom-secondary: #795548;');
  assertStringIncludes(css, '--custom-font: Roboto, sans-serif;');
  assertStringIncludes(css, '}');
  
  // Apply the theme
  const result = themeManager.applyTheme(theme);
  assertEquals(result.success, true);
  
  // Test that components can use the generated CSS
  const { container } = render(
    <div style={{ fontFamily: 'var(--custom-font)' }}>
      <Button style={{ backgroundColor: 'var(--custom-primary)' }}>
        Custom styled button
      </Button>
      <Card style={{ borderColor: 'var(--custom-secondary)' }}>
        Custom styled card
      </Card>
    </div>
  );
  
  assertExists(container);
});

Deno.test("Theme Integration - Multiple theme switches", async () => {
  const themes = [
    { name: 'blue', primaryColor: '#2196f3', daisyTheme: 'light' },
    { name: 'red', primaryColor: '#f44336', daisyTheme: 'dark' },
    { name: 'green', primaryColor: '#4caf50', daisyTheme: 'emerald' },
  ] as const;
  
  for (const theme of themes) {
    // Apply theme
    const result = themeManager.applyTheme({
      primaryColor: theme.primaryColor,
      daisyTheme: theme.daisyTheme,
    });
    
    assertEquals(result.success, true);
    
    // Render components with current theme
    const { container } = render(
      <div key={theme.name}>
        <Button variant="primary">{theme.name} Button</Button>
        <Input placeholder={`${theme.name} input`} />
        <Card title={`${theme.name} Card`}>
          Content for {theme.name} theme
        </Card>
      </div>
    );
    
    assertExists(container);
    
    // Verify theme variables are applied
    const appliedVars = themeManager.getAppliedVariables();
    assertEquals(appliedVars['data-theme'], theme.daisyTheme);
  }
});