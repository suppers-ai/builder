import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { StatsSection } from "./StatsSection.tsx";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("StatsSection - basic rendering", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(
    html,
    '<section class="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">',
  );
  assertStringIncludes(html, "Trusted by the Community");
  assertStringIncludes(html, "Join thousands of developers who choose our component library");
});

Deno.test("StatsSection - header content", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, '<h2 class="text-2xl lg:text-3xl font-bold text-base-content mb-4">');
  assertStringIncludes(html, "Trusted by the Community");
  assertStringIncludes(html, '<p class="text-base-content/70">');
  assertStringIncludes(html, "Join thousands of developers who choose our component library");
});

Deno.test("StatsSection - stats grid layout", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6");

  const document = parser.parseFromString(html, "text/html");
  const statCards = document?.querySelectorAll(".stats");
  assertEquals(statCards?.length, 4); // Should have 4 stat cards
});

Deno.test("StatsSection - downloads stat", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "10K+");
  assertStringIncludes(html, "Downloads");
  assertStringIncludes(html, "Monthly package downloads");
  assertStringIncludes(html, "+23%");
});

Deno.test("StatsSection - users stat", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "500+");
  assertStringIncludes(html, "Developers");
  assertStringIncludes(html, "Active users building with our library");
  assertStringIncludes(html, "+15%");
});

Deno.test("StatsSection - rating stat", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "4.9");
  assertStringIncludes(html, "Rating");
  assertStringIncludes(html, "Average developer satisfaction");
  assertStringIncludes(html, "★★★★★");
});

Deno.test("StatsSection - uptime stat", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "99.9%");
  assertStringIncludes(html, "Uptime");
  assertStringIncludes(html, "Component reliability in production");
  assertStringIncludes(html, "Stable");
});

Deno.test("StatsSection - stat card structure", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "stats shadow-lg bg-base-100 border border-base-300");
  assertStringIncludes(html, '<div class="stat">');
  assertStringIncludes(html, "stat-figure text-primary");
  assertStringIncludes(html, "stat-title text-base-content/60");
  assertStringIncludes(html, "stat-value text-primary text-2xl lg:text-3xl");
  assertStringIncludes(html, "stat-desc text-base-content/60");
});

Deno.test("StatsSection - trend indicators", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "stat-desc text-success font-medium mt-1");
  assertStringIncludes(html, "+23%"); // Downloads trend
  assertStringIncludes(html, "+15%"); // Users trend
  assertStringIncludes(html, "★★★★★"); // Rating trend
  assertStringIncludes(html, "Stable"); // Uptime trend
});

Deno.test("StatsSection - icons present", () => {
  const html = renderToString(StatsSection({}));

  // Icons are rendered as SVG elements
  const document = parser.parseFromString(html, "text/html");
  const icons = document?.querySelectorAll(".stat-figure svg");
  assertEquals(icons?.length, 4); // Should have 4 icons
});

Deno.test("StatsSection - additional metrics", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "Zero runtime dependencies");
  assertStringIncludes(html, "Supports all modern browsers");
  assertStringIncludes(html, "Active community support");
  assertStringIncludes(html, "Regular updates");
});

Deno.test("StatsSection - metric indicators", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "w-2 h-2 bg-success rounded-full"); // Zero dependencies
  assertStringIncludes(html, "w-2 h-2 bg-primary rounded-full"); // Browser support
  assertStringIncludes(html, "w-2 h-2 bg-secondary rounded-full"); // Community
  assertStringIncludes(html, "w-2 h-2 bg-accent rounded-full"); // Updates
});

Deno.test("StatsSection - layout structure", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "px-4 lg:px-6 max-w-6xl mx-auto");
  assertStringIncludes(html, "text-center mb-12"); // Header
  assertStringIncludes(html, "mt-12 text-center"); // Additional metrics
});

Deno.test("StatsSection - responsive design classes", () => {
  const html = renderToString(StatsSection({}));

  // Header responsive text
  assertStringIncludes(html, "text-2xl lg:text-3xl");

  // Grid responsive layout
  assertStringIncludes(html, "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4");

  // Stat value responsive text
  assertStringIncludes(html, "text-2xl lg:text-3xl");

  // Container responsive padding
  assertStringIncludes(html, "px-4 lg:px-6");
});

Deno.test("StatsSection - color scheme", () => {
  const html = renderToString(StatsSection({}));

  // Background gradient
  assertStringIncludes(html, "bg-gradient-to-r from-primary/5 to-secondary/5");

  // Text colors
  assertStringIncludes(html, "text-base-content");
  assertStringIncludes(html, "text-base-content/70");
  assertStringIncludes(html, "text-base-content/60");

  // Primary colors
  assertStringIncludes(html, "text-primary");

  // Success color for trends
  assertStringIncludes(html, "text-success");
});

Deno.test("StatsSection - section semantics", () => {
  const html = renderToString(StatsSection({}));

  const document = parser.parseFromString(html, "text/html");
  const section = document?.querySelector("section");
  assertEquals(section !== null, true);

  const heading = document?.querySelector("h2");
  assertEquals(heading !== null, true);
  assertEquals(heading?.textContent, "Trusted by the Community");
});

Deno.test("StatsSection - accessibility structure", () => {
  const html = renderToString(StatsSection({}));

  const document = parser.parseFromString(html, "text/html");

  // Should have proper heading hierarchy
  const h2 = document?.querySelector("h2");
  assertEquals(h2 !== null, true);

  // Should have descriptive content
  const descriptions = document?.querySelectorAll(".stat-desc");
  assertEquals(descriptions?.length >= 4, true);
});

Deno.test("StatsSection - flex layout for metrics", () => {
  const html = renderToString(StatsSection({}));

  assertStringIncludes(html, "inline-flex flex-wrap items-center justify-center gap-8");
  assertStringIncludes(html, "flex items-center gap-2");
});

Deno.test("StatsSection - complete component structure", () => {
  const html = renderToString(StatsSection({}));

  // Should contain all major sections
  assertStringIncludes(html, "Trusted by the Community"); // Header
  assertStringIncludes(html, "10K+"); // Stats
  assertStringIncludes(html, "Zero runtime dependencies"); // Additional metrics

  const document = parser.parseFromString(html, "text/html");

  // Should have proper nesting
  const section = document?.querySelector("section");
  const container = section?.querySelector(".max-w-6xl");
  const header = container?.querySelector(".text-center.mb-12");
  const grid = container?.querySelector(".grid");
  const metrics = container?.querySelector(".mt-12");

  assertEquals(section !== null, true);
  assertEquals(container !== null, true);
  assertEquals(header !== null, true);
  assertEquals(grid !== null, true);
  assertEquals(metrics !== null, true);
});
