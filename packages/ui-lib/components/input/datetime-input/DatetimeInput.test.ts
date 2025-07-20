import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { DatetimeInput } from "./DatetimeInput.tsx";

Deno.test("DatetimeInput - basic rendering", () => {
  const html = renderToString(DatetimeInput({}));
  assertStringIncludes(html, "input");
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-bordered");
  assertStringIncludes(html, 'type="datetime-local"');
});

Deno.test("DatetimeInput - with value", () => {
  const html = renderToString(DatetimeInput({
    value: "2024-03-15T14:30",
  }));
  assertStringIncludes(html, 'value="2024-03-15T14:30"');
});

Deno.test("DatetimeInput - with placeholder", () => {
  const html = renderToString(DatetimeInput({
    placeholder: "Select date and time",
  }));
  assertStringIncludes(html, 'placeholder="Select date and time"');
});

Deno.test("DatetimeInput - with min and max", () => {
  const html = renderToString(DatetimeInput({
    min: "2024-01-01T00:00",
    max: "2024-12-31T23:59",
  }));
  assertStringIncludes(html, 'min="2024-01-01T00:00"');
  assertStringIncludes(html, 'max="2024-12-31T23:59"');
});

Deno.test("DatetimeInput - with step", () => {
  const html = renderToString(DatetimeInput({
    step: "900", // 15 minutes
  }));
  assertStringIncludes(html, 'step="900"');
});

Deno.test("DatetimeInput - disabled state", () => {
  const html = renderToString(DatetimeInput({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "input-disabled");
});

Deno.test("DatetimeInput - enabled state", () => {
  const html = renderToString(DatetimeInput({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
  assertEquals(html.includes("input-disabled"), false);
});

Deno.test("DatetimeInput - required state", () => {
  const html = renderToString(DatetimeInput({
    required: true,
  }));
  assertStringIncludes(html, "required");
});

Deno.test("DatetimeInput - not required state", () => {
  const html = renderToString(DatetimeInput({
    required: false,
  }));
  assertEquals(html.includes("required"), false);
});

Deno.test("DatetimeInput - without border", () => {
  const html = renderToString(DatetimeInput({
    bordered: false,
  }));
  assertEquals(html.includes("input-bordered"), false);
});

Deno.test("DatetimeInput - with border", () => {
  const html = renderToString(DatetimeInput({
    bordered: true,
  }));
  assertStringIncludes(html, "input-bordered");
});

Deno.test("DatetimeInput - ghost style", () => {
  const html = renderToString(DatetimeInput({
    ghost: true,
  }));
  assertStringIncludes(html, "input-ghost");
});

Deno.test("DatetimeInput - without ghost style", () => {
  const html = renderToString(DatetimeInput({
    ghost: false,
  }));
  assertEquals(html.includes("input-ghost"), false);
});

Deno.test("DatetimeInput - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(DatetimeInput({
      size: size as any,
    }));
    assertStringIncludes(html, `input-${size}`);
  });
});

Deno.test("DatetimeInput - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(DatetimeInput({
      color: color as any,
    }));
    assertStringIncludes(html, `input-${color}`);
  });
});

Deno.test("DatetimeInput - custom class", () => {
  const html = renderToString(DatetimeInput({
    class: "custom-datetime-input",
  }));
  assertStringIncludes(html, "custom-datetime-input");
});

Deno.test("DatetimeInput - with id", () => {
  const html = renderToString(DatetimeInput({
    id: "test-datetime-input",
  }));
  assertStringIncludes(html, 'id="test-datetime-input"');
});

Deno.test("DatetimeInput - all props combined", () => {
  const html = renderToString(DatetimeInput({
    value: "2024-06-15T10:30",
    placeholder: "Enter date and time",
    min: "2024-01-01T00:00",
    max: "2024-12-31T23:59",
    step: "1800", // 30 minutes
    size: "lg",
    color: "primary",
    disabled: false,
    bordered: true,
    ghost: false,
    required: true,
    class: "test-class",
    id: "full-datetime-input",
  }));
  assertStringIncludes(html, 'value="2024-06-15T10:30"');
  assertStringIncludes(html, 'placeholder="Enter date and time"');
  assertStringIncludes(html, 'min="2024-01-01T00:00"');
  assertStringIncludes(html, 'max="2024-12-31T23:59"');
  assertStringIncludes(html, 'step="1800"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-primary");
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "input-bordered");
  assertEquals(html.includes("input-ghost"), false);
  assertStringIncludes(html, "required");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-datetime-input"');
});

Deno.test("DatetimeInput - event scheduling", () => {
  const html = renderToString(DatetimeInput({
    min: "2024-01-01T08:00",
    max: "2024-12-31T18:00",
    step: "3600", // 1 hour
    placeholder: "Event date and time",
    color: "success",
    size: "lg",
  }));
  assertStringIncludes(html, 'min="2024-01-01T08:00"');
  assertStringIncludes(html, 'max="2024-12-31T18:00"');
  assertStringIncludes(html, 'step="3600"');
  assertStringIncludes(html, 'placeholder="Event date and time"');
  assertStringIncludes(html, "input-success");
  assertStringIncludes(html, "input-lg");
});

Deno.test("DatetimeInput - appointment booking", () => {
  const html = renderToString(DatetimeInput({
    value: "2024-07-20T14:00",
    size: "md",
    color: "info",
    required: true,
    step: "900", // 15 minutes
  }));
  assertStringIncludes(html, 'value="2024-07-20T14:00"');
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-info");
  assertStringIncludes(html, "required");
  assertStringIncludes(html, 'step="900"');
});

Deno.test("DatetimeInput - disabled with value", () => {
  const html = renderToString(DatetimeInput({
    value: "2024-05-10T16:30",
    disabled: true,
  }));
  assertStringIncludes(html, 'value="2024-05-10T16:30"');
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "input-disabled");
});

Deno.test("DatetimeInput - ghost style with accent color", () => {
  const html = renderToString(DatetimeInput({
    ghost: true,
    color: "accent",
    placeholder: "Ghost accent datetime",
  }));
  assertStringIncludes(html, "input-ghost");
  assertStringIncludes(html, "input-accent");
  assertStringIncludes(html, 'placeholder="Ghost accent datetime"');
});

Deno.test("DatetimeInput - error color", () => {
  const html = renderToString(DatetimeInput({
    color: "error",
    placeholder: "Error datetime input",
  }));
  assertStringIncludes(html, "input-error");
  assertStringIncludes(html, 'placeholder="Error datetime input"');
});

Deno.test("DatetimeInput - warning color", () => {
  const html = renderToString(DatetimeInput({
    color: "warning",
    placeholder: "Warning datetime input",
  }));
  assertStringIncludes(html, "input-warning");
  assertStringIncludes(html, 'placeholder="Warning datetime input"');
});

Deno.test("DatetimeInput - meeting scheduler", () => {
  const html = renderToString(DatetimeInput({
    placeholder: "Select meeting time",
    min: "2024-01-01T09:00",
    max: "2024-12-31T17:00",
    step: "1800", // 30 minutes
    color: "primary",
    required: true,
  }));
  assertStringIncludes(html, 'placeholder="Select meeting time"');
  assertStringIncludes(html, 'min="2024-01-01T09:00"');
  assertStringIncludes(html, 'max="2024-12-31T17:00"');
  assertStringIncludes(html, 'step="1800"');
  assertStringIncludes(html, "input-primary");
  assertStringIncludes(html, "required");
});
