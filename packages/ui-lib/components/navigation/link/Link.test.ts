import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Link } from "./Link.tsx";

Deno.test("Link - basic rendering", () => {
  const html = renderToString(Link({
    children: "Test Link",
    href: "/test",
  }));
  assertStringIncludes(html, "link");
  assertStringIncludes(html, "no-underline");
  assertStringIncludes(html, "transition-colors duration-200");
  assertStringIncludes(html, "cursor-pointer");
  assertStringIncludes(html, 'href="/test"');
  assertStringIncludes(html, "Test Link");
});

Deno.test("Link - variant styles", () => {
  const variants = ["default", "hover", "focus", "neutral"];

  variants.forEach((variant) => {
    const html = renderToString(Link({
      variant: variant as string,
      children: `${variant} link`,
      href: "/test",
    }));

    if (variant === "default") {
      assertEquals(html.includes("link-default"), false);
    } else {
      assertStringIncludes(html, `link-${variant}`);
    }
    assertStringIncludes(html, `${variant} link`);
  });
});

Deno.test("Link - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(Link({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
      children: `${color} link`,
      href: "/test",
    }));
    assertStringIncludes(html, `link-${color}`);
    assertStringIncludes(html, `${color} link`);
  });
});

Deno.test("Link - underline enabled", () => {
  const html = renderToString(Link({
    underline: true,
    children: "Underlined link",
    href: "/test",
  }));
  assertStringIncludes(html, "underline");
  assertEquals(html.includes("no-underline"), false);
  assertStringIncludes(html, "Underlined link");
});

Deno.test("Link - underline disabled", () => {
  const html = renderToString(Link({
    underline: false,
    children: "No underline link",
    href: "/test",
  }));
  assertStringIncludes(html, "no-underline");
  assertEquals(html.includes("link-underline"), false); // Check for specific underline class, not the word 'underline'
  assertStringIncludes(html, "No underline link");
});

Deno.test("Link - external link", () => {
  const html = renderToString(Link({
    external: true,
    children: "External link",
    href: "https://example.com",
  }));
  assertStringIncludes(html, 'target="_blank"');
  assertStringIncludes(html, 'rel="noopener noreferrer"');
  assertStringIncludes(html, "↗");
  assertStringIncludes(html, "External link");
});

Deno.test("Link - internal link", () => {
  const html = renderToString(Link({
    external: false,
    children: "Internal link",
    href: "/internal",
  }));
  assertEquals(html.includes('target="_blank"'), false);
  assertEquals(html.includes('rel="noopener noreferrer"'), false);
  assertEquals(html.includes("↗"), false);
  assertStringIncludes(html, "Internal link");
});

Deno.test("Link - disabled state", () => {
  const html = renderToString(Link({
    disabled: true,
    children: "Disabled link",
    href: "/test",
  }));
  assertStringIncludes(html, "link-disabled");
  assertStringIncludes(html, "cursor-not-allowed opacity-50");
  assertStringIncludes(html, 'aria-disabled="true"');
  assertEquals(html.includes('href="/test"'), false);
  assertStringIncludes(html, "Disabled link");
});

Deno.test("Link - enabled state", () => {
  const html = renderToString(Link({
    disabled: false,
    children: "Enabled link",
    href: "/test",
  }));
  assertEquals(html.includes("link-disabled"), false);
  assertEquals(html.includes("cursor-not-allowed"), false);
  assertEquals(html.includes("opacity-50"), false);
  assertStringIncludes(html, "cursor-pointer");
  assertStringIncludes(html, 'href="/test"');
  assertStringIncludes(html, "Enabled link");
});

Deno.test("Link - disabled external link", () => {
  const html = renderToString(Link({
    disabled: true,
    external: true,
    children: "Disabled external",
    href: "https://example.com",
  }));
  assertEquals(html.includes("↗"), false);
  assertStringIncludes(html, "link-disabled");
  assertStringIncludes(html, "Disabled external");
});

Deno.test("Link - custom className", () => {
  const html = renderToString(Link({
    className: "custom-link",
    children: "Custom link",
    href: "/test",
  }));
  assertStringIncludes(html, "custom-link");
  assertStringIncludes(html, "Custom link");
});

