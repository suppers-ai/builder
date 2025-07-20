import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { Loading } from "./Loading.tsx";

Deno.test("Loading - basic rendering with default spinner", () => {
  const html = renderToString(Loading({}));
  assertStringIncludes(html, "loading");
  assertStringIncludes(html, "loading-spinner");
  assertStringIncludes(html, "loading-md");
});

Deno.test("Loading - spinner variant", () => {
  const html = renderToString(Loading({
    variant: "spinner",
  }));
  assertStringIncludes(html, "loading-spinner");
});

Deno.test("Loading - dots variant", () => {
  const html = renderToString(Loading({
    variant: "dots",
  }));
  assertStringIncludes(html, "loading-dots");
});

Deno.test("Loading - ring variant", () => {
  const html = renderToString(Loading({
    variant: "ring",
  }));
  assertStringIncludes(html, "loading-ring");
});

Deno.test("Loading - ball variant", () => {
  const html = renderToString(Loading({
    variant: "ball",
  }));
  assertStringIncludes(html, "loading-ball");
});

Deno.test("Loading - bars variant", () => {
  const html = renderToString(Loading({
    variant: "bars",
  }));
  assertStringIncludes(html, "loading-bars");
});

Deno.test("Loading - infinity variant", () => {
  const html = renderToString(Loading({
    variant: "infinity",
  }));
  assertStringIncludes(html, "loading-infinity");
});

Deno.test("Loading - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Loading({
      size: size as any,
    }));
    assertStringIncludes(html, `loading-${size}`);
  });
});

Deno.test("Loading - color variants", () => {
  const colors = [
    "primary",
    "secondary",
    "accent",
    "neutral",
    "info",
    "success",
    "warning",
    "error",
  ];

  colors.forEach((color) => {
    const html = renderToString(Loading({
      color: color as any,
    }));
    assertStringIncludes(html, `text-${color}`);
  });
});

Deno.test("Loading - without color", () => {
  const html = renderToString(Loading({}));
  assertEquals(html.includes("text-"), false);
});

Deno.test("Loading - custom class", () => {
  const html = renderToString(Loading({
    class: "custom-loading-class",
  }));
  assertStringIncludes(html, "custom-loading-class");
});

Deno.test("Loading - with id", () => {
  const html = renderToString(Loading({
    id: "test-loading",
  }));
  assertStringIncludes(html, 'id="test-loading"');
});

Deno.test("Loading - all props combined", () => {
  const html = renderToString(Loading({
    variant: "dots",
    size: "lg",
    color: "primary",
    class: "test-class",
    id: "full-loading",
  }));
  assertStringIncludes(html, "loading-dots");
  assertStringIncludes(html, "loading-lg");
  assertStringIncludes(html, "text-primary");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-loading"');
});

Deno.test("Loading - small spinner with secondary color", () => {
  const html = renderToString(Loading({
    variant: "spinner",
    size: "sm",
    color: "secondary",
  }));
  assertStringIncludes(html, "loading-spinner");
  assertStringIncludes(html, "loading-sm");
  assertStringIncludes(html, "text-secondary");
});

Deno.test("Loading - large ring with error color", () => {
  const html = renderToString(Loading({
    variant: "ring",
    size: "lg",
    color: "error",
  }));
  assertStringIncludes(html, "loading-ring");
  assertStringIncludes(html, "loading-lg");
  assertStringIncludes(html, "text-error");
});

Deno.test("Loading - extra small dots", () => {
  const html = renderToString(Loading({
    variant: "dots",
    size: "xs",
  }));
  assertStringIncludes(html, "loading-dots");
  assertStringIncludes(html, "loading-xs");
});

Deno.test("Loading - infinity with accent color", () => {
  const html = renderToString(Loading({
    variant: "infinity",
    color: "accent",
  }));
  assertStringIncludes(html, "loading-infinity");
  assertStringIncludes(html, "text-accent");
});

Deno.test("Loading - bars with success color", () => {
  const html = renderToString(Loading({
    variant: "bars",
    color: "success",
  }));
  assertStringIncludes(html, "loading-bars");
  assertStringIncludes(html, "text-success");
});

Deno.test("Loading - ball with warning color", () => {
  const html = renderToString(Loading({
    variant: "ball",
    color: "warning",
  }));
  assertStringIncludes(html, "loading-ball");
  assertStringIncludes(html, "text-warning");
});

Deno.test("Loading - renders as span element", () => {
  const html = renderToString(Loading({}));
  assertStringIncludes(html, "<span");
  assertStringIncludes(html, "</span>");
});

Deno.test("Loading - no children content", () => {
  const html = renderToString(Loading({}));
  // Should be self-closing or empty span
  const isEmpty = html.includes("></span>") || html.includes("/>");
  assertEquals(isEmpty, true);
});

// Snapshot tests
Deno.test("Loading - HTML snapshot spinner", async (t) => {
  const html = renderToString(Loading({
    variant: "spinner",
    size: "md",
    color: "primary",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Loading - HTML snapshot dots", async (t) => {
  const html = renderToString(Loading({
    variant: "dots",
    size: "lg",
    color: "secondary",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Loading - HTML snapshot ring", async (t) => {
  const html = renderToString(Loading({
    variant: "ring",
    size: "sm",
    color: "accent",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Loading - HTML snapshot all variants", async (t) => {
  const variants = ["spinner", "dots", "ring", "ball", "bars", "infinity"];
  const htmls = variants.map((variant) =>
    renderToString(Loading({
      variant: variant as any,
      size: "md",
    }))
  );
  await assertSnapshot(t, htmls.join("\n"));
});

Deno.test("Loading - HTML snapshot all sizes", async (t) => {
  const sizes = ["xs", "sm", "md", "lg"];
  const htmls = sizes.map((size) =>
    renderToString(Loading({
      variant: "spinner",
      size: size as any,
      color: "primary",
    }))
  );
  await assertSnapshot(t, htmls.join("\n"));
});
