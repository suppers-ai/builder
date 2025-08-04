import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { renderToString } from "preact-render-to-string";
import { Progress } from "./Progress.tsx";

Deno.test("Progress - basic rendering", () => {
  const html = renderToString(Progress({}));
  assertStringIncludes(html, "progress");
  assertStringIncludes(html, "progress-primary");
  assertStringIncludes(html, "progress-md");
  assertStringIncludes(html, 'value="0"');
  assertStringIncludes(html, 'max="100"');
});

Deno.test("Progress - with value", () => {
  const html = renderToString(Progress({
    value: 50,
  }));
  assertStringIncludes(html, 'value="50"');
  assertStringIncludes(html, "50%");
});

Deno.test("Progress - with custom max", () => {
  const html = renderToString(Progress({
    value: 30,
    max: 200,
  }));
  assertStringIncludes(html, 'value="30"');
  assertStringIncludes(html, 'max="200"');
  assertStringIncludes(html, "30%");
});

Deno.test("Progress - indeterminate", () => {
  const html = renderToString(Progress({
    indeterminate: true,
  }));
  assertStringIncludes(html, "progress");
  assertEquals(html.includes("value="), false);
  assertEquals(html.includes("max="), false);
  assertEquals(html.includes("%"), false);
});

Deno.test("Progress - not indeterminate (default)", () => {
  const html = renderToString(Progress({
    indeterminate: false,
    value: 25,
  }));
  assertStringIncludes(html, 'value="25"');
  assertStringIncludes(html, "25%");
});

Deno.test("Progress - striped", () => {
  const html = renderToString(Progress({
    striped: true,
  }));
  assertStringIncludes(html, "progress-striped");
});

Deno.test("Progress - animated", () => {
  const html = renderToString(Progress({
    animated: true,
  }));
  assertStringIncludes(html, "progress-animated");
});

Deno.test("Progress - striped and animated", () => {
  const html = renderToString(Progress({
    striped: true,
    animated: true,
  }));
  assertStringIncludes(html, "progress-striped");
  assertStringIncludes(html, "progress-animated");
});

Deno.test("Progress - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Progress({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
      value: 50,
    }));
    assertStringIncludes(html, `progress-${size}`);
  });
});

Deno.test("Progress - color variants", () => {
  const colors = ["primary", "secondary", "accent", "info", "success", "warning", "error"];

  colors.forEach((color) => {
    const html = renderToString(Progress({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
      value: 60,
    }));
    assertStringIncludes(html, `progress-${color}`);
  });
});

Deno.test("Progress - custom class", () => {
  const html = renderToString(Progress({
    class: "custom-progress-class",
    value: 40,
  }));
  assertStringIncludes(html, "custom-progress-class");
});

Deno.test("Progress - with id", () => {
  const html = renderToString(Progress({
    id: "test-progress",
    value: 75,
  }));
  assertStringIncludes(html, 'id="test-progress"');
});

Deno.test("Progress - zero value", () => {
  const html = renderToString(Progress({
    value: 0,
  }));
  assertStringIncludes(html, 'value="0"');
  assertStringIncludes(html, "0%");
});

Deno.test("Progress - full value", () => {
  const html = renderToString(Progress({
    value: 100,
  }));
  assertStringIncludes(html, 'value="100"');
  assertStringIncludes(html, "100%");
});

Deno.test("Progress - over max value", () => {
  const html = renderToString(Progress({
    value: 150,
    max: 100,
  }));
  assertStringIncludes(html, 'value="150"');
  assertStringIncludes(html, 'max="100"');
  assertStringIncludes(html, "150%");
});

Deno.test("Progress - all props combined", () => {
  const html = renderToString(Progress({
    value: 85,
    max: 100,
    size: "lg",
    color: "success",
    striped: true,
    animated: true,
    class: "test-class",
    id: "full-progress",
  }));
  assertStringIncludes(html, 'value="85"');
  assertStringIncludes(html, 'max="100"');
  assertStringIncludes(html, "progress-lg");
  assertStringIncludes(html, "progress-success");
  assertStringIncludes(html, "progress-striped");
  assertStringIncludes(html, "progress-animated");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-progress"');
  assertStringIncludes(html, "85%");
});

