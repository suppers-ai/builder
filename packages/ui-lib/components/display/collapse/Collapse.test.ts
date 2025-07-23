import { assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { Collapse } from "./Collapse.tsx";

Deno.test("Collapse - basic rendering", () => {
  const html = renderToString(Collapse({
    title: "Click to expand",
    children: "Hidden content",
  }));
  assertStringIncludes(html, "collapse");
  assertStringIncludes(html, "Click to expand");
  assertStringIncludes(html, "Hidden content");
});

Deno.test("Collapse - with checkbox", () => {
  const html = renderToString(Collapse({
    title: "Checkbox collapse",
    children: "Content",
    checkbox: true,
  }));
  assertStringIncludes(html, "collapse");
  assertStringIncludes(html, 'type="checkbox"');
});

Deno.test("Collapse - with arrow", () => {
  const html = renderToString(Collapse({
    title: "Arrow collapse",
    children: "Content",
    arrow: true,
  }));
  assertStringIncludes(html, "collapse-arrow");
});

Deno.test("Collapse - with plus icon", () => {
  const html = renderToString(Collapse({
    title: "Plus collapse",
    children: "Content",
    plus: true,
  }));
  assertStringIncludes(html, "collapse-plus");
});

Deno.test("Collapse - open state", () => {
  const html = renderToString(Collapse({
    title: "Open collapse",
    children: "Visible content",
    open: true,
  }));
  assertStringIncludes(html, "Visible content");
});

Deno.test("Collapse - closed state", () => {
  const html = renderToString(Collapse({
    title: "Closed collapse",
    children: "Hidden content",
    open: false,
  }));
  assertStringIncludes(html, "collapse");
});

Deno.test("Collapse - with custom class", () => {
  const html = renderToString(Collapse({
    title: "Custom collapse",
    children: "Content",
    class: "custom-collapse",
  }));
  assertStringIncludes(html, "custom-collapse");
});

Deno.test("Collapse - with border", () => {
  const html = renderToString(Collapse({
    title: "Bordered collapse",
    children: "Content",
    arrow: true,
  }));
  assertStringIncludes(html, "border");
});

Deno.test("Collapse - HTML snapshot", async (t) => {
  const html = renderToString(Collapse({
    title: "What is daisyUI?",
    children: "daisyUI is a semantic component library for Tailwind CSS.",
    arrow: true,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Collapse - HTML snapshot checkbox type", async (t) => {
  const html = renderToString(Collapse({
    title: "Terms and Conditions",
    children: "Please read our terms and conditions carefully...",
    checkbox: true,
    plus: true,
    arrow: true,
  }));
  await assertSnapshot(t, html);
});
