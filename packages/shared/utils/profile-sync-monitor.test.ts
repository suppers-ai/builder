/**
 * Tests for profile synchronization monitoring system
 */

import { assertEquals, assertExists, assertGreater } from "@std/assert";
import { ProfileSyncMonitor, type SyncEvent } from "./profile-sync-monitor.ts";

Deno.test("ProfileSyncMonitor - singleton instance", () => {
  const instance1 = ProfileSyncMonitor.getInstance();
  const instance2 = ProfileSyncMonitor.getInstance();
  
  assertEquals(instance1, instance2, "Should return the same singleton instance");
});

Deno.test("ProfileSyncMonitor - record broadcast event", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset(); // Start with clean state
  
  const eventId = monitor.recordBroadcast("theme", true, 150, "BroadcastChannel");
  
  assertExists(eventId, "Should return an event ID");
  
  const metrics = monitor.getMetrics();
  assertEquals(metrics.totalEvents, 1, "Should record one event");
  assertEquals(metrics.successfulEvents, 1, "Should record one successful event");
  assertEquals(metrics.eventsByType.theme, 1, "Should record theme event");
  assertEquals(metrics.communicationMethodUsage.BroadcastChannel, 1, "Should record BroadcastChannel usage");
});

Deno.test("ProfileSyncMonitor - record receive event", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  const eventId = monitor.recordReceive("avatar", true, 75, "localStorage");
  
  assertExists(eventId, "Should return an event ID");
  
  const metrics = monitor.getMetrics();
  assertEquals(metrics.totalEvents, 1, "Should record one event");
  assertEquals(metrics.successfulEvents, 1, "Should record one successful event");
  assertEquals(metrics.eventsByType.avatar, 1, "Should record avatar event");
  assertEquals(metrics.communicationMethodUsage.localStorage, 1, "Should record localStorage usage");
});

Deno.test("ProfileSyncMonitor - record error event", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  const eventId = monitor.recordError("Connection failed", "profile", "BroadcastChannel");
  
  assertExists(eventId, "Should return an event ID");
  
  const metrics = monitor.getMetrics();
  assertEquals(metrics.totalEvents, 1, "Should record one event");
  assertEquals(metrics.failedEvents, 1, "Should record one failed event");
  assertEquals(metrics.errorsByType["Connection failed"], 1, "Should record error type");
});

Deno.test("ProfileSyncMonitor - record performance event", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  const eventId = monitor.recordPerformance("memory_usage", 1024000);
  
  assertExists(eventId, "Should return an event ID");
  
  const metrics = monitor.getMetrics();
  assertEquals(metrics.totalEvents, 1, "Should record one event");
  assertEquals(metrics.successfulEvents, 1, "Should record one successful event");
});

Deno.test("ProfileSyncMonitor - calculate average latency", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  monitor.recordBroadcast("theme", true, 100, "BroadcastChannel");
  monitor.recordBroadcast("avatar", true, 200, "BroadcastChannel");
  monitor.recordBroadcast("profile", true, 150, "BroadcastChannel");
  
  const avgLatency = monitor.getAverageLatency();
  assertEquals(avgLatency, 150, "Should calculate correct average latency");
});

Deno.test("ProfileSyncMonitor - calculate success rate", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  monitor.recordBroadcast("theme", true, 100, "BroadcastChannel");
  monitor.recordBroadcast("avatar", true, 150, "BroadcastChannel");
  monitor.recordBroadcast("profile", false, 200, "BroadcastChannel", "Network error");
  
  const successRate = monitor.getSuccessRate();
  assertEquals(successRate, 2/3, "Should calculate correct success rate");
});

Deno.test("ProfileSyncMonitor - get event frequency", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  // Record multiple theme events
  monitor.recordBroadcast("theme", true, 100, "BroadcastChannel");
  monitor.recordBroadcast("theme", true, 150, "BroadcastChannel");
  monitor.recordBroadcast("theme", true, 120, "BroadcastChannel");
  
  const frequency = monitor.getEventFrequency("theme");
  assertGreater(frequency, 0, "Should calculate event frequency");
});

