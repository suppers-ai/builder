// Mobile Testing Utilities for iOS Safari and Chrome Mobile

interface MobileTestResult {
  device: string;
  browser: string;
  tests: Array<{
    name: string;
    passed: boolean;
    details?: string;
  }>;
  overall: boolean;
}

interface DeviceInfo {
  name: string;
  type: "phone" | "tablet";
  os: string;
  browser: string;
  viewportWidth: number;
  viewportHeight: number;
  pixelRatio: number;
}

export class MobileCompatibilityTester {
  private deviceInfo: DeviceInfo;

  constructor() {
    this.deviceInfo = this.detectDevice();
  }

  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    let name = "Unknown Device";
    let type: "phone" | "tablet" = "phone";
    let os = "Unknown OS";
    let browser = "Unknown Browser";

    // Detect OS
    if (/iPhone|iPod/.test(userAgent)) {
      os = "iOS";
      name = userAgent.includes("iPhone") ? "iPhone" : "iPod";
      type = "phone";
    } else if (/iPad/.test(userAgent)) {
      os = "iOS";
      name = "iPad";
      type = "tablet";
    } else if (/Android/.test(userAgent)) {
      os = "Android";
      name = "Android Device";
      type = viewportWidth > 768 ? "tablet" : "phone";
    }

