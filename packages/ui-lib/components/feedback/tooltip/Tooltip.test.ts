import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { Tooltip } from "./Tooltip.tsx";

Deno.test("Tooltip - basic rendering", () => {
  const html = renderToString(Tooltip({
    tip: "This is a tooltip",
    children: "Hover me",
  }));
  assertStringIncludes(html, "tooltip");
  assertStringIncludes(html, "tooltip-top");
  assertStringIncludes(html, 'data-tip="This is a tooltip"');
  assertStringIncludes(html, "Hover me");
});

Deno.test("Tooltip - tip prop", () => {
  const html = renderToString(Tooltip({
    tip: "Helpful information",
    children: "Button",
  }));
  assertStringIncludes(html, 'data-tip="Helpful information"');
});

Deno.test("Tooltip - default position", () => {
  const html = renderToString(Tooltip({
    tip: "Default position",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-top");
});

Deno.test("Tooltip - position top", () => {
  const html = renderToString(Tooltip({
    tip: "Top position",
    position: "top",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-top");
});

Deno.test("Tooltip - position bottom", () => {
  const html = renderToString(Tooltip({
    tip: "Bottom position",
    position: "bottom",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-bottom");
});

Deno.test("Tooltip - position left", () => {
  const html = renderToString(Tooltip({
    tip: "Left position",
    position: "left",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-left");
});

Deno.test("Tooltip - position right", () => {
  const html = renderToString(Tooltip({
    tip: "Right position",
    position: "right",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-right");
});

Deno.test("Tooltip - color primary", () => {
  const html = renderToString(Tooltip({
    tip: "Primary tooltip",
    color: "primary",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-primary");
});

Deno.test("Tooltip - color secondary", () => {
  const html = renderToString(Tooltip({
    tip: "Secondary tooltip",
    color: "secondary",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-secondary");
});

Deno.test("Tooltip - color accent", () => {
  const html = renderToString(Tooltip({
    tip: "Accent tooltip",
    color: "accent",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-accent");
});

Deno.test("Tooltip - color neutral", () => {
  const html = renderToString(Tooltip({
    tip: "Neutral tooltip",
    color: "neutral",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-neutral");
});

Deno.test("Tooltip - color info", () => {
  const html = renderToString(Tooltip({
    tip: "Info tooltip",
    color: "info",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-info");
});

Deno.test("Tooltip - color success", () => {
  const html = renderToString(Tooltip({
    tip: "Success tooltip",
    color: "success",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-success");
});

Deno.test("Tooltip - color warning", () => {
  const html = renderToString(Tooltip({
    tip: "Warning tooltip",
    color: "warning",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-warning");
});

Deno.test("Tooltip - color error", () => {
  const html = renderToString(Tooltip({
    tip: "Error tooltip",
    color: "error",
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-error");
});

Deno.test("Tooltip - base colors", () => {
  const baseColors = ["base-100", "base-200", "base-300"] as const;

  baseColors.forEach((color) => {
    const html = renderToString(Tooltip({
      tip: `${color} tooltip`,
      color,
      children: "Element",
    }));
    assertStringIncludes(html, `tooltip-${color}`);
  });
});

Deno.test("Tooltip - no color", () => {
  const html = renderToString(Tooltip({
    tip: "No color tooltip",
    children: "Element",
  }));
  assertEquals(html.includes("tooltip-primary"), false);
  assertEquals(html.includes("tooltip-secondary"), false);
  assertEquals(html.includes("tooltip-accent"), false);
});

Deno.test("Tooltip - open prop true", () => {
  const html = renderToString(Tooltip({
    tip: "Always visible",
    open: true,
    children: "Element",
  }));
  assertStringIncludes(html, "tooltip-open");
});

Deno.test("Tooltip - open prop false", () => {
  const html = renderToString(Tooltip({
    tip: "Hidden tooltip",
    open: false,
    children: "Element",
  }));
  assertEquals(html.includes("tooltip-open"), false);
});

Deno.test("Tooltip - default open", () => {
  const html = renderToString(Tooltip({
    tip: "Default open",
    children: "Element",
  }));
  assertEquals(html.includes("tooltip-open"), false);
});

Deno.test("Tooltip - custom class", () => {
  const html = renderToString(Tooltip({
    tip: "Custom class",
    class: "custom-tooltip-class",
    children: "Element",
  }));
  assertStringIncludes(html, "custom-tooltip-class");
});

Deno.test("Tooltip - with id", () => {
  const html = renderToString(Tooltip({
    tip: "Tooltip with id",
    id: "test-tooltip",
    children: "Element",
  }));
  assertStringIncludes(html, 'id="test-tooltip"');
});

Deno.test("Tooltip - simple text children", () => {
  const html = renderToString(Tooltip({
    tip: "Simple tooltip",
    children: "Click me",
  }));
  assertStringIncludes(html, "Click me");
});

Deno.test("Tooltip - JSX children", () => {
  const html = renderToString(Tooltip({
    tip: "JSX tooltip",
    children: h("button", { class: "btn" }, "JSX Button"),
  }));
  assertStringIncludes(html, "btn");
  assertStringIncludes(html, "JSX Button");
});

Deno.test("Tooltip - complex children", () => {
  const html = renderToString(Tooltip({
    tip: "Complex tooltip",
    children: h("div", { class: "card" }, [
      h("h3", {}, "Card Title"),
      h("p", {}, "Card content"),
    ]),
  }));
  assertStringIncludes(html, "card");
  assertStringIncludes(html, "Card Title");
  assertStringIncludes(html, "Card content");
});

Deno.test("Tooltip - multiline tip", () => {
  const html = renderToString(Tooltip({
    tip: "Line 1\nLine 2\nLine 3",
    children: "Multiline tip",
  }));
  assertStringIncludes(html, 'data-tip="Line 1\nLine 2\nLine 3"');
});

Deno.test("Tooltip - special characters in tip", () => {
  const html = renderToString(Tooltip({
    tip: "Special chars: !@#$%^&*()",
    children: "Special tip",
  }));
  assertStringIncludes(html, 'data-tip="Special chars: !@#$%^&amp;*()"');
});

Deno.test("Tooltip - all props combined", () => {
  const html = renderToString(Tooltip({
    tip: "Complete tooltip",
    position: "bottom",
    color: "primary",
    open: true,
    class: "test-class",
    id: "complete-tooltip",
    children: "Complete element",
  }));
  assertStringIncludes(html, 'data-tip="Complete tooltip"');
  assertStringIncludes(html, "tooltip-bottom");
  assertStringIncludes(html, "tooltip-primary");
  assertStringIncludes(html, "tooltip-open");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="complete-tooltip"');
  assertStringIncludes(html, "Complete element");
});

Deno.test("Tooltip - position and color combinations", () => {
  const positions = ["top", "bottom", "left", "right"] as const;
  const colors = ["primary", "secondary", "accent", "info"] as const;

  positions.forEach((position) => {
    colors.forEach((color) => {
      const html = renderToString(Tooltip({
        tip: `${position} ${color} tooltip`,
        position,
        color,
        children: "Element",
      }));
      assertStringIncludes(html, `tooltip-${position}`);
      assertStringIncludes(html, `tooltip-${color}`);
    });
  });
});

Deno.test("Tooltip - button with tooltip", () => {
  const html = renderToString(Tooltip({
    tip: "Click to submit",
    position: "top",
    color: "success",
    children: h("button", { class: "btn btn-success" }, "Submit"),
  }));
  assertStringIncludes(html, 'data-tip="Click to submit"');
  assertStringIncludes(html, "tooltip-top");
  assertStringIncludes(html, "tooltip-success");
  assertStringIncludes(html, "btn btn-success");
  assertStringIncludes(html, "Submit");
});

Deno.test("Tooltip - icon with tooltip", () => {
  const html = renderToString(Tooltip({
    tip: "Information icon",
    position: "right",
    color: "info",
    children: h("span", { class: "icon" }, "ℹ️"),
  }));
  assertStringIncludes(html, 'data-tip="Information icon"');
  assertStringIncludes(html, "tooltip-right");
  assertStringIncludes(html, "tooltip-info");
  assertStringIncludes(html, "icon");
  assertStringIncludes(html, "ℹ️");
});

Deno.test("Tooltip - card with tooltip", () => {
  const html = renderToString(Tooltip({
    tip: "Hover for details",
    position: "bottom",
    color: "accent",
    open: false,
    children: h("div", { class: "card bg-base-100 shadow-xl" }, [
      h("div", { class: "card-body" }, [
        h("h2", { class: "card-title" }, "Card Title"),
        h("p", {}, "Card description"),
      ]),
    ]),
  }));
  assertStringIncludes(html, 'data-tip="Hover for details"');
  assertStringIncludes(html, "tooltip-bottom");
  assertStringIncludes(html, "tooltip-accent");
  assertEquals(html.includes("tooltip-open"), false);
  assertStringIncludes(html, "card bg-base-100 shadow-xl");
  assertStringIncludes(html, "Card Title");
  assertStringIncludes(html, "Card description");
});

Deno.test("Tooltip - extra props passthrough", () => {
  const html = renderToString(Tooltip({
    tip: "Extra props",
    children: "Element",
    ...{ "data-testid": "tooltip-wrapper", title: "Tooltip wrapper", role: "tooltip" },
  }));
  assertStringIncludes(html, 'data-testid="tooltip-wrapper"');
  assertStringIncludes(html, 'title="Tooltip wrapper"');
  assertStringIncludes(html, 'role="tooltip"');
});
