// Lighthouse Performance Audit Utilities and Monitoring

interface LighthouseMetrics {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  pwaScore?: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay?: number;
    totalBlockingTime: number;
    speedIndex: number;
  };
}

interface PerformanceRecommendation {
  category: string;
  issue: string;
  impact: "high" | "medium" | "low";
  solution: string;
}

export class LighthouseAuditor {
  private observer: PerformanceObserver | null = null;
  private metrics: Partial<LighthouseMetrics["metrics"]> = {};

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === "undefined" || !globalThis.PerformanceObserver) {
      return;
    }

    try {
      // Observe paint metrics
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.name) {
            case "first-contentful-paint":
              this.metrics.firstContentfulPaint = entry.startTime;
              break;
            case "largest-contentful-paint":
              this.metrics.largestContentfulPaint = entry.startTime;
              break;
          }
        }
      });

      this.observer.observe({
        entryTypes: ["paint", "largest-contentful-paint"],
      });

      // Observe layout shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
      });

      clsObserver.observe({ entryTypes: ["layout-shift"] });

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      });

      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (error) {
      console.warn("Performance observers not fully supported:", error);
    }
  }

  // Calculate Core Web Vitals
  async getCoreWebVitals(): Promise<LighthouseMetrics["metrics"]> {
    return new Promise((resolve) => {
      // Wait for metrics to be collected
      setTimeout(() => {
        // Calculate additional metrics
        this.calculateTotalBlockingTime();
        this.calculateSpeedIndex();

        resolve(this.metrics as LighthouseMetrics["metrics"]);
      }, 5000); // Allow time for metrics collection
    });
  }

  private calculateTotalBlockingTime() {
    if (!globalThis.performance) return;

    const navigationEntry = performance.getEntriesByType("navigation")[0];
    if (!navigationEntry) return;

    // Simplified TBT calculation
    const longTasks = performance.getEntriesByType("longtask") as any[];
    let tbt = 0;

    for (const task of longTasks) {
      if (task.duration > 50) {
        tbt += task.duration - 50;
      }
    }

    this.metrics.totalBlockingTime = tbt;
  }

  private calculateSpeedIndex() {
    if (!globalThis.performance) return;

    // Simplified Speed Index calculation based on visual progress
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find((entry) => entry.name === "first-contentful-paint");

    if (fcpEntry) {
      // Simplified approximation
      this.metrics.speedIndex = fcpEntry.startTime * 1.2;
    }
  }

  // Performance score calculation (simplified Lighthouse scoring)
  calculatePerformanceScore(metrics: LighthouseMetrics["metrics"]): number {
    const weights = {
      firstContentfulPaint: 0.1,
      largestContentfulPaint: 0.25,
      firstInputDelay: 0.1,
      totalBlockingTime: 0.3,
      cumulativeLayoutShift: 0.25,
    };

    let score = 0;

    // FCP scoring (0-2000ms = 100, 2000-4000ms = 50-100, >4000ms = 0-50)
    if (metrics.firstContentfulPaint <= 2000) {
      score += weights.firstContentfulPaint * 100;
    } else if (metrics.firstContentfulPaint <= 4000) {
      score += weights.firstContentfulPaint * (100 - (metrics.firstContentfulPaint - 2000) / 40);
    } else {
      score += weights.firstContentfulPaint *
        Math.max(0, 50 - (metrics.firstContentfulPaint - 4000) / 80);
    }

    // LCP scoring (0-2500ms = 100, 2500-4000ms = 50-100, >4000ms = 0-50)
    if (metrics.largestContentfulPaint <= 2500) {
      score += weights.largestContentfulPaint * 100;
    } else if (metrics.largestContentfulPaint <= 4000) {
      score += weights.largestContentfulPaint *
        (100 - (metrics.largestContentfulPaint - 2500) / 30);
    } else {
      score += weights.largestContentfulPaint *
        Math.max(0, 50 - (metrics.largestContentfulPaint - 4000) / 80);
    }

    // FID scoring (0-100ms = 100, 100-300ms = 50-100, >300ms = 0-50)
    if (metrics.firstInputDelay !== undefined) {
      if (metrics.firstInputDelay <= 100) {
        score += weights.firstInputDelay * 100;
      } else if (metrics.firstInputDelay <= 300) {
        score += weights.firstInputDelay * (100 - (metrics.firstInputDelay - 100) / 4);
      } else {
        score += weights.firstInputDelay * Math.max(0, 50 - (metrics.firstInputDelay - 300) / 6);
      }
    }

    // TBT scoring (0-200ms = 100, 200-600ms = 50-100, >600ms = 0-50)
    if (metrics.totalBlockingTime <= 200) {
      score += weights.totalBlockingTime * 100;
    } else if (metrics.totalBlockingTime <= 600) {
      score += weights.totalBlockingTime * (100 - (metrics.totalBlockingTime - 200) / 8);
    } else {
      score += weights.totalBlockingTime * Math.max(0, 50 - (metrics.totalBlockingTime - 600) / 12);
    }

    // CLS scoring (0-0.1 = 100, 0.1-0.25 = 50-100, >0.25 = 0-50)
    if (metrics.cumulativeLayoutShift <= 0.1) {
      score += weights.cumulativeLayoutShift * 100;
    } else if (metrics.cumulativeLayoutShift <= 0.25) {
      score += weights.cumulativeLayoutShift *
        (100 - (metrics.cumulativeLayoutShift - 0.1) / 0.0015);
    } else {
      score += weights.cumulativeLayoutShift *
        Math.max(0, 50 - (metrics.cumulativeLayoutShift - 0.25) / 0.003);
    }

    return Math.round(score);
  }

  // Accessibility audit
  auditAccessibility(): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    // Check for alt text on images
    const images = document.querySelectorAll("img");
    let missingAlt = 0;
    images.forEach((img) => {
      if (!img.alt && !img.getAttribute("aria-label")) {
        missingAlt++;
      }
    });
    if (missingAlt > 0) {
      issues.push(`${missingAlt} images missing alt text`);
      score -= missingAlt * 5;
    }

    // Check for proper headings structure
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headings.length === 0) {
      issues.push("No heading structure found");
      score -= 15;
    }

    // Check for color contrast (basic check)
    const buttons = document.querySelectorAll("button, .btn");
    buttons.forEach((button) => {
      const styles = getComputedStyle(button);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;

      // Basic contrast check (simplified)
      if (bgColor === textColor) {
        issues.push("Poor color contrast detected");
        score -= 10;
      }
    });

    // Check for keyboard navigation
    const interactiveElements = document.querySelectorAll("button, a, input, select, textarea");
    let noTabIndex = 0;
    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute("tabindex");
      if (tabIndex === "-1") {
        noTabIndex++;
      }
    });
    if (noTabIndex > interactiveElements.length * 0.5) {
      issues.push("Many elements not keyboard accessible");
      score -= 20;
    }

    // Check for ARIA labels
    const unlabeledButtons = document.querySelectorAll(
      "button:not([aria-label]):not([aria-labelledby])",
    );
    if (unlabeledButtons.length > 0) {
      issues.push(`${unlabeledButtons.length} buttons missing ARIA labels`);
      score -= unlabeledButtons.length * 3;
    }

    return { score: Math.max(0, score), issues };
  }

  // SEO audit
  auditSEO(): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    // Check for title tag
    const title = document.querySelector("title");
    if (!title || title.textContent!.length < 10) {
      issues.push("Missing or too short title tag");
      score -= 15;
    }

    // Check for meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      issues.push("Missing meta description");
      score -= 10;
    }

    // Check for viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      issues.push("Missing viewport meta tag");
      score -= 10;
    }

    // Check for Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogTitle || !ogDescription) {
      issues.push("Missing Open Graph tags");
      score -= 8;
    }

    // Check for structured data
    const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
    if (structuredData.length === 0) {
      issues.push("No structured data found");
      score -= 5;
    }

    // Check for proper heading hierarchy
    const h1s = document.querySelectorAll("h1");
    if (h1s.length !== 1) {
      issues.push("Should have exactly one H1 tag");
      score -= 8;
    }

    return { score: Math.max(0, score), issues };
  }

  // Best practices audit
  auditBestPractices(): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    // Check for HTTPS
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      issues.push("Site not served over HTTPS");
      score -= 15;
    }

    // Check for console errors
    const originalError = console.error;
    let errorCount = 0;
    console.error = (...args) => {
      errorCount++;
      originalError.apply(console, args);
    };

    setTimeout(() => {
      console.error = originalError;
      if (errorCount > 0) {
        issues.push(`${errorCount} console errors detected`);
        score -= errorCount * 5;
      }
    }, 1000);

    // Check for deprecated APIs
    if ("webkitRequestAnimationFrame" in window) {
      issues.push("Using deprecated webkit APIs");
      score -= 5;
    }

    // Check for external links security
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    let unsafeLinks = 0;
    externalLinks.forEach((link) => {
      if (!link.hasAttribute("rel") || !link.getAttribute("rel")!.includes("noopener")) {
        unsafeLinks++;
      }
    });
    if (unsafeLinks > 0) {
      issues.push(`${unsafeLinks} external links missing rel="noopener"`);
      score -= unsafeLinks * 2;
    }

    return { score: Math.max(0, score), issues };
  }

  // Generate performance recommendations
  generateRecommendations(metrics: LighthouseMetrics["metrics"]): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    if (metrics.firstContentfulPaint > 2000) {
      recommendations.push({
        category: "Performance",
        issue: "Slow First Contentful Paint",
        impact: "high",
        solution:
          "Optimize critical rendering path, reduce server response time, enable text compression",
      });
    }

    if (metrics.largestContentfulPaint > 2500) {
      recommendations.push({
        category: "Performance",
        issue: "Slow Largest Contentful Paint",
        impact: "high",
        solution: "Optimize images, preload important resources, reduce render-blocking resources",
      });
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push({
        category: "Performance",
        issue: "High Cumulative Layout Shift",
        impact: "medium",
        solution:
          "Set explicit dimensions for images and embeds, avoid inserting content above existing content",
      });
    }

    if (metrics.totalBlockingTime > 200) {
      recommendations.push({
        category: "Performance",
        issue: "High Total Blocking Time",
        impact: "high",
        solution:
          "Break up long-running JavaScript tasks, optimize third-party code, use web workers",
      });
    }

    if (metrics.firstInputDelay && metrics.firstInputDelay > 100) {
      recommendations.push({
        category: "Performance",
        issue: "Slow First Input Delay",
        impact: "medium",
        solution: "Reduce JavaScript execution time, split code bundles, remove unused code",
      });
    }

    return recommendations;
  }

  // Complete audit
  async runCompleteAudit(): Promise<LighthouseMetrics> {
    const metrics = await this.getCoreWebVitals();
    const accessibility = this.auditAccessibility();
    const seo = this.auditSEO();
    const bestPractices = this.auditBestPractices();
    const performanceScore = this.calculatePerformanceScore(metrics);

    return {
      performanceScore,
      accessibilityScore: accessibility.score,
      bestPracticesScore: bestPractices.score,
      seoScore: seo.score,
      metrics,
    };
  }

  // Generate audit report
  generateAuditReport(audit: LighthouseMetrics): string {
    const recommendations = this.generateRecommendations(audit.metrics);

    let report = `# Lighthouse Performance Audit Report\n\n`;

    report += `## Scores\n\n`;
    report += `- **Performance:** ${audit.performanceScore}/100\n`;
    report += `- **Accessibility:** ${audit.accessibilityScore}/100\n`;
    report += `- **Best Practices:** ${audit.bestPracticesScore}/100\n`;
    report += `- **SEO:** ${audit.seoScore}/100\n\n`;

    report += `## Core Web Vitals\n\n`;
    report += `- **First Contentful Paint:** ${audit.metrics.firstContentfulPaint.toFixed(0)}ms\n`;
    report += `- **Largest Contentful Paint:** ${
      audit.metrics.largestContentfulPaint.toFixed(0)
    }ms\n`;
    report += `- **Cumulative Layout Shift:** ${audit.metrics.cumulativeLayoutShift.toFixed(3)}\n`;
    report += `- **Total Blocking Time:** ${audit.metrics.totalBlockingTime.toFixed(0)}ms\n`;

    if (audit.metrics.firstInputDelay) {
      report += `- **First Input Delay:** ${audit.metrics.firstInputDelay.toFixed(0)}ms\n`;
    }

    report += `- **Speed Index:** ${audit.metrics.speedIndex.toFixed(0)}ms\n\n`;

    if (recommendations.length > 0) {
      report += `## Recommendations\n\n`;

      recommendations.forEach((rec, index) => {
        report += `### ${index + 1}. ${rec.issue} (${rec.impact.toUpperCase()} impact)\n`;
        report += `**Category:** ${rec.category}\n`;
        report += `**Solution:** ${rec.solution}\n\n`;
      });
    }

    return report;
  }

  // Cleanup observers
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Usage example
export function runLighthouseAudit(): void {
  const auditor = new LighthouseAuditor();

  auditor.runCompleteAudit().then((audit) => {
    const report = auditor.generateAuditReport(audit);
    console.log(report);

    // Log detailed results
    console.log("Complete Audit Results:", audit);

    // Cleanup
    auditor.disconnect();
  });
}

// Auto-run audit when page loads
if (typeof window !== "undefined") {
  globalThis.addEventListener("load", () => {
    // Wait for page to stabilize before running audit
    setTimeout(runLighthouseAudit, 3000);
  });
}
