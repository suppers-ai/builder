import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Stat } from "./Stat.tsx";
import { h } from "preact";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Stat - basic rendering with value", () => {
  const html = renderToString(Stat({
    value: "1,000",
  }));

  assertStringIncludes(html, 'class="stat"');
  assertStringIncludes(html, '<div class="stat-value">1,000</div>');
});

Deno.test("Stat - with title", () => {
  const html = renderToString(Stat({
    title: "Total Users",
    value: "1,000",
  }));

  assertStringIncludes(html, '<div class="stat-title">Total Users</div>');
  assertStringIncludes(html, '<div class="stat-value">1,000</div>');
});

Deno.test("Stat - with description", () => {
  const html = renderToString(Stat({
    value: "1,000",
    description: "↗︎ 400 (22%)",
  }));

  assertStringIncludes(html, '<div class="stat-value">1,000</div>');
  assertStringIncludes(html, '<div class="stat-desc">↗︎ 400 (22%)</div>');
});

Deno.test("Stat - with figure", () => {
  const html = renderToString(Stat({
    value: "1,000",
    figure: h("svg", { class: "w-8 h-8" }, "Icon"),
  }));

  assertStringIncludes(html, '<div class="stat-figure text-secondary">');
  assertStringIncludes(html, '<svg class="w-8 h-8">Icon</svg>');
});

Deno.test("Stat - with actions", () => {
  const html = renderToString(Stat({
    value: "1,000",
    actions: h("button", { class: "btn btn-sm" }, "View"),
  }));

  assertStringIncludes(html, '<div class="stat-actions">');
  assertStringIncludes(html, '<button class="btn btn-sm">View</button>');
});

Deno.test("Stat - with custom class", () => {
  const html = renderToString(Stat({
    value: "1,000",
    class: "custom-stat",
  }));
  assertStringIncludes(html, 'class="stat custom-stat"');
});

Deno.test("Stat - with onClick adds interactive styles", () => {
  const html = renderToString(Stat({
    value: "1,000",
    onClick: () => {},
  }));
  assertStringIncludes(html, "cursor-pointer hover:bg-base-200 transition-colors");
});

Deno.test("Stat - without onClick no interactive styles", () => {
  const html = renderToString(Stat({
    value: "1,000",
  }));
  const document = parser.parseFromString(html, "text/html");
  const stat = document?.querySelector(".stat");
  assertEquals(stat?.className?.includes("cursor-pointer"), false);
});

Deno.test("Stat - with id", () => {
  const html = renderToString(Stat({
    value: "1,000",
    id: "test-stat",
  }));
  assertStringIncludes(html, 'id="test-stat"');
});

Deno.test("Stat - numeric value", () => {
  const html = renderToString(Stat({
    value: 42,
  }));
  assertStringIncludes(html, '<div class="stat-value">42</div>');
});

Deno.test("Stat - all props combined", () => {
  const html = renderToString(Stat({
    class: "custom-stat",
    title: "Revenue",
    value: "$12,345",
    description: "↗︎ 14% from last month",
    figure: h("div", { class: "avatar" }, "💰"),
    actions: h("div", {}, [
      h("button", { class: "btn btn-xs" }, "Details"),
      h("button", { class: "btn btn-xs btn-primary" }, "Export"),
    ]),
    onClick: () => {},
    id: "revenue-stat",
  }));

  assertStringIncludes(
    html,
    'class="stat cursor-pointer hover:bg-base-200 transition-colors custom-stat"',
  );
  assertStringIncludes(html, 'id="revenue-stat"');
  assertStringIncludes(html, '<div class="stat-title">Revenue</div>');
  assertStringIncludes(html, '<div class="stat-value">$12,345</div>');
  assertStringIncludes(html, '<div class="stat-desc">↗︎ 14% from last month</div>');
  assertStringIncludes(html, '<div class="stat-figure text-secondary">');
  assertStringIncludes(html, '<div class="stat-actions">');
  assertStringIncludes(html, '<button class="btn btn-xs">Details</button>');
  assertStringIncludes(html, '<button class="btn btn-xs btn-primary">Export</button>');
});

Deno.test("Stat - minimal stat with just value", () => {
  const html = renderToString(Stat({
    value: "Active",
  }));

  assertStringIncludes(html, '<div class="stat-value">Active</div>');
  const document = parser.parseFromString(html, "text/html");
  assertEquals(document?.querySelector(".stat-title"), null);
  assertEquals(document?.querySelector(".stat-desc"), null);
  assertEquals(document?.querySelector(".stat-figure"), null);
  assertEquals(document?.querySelector(".stat-actions"), null);
});

Deno.test("Stat - conditional rendering", () => {
  const html = renderToString(Stat({
    value: "100",
    title: "", // Empty string should not render
    description: undefined, // Undefined should not render
  }));

  const document = parser.parseFromString(html, "text/html");
  assertEquals(document?.querySelector(".stat-title"), null);
  assertEquals(document?.querySelector(".stat-desc"), null);
  assertStringIncludes(html, '<div class="stat-value">100</div>');
});
