import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { HeroSection } from "./HeroSection.tsx";

Deno.test("HeroSection - basic rendering", () => {
  const html = renderToString(HeroSection({}));
  assertStringIncludes(html, "Professional");
  assertStringIncludes(html, "DaisyUI Components");
  assertStringIncludes(html, "section");
});

Deno.test("HeroSection - contains main heading", () => {
  const html = renderToString(HeroSection({}));

  // Check for main heading content
  assertStringIncludes(html, "Professional");
  assertStringIncludes(html, "DaisyUI Components");
  assertStringIncludes(html, "for Fresh");
});

Deno.test("HeroSection - contains subtitle description", () => {
  const html = renderToString(HeroSection({}));

  // Check for subtitle content
  assertStringIncludes(html, "The most comprehensive DaisyUI component library");
  assertStringIncludes(html, "Fresh 2.0");
  assertStringIncludes(html, "65+ production-ready components");
  assertStringIncludes(html, "TypeScript support");
});

Deno.test("HeroSection - contains stats section", () => {
  const html = renderToString(HeroSection({}));

  // Check for statistics
  assertStringIncludes(html, "65+");
  assertStringIncludes(html, "Components");
  assertStringIncludes(html, "100%");
  assertStringIncludes(html, "DaisyUI Coverage");
  assertStringIncludes(html, "29");
  assertStringIncludes(html, "Themes");
  assertStringIncludes(html, "TypeScript");
  assertStringIncludes(html, "Full Support");
});

Deno.test("HeroSection - contains CTA buttons", () => {
  const html = renderToString(HeroSection({}));

  // Check for call-to-action buttons
  assertStringIncludes(html, "Browse Components");
  assertStringIncludes(html, "Get Started");
  assertStringIncludes(html, "View on GitHub");
});

Deno.test("HeroSection - contains Fresh 2.0 badge", () => {
  const html = renderToString(HeroSection({}));

  // Check for Fresh 2.0 support badge
  assertStringIncludes(html, "New: Fresh 2.0 Support");
  assertStringIncludes(html, "animate-pulse");
});

Deno.test("HeroSection - contains social proof", () => {
  const html = renderToString(HeroSection({}));

  // Check for social proof elements
  assertStringIncludes(html, "Trusted by developers");
  assertStringIncludes(html, "Production ready");
  assertStringIncludes(html, "Lightning fast");
  assertStringIncludes(html, "Fully themeable");
});

Deno.test("HeroSection - has proper link structure", () => {
  const html = renderToString(HeroSection({}));

  // Check for proper link elements
  assertStringIncludes(html, 'href="/components"');
  assertStringIncludes(html, 'href="/docs/getting-started"');
  assertStringIncludes(html, 'href="https://github.com"');
});

Deno.test("HeroSection - includes background decorations", () => {
  const html = renderToString(HeroSection({}));

  // Check for background elements
  assertStringIncludes(html, "bg-gradient-to-br");
  assertStringIncludes(html, "bg-grid-pattern");
  assertStringIncludes(html, "blur-3xl");
});

Deno.test("HeroSection - includes SVG wave", () => {
  const html = renderToString(HeroSection({}));

  // Check for SVG wave element
  assertStringIncludes(html, "<svg");
  assertStringIncludes(html, 'viewBox="0 0 1440 120"');
});

Deno.test("HeroSection - has responsive design classes", () => {
  const html = renderToString(HeroSection({}));

  // Check for responsive classes
  assertStringIncludes(html, "lg:");
  assertStringIncludes(html, "xl:");
  assertStringIncludes(html, "sm:");
});

Deno.test("HeroSection - HTML snapshot", async (t) => {
  const html = renderToString(HeroSection({}));
  await assertSnapshot(t, html);
});
