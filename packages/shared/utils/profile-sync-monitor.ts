/**
 * Profile synchronization monitoring and analytics system
 */

import { type ProfileChangeEvent } from "./profile-sync.ts";

export interface SyncMetrics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  averageLatency: number;
  eventsByType: Record<string, number>;
  errorsByType: Record<string, number>;
  communicationMethodUsage: Record<string, number>;
  peakEventsPerMinute: number;
  lastEventTimestamp: number;
  uptime: number;
}

export interface SyncEvent {
  id: string;
  type: 'broadcast' | 'receive' | 'error' | 'performance';
  eventType?: ProfileChangeEvent['type'];
  timestamp: number;
  latency?: number;
  success: boolean;
  error?: string;
  communicationMethod?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  memoryUsage?: number;
  eventQueueSize: number;
  activeConnections: number;
  throttledEvents: number;
  batchedEvents: number;
  cacheHitRate: number;
  averageProcessingTime: number;
}

/**
 * Profile synchronization monitoring system
 */
export class ProfileSyncMonitor {
  private static instance: ProfileSyncMonitor | null = null;
  private events: SyncEvent[] = [];
  private metrics: SyncMetrics;
  private performanceMetrics: PerformanceMetrics;
  private startTime: number;
  private eventIdCounter = 0;
  
  // Configuration
  private readonly MAX_EVENTS_STORED = 1000;
  private readonly METRICS_WINDOW = 300000; // 5 minutes
  private readonly PERFORMANCE_SAMPLE_INTERVAL = 10000; // 10 seconds
  
  // Timers
  private metricsUpdateTimer: number | null = null;
  private performanceSampleTimer: number | null = null;
  private cleanupTimer: number | null = null;

