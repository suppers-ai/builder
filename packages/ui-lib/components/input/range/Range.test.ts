import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { Range } from "./Range.tsx";

// Mock DOMParser for testing
const parser = new DOMParser();

Deno.test("Range - basic rendering", () => {
  const html = renderToString(Range({}));
  assertStringIncludes(html, 'type="range"');
  assertStringIncludes(html, 'class="range range-md range-primary"');
});

Deno.test("Range - with custom class", () => {
  const html = renderToString(Range({
    class: "custom-range",
  }));
  assertStringIncludes(html, 'class="range range-md range-primary custom-range"');
});

Deno.test("Range - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Range({
      size: size as any,
    }));
    assertStringIncludes(html, `range-${size}`);
  });
});

Deno.test("Range - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "error", "info"];

  colors.forEach((color) => {
    const html = renderToString(Range({
      color: color as any,
    }));
    assertStringIncludes(html, `range-${color}`);
  });
});

Deno.test("Range - with min max values", () => {
  const html = renderToString(Range({
    min: 10,
    max: 90,
  }));
  assertStringIncludes(html, 'min="10"');
  assertStringIncludes(html, 'max="90"');
});

Deno.test("Range - with value", () => {
  const html = renderToString(Range({
    value: 75,
  }));
  assertStringIncludes(html, 'value="75"');
});

Deno.test("Range - with step", () => {
  const html = renderToString(Range({
    step: 5,
  }));
  assertStringIncludes(html, 'step="5"');
});

Deno.test("Range - disabled state", () => {
  const html = renderToString(Range({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
});

Deno.test("Range - with id", () => {
  const html = renderToString(Range({
    id: "test-range",
  }));
  assertStringIncludes(html, 'id="test-range"');
});

Deno.test("Range - all props combined", () => {
  const html = renderToString(Range({
    class: "custom-range",
    size: "lg",
    color: "accent",
    min: 0,
    max: 200,
    value: 150,
    step: 10,
    disabled: false,
    id: "full-range",
  }));

  assertStringIncludes(html, 'class="range range-lg range-accent custom-range"');
  assertStringIncludes(html, 'min="0"');
  assertStringIncludes(html, 'max="200"');
  assertStringIncludes(html, 'value="150"');
  assertStringIncludes(html, 'step="10"');
  assertStringIncludes(html, 'id="full-range"');
});

Deno.test("Range - default values", () => {
  const html = renderToString(Range({}));
  assertStringIncludes(html, 'min="0"');
  assertStringIncludes(html, 'max="100"');
  assertStringIncludes(html, 'value="50"');
  assertStringIncludes(html, 'step="1"');
});
