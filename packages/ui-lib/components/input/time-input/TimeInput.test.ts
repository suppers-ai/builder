import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { TimeInput } from "./TimeInput.tsx";

Deno.test("TimeInput - basic rendering", () => {
  const html = renderToString(TimeInput({}));
  assertStringIncludes(html, "input");
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-bordered");
  assertStringIncludes(html, 'type="time"');
});

Deno.test("TimeInput - with value", () => {
  const html = renderToString(TimeInput({
    value: "14:30",
  }));
  assertStringIncludes(html, 'value="14:30"');
});

Deno.test("TimeInput - with placeholder", () => {
  const html = renderToString(TimeInput({
    placeholder: "Select time",
  }));
  assertStringIncludes(html, 'placeholder="Select time"');
});

Deno.test("TimeInput - with min and max", () => {
  const html = renderToString(TimeInput({
    min: "09:00",
    max: "17:00",
  }));
  assertStringIncludes(html, 'min="09:00"');
  assertStringIncludes(html, 'max="17:00"');
});

Deno.test("TimeInput - with step", () => {
  const html = renderToString(TimeInput({
    step: "300", // 5 minutes
  }));
  assertStringIncludes(html, 'step="300"');
});

Deno.test("TimeInput - disabled state", () => {
  const html = renderToString(TimeInput({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "input-disabled");
});

Deno.test("TimeInput - enabled state", () => {
  const html = renderToString(TimeInput({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
  assertEquals(html.includes("input-disabled"), false);
});

Deno.test("TimeInput - required state", () => {
  const html = renderToString(TimeInput({
    required: true,
  }));
  assertStringIncludes(html, "required");
});

Deno.test("TimeInput - not required state", () => {
  const html = renderToString(TimeInput({
    required: false,
  }));
  assertEquals(html.includes("required"), false);
});

Deno.test("TimeInput - without border", () => {
  const html = renderToString(TimeInput({
    bordered: false,
  }));
  assertEquals(html.includes("input-bordered"), false);
});

Deno.test("TimeInput - with border", () => {
  const html = renderToString(TimeInput({
    bordered: true,
  }));
  assertStringIncludes(html, "input-bordered");
});

Deno.test("TimeInput - ghost style", () => {
  const html = renderToString(TimeInput({
    ghost: true,
  }));
  assertStringIncludes(html, "input-ghost");
});

Deno.test("TimeInput - without ghost style", () => {
  const html = renderToString(TimeInput({
    ghost: false,
  }));
  assertEquals(html.includes("input-ghost"), false);
});

Deno.test("TimeInput - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(TimeInput({
      size: size as any,
    }));
    assertStringIncludes(html, `input-${size}`);
  });
});

Deno.test("TimeInput - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(TimeInput({
      color: color as any,
    }));
    assertStringIncludes(html, `input-${color}`);
  });
});

Deno.test("TimeInput - custom class", () => {
  const html = renderToString(TimeInput({
    class: "custom-time-input",
  }));
  assertStringIncludes(html, "custom-time-input");
});

Deno.test("TimeInput - with id", () => {
  const html = renderToString(TimeInput({
    id: "test-time-input",
  }));
  assertStringIncludes(html, 'id="test-time-input"');
});

Deno.test("TimeInput - all props combined", () => {
  const html = renderToString(TimeInput({
    value: "12:45",
    placeholder: "Enter time",
    min: "08:00",
    max: "18:00",
    step: "900", // 15 minutes
    size: "lg",
    color: "primary",
    disabled: false,
    bordered: true,
    ghost: false,
    required: true,
    class: "test-class",
    id: "full-time-input",
  }));
  assertStringIncludes(html, 'value="12:45"');
  assertStringIncludes(html, 'placeholder="Enter time"');
  assertStringIncludes(html, 'min="08:00"');
  assertStringIncludes(html, 'max="18:00"');
  assertStringIncludes(html, 'step="900"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-primary");
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "input-bordered");
  assertEquals(html.includes("input-ghost"), false);
  assertStringIncludes(html, "required");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-time-input"');
});

Deno.test("TimeInput - business hours", () => {
  const html = renderToString(TimeInput({
    min: "09:00",
    max: "17:00",
    step: "1800", // 30 minutes
    placeholder: "Business hours",
    color: "success",
  }));
  assertStringIncludes(html, 'min="09:00"');
  assertStringIncludes(html, 'max="17:00"');
  assertStringIncludes(html, 'step="1800"');
  assertStringIncludes(html, 'placeholder="Business hours"');
  assertStringIncludes(html, "input-success");
});

Deno.test("TimeInput - appointment time", () => {
  const html = renderToString(TimeInput({
    value: "10:30",
    size: "lg",
    color: "info",
    required: true,
  }));
  assertStringIncludes(html, 'value="10:30"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-info");
  assertStringIncludes(html, "required");
});

Deno.test("TimeInput - disabled with value", () => {
  const html = renderToString(TimeInput({
    value: "15:00",
    disabled: true,
  }));
  assertStringIncludes(html, 'value="15:00"');
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "input-disabled");
});

Deno.test("TimeInput - ghost style with accent color", () => {
  const html = renderToString(TimeInput({
    ghost: true,
    color: "accent",
    placeholder: "Ghost accent time",
  }));
  assertStringIncludes(html, "input-ghost");
  assertStringIncludes(html, "input-accent");
  assertStringIncludes(html, 'placeholder="Ghost accent time"');
});

Deno.test("TimeInput - error color", () => {
  const html = renderToString(TimeInput({
    color: "error",
    placeholder: "Error time input",
  }));
  assertStringIncludes(html, "input-error");
  assertStringIncludes(html, 'placeholder="Error time input"');
});

Deno.test("TimeInput - warning color", () => {
  const html = renderToString(TimeInput({
    color: "warning",
    placeholder: "Warning time input",
  }));
  assertStringIncludes(html, "input-warning");
  assertStringIncludes(html, 'placeholder="Warning time input"');
});
