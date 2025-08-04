import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Button } from "./Button.tsx";

// Unit Tests
Deno.test("Button - default props", () => {
  const html = renderToString(Button({ children: "Test Button" }));

  assertStringIncludes(html, 'class="btn"');
  assertStringIncludes(html, "Test Button");
});

Deno.test("Button - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "error", "info"];

  colors.forEach((color) => {
    const html = renderToString(Button({
      children: "Test",
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
    }));
    assertStringIncludes(html, `btn-${color}`);
  });
});

Deno.test("Button - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Button({
      children: "Test",
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    }));
    assertStringIncludes(html, `btn-${size}`);
  });
});

Deno.test("Button - variant styles", () => {
  const variants = ["outline", "ghost", "link"] as const;

  variants.forEach((variant) => {
    const html = renderToString(Button({
      children: "Test",
      variant: variant,
    }));
    assertStringIncludes(html, `btn-${variant}`);
  });
});

Deno.test("Button - disabled state", () => {
  const html = renderToString(Button({
    children: "Test",
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
});

Deno.test("Button - loading state", () => {
  const html = renderToString(Button({
    children: "Test",
    loading: true,
  }));
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "loading");
  assertStringIncludes(html, "loading-spinner");
});

Deno.test("Button - custom classes", () => {
  const html = renderToString(Button({
    children: "Test",
    class: "custom-class",
  }));
  assertStringIncludes(html, "custom-class");
});

Deno.test("Button - with icon", () => {
  const html = renderToString(Button({
    children: ["🔥", "Fire Button"] as any,
  }));
  assertStringIncludes(html, "🔥");
  assertStringIncludes(html, "Fire Button");
});

// Edge Cases
Deno.test("Button - empty children", () => {
  const html = renderToString(Button({ children: "" }));
  assertStringIncludes(html, 'class="btn"');
});

Deno.test("Button - complex children", () => {
  const html = renderToString(Button({
    children: [
      "Icon ",
      "Text",
      " More",
    ] as any,
  }));
  assertStringIncludes(html, "Icon ");
  assertStringIncludes(html, "Text");
  assertStringIncludes(html, " More");
});

Deno.test("Button - all props combined", () => {
  const html = renderToString(Button({
    children: "Complex Button",
    color: "primary",
    size: "lg",
    variant: "outline",
    disabled: false,
    loading: false,
    class: "my-custom-class",
    id: "test-button",
  }));

  assertStringIncludes(html, "btn");
  assertStringIncludes(html, "btn-primary");
  assertStringIncludes(html, "btn-lg");
  assertStringIncludes(html, "btn-outline");
  assertStringIncludes(html, "my-custom-class");
  assertStringIncludes(html, 'id="test-button"');
  assertStringIncludes(html, "Complex Button");
});
