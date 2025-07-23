import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Toggle } from "./Toggle.tsx";
import { h } from "preact";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Toggle - basic rendering", () => {
  const html = renderToString(Toggle({}));
  assertStringIncludes(html, '<div class="form-control">');
  assertStringIncludes(html, '<label class="label cursor-pointer justify-start gap-3">');
  assertStringIncludes(html, 'type="checkbox"');
  assertStringIncludes(html, 'class="toggle toggle-md toggle-primary"');
});

Deno.test("Toggle - with custom class", () => {
  const html = renderToString(Toggle({
    class: "custom-toggle",
  }));
  assertStringIncludes(html, 'class="toggle toggle-md toggle-primary custom-toggle"');
});

Deno.test("Toggle - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Toggle({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    }));
    assertStringIncludes(html, `toggle-${size}`);
  });
});

Deno.test("Toggle - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "error", "info"];

  colors.forEach((color) => {
    const html = renderToString(Toggle({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
    }));
    assertStringIncludes(html, `toggle-${color}`);
  });
});

Deno.test("Toggle - checked state", () => {
  const html = renderToString(Toggle({
    checked: true,
  }));
  assertStringIncludes(html, "checked");
});

Deno.test("Toggle - unchecked state", () => {
  const html = renderToString(Toggle({
    checked: false,
  }));
  const document = parser.parseFromString(html, "text/html");
  const input = document?.querySelector('input[type="checkbox"]');
  assertEquals(input?.hasAttribute("checked"), false);
});

Deno.test("Toggle - disabled state", () => {
  const html = renderToString(Toggle({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
});

Deno.test("Toggle - with label text", () => {
  const html = renderToString(Toggle({
    children: "Enable notifications",
  }));
  assertStringIncludes(html, '<span class="label-text">Enable notifications</span>');
});

Deno.test("Toggle - with JSX label", () => {
  const html = renderToString(Toggle({
    children: h("strong", {}, "Important setting"),
  }));
  assertStringIncludes(html, '<span class="label-text"><strong>Important setting</strong></span>');
});

Deno.test("Toggle - without label", () => {
  const html = renderToString(Toggle({}));
  const document = parser.parseFromString(html, "text/html");
  const labelText = document?.querySelector(".label-text");
  assertEquals(labelText, null);
});

Deno.test("Toggle - with id", () => {
  const html = renderToString(Toggle({
    id: "test-toggle",
  }));
  assertStringIncludes(html, 'id="test-toggle"');
});

Deno.test("Toggle - all props combined", () => {
  const html = renderToString(Toggle({
    class: "custom-toggle",
    size: "lg",
    color: "success",
    checked: true,
    disabled: false,
    id: "full-toggle",
    children: "Complete toggle example",
  }));

  assertStringIncludes(html, 'class="toggle toggle-lg toggle-success custom-toggle"');
  assertStringIncludes(html, "checked");
  assertStringIncludes(html, 'id="full-toggle"');
  assertStringIncludes(html, '<span class="label-text">Complete toggle example</span>');
});

Deno.test("Toggle - form control structure", () => {
  const html = renderToString(Toggle({
    children: "Test toggle",
  }));

  assertStringIncludes(html, '<div class="form-control">');
  assertStringIncludes(html, '<label class="label cursor-pointer justify-start gap-3">');
  assertStringIncludes(html, 'type="checkbox"');
  assertStringIncludes(html, '<span class="label-text">Test toggle</span>');
});

Deno.test("Toggle - default values", () => {
  const html = renderToString(Toggle({}));
  assertStringIncludes(html, "toggle-md");
  assertStringIncludes(html, "toggle-primary");
  const document = parser.parseFromString(html, "text/html");
  const input = document?.querySelector('input[type="checkbox"]');
  assertEquals(input?.hasAttribute("checked"), false);
  assertEquals(input?.hasAttribute("disabled"), false);
});
