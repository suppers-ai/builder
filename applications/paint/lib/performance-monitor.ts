// Performance monitoring system for drawing operations
import type { DrawingState, InsertedImage, Stroke } from "../types/paint.ts";

/**
 * Performance metrics for different operations
 */
export interface PerformanceMetrics {
  // Drawing operations
  strokeDrawTime: number;
  imageDrawTime: number;
  canvasRedrawTime: number;

  // Memory operations
  memoryUsage: number;
  gcTime: number;
  compressionTime: number;

  // User interaction
  inputLatency: number;
  frameRate: number;
  droppedFrames: number;

  // System resources
  cpuUsage: number;
  memoryPressure: number;
  batteryLevel?: number;
}

/**
 * Performance sample for tracking over time
 */
export interface PerformanceSample {
  timestamp: number;
  metrics: PerformanceMetrics;
  operation: string;
  duration: number;
}

/**
 * Performance thresholds for warnings
 */
export interface PerformanceThresholds {
  maxStrokeDrawTime: number; // ms
  maxImageDrawTime: number; // ms
  maxCanvasRedrawTime: number; // ms
  maxInputLatency: number; // ms
  minFrameRate: number; // fps
  maxMemoryUsage: number; // bytes
  maxDroppedFrames: number;
}

/**
 * Performance optimization suggestions
 */
export interface OptimizationSuggestion {
  type: "memory" | "rendering" | "input" | "system";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  action: string;
  impact: string;
}

/**
 * Performance monitoring and optimization system
 */
export class PerformanceMonitor {
  private samples: PerformanceSample[] = [];
  private currentMetrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private isMonitoring = false;
  private monitoringInterval: number | null = null;
  private frameTimeHistory: number[] = [];
  private lastFrameTime = 0;
  private operationTimers: Map<string, number> = new Map();

  // Performance observers
  private performanceObserver: PerformanceObserver | null = null;
  private memoryObserver: any = null;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = {
      maxStrokeDrawTime: 16, // 60fps target
      maxImageDrawTime: 33, // 30fps target for images
      maxCanvasRedrawTime: 16, // 60fps target
      maxInputLatency: 50, // 50ms max input lag
      minFrameRate: 30, // 30fps minimum
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxDroppedFrames: 5, // per second
      ...thresholds,
    };

