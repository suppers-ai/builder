import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { renderToString } from "preact-render-to-string";
import { ThemeController } from "./ThemeController.tsx";

Deno.test("ThemeController - basic rendering", () => {
  const html = renderToString(ThemeController({}));
  assertStringIncludes(html, "dropdown");
});

Deno.test("ThemeController - dropdown variant (default)", () => {
  const html = renderToString(ThemeController({
    variant: "dropdown",
  }));
  assertStringIncludes(html, "dropdown");
  assertStringIncludes(html, "☀️ Light");
});

Deno.test("ThemeController - toggle variant", () => {
  const html = renderToString(ThemeController({
    variant: "toggle",
  }));
  assertStringIncludes(html, "toggle");
  assertStringIncludes(html, "Dark mode");
});

Deno.test("ThemeController - toggle variant without label", () => {
  const html = renderToString(ThemeController({
    variant: "toggle",
    showLabel: false,
  }));
  assertStringIncludes(html, "toggle");
  assertEquals(html.includes("Dark mode"), false);
});

Deno.test("ThemeController - radio variant", () => {
  const html = renderToString(ThemeController({
    variant: "radio",
    themes: ["light", "dark", "cupcake"],
  }));
  assertStringIncludes(html, "radio");
  assertStringIncludes(html, "Choose Theme");
});

Deno.test("ThemeController - radio variant without label", () => {
  const html = renderToString(ThemeController({
    variant: "radio",
    showLabel: false,
    themes: ["light", "dark"],
  }));
  assertStringIncludes(html, "radio");
  assertEquals(html.includes("Choose Theme"), false);
});

Deno.test("ThemeController - with custom current theme", () => {
  const html = renderToString(ThemeController({
    currentTheme: "dark",
    variant: "dropdown",
  }));
  assertStringIncludes(html, "🌙 Dark");
});

Deno.test("ThemeController - with custom themes", () => {
  const html = renderToString(ThemeController({
    themes: ["light", "dark", "cupcake", "cyberpunk"],
    variant: "dropdown",
  }));
  // The HTML should include options for these themes when dropdown is opened
  assertStringIncludes(html, "dropdown");
});

Deno.test("ThemeController - different sizes", () => {
  const sizeTests = [
    { size: "xs" as const, expected: "btn-xs" },
    { size: "sm" as const, expected: "btn-sm" },
    { size: "md" as const, expected: "" }, // default has no size class
    { size: "lg" as const, expected: "btn-lg" },
    { size: "xl" as const, expected: "btn-xl" },
  ];

  sizeTests.forEach(({ size, expected }) => {
    const html = renderToString(ThemeController({
      size,
      variant: "dropdown",
    }));
    if (expected) {
      assertStringIncludes(html, expected);
    }
  });
});

Deno.test("ThemeController - with preview enabled", () => {
  const html = renderToString(ThemeController({
    showPreview: true,
    variant: "dropdown",
  }));
  // Preview should show color dots and descriptions in dropdown
  assertStringIncludes(html, "dropdown");
});

Deno.test("ThemeController - with custom class", () => {
  const html = renderToString(ThemeController({
    class: "custom-theme-controller",
  }));
  assertStringIncludes(html, "custom-theme-controller");
});

Deno.test("ThemeController - with id attribute", () => {
  const html = renderToString(ThemeController({
    id: "theme-controller-1",
  }));
  assertStringIncludes(html, 'id="theme-controller-1"');
});

Deno.test("ThemeController - HTML snapshot dropdown", async (t) => {
  const html = renderToString(ThemeController({
    currentTheme: "light",
    themes: ["light", "dark", "cupcake"],
    variant: "dropdown",
  }));
  await assertSnapshot(t, html);
});

Deno.test("ThemeController - HTML snapshot toggle", async (t) => {
  const html = renderToString(ThemeController({
    currentTheme: "dark",
    variant: "toggle",
    showLabels: true,
  }));
  await assertSnapshot(t, html);
});

Deno.test("ThemeController - HTML snapshot radio", async (t) => {
  const html = renderToString(ThemeController({
    currentTheme: "cupcake",
    themes: ["light", "dark", "cupcake", "cyberpunk"],
    variant: "radio",
    showLabels: true,
  }));
  await assertSnapshot(t, html);
});
