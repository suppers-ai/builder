import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { BrowserMockup } from "./BrowserMockup.tsx";

Deno.test("BrowserMockup - basic rendering", () => {
  const html = renderToString(BrowserMockup({
    children: "Test content",
  }));
  assertStringIncludes(html, "mockup-browser");
  assertStringIncludes(html, "Test content");
});

Deno.test("BrowserMockup - with custom URL", () => {
  const html = renderToString(BrowserMockup({
    children: "Test content",
    url: "https://custom.example.com",
  }));
  assertStringIncludes(html, "https://custom.example.com");
});

Deno.test("BrowserMockup - without controls", () => {
  const html = renderToString(BrowserMockup({
    children: "Test content",
    showControls: false,
  }));
  assertStringIncludes(html, "mockup-browser");
  // Should not include toolbar when controls are hidden
  assertEquals(html.includes("mockup-browser-toolbar"), false);
});

Deno.test("BrowserMockup - dark variant", () => {
  const html = renderToString(BrowserMockup({
    children: "Test content",
    variant: "dark",
  }));
  assertStringIncludes(html, "bg-base-300");
});

Deno.test("BrowserMockup - minimal variant", () => {
  const html = renderToString(BrowserMockup({
    children: "Test content",
    variant: "minimal",
  }));
  assertStringIncludes(html, "border-base-300");
});

Deno.test("BrowserMockup - with custom class", () => {
  const html = renderToString(BrowserMockup({
    children: "Test content",
    class: "custom-class",
  }));
  assertStringIncludes(html, "custom-class");
});

Deno.test("BrowserMockup - HTML snapshot", async (t) => {
  const html = renderToString(BrowserMockup({
    children: "Test content for snapshot",
    url: "https://example.com",
  }));
  await assertSnapshot(t, html);
});

Deno.test("BrowserMockup - HTML snapshot dark variant", async (t) => {
  const html = renderToString(BrowserMockup({
    children: "Dark theme content",
    variant: "dark",
    url: "https://dark.example.com",
  }));
  await assertSnapshot(t, html);
});

Deno.test("BrowserMockup - HTML snapshot minimal without controls", async (t) => {
  const html = renderToString(BrowserMockup({
    children: "Minimal content",
    variant: "minimal",
    showControls: false,
  }));
  await assertSnapshot(t, html);
});
