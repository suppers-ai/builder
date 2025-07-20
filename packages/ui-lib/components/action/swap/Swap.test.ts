import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { Swap } from "./Swap.tsx";

Deno.test("Swap - basic rendering when inactive", () => {
  const html = renderToString(Swap({
    on: "ON",
    off: "OFF",
    active: false,
  }));
  assertStringIncludes(html, "swap");
  assertStringIncludes(html, "swap-on");
  assertStringIncludes(html, "swap-off");
  assertStringIncludes(html, "ON");
  assertStringIncludes(html, "OFF");
  assertEquals(html.includes("checked"), false);
});

Deno.test("Swap - basic rendering when active", () => {
  const html = renderToString(Swap({
    on: "ON",
    off: "OFF",
    active: true,
  }));
  assertStringIncludes(html, "swap");
  assertStringIncludes(html, "swap-active");
  assertStringIncludes(html, "checked");
});

Deno.test("Swap - with rotate animation", () => {
  const html = renderToString(Swap({
    on: "✓",
    off: "✗",
    rotate: true,
  }));
  assertStringIncludes(html, "swap-rotate");
  assertStringIncludes(html, "✓");
  assertStringIncludes(html, "✗");
});

Deno.test("Swap - with flip animation", () => {
  const html = renderToString(Swap({
    on: "👍",
    off: "👎",
    flip: true,
  }));
  assertStringIncludes(html, "swap-flip");
});

Deno.test("Swap - with custom class", () => {
  const html = renderToString(Swap({
    on: "Light",
    off: "Dark",
    class: "custom-swap-class",
  }));
  assertStringIncludes(html, "custom-swap-class");
});

Deno.test("Swap - with id", () => {
  const html = renderToString(Swap({
    on: "Yes",
    off: "No",
    id: "test-swap",
  }));
  assertStringIncludes(html, 'id="test-swap"');
});

Deno.test("Swap - all animations combined", () => {
  const html = renderToString(Swap({
    on: "Active",
    off: "Inactive",
    rotate: true,
    flip: true,
    active: true,
  }));
  assertStringIncludes(html, "swap-rotate");
  assertStringIncludes(html, "swap-flip");
  assertStringIncludes(html, "swap-active");
});

Deno.test("Swap - complex children elements", () => {
  const html = renderToString(Swap({
    on: h("div", { class: "flex items-center gap-2" }, [
      h("span", {}, "🌞"),
      h("span", {}, "Light"),
    ]),
    off: h("div", { class: "flex items-center gap-2" }, [
      h("span", {}, "🌙"),
      h("span", {}, "Dark"),
    ]),
    active: false,
  }));
  assertStringIncludes(html, "🌞");
  assertStringIncludes(html, "🌙");
  assertStringIncludes(html, "Light");
  assertStringIncludes(html, "Dark");
  assertStringIncludes(html, "flex items-center gap-2");
});

Deno.test("Swap - icon swap", () => {
  const html = renderToString(Swap({
    on: "🔊",
    off: "🔇",
    active: true,
    rotate: true,
  }));
  assertStringIncludes(html, "🔊");
  assertStringIncludes(html, "🔇");
  assertStringIncludes(html, "swap-rotate");
  assertStringIncludes(html, "swap-active");
});

Deno.test("Swap - text swap", () => {
  const html = renderToString(Swap({
    on: "Hide",
    off: "Show",
    flip: true,
  }));
  assertStringIncludes(html, "Hide");
  assertStringIncludes(html, "Show");
  assertStringIncludes(html, "swap-flip");
});

Deno.test("Swap - button content swap", () => {
  const html = renderToString(Swap({
    on: h("button", { class: "btn btn-primary" }, "Stop"),
    off: h("button", { class: "btn btn-secondary" }, "Start"),
    active: false,
  }));
  assertStringIncludes(html, "btn-primary");
  assertStringIncludes(html, "btn-secondary");
  assertStringIncludes(html, "Stop");
  assertStringIncludes(html, "Start");
});

Deno.test("Swap - all props combined", () => {
  const html = renderToString(Swap({
    on: "Active State",
    off: "Inactive State",
    active: true,
    rotate: true,
    flip: true,
    class: "test-class",
    id: "full-swap",
  }));
  assertStringIncludes(html, "swap-active");
  assertStringIncludes(html, "swap-rotate");
  assertStringIncludes(html, "swap-flip");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-swap"');
  assertStringIncludes(html, "Active State");
  assertStringIncludes(html, "Inactive State");
});

// Snapshot tests
Deno.test("Swap - HTML snapshot when inactive", async (t) => {
  const html = renderToString(Swap({
    on: "ON",
    off: "OFF",
    active: false,
    rotate: true,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Swap - HTML snapshot when active", async (t) => {
  const html = renderToString(Swap({
    on: "ON",
    off: "OFF",
    active: true,
    flip: true,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Swap - HTML snapshot complex", async (t) => {
  const html = renderToString(Swap({
    on: h("div", { class: "flex items-center gap-2 p-2" }, [
      h("svg", { class: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20" }, [
        h("path", { d: "M10 2L3 7v11a2 2 0 002 2h4v-6h2v6h4a2 2 0 002-2V7l-7-5z" }),
      ]),
      h("span", {}, "Home"),
    ]),
    off: h("div", { class: "flex items-center gap-2 p-2" }, [
      h("svg", { class: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20" }, [
        h("path", { d: "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" }),
      ]),
      h("span", {}, "Menu"),
    ]),
    active: false,
    rotate: true,
    class: "custom-swap",
  }));
  await assertSnapshot(t, html);
});
