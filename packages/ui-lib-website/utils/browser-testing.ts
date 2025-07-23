// Browser Testing Utilities for Cross-Platform Compatibility

interface BrowserTest {
  name: string;
  version: string;
  userAgent: string;
  features: string[];
  passed: boolean;
}

interface TestResult {
  browser: string;
  tests: Array<{
    name: string;
    passed: boolean;
    details?: string;
  }>;
  overall: boolean;
}

export class BrowserTester {
  private results: TestResult[] = [];

  // Feature detection tests
  async runFeatureTests(): Promise<TestResult> {
    const browserInfo = this.getBrowserInfo();
    const tests = [
      this.testCSSSSupport(),
      this.testJavaScriptFeatures(),
      this.testWebAPIs(),
      this.testResponsiveDesign(),
      this.testAccessibility(),
      this.testPerformance(),
    ];

    const testResults = await Promise.all(tests);
    const overall = testResults.every((test) => test.passed);

    return {
      browser: browserInfo.name,
      tests: testResults,
      overall,
    };
  }

  private getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let name = "Unknown";
    let version = "Unknown";

    if (userAgent.includes("Chrome")) {
      name = "Chrome";
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || "Unknown";
    } else if (userAgent.includes("Firefox")) {
      name = "Firefox";
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || "Unknown";
    } else if (userAgent.includes("Safari")) {
      name = "Safari";
      version = userAgent.match(/Version\/(\d+)/)?.[1] || "Unknown";
    } else if (userAgent.includes("Edge")) {
      name = "Edge";
      version = userAgent.match(/Edge\/(\d+)/)?.[1] || "Unknown";
    }

    return { name, version, userAgent };
  }

  private testCSSSSupport() {
    const tests = [
      "CSS Grid",
      "CSS Flexbox",
      "CSS Custom Properties",
      "CSS Transitions",
      "CSS Transforms",
    ];

    let passed = true;
    let details = "";

    // Test CSS Grid
    if (!CSS.supports("display", "grid")) {
      passed = false;
      details += "CSS Grid not supported. ";
    }

    // Test CSS Custom Properties
    if (!CSS.supports("color", "var(--test)")) {
      passed = false;
      details += "CSS Custom Properties not supported. ";
    }

    // Test CSS Flexbox
    if (!CSS.supports("display", "flex")) {
      passed = false;
      details += "CSS Flexbox not supported. ";
    }

    return {
      name: "CSS Support",
      passed,
      details: details || "All CSS features supported",
    };
  }

  private testJavaScriptFeatures() {
    let passed = true;
    let details = "";

    // Test ES6 features
    try {
      // Arrow functions
      const test = () => true;

      // Template literals
      const template = `test ${test()}`;

      // Destructuring
      const { length } = "test";

      // Async/await
      if (typeof Promise === "undefined") {
        passed = false;
        details += "Promises not supported. ";
      }

      // Intersection Observer
      if (typeof IntersectionObserver === "undefined") {
        passed = false;
        details += "IntersectionObserver not supported. ";
      }
    } catch (error) {
      passed = false;
      details += `JavaScript error: ${error.message}. `;
    }

    return {
      name: "JavaScript Features",
      passed,
      details: details || "All JavaScript features supported",
    };
  }

  private testWebAPIs() {
    let passed = true;
    let details = "";

    // Test required Web APIs
    const requiredAPIs = [
      "localStorage",
      "sessionStorage",
      "fetch",
      "ResizeObserver",
      "MutationObserver",
    ];

    for (const api of requiredAPIs) {
      if (!(api in window)) {
        passed = false;
        details += `${api} not supported. `;
      }
    }

    return {
      name: "Web APIs",
      passed,
      details: details || "All Web APIs supported",
    };
  }

  private testResponsiveDesign() {
    let passed = true;
    let details = "";

    // Test viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      passed = false;
      details += "Viewport meta tag missing. ";
    }

    // Test media query support
    if (!globalThis.matchMedia) {
      passed = false;
      details += "Media queries not supported. ";
    }

    // Test screen size detection
    try {
      const mq = globalThis.matchMedia("(min-width: 768px)");
      if (!mq.matches && !mq.media) {
        passed = false;
        details += "Media query functionality broken. ";
      }
    } catch (error) {
      passed = false;
      details += "Media query test failed. ";
    }

    return {
      name: "Responsive Design",
      passed,
      details: details || "Responsive design fully supported",
    };
  }

  private testAccessibility() {
    let passed = true;
    let details = "";

    // Test ARIA support
    const testElement = document.createElement("div");
    testElement.setAttribute("role", "button");
    testElement.setAttribute("aria-label", "test");

    if (!testElement.getAttribute("role") || !testElement.getAttribute("aria-label")) {
      passed = false;
      details += "ARIA attributes not supported. ";
    }

    // Test focus management
    if (typeof testElement.focus !== "function") {
      passed = false;
      details += "Focus management not supported. ";
    }

    // Test screen reader detection (basic)
    if (
      globalThis.navigator.userAgent.includes("NVDA") ||
      globalThis.navigator.userAgent.includes("JAWS") ||
      globalThis.speechSynthesis
    ) {
      details += "Screen reader detected. ";
    }

    return {
      name: "Accessibility",
      passed,
      details: details || "Basic accessibility features supported",
    };
  }

  private async testPerformance() {
    let passed = true;
    let details = "";

    // Test Performance API
    if (!globalThis.performance) {
      passed = false;
      details += "Performance API not supported. ";
      return { name: "Performance", passed, details };
    }

    // Test basic performance metrics
    try {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;

      if (loadTime > 5000) {
        passed = false;
        details += `Slow load time: ${loadTime}ms. `;
      }

      // Test memory usage (if available)
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
          details += "High memory usage detected. ";
        }
      }
    } catch (error) {
      details += "Performance measurement failed. ";
    }

    return {
      name: "Performance",
      passed,
      details: details || "Performance tests passed",
    };
  }

  // Generate compatibility report
  generateReport(results: TestResult[]): string {
    let report = "# Browser Compatibility Report\n\n";

    for (const result of results) {
      report += `## ${result.browser}\n\n`;
      report += `**Overall Status:** ${result.overall ? "✅ PASS" : "❌ FAIL"}\n\n`;

      for (const test of result.tests) {
        report += `- **${test.name}:** ${test.passed ? "✅" : "❌"} ${test.details || ""}\n`;
      }

      report += "\n";
    }

    return report;
  }

  // Test component rendering across browsers
  async testComponentRendering(): Promise<boolean> {
    const testCases = [
      { selector: ".btn", expected: "button" },
      { selector: ".card", expected: "card container" },
      { selector: ".navbar", expected: "navigation" },
      { selector: ".drawer", expected: "side panel" },
    ];

    let allPassed = true;

    for (const testCase of testCases) {
      const element = document.querySelector(testCase.selector);
      if (!element) {
        console.warn(`Component not found: ${testCase.selector}`);
        allPassed = false;
        continue;
      }

      // Test computed styles
      const styles = getComputedStyle(element);
      if (!styles.display || styles.display === "none") {
        console.warn(`Component not rendering: ${testCase.selector}`);
        allPassed = false;
      }
    }

    return allPassed;
  }
}

