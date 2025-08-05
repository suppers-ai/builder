import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { Logo } from "./Logo.tsx";
import { globalTheme } from "../../../utils/signals.ts";

Deno.test("Logo - renders with default props", () => {
  globalTheme.value = "light";
  const html = renderToString(h(Logo, {}));
  
  assertStringIncludes(html, 'alt="Suppers Logo"');
  assertStringIncludes(html, "w-auto object-contain h-8");
  assertStringIncludes(html, "long_light.png");
});

Deno.test("Logo - renders with dark theme", () => {
  globalTheme.value = "dark";
  const html = renderToString(h(Logo, {}));
  
  assertStringIncludes(html, "long_dark.png");
});

Deno.test("Logo - renders with synthwave theme (dark variant)", () => {
  globalTheme.value = "synthwave";
  const html = renderToString(h(Logo, {}));
  
  assertStringIncludes(html, "long_dark.png");
});

Deno.test("Logo - renders short variant", () => {
  globalTheme.value = "light";
  const html = renderToString(h(Logo, { variant: "short" }));
  
  assertStringIncludes(html, "short_light.png");
});

Deno.test("Logo - renders with custom size", () => {
  const html = renderToString(h(Logo, { size: "lg" }));
  
  assertStringIncludes(html, "h-12");
});

Deno.test("Logo - renders with href as link", () => {
  const html = renderToString(h(Logo, { href: "/" }));
  
  assertStringIncludes(html, 'href="/"');
  assertStringIncludes(html, "inline-block hover:opacity-80 transition-opacity");
});

Deno.test("Logo - renders with custom props", () => {
  const html = renderToString(h(Logo, {
    alt: "Custom Logo",
    class: "custom-class",
    id: "logo-id",
    size: "xl"
  }));
  
  assertStringIncludes(html, 'alt="Custom Logo"');
  assertStringIncludes(html, 'id="logo-id"');
  assertStringIncludes(html, "custom-class");
  assertStringIncludes(html, "h-16");
});