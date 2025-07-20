import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { Diff } from "./Diff.tsx";

Deno.test("Diff - basic rendering", () => {
  const html = renderToString(Diff({
    oldContent: "Original text",
    newContent: "Changed text",
  }));
  assertStringIncludes(html, "diff");
  assertStringIncludes(html, "Original text");
  assertStringIncludes(html, "Changed text");
});

Deno.test("Diff - with item1 and item2", () => {
  const html = renderToString(Diff({
    oldContent: "First version",
    newContent: "Second version",
  }));
  assertStringIncludes(html, "diff");
  assertStringIncludes(html, "First version");
  assertStringIncludes(html, "Second version");
});

Deno.test("Diff - responsive behavior", () => {
  const html = renderToString(Diff({
    oldContent: "Mobile view",
    newContent: "Desktop view",
    type: "split",
  }));
  assertStringIncludes(html, "diff");
  assertStringIncludes(html, "diff-item-1");
});

Deno.test("Diff - with custom class", () => {
  const html = renderToString(Diff({
    oldContent: "Original",
    newContent: "Changed",
    class: "custom-diff",
  }));
  assertStringIncludes(html, "custom-diff");
});

Deno.test("Diff - with labels", () => {
  const html = renderToString(Diff({
    oldContent: "Before",
    newContent: "After",
    oldLabel: "Before Changes",
    newLabel: "After Changes",
  }));
  assertStringIncludes(html, "Before Changes");
  assertStringIncludes(html, "After Changes");
});

Deno.test("Diff - split view", () => {
  const html = renderToString(Diff({
    oldContent: "Left side",
    newContent: "Right side",
    split: true,
  }));
  assertStringIncludes(html, "diff");
});

Deno.test("Diff - with resize handle", () => {
  const html = renderToString(Diff({
    oldContent: "Resizable left",
    newContent: "Resizable right",
    showLabels: true,
  }));
  assertStringIncludes(html, "mockup-code");
});

Deno.test("Diff - text comparison", () => {
  const html = renderToString(Diff({
    oldContent: "The quick brown fox",
    newContent: "The quick red fox",
    type: "text",
  }));
  assertStringIncludes(html, "diff");
  assertStringIncludes(html, "brown");
  assertStringIncludes(html, "red");
});

Deno.test("Diff - HTML snapshot", async (t) => {
  const html = renderToString(Diff({
    oldContent: "console.log('Hello World');",
    newContent: "console.log('Hello, DaisyUI!');",
    oldLabel: "Before",
    newLabel: "After",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Diff - HTML snapshot responsive", async (t) => {
  const html = renderToString(Diff({
    oldContent: "Original design mockup",
    newContent: "Updated design mockup",
    type: "split",
    showLabels: true,
  }));
  await assertSnapshot(t, html);
});
