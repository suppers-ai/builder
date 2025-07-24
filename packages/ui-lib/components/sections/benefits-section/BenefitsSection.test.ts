import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { BenefitsSection } from "./BenefitsSection.tsx";

Deno.test("BenefitsSection - basic rendering", () => {
  const html = renderToString(BenefitsSection({}));
  assertStringIncludes(html, "Why Choose Our Component Library?");
  assertStringIncludes(html, "section");
});

Deno.test("BenefitsSection - contains main benefits", () => {
  const html = renderToString(BenefitsSection({}));

  // Check for main benefit titles
  assertStringIncludes(html, "100% DaisyUI Coverage");
  assertStringIncludes(html, "Fresh 2.0 Native");
  assertStringIncludes(html, "TypeScript First");
  assertStringIncludes(html, "Production Ready");
});

Deno.test("BenefitsSection - contains feature descriptions", () => {
  const html = renderToString(BenefitsSection({}));

  // Check for specific feature descriptions
  assertStringIncludes(html, "All 65+ components included");
  assertStringIncludes(html, "Server-side rendering");
  assertStringIncludes(html, "100% TypeScript coverage");
  assertStringIncludes(html, "Extensive test coverage");
});

Deno.test("BenefitsSection - contains additional features", () => {
  const html = renderToString(BenefitsSection({}));

  // Check for additional features section
  assertStringIncludes(html, "Everything You Need");
  assertStringIncludes(html, "Component Islands");
  assertStringIncludes(html, "30+ Themes");
  assertStringIncludes(html, "Mobile First");
  assertStringIncludes(html, "Accessibility");
});

Deno.test("BenefitsSection - contains CTA buttons", () => {
  const html = renderToString(BenefitsSection({}));

  // Check for call-to-action elements
  assertStringIncludes(html, "Ready to Get Started?");
  assertStringIncludes(html, "Explore Components");
  assertStringIncludes(html, "Installation Guide");
});

Deno.test("BenefitsSection - has proper semantic structure", () => {
  const html = renderToString(BenefitsSection({}));

  // Check for semantic HTML structure
  assertStringIncludes(html, "<section");
  assertStringIncludes(html, "card");
  assertStringIncludes(html, "card-body");
  assertStringIncludes(html, "btn");
});

Deno.test("BenefitsSection - includes icon components", () => {
  const html = renderToString(BenefitsSection({}));

  // Check that Lucide icons are rendered (they should create SVG elements)
  assertStringIncludes(html, "<svg");
});

Deno.test("BenefitsSection - has responsive design classes", () => {
  const html = renderToString(BenefitsSection({}));

  // Check for responsive grid and layout classes
  assertStringIncludes(html, "grid");
  assertStringIncludes(html, "lg:");
  assertStringIncludes(html, "max-w-");
});

Deno.test("BenefitsSection - HTML snapshot", async (t) => {
  const html = renderToString(BenefitsSection({}));
  await assertSnapshot(t, html);
});