// Mobile-specific testing utilities
export class MobileTester {
  // Test touch events
  testTouchSupport(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  // Test device orientation
  testOrientationSupport(): boolean {
    return "orientation" in window || "onorientationchange" in window;
  }

  // Test viewport scaling
  testViewportHandling(): boolean {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return false;

    const content = viewport.getAttribute("content") || "";
    return content.includes("width=device-width") && content.includes("initial-scale=1");
  }

  // Test PWA features
  testPWASupport(): { serviceWorker: boolean; manifest: boolean; installable: boolean } {
    return {
      serviceWorker: "serviceWorker" in navigator,
      manifest: !!document.querySelector('link[rel="manifest"]'),
      installable: "onbeforeinstallprompt" in window,
    };
  }

  // Generate mobile compatibility report
  generateMobileReport(): string {
    const touch = this.testTouchSupport();
    const orientation = this.testOrientationSupport();
    const viewport = this.testViewportHandling();
    const pwa = this.testPWASupport();

    return `# Mobile Compatibility Report

## Touch Support
${touch ? "✅ Touch events supported" : "❌ Touch events not supported"}

## Orientation Support
${orientation ? "✅ Orientation detection supported" : "❌ Orientation detection not supported"}

## Viewport Handling
${viewport ? "✅ Proper viewport configuration" : "❌ Viewport configuration issues"}

## PWA Features
- Service Worker: ${pwa.serviceWorker ? "✅" : "❌"}
- Web App Manifest: ${pwa.manifest ? "✅" : "❌"}
- Installable: ${pwa.installable ? "✅" : "❌"}
`;
  }
}

// Usage example and test runner
export function runBrowserTests(): void {
  const tester = new BrowserTester();
  const mobileTester = new MobileTester();

  // Run all tests
  tester.runFeatureTests().then((results) => {
    console.log("Browser Tests Results:", results);

    // Generate and log report
    const report = tester.generateReport([results]);
    console.log(report);
  });

  // Run mobile tests
  if (mobileTester.testTouchSupport()) {
    const mobileReport = mobileTester.generateMobileReport();
    console.log(mobileReport);
  }

  // Test component rendering
  tester.testComponentRendering().then((passed) => {
    console.log("Component rendering test:", passed ? "PASSED" : "FAILED");
  });
}

// Auto-run tests when loaded
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // Run tests after page load
    setTimeout(runBrowserTests, 1000);
  });
}
