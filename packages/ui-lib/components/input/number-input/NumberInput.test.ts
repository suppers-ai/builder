import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { NumberInput } from "./NumberInput.tsx";

Deno.test("NumberInput - basic rendering", () => {
  const html = renderToString(NumberInput({}));
  assertStringIncludes(html, "input");
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-bordered");
  assertStringIncludes(html, 'type="number"');
  assertStringIncludes(html, 'placeholder="0"');
  assertStringIncludes(html, 'step="1"');
  assertStringIncludes(html, "relative");
  assertStringIncludes(html, "pr-8"); // button padding
});

Deno.test("NumberInput - with value", () => {
  const html = renderToString(NumberInput({
    value: 42,
  }));
  assertStringIncludes(html, 'value="42"');
});

Deno.test("NumberInput - with placeholder", () => {
  const html = renderToString(NumberInput({
    placeholder: "Enter number",
  }));
  assertStringIncludes(html, 'placeholder="Enter number"');
});

Deno.test("NumberInput - with min and max", () => {
  const html = renderToString(NumberInput({
    min: 0,
    max: 100,
  }));
  assertStringIncludes(html, 'min="0"');
  assertStringIncludes(html, 'max="100"');
});

Deno.test("NumberInput - with step", () => {
  const html = renderToString(NumberInput({
    step: 5,
  }));
  assertStringIncludes(html, 'step="5"');
});

Deno.test("NumberInput - disabled state", () => {
  const html = renderToString(NumberInput({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "input-disabled");
});

Deno.test("NumberInput - enabled state", () => {
  const html = renderToString(NumberInput({
    disabled: false,
  }));
  assertEquals(html.includes('disabled=""'), false); // Check for disabled attribute, not CSS class
  assertEquals(html.includes("input-disabled"), false);
});

Deno.test("NumberInput - required state", () => {
  const html = renderToString(NumberInput({
    required: true,
  }));
  assertStringIncludes(html, "required");
});

Deno.test("NumberInput - not required state", () => {
  const html = renderToString(NumberInput({
    required: false,
  }));
  assertEquals(html.includes('required=""'), false); // Check for required attribute, not other occurrences
});

Deno.test("NumberInput - without border", () => {
  const html = renderToString(NumberInput({
    bordered: false,
  }));
  assertEquals(html.includes("input-bordered"), false);
});

Deno.test("NumberInput - with border", () => {
  const html = renderToString(NumberInput({
    bordered: true,
  }));
  assertStringIncludes(html, "input-bordered");
});

Deno.test("NumberInput - ghost style", () => {
  const html = renderToString(NumberInput({
    ghost: true,
  }));
  assertStringIncludes(html, "input-ghost");
});

Deno.test("NumberInput - without ghost style", () => {
  const html = renderToString(NumberInput({
    ghost: false,
  }));
  assertEquals(html.includes("input-ghost"), false);
});

Deno.test("NumberInput - increment/decrement buttons", () => {
  const html = renderToString(NumberInput({}));
  assertStringIncludes(html, "absolute right-1");
  assertStringIncludes(html, "flex flex-col");
  assertStringIncludes(html, "▲");
  assertStringIncludes(html, "▼");
  assertStringIncludes(html, "button");
});

Deno.test("NumberInput - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(NumberInput({
      size: size as any,
    }));
    assertStringIncludes(html, `input-${size}`);
  });
});

Deno.test("NumberInput - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(NumberInput({
      color: color as any,
    }));
    assertStringIncludes(html, `input-${color}`);
  });
});

Deno.test("NumberInput - custom class", () => {
  const html = renderToString(NumberInput({
    class: "custom-number-input",
  }));
  assertStringIncludes(html, "custom-number-input");
});

Deno.test("NumberInput - with id", () => {
  const html = renderToString(NumberInput({
    id: "test-number-input",
  }));
  assertStringIncludes(html, 'id="test-number-input"');
});