    // Detect browser
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      browser = "Safari";
    } else if (/Chrome/.test(userAgent)) {
      browser = "Chrome Mobile";
    } else if (/Firefox/.test(userAgent)) {
      browser = "Firefox Mobile";
    }

    return {
      name,
      type,
      os,
      browser,
      viewportWidth,
      viewportHeight,
      pixelRatio,
    };
  }

  async runMobileTests(): Promise<MobileTestResult> {
    const tests = [
      this.testTouchInteractions(),
      this.testViewportHandling(),
      this.testOrientationChanges(),
      this.testScrollBehavior(),
      this.testTapTargets(),
      this.testFormInputs(),
      this.testModalBehavior(),
      this.testPerformanceOnMobile(),
      this.testPWAFeatures(),
    ];

    const testResults = await Promise.all(tests);
    const overall = testResults.every((test) => test.passed);

    return {
      device: this.deviceInfo.name,
      browser: this.deviceInfo.browser,
      tests: testResults,
      overall,
    };
  }

  private testTouchInteractions() {
    let passed = true;
    let details = "";

    // Test touch events
    if (!("ontouchstart" in window)) {
      passed = false;
      details += "Touch events not supported. ";
    }

    // Test touch action CSS support
    if (!CSS.supports("touch-action", "manipulation")) {
      passed = false;
      details += "touch-action CSS not supported. ";
    }

    // Test gesture events (iOS specific)
    if (this.deviceInfo.os === "iOS") {
      if (!("ongesturestart" in window)) {
        details += "Gesture events not available. ";
      }
    }

    // Test maximum touch points
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    if (maxTouchPoints < 1) {
      passed = false;
      details += "No touch points detected. ";
    }

    return {
      name: "Touch Interactions",
      passed,
      details: details || `Touch support detected (${maxTouchPoints} points)`,
    };
  }

  private testViewportHandling() {
    let passed = true;
    let details = "";

    // Check viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewport) {
      passed = false;
      details += "Viewport meta tag missing. ";
      return { name: "Viewport Handling", passed, details };
    }

    const content = viewport.content;

    // Check for proper viewport settings
    if (!content.includes("width=device-width")) {
      passed = false;
      details += "width=device-width missing. ";
    }

    if (!content.includes("initial-scale=1")) {
      passed = false;
      details += "initial-scale=1 missing. ";
    }

    // Test for zoom prevention (should be avoided for accessibility)
    if (content.includes("user-scalable=no") || content.includes("maximum-scale=1")) {
      details += "Warning: Zoom disabled (accessibility concern). ";
    }

    // Test actual viewport behavior
    const actualWidth = window.innerWidth;
    const screenWidth = screen.width;

    if (Math.abs(actualWidth - (screenWidth / this.deviceInfo.pixelRatio)) > 50) {
      details += "Viewport scaling may be incorrect. ";
    }

    return {
      name: "Viewport Handling",
      passed,
      details: details || "Viewport properly configured",
    };
  }

  private async testOrientationChanges() {
    let passed = true;
    let details = "";

    // Test orientation API
    if (!("orientation" in window) && !("onorientationchange" in window)) {
      passed = false;
      details += "Orientation API not supported. ";
    }

    // Test CSS orientation media queries
    try {
      const portraitQuery = window.matchMedia("(orientation: portrait)");
      const landscapeQuery = window.matchMedia("(orientation: landscape)");

      if (!portraitQuery.media || !landscapeQuery.media) {
        passed = false;
        details += "Orientation media queries not supported. ";
      }
    } catch (error) {
      passed = false;
      details += "Media query test failed. ";
    }

    // Test screen orientation API (modern)
    if ("screen" in window && "orientation" in screen) {
      try {
        const orientation = screen.orientation;
        details += `Current orientation: ${orientation.type}. `;
      } catch (error) {
        details += "Screen orientation API error. ";
      }
    }

    return {
      name: "Orientation Changes",
      passed,
      details: details || "Orientation handling supported",
    };
  }

  private testScrollBehavior() {
    let passed = true;
    let details = "";

    // Test smooth scrolling
    if (!CSS.supports("scroll-behavior", "smooth")) {
      details += "Smooth scrolling not supported. ";
    }

    // Test momentum scrolling (iOS)
    if (this.deviceInfo.os === "iOS") {
      if (!CSS.supports("-webkit-overflow-scrolling", "touch")) {
        details += "iOS momentum scrolling not supported. ";
      }
    }

    // Test overscroll behavior
    if (!CSS.supports("overscroll-behavior", "contain")) {
      details += "overscroll-behavior not supported. ";
    }

    // Test scroll restoration
    if (!("scrollRestoration" in history)) {
      details += "Scroll restoration not supported. ";
    }

    return {
      name: "Scroll Behavior",
      passed,
      details: details || "Scroll behavior fully supported",
    };
  }

  private testTapTargets() {
    let passed = true;
    let details = "";

    // Find all interactive elements
    const interactiveElements = document.querySelectorAll(
      "button, a, input, select, textarea, [tabindex], [onclick], .btn",
    );

    let smallTargets = 0;
    const minSize = 44; // Apple's recommended minimum

    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        smallTargets++;
      }
    });

    if (smallTargets > 0) {
      passed = false;
      details += `${smallTargets} tap targets smaller than ${minSize}px. `;
    }

    // Test spacing between targets
    let closeTargets = 0;
    for (let i = 0; i < interactiveElements.length - 1; i++) {
      const current = interactiveElements[i].getBoundingClientRect();
      const next = interactiveElements[i + 1].getBoundingClientRect();

      const distance = Math.min(
        Math.abs(current.right - next.left),
        Math.abs(current.bottom - next.top),
      );

      if (distance < 8) { // Minimum spacing
        closeTargets++;
      }
    }

    if (closeTargets > 0) {
      details += `${closeTargets} tap targets too close together. `;
    }

    return {
      name: "Tap Targets",
      passed,
      details: details || `All ${interactiveElements.length} targets properly sized and spaced`,
    };
  }

  private testFormInputs() {
    let passed = true;
    let details = "";

    const inputs = document.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
      // Test input types
      if (input instanceof HTMLInputElement) {
        const type = input.type;

        // Test HTML5 input type support
        const testInput = document.createElement("input");
        testInput.type = type;

        if (testInput.type !== type) {
          details += `Input type "${type}" not supported. `;
        }
      }

      // Test for proper labels
      const label = input.labels?.[0] || document.querySelector(`label[for="${input.id}"]`);
      if (!label && !input.getAttribute("aria-label")) {
        details += "Input missing proper label. ";
      }
    });

    // Test virtual keyboard handling
    if (this.deviceInfo.type === "phone") {
      // Check if viewport height changes are handled
      const originalHeight = window.innerHeight;
      details += `Viewport height: ${originalHeight}px. `;
    }

    return {
      name: "Form Inputs",
      passed,
      details: details || `${inputs.length} form inputs properly configured`,
    };
  }

  private testModalBehavior() {
    let passed = true;
    let details = "";

    // Look for modal elements
    const modals = document.querySelectorAll('.modal, [role="dialog"], .drawer');

    if (modals.length === 0) {
      return {
        name: "Modal Behavior",
        passed: true,
        details: "No modals found to test",
      };
    }

    modals.forEach((modal) => {
      // Test if modal prevents body scroll
      const computedStyle = getComputedStyle(document.body);

      // Test focus trap (basic check)
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length === 0) {
        details += "Modal has no focusable elements. ";
      }

      // Test ARIA attributes
      if (!modal.getAttribute("role") && !modal.classList.contains("modal")) {
        details += "Modal missing proper ARIA role. ";
      }
    });

    return {
      name: "Modal Behavior",
      passed,
      details: details || `${modals.length} modals properly configured`,
    };
  }

  private async testPerformanceOnMobile() {
    let passed = true;
    let details = "";

    if (!window.performance) {
      passed = false;
      details += "Performance API not available. ";
      return { name: "Mobile Performance", passed, details };
    }

    try {
      // Test First Contentful Paint
      const fcpEntries = performance.getEntriesByName("first-contentful-paint");
      if (fcpEntries.length > 0) {
        const fcp = fcpEntries[0].startTime;
        if (fcp > 2000) { // 2 seconds threshold for mobile
          passed = false;
          details += `Slow FCP: ${fcp}ms. `;
        }
      }

      // Test Largest Contentful Paint
      const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
      if (lcpEntries.length > 0) {
        const lcp = lcpEntries[lcpEntries.length - 1].startTime;
        if (lcp > 4000) { // 4 seconds threshold for mobile
          passed = false;
          details += `Slow LCP: ${lcp}ms. `;
        }
      }

      // Test memory usage (if available)
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        if (usedMB > 30) { // 30MB threshold for mobile
          details += `High memory usage: ${usedMB.toFixed(1)}MB. `;
        }
      }

      // Test frame rate (basic check)
      let frameCount = 0;
      const startTime = performance.now();

      const countFrames = () => {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          if (frameCount < 50) { // Below 50fps
            details += `Low frame rate: ${frameCount}fps. `;
          }
        }
      };
      requestAnimationFrame(countFrames);
    } catch (error) {
      details += "Performance measurement failed. ";
    }

    return {
      name: "Mobile Performance",
      passed,
      details: details || "Performance metrics within acceptable ranges",
    };
  }

  private testPWAFeatures() {
    let passed = true;
    let details = "";

    // Test service worker support
    if (!("serviceWorker" in navigator)) {
      details += "Service Worker not supported. ";
    }

    // Test web app manifest
    const manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      details += "Web App Manifest not found. ";
    }

    // Test install prompt
    if (!("onbeforeinstallprompt" in window)) {
      details += "Install prompt not supported. ";
    }

    // Test web share API (mobile specific)
    if (!("share" in navigator)) {
      details += "Web Share API not supported. ";
    }

    // Test offline functionality
    if (!("onLine" in navigator)) {
      details += "Online/offline detection not supported. ";
    }

    return {
      name: "PWA Features",
      passed,
      details: details || "PWA features available",
    };
  }

  generateMobileReport(result: MobileTestResult): string {
    let report = `# Mobile Compatibility Report\n\n`;
    report += `**Device:** ${result.device}\n`;
    report += `**Browser:** ${result.browser}\n`;
    report += `**OS:** ${this.deviceInfo.os}\n`;
    report += `**Viewport:** ${this.deviceInfo.viewportWidth}x${this.deviceInfo.viewportHeight}\n`;
    report += `**Pixel Ratio:** ${this.deviceInfo.pixelRatio}\n\n`;
    report += `**Overall Status:** ${result.overall ? "✅ PASS" : "❌ FAIL"}\n\n`;

    report += `## Test Results\n\n`;
    for (const test of result.tests) {
      report += `### ${test.name}\n`;
      report += `**Status:** ${test.passed ? "✅ PASS" : "❌ FAIL"}\n`;
      if (test.details) {
        report += `**Details:** ${test.details}\n`;
      }
      report += "\n";
    }

    return report;
  }
}

