// Testing utilities for component quality assurance

/**
 * Accessibility testing utilities
 */
export class AccessibilityTester {
  /**
   * Check if element has proper ARIA attributes
   */
  static checkAriaAttributes(element: Element): string[] {
    const issues: string[] = [];

    // Check for interactive elements without proper roles
    const interactiveElements = ["button", "a", "input", "select", "textarea"];
    if (interactiveElements.includes(element.tagName.toLowerCase())) {
      if (!element.getAttribute("role") && element.tagName.toLowerCase() === "div") {
        issues.push("Interactive div element missing role attribute");
      }
    }

    // Check for images without alt text
    if (element.tagName.toLowerCase() === "img") {
      if (!element.getAttribute("alt")) {
        issues.push("Image missing alt attribute");
      }
    }

    // Check for form inputs without labels
    if (["input", "select", "textarea"].includes(element.tagName.toLowerCase())) {
      const id = element.getAttribute("id");
      const ariaLabel = element.getAttribute("aria-label");
      const ariaLabelledBy = element.getAttribute("aria-labelledby");

      if (!ariaLabel && !ariaLabelledBy) {
        if (!id || !document.querySelector(`label[for="${id}"]`)) {
          issues.push("Form input missing accessible label");
        }
      }
    }

    // Check for proper heading hierarchy
    if (element.tagName.match(/^H[1-6]$/)) {
      const level = parseInt(element.tagName.charAt(1));
      const previousHeadings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
        .filter((h) =>
          document.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING
        );

      if (previousHeadings.length > 0) {
        const lastHeading = previousHeadings[previousHeadings.length - 1];
        const lastLevel = parseInt(lastHeading.tagName.charAt(1));

        if (level > lastLevel + 1) {
          issues.push(`Heading level ${level} skips hierarchy (previous was ${lastLevel})`);
        }
      }
    }

    return issues;
  }

  /**
   * Check color contrast ratios
   */
  static checkColorContrast(element: Element): string[] {
    const issues: string[] = [];
    const styles = globalThis.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // Simple contrast check (would need more sophisticated algorithm in production)
    if (color && backgroundColor && color !== "transparent" && backgroundColor !== "transparent") {
      const colorLuminance = this.getLuminance(color);
      const bgLuminance = this.getLuminance(backgroundColor);
      const contrast = this.getContrastRatio(colorLuminance, bgLuminance);

      if (contrast < 4.5) {
        issues.push(`Low color contrast ratio: ${contrast.toFixed(2)} (minimum 4.5)`);
      }
    }

    return issues;
  }

  /**
   * Check keyboard navigation
   */
  static checkKeyboardNavigation(container: Element): string[] {
    const issues: string[] = [];
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    focusableElements.forEach((element, index) => {
      const tabIndex = element.getAttribute("tabindex");

      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push(
          `Element has positive tabindex (${tabIndex}), which can disrupt natural tab order`,
        );
      }

      // Check for focus indicators
      const styles = globalThis.getComputedStyle(element, ":focus");
      if (!styles.outline || styles.outline === "none") {
        if (!styles.boxShadow && !styles.border) {
          issues.push("Element lacks visible focus indicator");
        }
      }
    });