    this.currentMetrics = this.initializeMetrics();
    this.initializePerformanceObservers();
  }

  /**
   * Initialize default metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      strokeDrawTime: 0,
      imageDrawTime: 0,
      canvasRedrawTime: 0,
      memoryUsage: 0,
      gcTime: 0,
      compressionTime: 0,
      inputLatency: 0,
      frameRate: 60,
      droppedFrames: 0,
      cpuUsage: 0,
      memoryPressure: 0,
      batteryLevel: undefined,
    };
  }

  /**
   * Initialize performance observers
   */
  private initializePerformanceObservers(): void {
    // Performance Observer for measuring paint and layout times
    if (typeof PerformanceObserver !== "undefined") {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.handlePerformanceEntry(entry);
          }
        });

        this.performanceObserver.observe({
          entryTypes: ["measure", "navigation", "paint", "layout-shift"],
        });
      } catch (error) {
        console.warn("Performance Observer not supported:", error);
      }
    }

    // Memory pressure observer (if available)
    if ("memory" in performance && (performance as any).memory) {
      this.memoryObserver = (performance as any).memory;
    }
  }

  /**
   * Handle performance observer entries
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case "measure":
        this.handleMeasureEntry(entry);
        break;
      case "paint":
        this.handlePaintEntry(entry);
        break;
      case "layout-shift":
        this.handleLayoutShiftEntry(entry as any);
        break;
    }
  }

  /**
   * Handle measure entries
   */
  private handleMeasureEntry(entry: PerformanceEntry): void {
    const duration = entry.duration;

    if (entry.name.includes("stroke-draw")) {
      this.currentMetrics.strokeDrawTime = duration;
    } else if (entry.name.includes("image-draw")) {
      this.currentMetrics.imageDrawTime = duration;
    } else if (entry.name.includes("canvas-redraw")) {
      this.currentMetrics.canvasRedrawTime = duration;
    } else if (entry.name.includes("input-latency")) {
      this.currentMetrics.inputLatency = duration;
    }
  }

  /**
   * Handle paint entries
   */
  private handlePaintEntry(entry: PerformanceEntry): void {
    // Track paint timing for frame rate calculation
    const currentTime = entry.startTime;
    if (this.lastFrameTime > 0) {
      const frameDuration = currentTime - this.lastFrameTime;
      this.frameTimeHistory.push(frameDuration);

      // Keep only last 60 frame times (1 second at 60fps)
      if (this.frameTimeHistory.length > 60) {
        this.frameTimeHistory.shift();
      }

      // Calculate current frame rate
      const averageFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) /
        this.frameTimeHistory.length;
      this.currentMetrics.frameRate = 1000 / averageFrameTime;

      // Count dropped frames (frames taking longer than 16.67ms for 60fps)
      const droppedFrames = this.frameTimeHistory.filter((time) => time > 16.67).length;
      this.currentMetrics.droppedFrames = droppedFrames;
    }
    this.lastFrameTime = currentTime;
  }

  /**
   * Handle layout shift entries
   */
  private handleLayoutShiftEntry(entry: any): void {
    // Layout shifts can indicate performance issues
    if (entry.value > 0.1) {
      console.warn("Significant layout shift detected:", entry.value);
    }
  }

  /**
   * Start monitoring performance
   */
  public startMonitoring(intervalMs: number = 1000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
  }

  /**
   * Stop monitoring performance
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Collect current performance metrics
   */
  private collectMetrics(): void {
    // Update memory usage
    if (this.memoryObserver) {
      this.currentMetrics.memoryUsage = this.memoryObserver.usedJSHeapSize || 0;
      this.currentMetrics.memoryPressure = this.memoryObserver.totalJSHeapSizeLimit > 0
        ? this.memoryObserver.usedJSHeapSize / this.memoryObserver.totalJSHeapSizeLimit
        : 0;
    }

    // Update battery level (if available)
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.currentMetrics.batteryLevel = battery.level * 100;
      }).catch(() => {
        // Battery API not available
      });
    }

    // Create performance sample
    const sample: PerformanceSample = {
      timestamp: Date.now(),
      metrics: { ...this.currentMetrics },
      operation: "monitoring",
      duration: 0,
    };

    this.addSample(sample);
  }

  /**
   * Start timing an operation
   */
  public startTiming(operationName: string): void {
    const startTime = performance.now();
    this.operationTimers.set(operationName, startTime);

    // Use Performance API for more detailed timing
    if (typeof performance.mark === "function") {
      performance.mark(`${operationName}-start`);
    }
  }

  /**
   * End timing an operation
   */
  public endTiming(operationName: string): number {
    const endTime = performance.now();
    const startTime = this.operationTimers.get(operationName);

    if (startTime === undefined) {
      console.warn(`No start time found for operation: ${operationName}`);
      return 0;
    }

    const duration = endTime - startTime;
    this.operationTimers.delete(operationName);

    // Use Performance API for more detailed timing
    if (typeof performance.mark === "function" && typeof performance.measure === "function") {
      performance.mark(`${operationName}-end`);
      performance.measure(operationName, `${operationName}-start`, `${operationName}-end`);
    }

    // Create performance sample
    const sample: PerformanceSample = {
      timestamp: Date.now(),
      metrics: { ...this.currentMetrics },
      operation: operationName,
      duration,
    };

    this.addSample(sample);
    return duration;
  }

  /**
   * Measure stroke drawing performance
   */
  public measureStrokeDrawing(stroke: Stroke, drawFunction: () => void): number {
    this.startTiming("stroke-draw");
    drawFunction();
    const duration = this.endTiming("stroke-draw");

    this.currentMetrics.strokeDrawTime = duration;
    return duration;
  }

  /**
   * Measure image drawing performance
   */
  public measureImageDrawing(image: InsertedImage, drawFunction: () => void): number {
    this.startTiming("image-draw");
    drawFunction();
    const duration = this.endTiming("image-draw");

    this.currentMetrics.imageDrawTime = duration;
    return duration;
  }

  /**
   * Measure canvas redraw performance
   */
  public measureCanvasRedraw(drawFunction: () => void): number {
    this.startTiming("canvas-redraw");
    drawFunction();
    const duration = this.endTiming("canvas-redraw");

    this.currentMetrics.canvasRedrawTime = duration;
    return duration;
  }

  /**
   * Measure input latency
   */
  public measureInputLatency(inputFunction: () => void): number {
    this.startTiming("input-latency");
    inputFunction();
    const duration = this.endTiming("input-latency");

    this.currentMetrics.inputLatency = duration;
    return duration;
  }

  /**
   * Add a performance sample
   */
  private addSample(sample: PerformanceSample): void {
    this.samples.push(sample);

    // Keep only last 1000 samples to prevent memory growth
    if (this.samples.length > 1000) {
      this.samples.shift();
    }
  }

  /**
   * Get current performance metrics
   */
  public getCurrentMetrics(): PerformanceMetrics {
    return { ...this.currentMetrics };
  }

  /**
   * Get performance samples for a time range
   */
  public getSamples(startTime?: number, endTime?: number): PerformanceSample[] {
    let filteredSamples = this.samples;

    if (startTime !== undefined) {
      filteredSamples = filteredSamples.filter((sample) => sample.timestamp >= startTime);
    }

    if (endTime !== undefined) {
      filteredSamples = filteredSamples.filter((sample) => sample.timestamp <= endTime);
    }

    return filteredSamples;
  }

  /**
   * Get performance statistics
   */
  public getStatistics(): {
    averageStrokeDrawTime: number;
    averageImageDrawTime: number;
    averageCanvasRedrawTime: number;
    averageInputLatency: number;
    averageFrameRate: number;
    peakMemoryUsage: number;
    totalSamples: number;
  } {
    if (this.samples.length === 0) {
      return {
        averageStrokeDrawTime: 0,
        averageImageDrawTime: 0,
        averageCanvasRedrawTime: 0,
        averageInputLatency: 0,
        averageFrameRate: 0,
        peakMemoryUsage: 0,
        totalSamples: 0,
      };
    }

    const strokeDrawTimes = this.samples
      .filter((s) => s.operation === "stroke-draw")
      .map((s) => s.duration);

    const imageDrawTimes = this.samples
      .filter((s) => s.operation === "image-draw")
      .map((s) => s.duration);

    const canvasRedrawTimes = this.samples
      .filter((s) => s.operation === "canvas-redraw")
      .map((s) => s.duration);

    const inputLatencies = this.samples
      .filter((s) => s.operation === "input-latency")
      .map((s) => s.duration);

    const frameRates = this.samples.map((s) => s.metrics.frameRate);
    const memoryUsages = this.samples.map((s) => s.metrics.memoryUsage);

    return {
      averageStrokeDrawTime: this.average(strokeDrawTimes),
      averageImageDrawTime: this.average(imageDrawTimes),
      averageCanvasRedrawTime: this.average(canvasRedrawTimes),
      averageInputLatency: this.average(inputLatencies),
      averageFrameRate: this.average(frameRates),
      peakMemoryUsage: Math.max(...memoryUsages),
      totalSamples: this.samples.length,
    };
  }

  /**
   * Calculate average of an array
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Check for performance issues and get optimization suggestions
   */
  public getOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const stats = this.getStatistics();

    // Check stroke drawing performance
    if (stats.averageStrokeDrawTime > this.thresholds.maxStrokeDrawTime) {
      suggestions.push({
        type: "rendering",
        severity: stats.averageStrokeDrawTime > this.thresholds.maxStrokeDrawTime * 2
          ? "high"
          : "medium",
        message: `Stroke drawing is slow (${stats.averageStrokeDrawTime.toFixed(1)}ms average)`,
        action: "Consider reducing stroke complexity or enabling stroke simplification",
        impact: "Improved drawing responsiveness",
      });
    }

    // Check image drawing performance
    if (stats.averageImageDrawTime > this.thresholds.maxImageDrawTime) {
      suggestions.push({
        type: "rendering",
        severity: stats.averageImageDrawTime > this.thresholds.maxImageDrawTime * 2
          ? "high"
          : "medium",
        message: `Image drawing is slow (${stats.averageImageDrawTime.toFixed(1)}ms average)`,
        action: "Consider reducing image sizes or enabling image compression",
        impact: "Faster image rendering",
      });
    }

    // Check canvas redraw performance
    if (stats.averageCanvasRedrawTime > this.thresholds.maxCanvasRedrawTime) {
      suggestions.push({
        type: "rendering",
        severity: stats.averageCanvasRedrawTime > this.thresholds.maxCanvasRedrawTime * 2
          ? "high"
          : "medium",
        message: `Canvas redrawing is slow (${stats.averageCanvasRedrawTime.toFixed(1)}ms average)`,
        action: "Enable dirty region optimization or reduce canvas complexity",
        impact: "Smoother canvas updates",
      });
    }

    // Check input latency
    if (stats.averageInputLatency > this.thresholds.maxInputLatency) {
      suggestions.push({
        type: "input",
        severity: stats.averageInputLatency > this.thresholds.maxInputLatency * 2
          ? "high"
          : "medium",
        message: `Input latency is high (${stats.averageInputLatency.toFixed(1)}ms average)`,
        action: "Optimize event handlers or reduce processing in input callbacks",
        impact: "More responsive drawing experience",
      });
    }

    // Check frame rate
    if (stats.averageFrameRate < this.thresholds.minFrameRate) {
      suggestions.push({
        type: "rendering",
        severity: stats.averageFrameRate < this.thresholds.minFrameRate * 0.5 ? "critical" : "high",
        message: `Frame rate is low (${stats.averageFrameRate.toFixed(1)} fps average)`,
        action: "Enable performance optimizations or reduce visual complexity",
        impact: "Smoother animation and interaction",
      });
    }

    // Check memory usage
    if (stats.peakMemoryUsage > this.thresholds.maxMemoryUsage) {
      suggestions.push({
        type: "memory",
        severity: stats.peakMemoryUsage > this.thresholds.maxMemoryUsage * 2 ? "critical" : "high",
        message: `Memory usage is high (${
          (stats.peakMemoryUsage / 1024 / 1024).toFixed(1)
        }MB peak)`,
        action: "Enable memory compression or reduce history size",
        impact: "Reduced memory pressure and better stability",
      });
    }

    // Check dropped frames
    if (this.currentMetrics.droppedFrames > this.thresholds.maxDroppedFrames) {
      suggestions.push({
        type: "rendering",
        severity: this.currentMetrics.droppedFrames > this.thresholds.maxDroppedFrames * 2
          ? "high"
          : "medium",
        message: `High number of dropped frames (${this.currentMetrics.droppedFrames})`,
        action: "Reduce rendering complexity or enable frame rate limiting",
        impact: "Smoother visual experience",
      });
    }

    return suggestions;
  }

  /**
   * Get performance health score (0-100)
   */
  public getHealthScore(): number {
    const stats = this.getStatistics();
    let score = 100;

    // Deduct points for performance issues
    if (stats.averageStrokeDrawTime > this.thresholds.maxStrokeDrawTime) {
      score -= Math.min(
        20,
        (stats.averageStrokeDrawTime / this.thresholds.maxStrokeDrawTime - 1) * 20,
      );
    }

    if (stats.averageImageDrawTime > this.thresholds.maxImageDrawTime) {
      score -= Math.min(
        15,
        (stats.averageImageDrawTime / this.thresholds.maxImageDrawTime - 1) * 15,
      );
    }

    if (stats.averageCanvasRedrawTime > this.thresholds.maxCanvasRedrawTime) {
      score -= Math.min(
        20,
        (stats.averageCanvasRedrawTime / this.thresholds.maxCanvasRedrawTime - 1) * 20,
      );
    }

    if (stats.averageInputLatency > this.thresholds.maxInputLatency) {
      score -= Math.min(15, (stats.averageInputLatency / this.thresholds.maxInputLatency - 1) * 15);
    }

    if (stats.averageFrameRate < this.thresholds.minFrameRate) {
      score -= Math.min(20, (1 - stats.averageFrameRate / this.thresholds.minFrameRate) * 20);
    }

    if (stats.peakMemoryUsage > this.thresholds.maxMemoryUsage) {
      score -= Math.min(10, (stats.peakMemoryUsage / this.thresholds.maxMemoryUsage - 1) * 10);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Export performance data for analysis
   */
  public exportData(): {
    samples: PerformanceSample[];
    statistics: {
      averageStrokeDrawTime: number;
      averageImageDrawTime: number;
      averageCanvasRedrawTime: number;
      averageInputLatency: number;
      averageFrameRate: number;
      peakMemoryUsage: number;
      totalSamples: number;
    };
    suggestions: OptimizationSuggestion[];
    healthScore: number;
    thresholds: PerformanceThresholds;
  } {
    return {
      samples: this.samples,
      statistics: this.getStatistics(),
      suggestions: this.getOptimizationSuggestions(),
      healthScore: this.getHealthScore(),
      thresholds: this.thresholds,
    };
  }

  /**
   * Clear all performance data
   */
  public clearData(): void {
    this.samples = [];
    this.frameTimeHistory = [];
    this.operationTimers.clear();
    this.currentMetrics = this.initializeMetrics();
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stopMonitoring();

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    this.clearData();
  }
}
