import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Button } from "./Button.tsx";

// DaisyUI 5 Specific Tests
Deno.test("Button - DaisyUI 5 loading spinner", () => {
  const html = renderToString(Button({
    children: "Loading Button",
    loading: true,
  }));

  // Should have both loading classes in the button element
  assertStringIncludes(html, 'class="btn loading loading-spinner"');
  
  // Should have loading spinner span element
  assertStringIncludes(html, '<span class="loading loading-spinner"></span>');
  
  // Should be disabled when loading
  assertStringIncludes(html, "disabled");
});

Deno.test("Button - DaisyUI 5 class combinations", () => {
  const html = renderToString(Button({
    children: "Complex Button",
    color: "primary",
    size: "lg",
    variant: "outline",
    loading: true,
    wide: true,
    glass: true,
  }));

  // Verify all DaisyUI 5 compatible classes are present
  assertStringIncludes(html, "btn");
  assertStringIncludes(html, "btn-primary");
  assertStringIncludes(html, "btn-lg");
  assertStringIncludes(html, "btn-outline");
  assertStringIncludes(html, "loading loading-spinner");
  assertStringIncludes(html, "btn-wide");
  assertStringIncludes(html, "glass");
});

Deno.test("Button - DaisyUI 5 shape variants", () => {
  // Test circle shape
  const circleHtml = renderToString(Button({
    children: "○",
    shape: "circle",
    color: "primary",
  }));
  assertStringIncludes(circleHtml, "btn-circle");

  // Test square shape
  const squareHtml = renderToString(Button({
    children: "□",
    shape: "square",
    color: "secondary",
  }));
  assertStringIncludes(squareHtml, "btn-square");
});

Deno.test("Button - DaisyUI 5 all color variants", () => {
  const colors = [
    "primary", "secondary", "accent", "neutral", 
    "base-100", "base-200", "base-300",
    "info", "success", "warning", "error"
  ] as const;

  colors.forEach((color) => {
    const html = renderToString(Button({
      children: `${color} button`,
      color: color,
    }));
    assertStringIncludes(html, `btn-${color}`);
  });
});

Deno.test("Button - DaisyUI 5 all size variants", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

  sizes.forEach((size) => {
    const html = renderToString(Button({
      children: `${size} button`,
      size: size,
    }));
    if (size !== "md") { // md is default, no class added
      assertStringIncludes(html, `btn-${size}`);
    }
  });
});