Deno.test("ProfileSyncMonitor - get recent events", async () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  monitor.recordBroadcast("theme", true, 100, "BroadcastChannel");
  await new Promise(resolve => setTimeout(resolve, 1)); // Small delay
  monitor.recordReceive("avatar", true, 150, "localStorage");
  await new Promise(resolve => setTimeout(resolve, 1)); // Small delay
  monitor.recordError("Test error");
  
  const recentEvents = monitor.getRecentEvents(10);
  assertEquals(recentEvents.length, 3, "Should return all recent events");
  
  // Events should be sorted by timestamp (newest first)
  // The last recorded event should be first in the sorted array
  assertEquals(recentEvents[0].type, "error", "Most recent event should be error");
  assertEquals(recentEvents[1].type, "receive", "Second event should be receive");
  assertEquals(recentEvents[2].type, "broadcast", "Oldest event should be broadcast");
});

Deno.test("ProfileSyncMonitor - get events by type", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  monitor.recordBroadcast("theme", true, 100, "BroadcastChannel");
  monitor.recordBroadcast("avatar", true, 150, "BroadcastChannel");
  monitor.recordReceive("theme", true, 120, "localStorage");
  
  const broadcastEvents = monitor.getEventsByType("broadcast");
  assertEquals(broadcastEvents.length, 2, "Should return only broadcast events");
  
  const receiveEvents = monitor.getEventsByType("receive");
  assertEquals(receiveEvents.length, 1, "Should return only receive events");
});

Deno.test("ProfileSyncMonitor - update performance metrics", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  monitor.updatePerformanceMetrics({
    eventQueueSize: 5,
    activeConnections: 3,
    throttledEvents: 2,
    cacheHitRate: 0.85,
  });
  
  const performanceMetrics = monitor.getPerformanceMetrics();
  assertEquals(performanceMetrics.eventQueueSize, 5, "Should update event queue size");
  assertEquals(performanceMetrics.activeConnections, 3, "Should update active connections");
  assertEquals(performanceMetrics.throttledEvents, 2, "Should update throttled events");
  assertEquals(performanceMetrics.cacheHitRate, 0.85, "Should update cache hit rate");
});

Deno.test("ProfileSyncMonitor - generate analytics report", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  // Add some test data
  monitor.recordBroadcast("theme", true, 100, "BroadcastChannel");
  monitor.recordBroadcast("avatar", true, 150, "BroadcastChannel");
  monitor.recordReceive("theme", false, 200, "localStorage", "Parse error");
  monitor.recordError("Connection timeout", "profile", "BroadcastChannel");
  
  const report = monitor.generateAnalyticsReport();
  
  assertExists(report.summary, "Should include summary metrics");
  assertExists(report.performance, "Should include performance metrics");
  assertExists(report.recentErrors, "Should include recent errors");
  assertExists(report.topEventTypes, "Should include top event types");
  assertExists(report.communicationHealth, "Should include communication health");
  assertExists(report.recommendations, "Should include recommendations");
  
  assertEquals(report.recentErrors.length, 1, "Should include error events");
  assertGreater(report.topEventTypes.length, 0, "Should include event types");
  assertGreater(report.communicationHealth.length, 0, "Should include communication methods");
});

Deno.test("ProfileSyncMonitor - export data", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  monitor.recordBroadcast("theme", true, 100, "BroadcastChannel");
  monitor.recordError("Test error");
  
  const exportedData = monitor.exportData();
  
  assertExists(exportedData.metrics, "Should export metrics");
  assertExists(exportedData.performance, "Should export performance data");
  assertExists(exportedData.events, "Should export events");
  assertExists(exportedData.exportTimestamp, "Should include export timestamp");
  
  assertEquals(exportedData.events.length, 2, "Should export all events");
});

Deno.test("ProfileSyncMonitor - cleanup and memory management", () => {
  const monitor = ProfileSyncMonitor.getInstance();
  monitor.reset();
  
  // Add many events to test cleanup
  for (let i = 0; i < 1200; i++) {
    monitor.recordBroadcast("theme", true, 100, "BroadcastChannel");
  }
  
  const events = monitor.getRecentEvents(2000);
  assertEquals(events.length, 1000, "Should limit stored events to MAX_EVENTS_STORED");
});