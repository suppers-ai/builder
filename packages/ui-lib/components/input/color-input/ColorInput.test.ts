import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { ColorInput } from "./ColorInput.tsx";

Deno.test("ColorInput - basic rendering", () => {
  const html = renderToString(ColorInput({}));
  assertStringIncludes(html, "input");
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-bordered");
  assertStringIncludes(html, 'type="color"');
  assertStringIncludes(html, 'value="#000000"');
  assertStringIncludes(html, "relative");
  assertStringIncludes(html, "pl-12"); // preview padding
});

Deno.test("ColorInput - with custom value", () => {
  const html = renderToString(ColorInput({
    value: "#ff0000",
  }));
  assertStringIncludes(html, 'value="#ff0000"');
  assertStringIncludes(html, 'style="background-color:#ff0000;"');
});

Deno.test("ColorInput - with placeholder", () => {
  const html = renderToString(ColorInput({
    placeholder: "Select color",
  }));
  // Note: HTML color inputs don't support placeholder attributes
  assertStringIncludes(html, 'type="color"');
});

Deno.test("ColorInput - disabled state", () => {
  const html = renderToString(ColorInput({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
  // Note: DaisyUI uses HTML disabled attribute, not input-disabled class
});

Deno.test("ColorInput - enabled state", () => {
  const html = renderToString(ColorInput({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
  assertEquals(html.includes("input-disabled"), false);
});

Deno.test("ColorInput - required state", () => {
  const html = renderToString(ColorInput({
    required: true,
  }));
  assertStringIncludes(html, "required");
});

Deno.test("ColorInput - not required state", () => {
  const html = renderToString(ColorInput({
    required: false,
  }));
  assertEquals(html.includes("required"), false);
});

Deno.test("ColorInput - without border", () => {
  const html = renderToString(ColorInput({
    bordered: false,
  }));
  assertEquals(html.includes("input-bordered"), false);
});

Deno.test("ColorInput - with border", () => {
  const html = renderToString(ColorInput({
    bordered: true,
  }));
  assertStringIncludes(html, "input-bordered");
});

Deno.test("ColorInput - ghost style", () => {
  const html = renderToString(ColorInput({
    ghost: true,
  }));
  assertStringIncludes(html, "input-ghost");
});

Deno.test("ColorInput - without ghost style", () => {
  const html = renderToString(ColorInput({
    ghost: false,
  }));
  assertEquals(html.includes("input-ghost"), false);
});

Deno.test("ColorInput - without preview", () => {
  const html = renderToString(ColorInput({
    showPreview: false,
  }));
  assertEquals(html.includes("pl-12"), false);
  assertEquals(html.includes("absolute left-2"), false);
});

Deno.test("ColorInput - with preview", () => {
  const html = renderToString(ColorInput({
    showPreview: true,
    value: "#00ff00",
  }));
  assertStringIncludes(html, "pl-12");
  assertStringIncludes(html, "absolute left-2");
  assertStringIncludes(html, "w-6 h-6 rounded");
  assertStringIncludes(html, 'style="background-color:#00ff00;"');
});

Deno.test("ColorInput - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"];

  sizes.forEach((size) => {
    const html = renderToString(ColorInput({
      size: size as "xs" | "sm" | "md" | "lg" | "xl",
    }));
    assertStringIncludes(html, `input-${size}`);
  });
});

Deno.test("ColorInput - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(ColorInput({
      color: color as
        | "primary"
        | "secondary"
        | "accent"
        | "neutral"
        | "info"
        | "success"
        | "warning"
        | "error",
    }));
    assertStringIncludes(html, `input-${color}`);
  });
});

Deno.test("ColorInput - custom class", () => {
  const html = renderToString(ColorInput({
    class: "custom-color-input",
  }));
  assertStringIncludes(html, "custom-color-input");
});

Deno.test("ColorInput - with id", () => {
  const html = renderToString(ColorInput({
    id: "test-color-input",
  }));
  assertStringIncludes(html, 'id="test-color-input"');
});