// iOS Safari specific tests
export class iOSSafariTester extends MobileCompatibilityTester {
  testSafariBehaviors() {
    const tests = [];

    // Test address bar hiding
    tests.push({
      name: "Address Bar Hiding",
      test: () => {
        const initialHeight = window.innerHeight;
        // Simulate scroll to hide address bar
        window.scrollTo(0, 1);
        setTimeout(() => {
          const newHeight = window.innerHeight;
          return newHeight > initialHeight;
        }, 100);
      },
    });

    // Test rubber band scrolling
    tests.push({
      name: "Rubber Band Scroll Prevention",
      test: () => CSS.supports("overscroll-behavior", "none"),
    });

    // Test 100vh issues
    tests.push({
      name: "100vh Viewport Issues",
      test: () => {
        const testEl = document.createElement("div");
        testEl.style.height = "100vh";
        document.body.appendChild(testEl);
        const computedHeight = testEl.offsetHeight;
        document.body.removeChild(testEl);

        return computedHeight === window.innerHeight;
      },
    });

    return tests;
  }
}

// Usage example
export function runMobileCompatibilityTests(): void {
  const tester = new MobileCompatibilityTester();

  tester.runMobileTests().then((result) => {
    const report = tester.generateMobileReport(result);
    console.log(report);

    // Log to console for debugging
    console.log("Mobile Test Results:", result);
  });
}

// Auto-run on mobile devices
if (typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent)) {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(runMobileCompatibilityTests, 2000);
  });
}