Deno.test("NumberInput - all props combined", () => {
  const html = renderToString(NumberInput({
    value: 50,
    placeholder: "Enter amount",
    min: 0,
    max: 100,
    step: 10,
    size: "lg",
    color: "primary",
    disabled: false,
    bordered: true,
    ghost: false,
    required: true,
    class: "test-class",
    id: "full-number-input",
  }));
  assertStringIncludes(html, 'value="50"');
  assertStringIncludes(html, 'placeholder="Enter amount"');
  assertStringIncludes(html, 'min="0"');
  assertStringIncludes(html, 'max="100"');
  assertStringIncludes(html, 'step="10"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-primary");
  assertEquals(html.includes('disabled=""'), false); // Check for disabled attribute, not CSS class
  assertStringIncludes(html, "input-bordered");
  assertEquals(html.includes("input-ghost"), false);
  assertStringIncludes(html, "required");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-number-input"');
});

Deno.test("NumberInput - age input", () => {
  const html = renderToString(NumberInput({
    min: 0,
    max: 120,
    step: 1,
    placeholder: "Age",
    color: "success",
    size: "lg",
  }));
  assertStringIncludes(html, 'min="0"');
  assertStringIncludes(html, 'max="120"');
  assertStringIncludes(html, 'step="1"');
  assertStringIncludes(html, 'placeholder="Age"');
  assertStringIncludes(html, "input-success");
  assertStringIncludes(html, "input-lg");
});

Deno.test("NumberInput - price input", () => {
  const html = renderToString(NumberInput({
    value: 29.99,
    min: 0,
    step: 0.01,
    placeholder: "Price",
    color: "info",
    required: true,
  }));
  assertStringIncludes(html, 'value="29.99"');
  assertStringIncludes(html, 'min="0"');
  assertStringIncludes(html, 'step="0.01"');
  assertStringIncludes(html, 'placeholder="Price"');
  assertStringIncludes(html, "input-info");
  assertStringIncludes(html, "required");
});

Deno.test("NumberInput - quantity input", () => {
  const html = renderToString(NumberInput({
    value: 1,
    min: 1,
    max: 10,
    step: 1,
    size: "sm",
    color: "secondary",
  }));
  assertStringIncludes(html, 'value="1"');
  assertStringIncludes(html, 'min="1"');
  assertStringIncludes(html, 'max="10"');
  assertStringIncludes(html, 'step="1"');
  assertStringIncludes(html, "input-sm");
  assertStringIncludes(html, "input-secondary");
});

Deno.test("NumberInput - disabled with value", () => {
  const html = renderToString(NumberInput({
    value: 100,
    disabled: true,
  }));
  assertStringIncludes(html, 'value="100"');
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "input-disabled");
});

Deno.test("NumberInput - ghost style with accent color", () => {
  const html = renderToString(NumberInput({
    ghost: true,
    color: "accent",
    placeholder: "Ghost accent number",
  }));
  assertStringIncludes(html, "input-ghost");
  assertStringIncludes(html, "input-accent");
  assertStringIncludes(html, 'placeholder="Ghost accent number"');
});

Deno.test("NumberInput - error color", () => {
  const html = renderToString(NumberInput({
    color: "error",
    placeholder: "Error number input",
  }));
  assertStringIncludes(html, "input-error");
  assertStringIncludes(html, 'placeholder="Error number input"');
});

Deno.test("NumberInput - warning color", () => {
  const html = renderToString(NumberInput({
    color: "warning",
    placeholder: "Warning number input",
  }));
  assertStringIncludes(html, "input-warning");
  assertStringIncludes(html, 'placeholder="Warning number input"');
});

Deno.test("NumberInput - percentage input", () => {
  const html = renderToString(NumberInput({
    value: 75,
    min: 0,
    max: 100,
    step: 5,
    placeholder: "Percentage",
    color: "primary",
    required: true,
  }));
  assertStringIncludes(html, 'value="75"');
  assertStringIncludes(html, 'min="0"');
  assertStringIncludes(html, 'max="100"');
  assertStringIncludes(html, 'step="5"');
  assertStringIncludes(html, 'placeholder="Percentage"');
  assertStringIncludes(html, "input-primary");
  assertStringIncludes(html, "required");
});

Deno.test("NumberInput - negative numbers", () => {
  const html = renderToString(NumberInput({
    value: -10,
    min: -100,
    max: 100,
    step: 10,
  }));
  assertStringIncludes(html, 'value="-10"');
  assertStringIncludes(html, 'min="-100"');
  assertStringIncludes(html, 'max="100"');
  assertStringIncludes(html, 'step="10"');
});

Deno.test("NumberInput - decimal step", () => {
  const html = renderToString(NumberInput({
    value: 2.5,
    step: 0.5,
    placeholder: "Decimal value",
  }));
  assertStringIncludes(html, 'value="2.5"');
  assertStringIncludes(html, 'step="0.5"');
  assertStringIncludes(html, 'placeholder="Decimal value"');
});

Deno.test("NumberInput - zero value", () => {
  const html = renderToString(NumberInput({
    value: 0,
    min: 0,
  }));
  assertStringIncludes(html, 'value="0"');
  assertStringIncludes(html, 'min="0"');
});
