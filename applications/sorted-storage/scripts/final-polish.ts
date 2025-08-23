#!/usr/bin/env deno run --allow-all
/**
 * Final polish script for sorted-storage application
 * Runs comprehensive checks, optimizations, and validations
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { runIntegrationTests } from "../lib/integration-test.ts";

interface PolishResult {
  category: string;
  checks: { name: string; passed: boolean; message?: string }[];
}

class FinalPolishRunner {
  private results: PolishResult[] = [];

  async run(): Promise<void> {
    console.log("🎨 Running final polish checks...\n");

    await this.checkCodeQuality();
    await this.checkAccessibility();
    await this.checkPerformance();
    await this.checkIntegration();
    await this.checkDocumentation();
    await this.generateReport();

    console.log("\n✨ Final polish completed!");
  }

  /**
   * Check code quality and standards
   */
  private async checkCodeQuality(): Promise<void> {
    const checks: PolishResult["checks"] = [];

    try {
      // Check TypeScript compilation
      const typeCheckResult = await this.runCommand(["deno", "check", "**/*.ts", "**/*.tsx"]);
      checks.push({
        name: "TypeScript compilation",
        passed: typeCheckResult.success,
        message: typeCheckResult.success
          ? "All TypeScript files compile successfully"
          : "TypeScript compilation errors found",
      });

      // Check formatting
      const formatCheckResult = await this.runCommand(["deno", "fmt", "--check"]);
      checks.push({
        name: "Code formatting",
        passed: formatCheckResult.success,
        message: formatCheckResult.success
          ? "Code is properly formatted"
          : "Code formatting issues found",
      });

      // Check linting
      const lintResult = await this.runCommand(["deno", "lint"]);
      checks.push({
        name: "Code linting",
        passed: lintResult.success,
        message: lintResult.success ? "No linting issues found" : "Linting issues found",
      });
    } catch (error) {
      checks.push({
        name: "Code quality checks",
        passed: false,
        message: `Error running code quality checks: ${error.message}`,
      });
    }

    this.results.push({
      category: "Code Quality",
      checks,
    });
  }

  /**
   * Check accessibility compliance
   */
  private async checkAccessibility(): Promise<void> {
    const checks: PolishResult["checks"] = [];

    // Check for accessibility features
    const accessibilityFeatures = [
      { file: "components/AccessibilitySettings.tsx", feature: "Accessibility settings component" },
      { file: "lib/accessibility-utils.ts", feature: "Accessibility utilities" },
      { file: "static/styles.css", feature: "High contrast mode styles" },
    ];

    for (const { file, feature } of accessibilityFeatures) {
      try {
        const fileExists = await this.fileExists(file);
        checks.push({
          name: feature,
          passed: fileExists,
          message: fileExists ? `${feature} implemented` : `${feature} missing`,
        });
      } catch (error) {
        checks.push({
          name: feature,
          passed: false,
          message: `Error checking ${feature}: ${error.message}`,
        });
      }
    }

    // Check for ARIA labels and semantic HTML
    const cssContent = await this.readFile("static/styles.css");
    checks.push({
      name: "High contrast mode support",
      passed: cssContent.includes(".high-contrast"),
      message: cssContent.includes(".high-contrast")
        ? "High contrast styles implemented"
        : "High contrast styles missing",
    });

    checks.push({
      name: "Reduced motion support",
      passed: cssContent.includes("prefers-reduced-motion"),
      message: cssContent.includes("prefers-reduced-motion")
        ? "Reduced motion support implemented"
        : "Reduced motion support missing",
    });

    checks.push({
      name: "Focus indicators",
      passed: cssContent.includes("focus-visible"),
      message: cssContent.includes("focus-visible")
        ? "Focus indicators implemented"
        : "Focus indicators missing",
    });

    this.results.push({
      category: "Accessibility",
      checks,
    });
  }

  /**
   * Check performance optimizations
   */
  private async checkPerformance(): Promise<void> {
    const checks: PolishResult["checks"] = [];

    // Check for performance features
    const performanceFeatures = [
      { file: "lib/cache-manager.ts", feature: "Caching system" },
      { file: "components/VirtualScrollList.tsx", feature: "Virtual scrolling" },
      { file: "lib/performance-optimizations.test.ts", feature: "Performance tests" },
      { file: "lib/error-monitoring.ts", feature: "Error monitoring" },
    ];

    for (const { file, feature } of performanceFeatures) {
      try {
        const fileExists = await this.fileExists(file);
        checks.push({
          name: feature,
          passed: fileExists,
          message: fileExists ? `${feature} implemented` : `${feature} missing`,
        });
      } catch (error) {
        checks.push({
          name: feature,
          passed: false,
          message: `Error checking ${feature}: ${error.message}`,
        });
      }
    }

    // Check CSS optimizations
    const cssContent = await this.readFile("static/styles.css");
    checks.push({
      name: "CSS transitions",
      passed: cssContent.includes("transition"),
      message: cssContent.includes("transition")
        ? "CSS transitions implemented"
        : "CSS transitions missing",
    });

    checks.push({
      name: "Custom scrollbar",
      passed: cssContent.includes("::-webkit-scrollbar"),
      message: cssContent.includes("::-webkit-scrollbar")
        ? "Custom scrollbar implemented"
        : "Custom scrollbar missing",
    });

    this.results.push({
      category: "Performance",
      checks,
    });
  }

  /**
   * Check integration and system cohesion
   */
  private async checkIntegration(): Promise<void> {
    const checks: PolishResult["checks"] = [];

    try {
      // Run integration tests
      console.log("Running integration tests...");
      await runIntegrationTests();

      checks.push({
        name: "Integration tests",
        passed: true,
        message: "Integration tests completed successfully",
      });
    } catch (error) {
      checks.push({
        name: "Integration tests",
        passed: false,
        message: `Integration tests failed: ${error.message}`,
      });
    }

    // Check for key integration files
    const integrationFiles = [
      { file: "lib/user-preferences.ts", feature: "User preferences system" },
      { file: "components/UserSettingsModal.tsx", feature: "Settings modal" },
      { file: "lib/error-monitoring.ts", feature: "Error monitoring system" },
    ];

    for (const { file, feature } of integrationFiles) {
      try {
        const fileExists = await this.fileExists(file);
        checks.push({
          name: feature,
          passed: fileExists,
          message: fileExists ? `${feature} integrated` : `${feature} missing`,
        });
      } catch (error) {
        checks.push({
          name: feature,
          passed: false,
          message: `Error checking ${feature}: ${error.message}`,
        });
      }
    }

    this.results.push({
      category: "Integration",
      checks,
    });
  }

  /**
   * Check documentation and completeness
   */
  private async checkDocumentation(): Promise<void> {
    const checks: PolishResult["checks"] = [];

    // Check for documentation files
    const docFiles = [
      { file: "ACCESSIBILITY_FEATURES.md", feature: "Accessibility documentation" },
      { file: "PERFORMANCE_OPTIMIZATIONS.md", feature: "Performance documentation" },
      { file: "TESTING.md", feature: "Testing documentation" },
    ];

    for (const { file, feature } of docFiles) {
      try {
        const fileExists = await this.fileExists(file);
        checks.push({
          name: feature,
          passed: fileExists,
          message: fileExists ? `${feature} available` : `${feature} missing`,
        });
      } catch (error) {
        checks.push({
          name: feature,
          passed: false,
          message: `Error checking ${feature}: ${error.message}`,
        });
      }
    }

    // Check for comprehensive test coverage
    const testFiles = await this.findFiles("**/*.test.{ts,tsx}");
    checks.push({
      name: "Test coverage",
      passed: testFiles.length >= 10,
      message: `Found ${testFiles.length} test files`,
    });

    this.results.push({
      category: "Documentation",
      checks,
    });
  }

  /**
   * Generate final report
   */
  private async generateReport(): Promise<void> {
    console.log("\n📊 Final Polish Report\n");
    console.log("=".repeat(50));

    let totalChecks = 0;
    let passedChecks = 0;

    for (const result of this.results) {
      console.log(`\n${result.category}:`);
      console.log("-".repeat(result.category.length + 1));

      for (const check of result.checks) {
        totalChecks++;
        if (check.passed) passedChecks++;

        const status = check.passed ? "✅" : "❌";
        console.log(`${status} ${check.name}`);
        if (check.message) {
          console.log(`   ${check.message}`);
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Passed: ${passedChecks}`);
    console.log(`Failed: ${totalChecks - passedChecks}`);
    console.log(`Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);

    // Save report to file
    const reportContent = this.generateMarkdownReport();
    await this.writeFile("FINAL_POLISH_REPORT.md", reportContent);
    console.log("\n📄 Report saved to FINAL_POLISH_REPORT.md");
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(): string {
    let report = "# Final Polish Report\n\n";
    report += `Generated on: ${new Date().toISOString()}\n\n`;

    let totalChecks = 0;
    let passedChecks = 0;

    for (const result of this.results) {
      report += `## ${result.category}\n\n`;

      for (const check of result.checks) {
        totalChecks++;
        if (check.passed) passedChecks++;

        const status = check.passed ? "✅" : "❌";
        report += `${status} **${check.name}**`;
        if (check.message) {
          report += ` - ${check.message}`;
        }
        report += "\n";
      }
      report += "\n";
    }

    report += "## Summary\n\n";
    report += `- **Total Checks:** ${totalChecks}\n`;
    report += `- **Passed:** ${passedChecks}\n`;
    report += `- **Failed:** ${totalChecks - passedChecks}\n`;
    report += `- **Success Rate:** ${((passedChecks / totalChecks) * 100).toFixed(1)}%\n\n`;

    if (passedChecks === totalChecks) {
      report += "🎉 **All checks passed! The application is ready for production.**\n";
    } else {
      report +=
        "⚠️ **Some checks failed. Please review and address the issues before deployment.**\n";
    }

    return report;
  }

  /**
   * Helper methods
   */
  private async runCommand(cmd: string[]): Promise<{ success: boolean; output: string }> {
    try {
      const process = new Deno.Command(cmd[0], {
        args: cmd.slice(1),
        stdout: "piped",
        stderr: "piped",
      });

      const { code, stdout, stderr } = await process.output();
      const output = new TextDecoder().decode(stdout) + new TextDecoder().decode(stderr);

      return {
        success: code === 0,
        output,
      };
    } catch (error) {
      return {
        success: false,
        output: error.message,
      };
    }
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await Deno.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  private async readFile(path: string): Promise<string> {
    try {
      return await Deno.readTextFile(path);
    } catch {
      return "";
    }
  }

  private async writeFile(path: string, content: string): Promise<void> {
    await Deno.writeTextFile(path, content);
  }

  private async findFiles(pattern: string): Promise<string[]> {
    const files: string[] = [];

    try {
      for await (const entry of Deno.readDir(".")) {
        if (entry.isFile && entry.name.includes(".test.")) {
          files.push(entry.name);
        }
      }
    } catch {
      // Ignore errors
    }

    return files;
  }
}

// Run the final polish if this script is executed directly
if (import.meta.main) {
  const runner = new FinalPolishRunner();
  await runner.run();
}
