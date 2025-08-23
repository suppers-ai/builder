/**
 * Comprehensive error logging and monitoring system
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { userPreferences } from "./user-preferences.ts";
import { toastManager } from "./toast-manager.ts";

export interface ErrorReport {
  id: string;
  timestamp: string;
  type: "javascript" | "network" | "storage" | "auth" | "ui" | "performance";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  context: Record<string, any>;
  breadcrumbs: ErrorBreadcrumb[];
  performance?: PerformanceMetrics;
}

export interface ErrorBreadcrumb {
  timestamp: string;
  category: "navigation" | "user" | "http" | "console" | "dom";
  message: string;
  level: "info" | "warning" | "error";
  data?: Record<string, any>;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkLatency?: number;
  errorCount: number;
}

export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private sessionId: string;
  private errorCount = 0;
  private performanceObserver?: PerformanceObserver;
  private maxBreadcrumbs = 50;
  private errorQueue: ErrorReport[] = [];
  private isOnline = true;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
    this.setupNetworkMonitoring();
    this.setupPerformanceMonitoring();
  }

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  /**
   * Initialize error monitoring
   */
  private initializeMonitoring(): void {
    if (typeof window === "undefined") return;

    // Global error handler
    globalThis.addEventListener("error", (event) => {
      this.handleError({
        type: "javascript",
        severity: "high",
        message: event.message,
        stack: event.error?.stack,
        context: {
          lineno: (event as any).lineno,
          colno: (event as any).colno,
          filename: (event as any).filename,
        },
      });
    });

    // Unhandled promise rejection handler
    globalThis.addEventListener("unhandledrejection", (event) => {
      this.handleError({
        type: "javascript",
        severity: "high",
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      });
    });

    // Resource loading errors
    globalThis.addEventListener("error", (event) => {
      if (event.target !== window) {
        this.handleError({
          type: "network",
          severity: "medium",
          message: `Resource failed to load: ${
            (event.target as any)?.src || (event.target as any)?.href
          }`,
        });
      }
    }, true);

    // Console error interception
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.addBreadcrumb({
        category: "console",
        message: args.join(" "),
        level: "error",
      });
      originalConsoleError.apply(console, args);
    };

    // Console warning interception
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      this.addBreadcrumb({
        category: "console",
        message: args.join(" "),
        level: "warning",
      });
      originalConsoleWarn.apply(console, args);
    };
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    if (typeof window === "undefined") return;

    // Online/offline status
    globalThis.addEventListener("online", () => {
      this.isOnline = true;
      this.addBreadcrumb({
        category: "navigation",
        message: "Network connection restored",
        level: "info",
      });
      this.flushErrorQueue();
    });

    globalThis.addEventListener("offline", () => {
      this.isOnline = false;
      this.addBreadcrumb({
        category: "navigation",
        message: "Network connection lost",
        level: "warning",
      });
    });

    // Intercept fetch requests
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();

        this.addBreadcrumb({
          category: "http",
          message: `${response.status} ${url}`,
          level: response.ok ? "info" : "warning",
          data: {
            method: args[1]?.method || "GET",
            status: response.status,
            duration: endTime - startTime,
          },
        });

        if (!response.ok) {
          this.handleError({
            type: "network",
            severity: response.status >= 500 ? "high" : "medium",
            message: `HTTP ${response.status}: ${url}`,
            context: {
              method: args[1]?.method || "GET",
              status: response.status,
              url,
            },
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();

        this.addBreadcrumb({
          category: "http",
          message: `Network error: ${url}`,
          level: "error",
          data: {
            method: args[1]?.method || "GET",
            duration: endTime - startTime,
            error: (error as Error).message,
          },
        });

        this.handleError({
          type: "network",
          severity: "high",
          message: `Network error: ${(error as Error).message}`,
          stack: (error as Error).stack,
          context: {
            method: args[1]?.method || "GET",
            url,
          },
        });

        throw error;
      }
    };
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

    // Monitor long tasks
    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "longtask") {
            this.handleError({
              type: "performance",
              severity: "medium",
              message: `Long task detected: ${entry.duration}ms`,
              context: {
                duration: entry.duration,
                startTime: entry.startTime,
              },
            });
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ["longtask"] });
    } catch (error) {
      console.warn("Performance monitoring not available:", error);
    }

    // Monitor page load performance
    globalThis.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;

          if (loadTime > 3000) {
            this.handleError({
              type: "performance",
              severity: "medium",
              message: `Slow page load: ${loadTime}ms`,
              context: {
                loadTime,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                firstPaint: this.getFirstPaintTime(),
              },
            });
          }

          this.addBreadcrumb({
            category: "navigation",
            message: `Page loaded in ${loadTime}ms`,
            level: loadTime > 3000 ? "warning" : "info",
            data: { loadTime },
          });
        }
      }, 0);
    });
  }

  /**
   * Handle error reporting
   */
  private handleError(errorData: Partial<ErrorReport>): void {
    this.errorCount++;

    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: errorData.type || "javascript",
      severity: errorData.severity || "medium",
      message: errorData.message || "Unknown error",
      stack: errorData.stack,
      url: globalThis.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      context: {
        ...errorData.context,
        errorCount: this.errorCount,
        timestamp: Date.now(),
      },
      breadcrumbs: [...this.breadcrumbs],
      performance: this.getPerformanceMetrics(),
    };

    // Store error locally
    this.storeErrorLocally(report);

    // Add to queue for sending
    this.errorQueue.push(report);

    // Try to send immediately if online
    if (this.isOnline && this.shouldReportError()) {
      this.sendErrorReport(report);
    }

    // Show user notification for critical errors
    if (report.severity === "critical") {
      toastManager.error("A critical error occurred. Please refresh the page.");
    }

    // Log to console in debug mode
    if (userPreferences.getPreference("debugMode")) {
      console.error("Error Report:", report);
    }
  }

  /**
   * Add breadcrumb for error context
   */
  addBreadcrumb(breadcrumb: Omit<ErrorBreadcrumb, "timestamp">): void {
    const fullBreadcrumb: ErrorBreadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Manual error reporting
   */
  reportError(
    error: Error,
    context?: Record<string, any>,
    severity: ErrorReport["severity"] = "medium",
  ): void {
    this.handleError({
      type: "javascript",
      severity,
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  /**
   * Report user action for breadcrumbs
   */
  reportUserAction(action: string, data?: Record<string, any>): void {
    this.addBreadcrumb({
      category: "user",
      message: action,
      level: "info",
      data,
    });
  }

  /**
   * Store error locally for offline support
   */
  private storeErrorLocally(report: ErrorReport): void {
    try {
      const stored = localStorage.getItem("error-reports") || "[]";
      const reports = JSON.parse(stored);
      reports.push(report);

      // Keep only the most recent 100 errors
      const recentReports = reports.slice(-100);
      localStorage.setItem("error-reports", JSON.stringify(recentReports));
    } catch (error) {
      console.warn("Failed to store error locally:", error);
    }
  }

  /**
   * Send error report to server
   */
  private async sendErrorReport(report: ErrorReport): Promise<void> {
    try {
      // This would typically send to your error reporting service
      // For now, we'll just log it
      if (userPreferences.getPreference("debugMode")) {
        console.log("Sending error report:", report);
      }

      // TODO: Implement actual error reporting endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });

      // Remove from queue on successful send
      this.errorQueue = this.errorQueue.filter((e) => e.id !== report.id);
    } catch (error) {
      console.warn("Failed to send error report:", error);
    }
  }

  /**
   * Flush error queue when back online
   */
  private async flushErrorQueue(): Promise<void> {
    if (!this.isOnline || this.errorQueue.length === 0) return;

    const reports = [...this.errorQueue];
    for (const report of reports) {
      await this.sendErrorReport(report);
    }
  }

  /**
   * Check if error should be reported based on user preferences
   */
  private shouldReportError(): boolean {
    return userPreferences.getPreference("errorReportingEnabled");
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string | undefined {
    return localStorage.getItem("user-id") || undefined;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      renderTime: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
      errorCount: this.errorCount,
    };
  }

  /**
   * Get first paint time
   */
  private getFirstPaintTime(): number {
    const paintEntries = performance.getEntriesByType("paint");
    const firstPaint = paintEntries.find((entry) => entry.name === "first-paint");
    return firstPaint ? firstPaint.startTime : 0;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorReport[];
  } {
    try {
      const stored = localStorage.getItem("error-reports") || "[]";
      const reports: ErrorReport[] = JSON.parse(stored);

      const errorsByType: Record<string, number> = {};
      const errorsBySeverity: Record<string, number> = {};

      reports.forEach((report) => {
        errorsByType[report.type] = (errorsByType[report.type] || 0) + 1;
        errorsBySeverity[report.severity] = (errorsBySeverity[report.severity] || 0) + 1;
      });

      return {
        totalErrors: reports.length,
        errorsByType,
        errorsBySeverity,
        recentErrors: reports.slice(-10),
      };
    } catch (error) {
      return {
        totalErrors: 0,
        errorsByType: {},
        errorsBySeverity: {},
        recentErrors: [],
      };
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors(): void {
    try {
      localStorage.removeItem("error-reports");
      this.errorQueue = [];
      this.errorCount = 0;
    } catch (error) {
      console.warn("Failed to clear stored errors:", error);
    }
  }

  /**
   * Cleanup monitoring
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Export singleton instance
export const errorMonitor = ErrorMonitor.getInstance();

// Initialize error monitoring when module is loaded
if (typeof window !== "undefined") {
  // Auto-start monitoring
  errorMonitor.addBreadcrumb({
    category: "navigation",
    message: "Error monitoring initialized",
    level: "info",
  });
}
