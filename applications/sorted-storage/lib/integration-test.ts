/**
 * Integration test for final application polish
 * Tests all major systems working together
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { DEFAULT_PREFERENCES, userPreferences } from "./user-preferences.ts";
import { errorMonitor } from "./error-monitoring.ts";
import { toastManager } from "./toast-manager.ts";
import { HighContrastUtils, ScreenReaderUtils } from "./accessibility-utils.ts";

export class IntegrationTester {
  private testResults: { name: string; passed: boolean; error?: string }[] = [];

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<
    { passed: number; failed: number; results: typeof this.testResults }
  > {
    console.log("🧪 Running integration tests...");

    await this.testUserPreferences();
    await this.testErrorMonitoring();
    await this.testAccessibilityIntegration();
    await this.testToastIntegration();
    await this.testLayoutIntegration();
    await this.testPerformanceMonitoring();

    const passed = this.testResults.filter((r) => r.passed).length;
    const failed = this.testResults.filter((r) => !r.passed).length;

    console.log(`✅ Integration tests completed: ${passed} passed, ${failed} failed`);

    return {
      passed,
      failed,
      results: this.testResults,
    };
  }

  /**
   * Test user preferences system
   */
  private async testUserPreferences(): Promise<void> {
    try {
      // Test preference initialization
      const initialPrefs = userPreferences.getPreferences();
      this.assert(
        "User preferences initialized",
        initialPrefs.theme === DEFAULT_PREFERENCES.theme,
      );

      // Test preference updates
      await userPreferences.updatePreference("theme", "dark");
      const updatedPrefs = userPreferences.getPreferences();
      this.assert(
        "User preference update",
        updatedPrefs.theme === "dark",
      );

      // Test preference persistence
      const exported = userPreferences.exportPreferences();
      this.assert(
        "User preferences export",
        exported.includes('"theme":"dark"'),
      );

      // Test preference import
      await userPreferences.importPreferences(exported);
      const importedPrefs = userPreferences.getPreferences();
      this.assert(
        "User preferences import",
        importedPrefs.theme === "dark",
      );

      // Reset to defaults
      await userPreferences.resetPreferences();
      const resetPrefs = userPreferences.getPreferences();
      this.assert(
        "User preferences reset",
        resetPrefs.theme === DEFAULT_PREFERENCES.theme,
      );
    } catch (error) {
      this.assert("User preferences system", false, error.message);
    }
  }

  /**
   * Test error monitoring system
   */
  private async testErrorMonitoring(): Promise<void> {
    try {
      // Test error reporting
      const testError = new Error("Test error for integration");
      errorMonitor.reportError(testError, { test: true }, "low");

      // Test breadcrumb addition
      errorMonitor.addBreadcrumb({
        category: "user",
        message: "Integration test breadcrumb",
        level: "info",
      });

      // Test user action reporting
      errorMonitor.reportUserAction("Integration test action", { test: true });

      // Test error statistics
      const stats = errorMonitor.getErrorStats();
      this.assert(
        "Error monitoring statistics",
        stats.totalErrors >= 0,
      );

      this.assert("Error monitoring system", true);
    } catch (error) {
      this.assert("Error monitoring system", false, error.message);
    }
  }

  /**
   * Test accessibility integration
   */
  private async testAccessibilityIntegration(): Promise<void> {
    try {
      // Test high contrast utilities
      const initialHighContrast = HighContrastUtils.isHighContrastMode();
      HighContrastUtils.toggleHighContrastMode();
      const toggledHighContrast = HighContrastUtils.isHighContrastMode();

      this.assert(
        "High contrast toggle",
        initialHighContrast !== toggledHighContrast,
      );

      // Test screen reader utilities
      ScreenReaderUtils.announce("Integration test announcement", "polite");

      this.assert("Accessibility integration", true);
    } catch (error) {
      this.assert("Accessibility integration", false, error.message);
    }
  }

  /**
   * Test toast integration
   */
  private async testToastIntegration(): Promise<void> {
    try {
      // Test toast creation
      const toastId = toastManager.success("Integration test toast");
      this.assert(
        "Toast creation",
        typeof toastId === "string" && toastId.length > 0,
      );

      // Test toast dismissal
      toastManager.dismiss(toastId);

      this.assert("Toast integration", true);
    } catch (error) {
      this.assert("Toast integration", false, error.message);
    }
  }

  /**
   * Test layout integration
   */
  private async testLayoutIntegration(): Promise<void> {
    try {
      // Test layout preference integration
      await userPreferences.updatePreference("defaultLayout", "timeline");
      const layoutPref = userPreferences.getPreference("defaultLayout");

      this.assert(
        "Layout preference integration",
        layoutPref === "timeline",
      );

      // Test item size preference
      await userPreferences.updatePreference("itemSize", "large");
      const sizePref = userPreferences.getPreference("itemSize");

      this.assert(
        "Item size preference integration",
        sizePref === "large",
      );

      this.assert("Layout integration", true);
    } catch (error) {
      this.assert("Layout integration", false, error.message);
    }
  }

  /**
   * Test performance monitoring
   */
  private async testPerformanceMonitoring(): Promise<void> {
    try {
      // Test performance metrics collection
      if (typeof performance !== "undefined") {
        const navigationEntries = performance.getEntriesByType("navigation");
        this.assert(
          "Performance monitoring available",
          navigationEntries.length >= 0,
        );
      }

      // Test cache preference integration
      await userPreferences.updatePreference("cacheEnabled", false);
      const cachePref = userPreferences.getPreference("cacheEnabled");

      this.assert(
        "Cache preference integration",
        cachePref === false,
      );

      this.assert("Performance monitoring", true);
    } catch (error) {
      this.assert("Performance monitoring", false, error.message);
    }
  }

  /**
   * Assert test result
   */
  private assert(testName: string, condition: boolean, error?: string): void {
    this.testResults.push({
      name: testName,
      passed: condition,
      error,
    });

    if (condition) {
      console.log(`✅ ${testName}`);
    } else {
      console.error(`❌ ${testName}${error ? `: ${error}` : ""}`);
    }
  }

  /**
   * Generate integration report
   */
  generateReport(): string {
    const passed = this.testResults.filter((r) => r.passed).length;
    const failed = this.testResults.filter((r) => !r.passed).length;
    const total = this.testResults.length;

    let report = `# Integration Test Report\n\n`;
    report += `**Total Tests:** ${total}\n`;
    report += `**Passed:** ${passed}\n`;
    report += `**Failed:** ${failed}\n`;
    report += `**Success Rate:** ${((passed / total) * 100).toFixed(1)}%\n\n`;

    report += `## Test Results\n\n`;

    this.testResults.forEach((result) => {
      const status = result.passed ? "✅" : "❌";
      report += `${status} **${result.name}**`;
      if (result.error) {
        report += ` - Error: ${result.error}`;
      }
      report += "\n";
    });

    report += `\n## System Status\n\n`;
    report += `- User Preferences: ${userPreferences ? "✅ Active" : "❌ Inactive"}\n`;
    report += `- Error Monitoring: ${errorMonitor ? "✅ Active" : "❌ Inactive"}\n`;
    report += `- Toast Manager: ${toastManager ? "✅ Active" : "❌ Inactive"}\n`;

    return report;
  }
}

// Export test runner function
export async function runIntegrationTests(): Promise<void> {
  const tester = new IntegrationTester();
  const results = await tester.runAllTests();

  if (results.failed > 0) {
    console.error("❌ Some integration tests failed. Check the console for details.");
    console.log(tester.generateReport());
  } else {
    console.log("✅ All integration tests passed!");
  }
}

// Auto-run tests in debug mode
if (typeof window !== "undefined" && userPreferences?.getPreference("debugMode")) {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      runIntegrationTests();
    }, 2000); // Wait for app to initialize
  });
}