  private constructor() {
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.setupPeriodicTasks();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ProfileSyncMonitor {
    if (!ProfileSyncMonitor.instance) {
      ProfileSyncMonitor.instance = new ProfileSyncMonitor();
    }
    return ProfileSyncMonitor.instance;
  }

  /**
   * Initialize metrics structure
   */
  private initializeMetrics(): SyncMetrics {
    return {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      averageLatency: 0,
      eventsByType: {},
      errorsByType: {},
      communicationMethodUsage: {},
      peakEventsPerMinute: 0,
      lastEventTimestamp: 0,
      uptime: 0,
    };
  }

  /**
   * Initialize performance metrics structure
   */
  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      eventQueueSize: 0,
      activeConnections: 0,
      throttledEvents: 0,
      batchedEvents: 0,
      cacheHitRate: 0,
      averageProcessingTime: 0,
    };
  }

  /**
   * Setup periodic monitoring tasks
   */
  private setupPeriodicTasks(): void {
    // Update metrics every minute
    this.metricsUpdateTimer = setInterval(() => {
      this.updateMetrics();
    }, 60000);

    // Sample performance every 10 seconds
    this.performanceSampleTimer = setInterval(() => {
      this.samplePerformance();
    }, this.PERFORMANCE_SAMPLE_INTERVAL);

    // Cleanup old events every 5 minutes
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldEvents();
    }, 300000);
  }

  /**
   * Record a sync event
   */
  public recordEvent(
    type: SyncEvent['type'],
    eventType?: ProfileChangeEvent['type'],
    success: boolean = true,
    latency?: number,
    error?: string,
    communicationMethod?: string,
    metadata?: Record<string, any>
  ): string {
    const eventId = this.generateEventId();
    const timestamp = Date.now();

    const syncEvent: SyncEvent = {
      id: eventId,
      type,
      eventType,
      timestamp,
      success,
      latency,
      error,
      communicationMethod,
      metadata,
    };

    // Store event
    this.events.push(syncEvent);

    // Update metrics immediately for critical events
    this.updateMetricsForEvent(syncEvent);

    // Enforce storage limit
    if (this.events.length > this.MAX_EVENTS_STORED) {
      this.events.shift();
    }

    return eventId;
  }

  /**
   * Record broadcast event
   */
  public recordBroadcast(
    eventType: ProfileChangeEvent['type'],
    success: boolean,
    latency: number,
    communicationMethod: string,
    error?: string
  ): string {
    return this.recordEvent(
      'broadcast',
      eventType,
      success,
      latency,
      error,
      communicationMethod,
      { direction: 'outbound' }
    );
  }

  /**
   * Record receive event
   */
  public recordReceive(
    eventType: ProfileChangeEvent['type'],
    success: boolean,
    latency: number,
    communicationMethod: string,
    error?: string
  ): string {
    return this.recordEvent(
      'receive',
      eventType,
      success,
      latency,
      error,
      communicationMethod,
      { direction: 'inbound' }
    );
  }

  /**
   * Record error event
   */
  public recordError(
    error: string,
    eventType?: ProfileChangeEvent['type'],
    communicationMethod?: string,
    metadata?: Record<string, any>
  ): string {
    return this.recordEvent(
      'error',
      eventType,
      false,
      undefined,
      error,
      communicationMethod,
      metadata
    );
  }

  /**
   * Record performance event
   */
  public recordPerformance(
    metric: string,
    value: number,
    metadata?: Record<string, any>
  ): string {
    return this.recordEvent(
      'performance',
      undefined,
      true,
      undefined,
      undefined,
      undefined,
      { metric, value, ...metadata }
    );
  }

  /**
   * Update metrics for a specific event
   */
  private updateMetricsForEvent(event: SyncEvent): void {
    this.metrics.totalEvents++;
    this.metrics.lastEventTimestamp = event.timestamp;

    if (event.success) {
      this.metrics.successfulEvents++;
    } else {
      this.metrics.failedEvents++;
    }

    // Update event type counters
    if (event.eventType) {
      this.metrics.eventsByType[event.eventType] = 
        (this.metrics.eventsByType[event.eventType] || 0) + 1;
    }

    // Update error type counters
    if (event.error) {
      this.metrics.errorsByType[event.error] = 
        (this.metrics.errorsByType[event.error] || 0) + 1;
    }

    // Update communication method usage
    if (event.communicationMethod) {
      this.metrics.communicationMethodUsage[event.communicationMethod] = 
        (this.metrics.communicationMethodUsage[event.communicationMethod] || 0) + 1;
    }

    // Update latency average
    if (event.latency !== undefined) {
      const totalLatency = this.metrics.averageLatency * (this.metrics.totalEvents - 1);
      this.metrics.averageLatency = (totalLatency + event.latency) / this.metrics.totalEvents;
    }
  }

  /**
   * Update comprehensive metrics
   */
  private updateMetrics(): void {
    const now = Date.now();
    this.metrics.uptime = now - this.startTime;

    // Calculate events per minute in the last window
    const windowStart = now - this.METRICS_WINDOW;
    const recentEvents = this.events.filter(event => event.timestamp > windowStart);
    const eventsPerMinute = (recentEvents.length / this.METRICS_WINDOW) * 60000;
    
    if (eventsPerMinute > this.metrics.peakEventsPerMinute) {
      this.metrics.peakEventsPerMinute = eventsPerMinute;
    }

    // Dispatch metrics update event
    this.dispatchMetricsUpdate();
  }

  /**
   * Sample current performance metrics
   */
  private samplePerformance(): void {
    // Get memory usage if available
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.performanceMetrics.memoryUsage = memory.usedJSHeapSize;
    }

    // Record performance sample
    this.recordPerformance('memory_usage', this.performanceMetrics.memoryUsage || 0);
    this.recordPerformance('event_queue_size', this.performanceMetrics.eventQueueSize);
    this.recordPerformance('cache_hit_rate', this.performanceMetrics.cacheHitRate);
  }

  /**
   * Clean up old events to prevent memory leaks
   */
  private cleanupOldEvents(): void {
    const cutoffTime = Date.now() - (this.METRICS_WINDOW * 2); // Keep 10 minutes of data
    this.events = this.events.filter(event => event.timestamp > cutoffTime);
  }

  /**
   * Update performance metrics from external sources
   */
  public updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
  }

  /**
   * Get current metrics
   */
  public getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get recent events
   */
  public getRecentEvents(limit: number = 100): SyncEvent[] {
    return this.events
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get events by type
   */
  public getEventsByType(type: SyncEvent['type'], limit: number = 100): SyncEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get error events
   */
  public getErrorEvents(limit: number = 50): SyncEvent[] {
    return this.getEventsByType('error', limit);
  }

  /**
   * Get success rate for a time window
   */
  public getSuccessRate(windowMs: number = this.METRICS_WINDOW): number {
    const cutoffTime = Date.now() - windowMs;
    const recentEvents = this.events.filter(event => event.timestamp > cutoffTime);
    
    if (recentEvents.length === 0) return 1;
    
    const successfulEvents = recentEvents.filter(event => event.success).length;
    return successfulEvents / recentEvents.length;
  }

  /**
   * Get average latency for a time window
   */
  public getAverageLatency(windowMs: number = this.METRICS_WINDOW): number {
    const cutoffTime = Date.now() - windowMs;
    const recentEvents = this.events.filter(
      event => event.timestamp > cutoffTime && event.latency !== undefined
    );
    
    if (recentEvents.length === 0) return 0;
    
    const totalLatency = recentEvents.reduce((sum, event) => sum + (event.latency || 0), 0);
    return totalLatency / recentEvents.length;
  }

  /**
   * Get event frequency by type
   */
  public getEventFrequency(eventType: ProfileChangeEvent['type'], windowMs: number = this.METRICS_WINDOW): number {
    const cutoffTime = Date.now() - windowMs;
    const typeEvents = this.events.filter(
      event => event.timestamp > cutoffTime && event.eventType === eventType
    );
    
    return (typeEvents.length / windowMs) * 60000; // Events per minute
  }

  /**
   * Generate comprehensive analytics report
   */
  public generateAnalyticsReport(): {
    summary: SyncMetrics;
    performance: PerformanceMetrics;
    recentErrors: SyncEvent[];
    topEventTypes: Array<{ type: string; count: number; frequency: number }>;
    communicationHealth: Array<{ method: string; usage: number; successRate: number }>;
    recommendations: string[];
  } {
    const recentErrors = this.getErrorEvents(10);
    
    // Top event types by frequency
    const topEventTypes = Object.entries(this.metrics.eventsByType)
      .map(([type, count]) => ({
        type,
        count,
        frequency: this.getEventFrequency(type as ProfileChangeEvent['type'])
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Communication method health
    const communicationHealth = Object.entries(this.metrics.communicationMethodUsage)
      .map(([method, usage]) => {
        const methodEvents = this.events.filter(e => e.communicationMethod === method);
        const successfulEvents = methodEvents.filter(e => e.success).length;
        const successRate = methodEvents.length > 0 ? successfulEvents / methodEvents.length : 1;
        
        return { method, usage, successRate };
      })
      .sort((a, b) => b.usage - a.usage);

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      summary: this.getMetrics(),
      performance: this.getPerformanceMetrics(),
      recentErrors,
      topEventTypes,
      communicationHealth,
      recommendations,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const successRate = this.getSuccessRate();
    const avgLatency = this.getAverageLatency();

    if (successRate < 0.95) {
      recommendations.push(`Success rate is ${(successRate * 100).toFixed(1)}%. Consider investigating communication failures.`);
    }

    if (avgLatency > 1000) {
      recommendations.push(`Average latency is ${avgLatency.toFixed(0)}ms. Consider optimizing event processing.`);
    }

    if (this.performanceMetrics.eventQueueSize > 50) {
      recommendations.push(`Event queue size is ${this.performanceMetrics.eventQueueSize}. Consider increasing processing capacity.`);
    }

    if (this.performanceMetrics.cacheHitRate < 0.8) {
      recommendations.push(`Cache hit rate is ${(this.performanceMetrics.cacheHitRate * 100).toFixed(1)}%. Consider optimizing caching strategy.`);
    }

    if (this.events.length > this.MAX_EVENTS_STORED * 0.9) {
      recommendations.push('Event storage is near capacity. Consider increasing cleanup frequency.');
    }

    return recommendations;
  }

  /**
   * Dispatch metrics update event for external monitoring
   */
  private dispatchMetricsUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profile-sync-metrics-update', {
        detail: {
          metrics: this.getMetrics(),
          performance: this.getPerformanceMetrics(),
          timestamp: Date.now(),
        }
      }));
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sync_${Date.now()}_${++this.eventIdCounter}`;
  }

  /**
   * Export metrics data for external analysis
   */
  public exportData(): {
    metrics: SyncMetrics;
    performance: PerformanceMetrics;
    events: SyncEvent[];
    exportTimestamp: number;
  } {
    return {
      metrics: this.getMetrics(),
      performance: this.getPerformanceMetrics(),
      events: [...this.events],
      exportTimestamp: Date.now(),
    };
  }

  /**
   * Reset all metrics and events
   */
  public reset(): void {
    this.events = [];
    this.metrics = this.initializeMetrics();
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.startTime = Date.now();
    this.eventIdCounter = 0;
  }

  /**
   * Cleanup and destroy monitor
   */
  public destroy(): void {
    if (this.metricsUpdateTimer) {
      clearInterval(this.metricsUpdateTimer);
      this.metricsUpdateTimer = null;
    }

    if (this.performanceSampleTimer) {
      clearInterval(this.performanceSampleTimer);
      this.performanceSampleTimer = null;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.events = [];
    ProfileSyncMonitor.instance = null;
  }
}

// Export singleton instance
export const profileSyncMonitor = ProfileSyncMonitor.getInstance();