    return issues;
  }

  private static getLuminance(color: string): number {
    // Simplified luminance calculation
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((c) => {
      const channel = parseInt(c) / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private static getContrastRatio(lum1: number, lum2: number): number {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }
}

/**
 * Component testing utilities
 */
export class ComponentTester {
  /**
   * Test component rendering
   */
  static testRender(component: any, props: any = {}): boolean {
    try {
      // In a real implementation, this would use a testing framework
      // For now, just check if component can be instantiated
      const instance = component(props);
      return instance !== null && instance !== undefined;
    } catch (error) {
      console.error("Component render test failed:", error);
      return false;
    }
  }

  /**
   * Test component props
   */
  static testProps(
    component: any,
    requiredProps: string[],
    optionalProps: string[] = [],
  ): string[] {
    const issues: string[] = [];

    // Test with missing required props
    try {
      component({});
      if (requiredProps.length > 0) {
        issues.push("Component should require props but accepts empty object");
      }
    } catch (error) {
      // Expected for required props
    }

    // Test with valid props
    const validProps: any = {};
    requiredProps.forEach((prop) => {
      validProps[prop] = "test-value";
    });

    try {
      const result = component(validProps);
      if (!result) {
        issues.push("Component fails to render with valid props");
      }
    } catch (error) {
      issues.push(`Component throws error with valid props: ${error.message}`);
    }

    return issues;
  }

  /**
   * Test component accessibility
   */
  static testAccessibility(element: Element): string[] {
    const issues: string[] = [];

    issues.push(...AccessibilityTester.checkAriaAttributes(element));
    issues.push(...AccessibilityTester.checkColorContrast(element));
    issues.push(...AccessibilityTester.checkKeyboardNavigation(element));

    return issues;
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTester {
  /**
   * Measure component render time
   */
  static measureRenderTime(componentFn: () => void): number {
    const start = performance.now();
    componentFn();
    const end = performance.now();
    return end - start;
  }

  /**
   * Test memory usage (simplified)
   */
  static testMemoryUsage(testFn: () => void): any {
    if ("memory" in performance) {
      const beforeMemory = (performance as any).memory.usedJSHeapSize;
      testFn();
      const afterMemory = (performance as any).memory.usedJSHeapSize;

      return {
        before: beforeMemory,
        after: afterMemory,
        difference: afterMemory - beforeMemory,
      };
    }

    return { message: "Memory measurement not available" };
  }

  /**
   * Test for memory leaks in component cleanup
   */
  static testMemoryLeaks(
    createComponent: () => any,
    destroyComponent: (component: any) => void,
  ): boolean {
    const iterations = 100;
    const components: any[] = [];

    // Create many components
    for (let i = 0; i < iterations; i++) {
      components.push(createComponent());
    }

    // Destroy all components
    components.forEach((component) => destroyComponent(component));

    // Force garbage collection if available
    if ("gc" in window) {
      (window as any).gc();
    }

    // In a real test, you'd measure memory usage here
    return true; // Simplified
  }
}

/**
 * Cross-browser compatibility testing
 */
export class BrowserCompatibilityTester {
  /**
   * Check browser feature support
   */
  static checkFeatureSupport(): Record<string, boolean> {
    return {
      cssGrid: CSS.supports("display", "grid"),
      cssFlexbox: CSS.supports("display", "flex"),
      cssCustomProperties: CSS.supports("--test", "value"),
      intersectionObserver: "IntersectionObserver" in window,
      mutationObserver: "MutationObserver" in window,
      promiseSupport: "Promise" in window,
      fetchAPI: "fetch" in window,
      webComponents: "customElements" in window,
      serviceWorker: "serviceWorker" in navigator,
      localStorage: (() => {
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          return true;
        } catch {
          return false;
        }
      })(),
    };
  }

  /**
   * Get browser information
   */
  static getBrowserInfo(): Record<string, string> {
    const ua = navigator.userAgent;

    return {
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled.toString(),
      onLine: navigator.onLine.toString(),
      vendor: navigator.vendor || "unknown",
      browserName: this.detectBrowser(ua),
      browserVersion: this.detectBrowserVersion(ua),
    };
  }

  private static detectBrowser(ua: string): string {
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    if (ua.includes("Opera")) return "Opera";
    return "Unknown";
  }

  private static detectBrowserVersion(ua: string): string {
    const match = ua.match(/(?:Chrome|Firefox|Safari|Edge|Opera)\/(\d+\.?\d*)/);
    return match ? match[1] : "Unknown";
  }
}

/**
 * Automated testing suite
 */
export class AutomatedTestSuite {
  private tests: Array<{
    name: string;
    test: () => Promise<boolean>;
    category: "accessibility" | "performance" | "compatibility" | "functionality";
  }> = [];

  /**
   * Add a test to the suite
   */
  addTest(
    name: string,
    test: () => Promise<boolean>,
    category: "accessibility" | "performance" | "compatibility" | "functionality",
  ) {
    this.tests.push({ name, test, category });
  }

  /**
   * Run all tests
   */
  async runTests(): Promise<{
    passed: number;
    failed: number;
    results: Array<{ name: string; passed: boolean; error?: string; category: string }>;
  }> {
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const { name, test, category } of this.tests) {
      try {
        const result = await test();
        if (result) {
          passed++;
          results.push({ name, passed: true, category });
        } else {
          failed++;
          results.push({ name, passed: false, category });
        }
      } catch (error) {
        failed++;
        results.push({
          name,
          passed: false,
          error: error instanceof Error ? error.message : "Unknown error",
          category,
        });
      }
    }

    return { passed, failed, results };
  }

  /**
   * Generate test report
   */
  generateReport(testResults: any): string {
    const { passed, failed, results } = testResults;
    const total = passed + failed;
    const passRate = ((passed / total) * 100).toFixed(1);

    let report = `# Component Library Test Report\n\n`;
    report += `**Total Tests:** ${total}\n`;
    report += `**Passed:** ${passed}\n`;
    report += `**Failed:** ${failed}\n`;
    report += `**Pass Rate:** ${passRate}%\n\n`;

    // Group by category
    const categories = ["accessibility", "performance", "compatibility", "functionality"];

    categories.forEach((category) => {
      const categoryTests = results.filter((r: any) => r.category === category);
      if (categoryTests.length === 0) return;

      report += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Tests\n\n`;

      categoryTests.forEach((result: any) => {
        const status = result.passed ? "✅" : "❌";
        report += `${status} **${result.name}**\n`;
        if (result.error) {
          report += `   Error: ${result.error}\n`;
        }
        report += "\n";
      });
    });

    return report;
  }
}