Deno.test("Link - without href", () => {
  const html = renderToString(Link({
    children: "No href link",
  }));
  assertStringIncludes(html, "link");
  assertEquals(html.includes("href="), false);
  assertStringIncludes(html, "No href link");
});

Deno.test("Link - all props combined", () => {
  const html = renderToString(Link({
    href: "https://example.com",
    variant: "hover",
    color: "primary",
    underline: true,
    external: true,
    disabled: false,
    className: "test-class",
    children: "Combined props",
  }));
  assertStringIncludes(html, 'href="https://example.com"');
  assertStringIncludes(html, "link-hover");
  assertStringIncludes(html, "link-primary");
  assertStringIncludes(html, "underline");
  assertStringIncludes(html, 'target="_blank"');
  assertStringIncludes(html, 'rel="noopener noreferrer"');
  assertStringIncludes(html, "↗");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, "Combined props");
});

Deno.test("Link - hover variant", () => {
  const html = renderToString(Link({
    variant: "hover",
    children: "Hover link",
    href: "/test",
  }));
  assertStringIncludes(html, "link-hover");
  assertStringIncludes(html, "Hover link");
});

Deno.test("Link - focus variant", () => {
  const html = renderToString(Link({
    variant: "focus",
    children: "Focus link",
    href: "/test",
  }));
  assertStringIncludes(html, "link-focus");
  assertStringIncludes(html, "Focus link");
});

Deno.test("Link - neutral variant", () => {
  const html = renderToString(Link({
    variant: "neutral",
    children: "Neutral link",
    href: "/test",
  }));
  assertStringIncludes(html, "link-neutral");
  assertStringIncludes(html, "Neutral link");
});

Deno.test("Link - primary color", () => {
  const html = renderToString(Link({
    color: "primary",
    children: "Primary link",
    href: "/test",
  }));
  assertStringIncludes(html, "link-primary");
  assertStringIncludes(html, "Primary link");
});

Deno.test("Link - success color with underline", () => {
  const html = renderToString(Link({
    color: "success",
    underline: true,
    children: "Success link",
    href: "/test",
  }));
  assertStringIncludes(html, "link-success");
  assertStringIncludes(html, "underline");
  assertStringIncludes(html, "Success link");
});

Deno.test("Link - with id", () => {
  const html = renderToString(Link({
    id: "test-link",
    children: "ID link",
    href: "/test",
  }));
  assertStringIncludes(html, 'id="test-link"');
  assertStringIncludes(html, "ID link");
});

Deno.test("Link - complex children", () => {
  const html = renderToString(Link({
    children: ["Link", "Text"],
    href: "/test",
  }));
  assertStringIncludes(html, "link");
  assertStringIncludes(html, "Link");
  assertStringIncludes(html, "Text");
});

Deno.test("Link - default values", () => {
  const html = renderToString(Link({
    children: "Default link",
    href: "/test",
  }));
  // Check defaults: default variant, no color, no underline, not external, not disabled
  assertEquals(html.includes("link-default"), false);
  assertEquals(html.includes("link-primary"), false);
  assertStringIncludes(html, "no-underline");
  assertEquals(html.includes('target="_blank"'), false);
  assertEquals(html.includes("link-disabled"), false);
  assertStringIncludes(html, "cursor-pointer");
  assertStringIncludes(html, "Default link");
});

Deno.test("Link - external icon styling", () => {
  const html = renderToString(Link({
    external: true,
    children: "External with icon",
    href: "https://example.com",
  }));
  assertStringIncludes(html, "inline-block ml-1 text-xs opacity-70");
  assertStringIncludes(html, "↗");
  assertStringIncludes(html, "External with icon");
});

Deno.test("Link - aria-disabled attribute", () => {
  const disabledHtml = renderToString(Link({
    disabled: true,
    children: "Disabled",
    href: "/test",
  }));
  assertStringIncludes(disabledHtml, 'aria-disabled="true"');

  const enabledHtml = renderToString(Link({
    disabled: false,
    children: "Enabled",
    href: "/test",
  }));
  assertEquals(enabledHtml.includes('aria-disabled="true"'), false);
});
