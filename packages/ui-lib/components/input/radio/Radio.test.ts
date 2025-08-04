import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Radio } from "./Radio.tsx";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Radio - basic rendering without label", () => {
  const html = renderToString(Radio({}));
  assertStringIncludes(html, 'type="radio"');
  assertStringIncludes(html, 'class="radio radio-md radio-primary"');
});

Deno.test("Radio - with label", () => {
  const html = renderToString(Radio({
    label: "Test Option",
  }));

  assertStringIncludes(html, '<div class="form-control">');
  assertStringIncludes(html, '<label class="label cursor-pointer justify-start gap-3">');
  assertStringIncludes(html, '<span class="label-text">Test Option</span>');
});

Deno.test("Radio - without label (bare input)", () => {
  const html = renderToString(Radio({}));

  const document = parser.parseFromString(html, "text/html");
  const formControl = document?.querySelector(".form-control");
  assertEquals(formControl, null);

  assertStringIncludes(html, 'type="radio"');
});

Deno.test("Radio - with custom class", () => {
  const html = renderToString(Radio({
    class: "custom-radio",
  }));
  assertStringIncludes(html, 'class="radio radio-md radio-primary custom-radio"');
});

Deno.test("Radio - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Radio({
      size: size as "xs" | "sm" | "md" | "lg" | "xl",
    }));
    assertStringIncludes(html, `radio-${size}`);
  });
});

Deno.test("Radio - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "error", "info"];

  colors.forEach((color) => {
    const html = renderToString(Radio({
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
    assertStringIncludes(html, `radio-${color}`);
  });
});

Deno.test("Radio - with name attribute", () => {
  const html = renderToString(Radio({
    name: "radio-group",
  }));
  assertStringIncludes(html, 'name="radio-group"');
});

Deno.test("Radio - with value", () => {
  const html = renderToString(Radio({
    value: "option1",
  }));
  assertStringIncludes(html, 'value="option1"');
});

Deno.test("Radio - checked state", () => {
  const html = renderToString(Radio({
    checked: true,
  }));
  assertStringIncludes(html, "checked");
});

Deno.test("Radio - unchecked state", () => {
  const html = renderToString(Radio({
    checked: false,
  }));
  const document = parser.parseFromString(html, "text/html");
  const input = document?.querySelector('input[type="radio"]');
  assertEquals(input?.hasAttribute("checked"), false);
});

Deno.test("Radio - disabled state", () => {
  const html = renderToString(Radio({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
});

Deno.test("Radio - with id", () => {
  const html = renderToString(Radio({
    id: "test-radio",
  }));
  assertStringIncludes(html, 'id="test-radio"');
});

Deno.test("Radio - radio group example", () => {
  const radio1 = renderToString(Radio({
    name: "color",
    value: "red",
    label: "Red",
    checked: true,
  }));

  const radio2 = renderToString(Radio({
    name: "color",
    value: "blue",
    label: "Blue",
    checked: false,
  }));

  assertStringIncludes(radio1, 'name="color"');
  assertStringIncludes(radio1, 'value="red"');
  assertStringIncludes(radio1, "checked");
  assertStringIncludes(radio1, '<span class="label-text">Red</span>');

  assertStringIncludes(radio2, 'name="color"');
  assertStringIncludes(radio2, 'value="blue"');
  assertStringIncludes(radio2, '<span class="label-text">Blue</span>');
});

Deno.test("Radio - all props combined", () => {
  const html = renderToString(Radio({
    class: "custom-radio",
    size: "lg",
    color: "success",
    name: "test-group",
    value: "option-a",
    checked: true,
    disabled: false,
    label: "Option A",
    id: "full-radio",
  }));

  assertStringIncludes(html, 'class="radio radio-lg radio-success custom-radio"');
  assertStringIncludes(html, 'name="test-group"');
  assertStringIncludes(html, 'value="option-a"');
  assertStringIncludes(html, "checked");
  assertStringIncludes(html, 'id="full-radio"');
  assertStringIncludes(html, '<span class="label-text">Option A</span>');
});

Deno.test("Radio - form structure with label", () => {
  const html = renderToString(Radio({
    label: "Test radio",
    name: "test",
  }));

  assertStringIncludes(html, '<div class="form-control">');
  assertStringIncludes(html, '<label class="label cursor-pointer justify-start gap-3">');
  assertStringIncludes(html, 'type="radio"');
  assertStringIncludes(html, '<span class="label-text">Test radio</span>');
});

Deno.test("Radio - default values", () => {
  const html = renderToString(Radio({}));
  assertStringIncludes(html, "radio-md");
  assertStringIncludes(html, "radio-primary");
  const document = parser.parseFromString(html, "text/html");
  const input = document?.querySelector('input[type="radio"]');
  assertEquals(input?.hasAttribute("checked"), false);
  assertEquals(input?.hasAttribute("disabled"), false);
});