Deno.test("Progress - indeterminate with styles", () => {
  const html = renderToString(Progress({
    indeterminate: true,
    size: "lg",
    color: "warning",
    striped: true,
    animated: true,
  }));
  assertStringIncludes(html, "progress-lg");
  assertStringIncludes(html, "progress-warning");
  assertStringIncludes(html, "progress-striped");
  assertStringIncludes(html, "progress-animated");
  assertEquals(html.includes("value="), false);
  assertEquals(html.includes("%"), false);
});

Deno.test("Progress - small primary progress", () => {
  const html = renderToString(Progress({
    size: "sm",
    color: "primary",
    value: 25,
  }));
  assertStringIncludes(html, "progress-sm");
  assertStringIncludes(html, "progress-primary");
  assertStringIncludes(html, 'value="25"');
  assertStringIncludes(html, "25%");
});

Deno.test("Progress - large error progress", () => {
  const html = renderToString(Progress({
    size: "lg",
    color: "error",
    value: 90,
    striped: true,
  }));
  assertStringIncludes(html, "progress-lg");
  assertStringIncludes(html, "progress-error");
  assertStringIncludes(html, "progress-striped");
  assertStringIncludes(html, 'value="90"');
});

Deno.test("Progress - secondary animated progress", () => {
  const html = renderToString(Progress({
    color: "secondary",
    value: 45,
    animated: true,
  }));
  assertStringIncludes(html, "progress-secondary");
  assertStringIncludes(html, "progress-animated");
  assertStringIncludes(html, 'value="45"');
});

Deno.test("Progress - accent striped progress", () => {
  const html = renderToString(Progress({
    color: "accent",
    value: 70,
    striped: true,
  }));
  assertStringIncludes(html, "progress-accent");
  assertStringIncludes(html, "progress-striped");
  assertStringIncludes(html, 'value="70"');
});

Deno.test("Progress - info progress with custom max", () => {
  const html = renderToString(Progress({
    color: "info",
    value: 15,
    max: 50,
  }));
  assertStringIncludes(html, "progress-info");
  assertStringIncludes(html, 'value="15"');
  assertStringIncludes(html, 'max="50"');
  assertStringIncludes(html, "15%");
});

// Edge cases
Deno.test("Progress - negative value", () => {
  const html = renderToString(Progress({
    value: -10,
  }));
  assertStringIncludes(html, 'value="-10"');
  assertStringIncludes(html, "-10%");
});

Deno.test("Progress - decimal value", () => {
  const html = renderToString(Progress({
    value: 33.5,
  }));
  assertStringIncludes(html, 'value="33.5"');
  assertStringIncludes(html, "33.5%");
});

// Snapshot tests
Deno.test("Progress - HTML snapshot basic", async (t) => {
  const html = renderToString(Progress({
    value: 50,
    color: "primary",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Progress - HTML snapshot indeterminate", async (t) => {
  const html = renderToString(Progress({
    indeterminate: true,
    color: "secondary",
    animated: true,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Progress - HTML snapshot styled", async (t) => {
  const html = renderToString(Progress({
    value: 75,
    size: "lg",
    color: "success",
    striped: true,
    animated: true,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Progress - HTML snapshot all sizes", async (t) => {
  const sizes = ["xs", "sm", "md", "lg"];
  const htmls = sizes.map((size) =>
    renderToString(Progress({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
      value: 60,
      color: "primary",
    }))
  );
  await assertSnapshot(t, htmls.join("\n"));
});

Deno.test("Progress - HTML snapshot all colors", async (t) => {
  const colors = ["primary", "secondary", "accent", "info", "success", "warning", "error"];
  const htmls = colors.map((color) =>
    renderToString(Progress({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
      value: 45,
      size: "md",
    }))
  );
  await assertSnapshot(t, htmls.join("\n"));
});