Deno.test("ColorInput - all props combined", () => {
  const html = renderToString(ColorInput({
    value: "#ff6b35",
    placeholder: "Pick a color",
    size: "lg",
    color: "primary",
    disabled: false,
    bordered: true,
    ghost: false,
    required: true,
    showPreview: true,
    class: "test-class",
    id: "full-color-input",
  }));
  assertStringIncludes(html, 'value="#ff6b35"');
  // Note: HTML color inputs don't support placeholder attributes
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-primary");
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "input-bordered");
  assertEquals(html.includes("input-ghost"), false);
  assertStringIncludes(html, "required");
  assertStringIncludes(html, "pl-12");
  assertStringIncludes(html, 'style="background-color:#ff6b35;"');
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-color-input"');
});

Deno.test("ColorInput - theme color picker", () => {
  const html = renderToString(ColorInput({
    value: "#3b82f6",
    placeholder: "Theme color",
    color: "success",
    size: "lg",
  }));
  assertStringIncludes(html, 'value="#3b82f6"');
  // Note: HTML color inputs don't support placeholder attributes
  assertStringIncludes(html, "input-success");
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, 'style="background-color:#3b82f6;"');
});

Deno.test("ColorInput - brand color", () => {
  const html = renderToString(ColorInput({
    value: "#f59e0b",
    size: "md",
    color: "info",
    required: true,
  }));
  assertStringIncludes(html, 'value="#f59e0b"');
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-info");
  assertStringIncludes(html, "required");
  assertStringIncludes(html, 'style="background-color:#f59e0b;"');
});

Deno.test("ColorInput - disabled with value", () => {
  const html = renderToString(ColorInput({
    value: "#9ca3af",
    disabled: true,
  }));
  assertStringIncludes(html, 'value="#9ca3af"');
  assertStringIncludes(html, "disabled");
  // Note: DaisyUI uses HTML disabled attribute, not input-disabled class
  assertStringIncludes(html, 'style="background-color:#9ca3af;"');
});

Deno.test("ColorInput - ghost style with accent color", () => {
  const html = renderToString(ColorInput({
    ghost: true,
    color: "accent",
    value: "#8b5cf6",
  }));
  assertStringIncludes(html, "input-ghost");
  assertStringIncludes(html, "input-accent");
  assertStringIncludes(html, 'style="background-color:#8b5cf6;"');
});

Deno.test("ColorInput - error color", () => {
  const html = renderToString(ColorInput({
    color: "error",
    value: "#ef4444",
  }));
  assertStringIncludes(html, "input-error");
  assertStringIncludes(html, 'style="background-color:#ef4444;"');
});

Deno.test("ColorInput - warning color", () => {
  const html = renderToString(ColorInput({
    color: "warning",
    value: "#f59e0b",
  }));
  assertStringIncludes(html, "input-warning");
  assertStringIncludes(html, 'style="background-color:#f59e0b;"');
});

Deno.test("ColorInput - white color", () => {
  const html = renderToString(ColorInput({
    value: "#ffffff",
    placeholder: "White color",
  }));
  assertStringIncludes(html, 'value="#ffffff"');
  assertStringIncludes(html, 'style="background-color:#ffffff;"');
  // Note: HTML color inputs don't support placeholder attributes
});

Deno.test("ColorInput - black color", () => {
  const html = renderToString(ColorInput({
    value: "#000000",
    placeholder: "Black color",
  }));
  assertStringIncludes(html, 'value="#000000"');
  assertStringIncludes(html, 'style="background-color:#000000;"');
  // Note: HTML color inputs don't support placeholder attributes
});

Deno.test("ColorInput - RGB color", () => {
  const html = renderToString(ColorInput({
    value: "#rgb(255, 0, 128)",
    color: "primary",
  }));
  assertStringIncludes(html, 'value="#rgb(255, 0, 128)"');
  assertStringIncludes(html, 'style="background-color:#rgb(255, 0, 128);"');
});

Deno.test("ColorInput - preview border", () => {
  const html = renderToString(ColorInput({
    showPreview: true,
    value: "#22c55e",
  }));
  assertStringIncludes(html, "border border-base-300");
  assertStringIncludes(html, "rounded");
});
