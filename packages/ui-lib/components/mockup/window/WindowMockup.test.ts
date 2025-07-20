import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { WindowMockup } from "./WindowMockup.tsx";

Deno.test("WindowMockup - basic rendering", () => {
  const html = renderToString(WindowMockup({
    children: "Test content",
  }));
  assertStringIncludes(html, "mockup-window");
  assertStringIncludes(html, "Test content");
});

Deno.test("WindowMockup - with custom title", () => {
  const html = renderToString(WindowMockup({
    children: "Test content",
    title: "Custom Window Title",
  }));
  assertStringIncludes(html, "Custom Window Title");
});

Deno.test("WindowMockup - without controls", () => {
  const html = renderToString(WindowMockup({
    children: "Test content",
    showControls: false,
  }));
  assertStringIncludes(html, "mockup-window");
  // Should not include control buttons when controls are hidden
  assertEquals(html.includes("bg-red-500"), false);
  assertEquals(html.includes("bg-yellow-500"), false);
  assertEquals(html.includes("bg-green-500"), false);
});

Deno.test("WindowMockup - bordered variant", () => {
  const html = renderToString(WindowMockup({
    children: "Test content",
    variant: "bordered",
  }));
  assertStringIncludes(html, "border");
});

Deno.test("WindowMockup - shadow variant", () => {
  const html = renderToString(WindowMockup({
    children: "Test content",
    variant: "shadow",
  }));
  assertStringIncludes(html, "shadow-2xl");
});

Deno.test("WindowMockup - with window controls", () => {
  const html = renderToString(WindowMockup({
    children: "Test content",
    showControls: true,
  }));
  // Should include the colored control buttons
  assertStringIncludes(html, "bg-red-500");
  assertStringIncludes(html, "bg-yellow-500");
  assertStringIncludes(html, "bg-green-500");
});

Deno.test("WindowMockup - with custom class", () => {
  const html = renderToString(WindowMockup({
    children: "Test content",
    class: "custom-window-class",
  }));
  assertStringIncludes(html, "custom-window-class");
});

Deno.test("WindowMockup - HTML snapshot", async (t) => {
  const html = renderToString(WindowMockup({
    children: "Test content for snapshot",
    title: "Test Window",
  }));
  await assertSnapshot(t, html);
});

Deno.test("WindowMockup - HTML snapshot bordered variant", async (t) => {
  const html = renderToString(WindowMockup({
    children: "Bordered window content",
    variant: "bordered",
    title: "Bordered Window",
  }));
  await assertSnapshot(t, html);
});

Deno.test("WindowMockup - HTML snapshot without controls", async (t) => {
  const html = renderToString(WindowMockup({
    children: "No controls content",
    showControls: false,
    title: "Clean Window",
  }));
  await assertSnapshot(t, html);
});
