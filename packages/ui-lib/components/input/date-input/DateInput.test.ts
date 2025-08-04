import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { DateInput } from "./DateInput.tsx";

Deno.test("DateInput - basic rendering", () => {
  const html = renderToString(DateInput({}));
  assertStringIncludes(html, "input");
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-bordered");
  assertStringIncludes(html, 'type="date"');
});

Deno.test("DateInput - with value", () => {
  const html = renderToString(DateInput({
    value: "2024-03-15",
  }));
  assertStringIncludes(html, 'value="2024-03-15"');
});

Deno.test("DateInput - with placeholder", () => {
  const html = renderToString(DateInput({
    placeholder: "Select date",
  }));
  assertStringIncludes(html, 'placeholder="Select date"');
});

Deno.test("DateInput - with min and max", () => {
  const html = renderToString(DateInput({
    min: "2024-01-01",
    max: "2024-12-31",
  }));
  assertStringIncludes(html, 'min="2024-01-01"');
  assertStringIncludes(html, 'max="2024-12-31"');
});

Deno.test("DateInput - disabled state", () => {
  const html = renderToString(DateInput({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
  // Note: DaisyUI uses HTML disabled attribute, not input-disabled class
});

Deno.test("DateInput - enabled state", () => {
  const html = renderToString(DateInput({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
  assertEquals(html.includes("input-disabled"), false);
});

Deno.test("DateInput - required state", () => {
  const html = renderToString(DateInput({
    required: true,
  }));
  assertStringIncludes(html, "required");
});

Deno.test("DateInput - not required state", () => {
  const html = renderToString(DateInput({
    required: false,
  }));
  assertEquals(html.includes("required"), false);
});

Deno.test("DateInput - without border", () => {
  const html = renderToString(DateInput({
    bordered: false,
  }));
  assertEquals(html.includes("input-bordered"), false);
});

Deno.test("DateInput - with border", () => {
  const html = renderToString(DateInput({
    bordered: true,
  }));
  assertStringIncludes(html, "input-bordered");
});

Deno.test("DateInput - ghost style", () => {
  const html = renderToString(DateInput({
    ghost: true,
  }));
  assertStringIncludes(html, "input-ghost");
});

Deno.test("DateInput - without ghost style", () => {
  const html = renderToString(DateInput({
    ghost: false,
  }));
  assertEquals(html.includes("input-ghost"), false);
});

Deno.test("DateInput - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(DateInput({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    }));
    assertStringIncludes(html, `input-${size}`);
  });
});

Deno.test("DateInput - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(DateInput({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
    }));
    assertStringIncludes(html, `input-${color}`);
  });
});

Deno.test("DateInput - custom class", () => {
  const html = renderToString(DateInput({
    class: "custom-date-input",
  }));
  assertStringIncludes(html, "custom-date-input");
});

Deno.test("DateInput - with id", () => {
  const html = renderToString(DateInput({
    id: "test-date-input",
  }));
  assertStringIncludes(html, 'id="test-date-input"');
});

Deno.test("DateInput - all props combined", () => {
  const html = renderToString(DateInput({
    value: "2024-06-15",
    placeholder: "Enter date",
    min: "2024-01-01",
    max: "2024-12-31",
    size: "lg",
    color: "primary",
    disabled: false,
    bordered: true,
    ghost: false,
    required: true,
    class: "test-class",
    id: "full-date-input",
  }));
  assertStringIncludes(html, 'value="2024-06-15"');
  assertStringIncludes(html, 'placeholder="Enter date"');
  assertStringIncludes(html, 'min="2024-01-01"');
  assertStringIncludes(html, 'max="2024-12-31"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-primary");
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "input-bordered");
  assertEquals(html.includes("input-ghost"), false);
  assertStringIncludes(html, "required");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-date-input"');
});

Deno.test("DateInput - birthday input", () => {
  const html = renderToString(DateInput({
    min: "1900-01-01",
    max: "2024-12-31",
    placeholder: "Birth date",
    color: "success",
    size: "lg",
  }));
  assertStringIncludes(html, 'min="1900-01-01"');
  assertStringIncludes(html, 'max="2024-12-31"');
  assertStringIncludes(html, 'placeholder="Birth date"');
  assertStringIncludes(html, "input-success");
  assertStringIncludes(html, "input-lg");
});

Deno.test("DateInput - appointment date", () => {
  const html = renderToString(DateInput({
    value: "2024-07-20",
    size: "md",
    color: "info",
    required: true,
  }));
  assertStringIncludes(html, 'value="2024-07-20"');
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-info");
  assertStringIncludes(html, "required");
});

Deno.test("DateInput - disabled with value", () => {
  const html = renderToString(DateInput({
    value: "2024-05-10",
    disabled: true,
  }));
  assertStringIncludes(html, 'value="2024-05-10"');
  assertStringIncludes(html, "disabled");
  // Note: DaisyUI uses HTML disabled attribute, not input-disabled class
});

Deno.test("DateInput - ghost style with accent color", () => {
  const html = renderToString(DateInput({
    ghost: true,
    color: "accent",
    placeholder: "Ghost accent date",
  }));
  assertStringIncludes(html, "input-ghost");
  assertStringIncludes(html, "input-accent");
  assertStringIncludes(html, 'placeholder="Ghost accent date"');
});

Deno.test("DateInput - error color", () => {
  const html = renderToString(DateInput({
    color: "error",
    placeholder: "Error date input",
  }));
  assertStringIncludes(html, "input-error");
  assertStringIncludes(html, 'placeholder="Error date input"');
});

Deno.test("DateInput - warning color", () => {
  const html = renderToString(DateInput({
    color: "warning",
    placeholder: "Warning date input",
  }));
  assertStringIncludes(html, "input-warning");
  assertStringIncludes(html, 'placeholder="Warning date input"');
});

Deno.test("DateInput - event date", () => {
  const html = renderToString(DateInput({
    placeholder: "Event date",
    min: "2024-01-01",
    max: "2024-12-31",
    color: "primary",
    required: true,
  }));
  assertStringIncludes(html, 'placeholder="Event date"');
  assertStringIncludes(html, 'min="2024-01-01"');
  assertStringIncludes(html, 'max="2024-12-31"');
  assertStringIncludes(html, "input-primary");
  assertStringIncludes(html, "required");
});

Deno.test("DateInput - deadline date", () => {
  const html = renderToString(DateInput({
    value: "2024-08-30",
    color: "warning",
    size: "sm",
    required: true,
  }));
  assertStringIncludes(html, 'value="2024-08-30"');
  assertStringIncludes(html, "input-warning");
  assertStringIncludes(html, "input-sm");
  assertStringIncludes(html, "required");
});
