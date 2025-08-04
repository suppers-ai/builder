import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Artboard } from "./Artboard.tsx";

Deno.test("Artboard - basic rendering", () => {
  const html = renderToString(Artboard({
    children: "Test content",
  }));
  assertStringIncludes(html, "artboard");
  assertStringIncludes(html, "artboard-1");
  assertStringIncludes(html, "Test content");
});

Deno.test("Artboard - size variants", () => {
  const sizes = ["1", "2", "3", "4", "5", "6"];

  sizes.forEach((size) => {
    const html = renderToString(Artboard({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
      children: `Size ${size}`,
    }));
    assertStringIncludes(html, `artboard-${size}`);
    assertStringIncludes(html, `Size ${size}`);
  });
});

Deno.test("Artboard - phone mode", () => {
  const html = renderToString(Artboard({
    phone: true,
    size: "1",
    children: "Phone content",
  }));
  assertStringIncludes(html, "phone-1");
  assertEquals(html.includes("artboard-1"), false);
  assertStringIncludes(html, "Phone content");
});

Deno.test("Artboard - phone mode with different sizes", () => {
  const sizes = ["1", "2", "3", "4", "5", "6"];

  sizes.forEach((size) => {
    const html = renderToString(Artboard({
      phone: true,
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
      children: `Phone ${size}`,
    }));
    assertStringIncludes(html, `phone-${size}`);
    assertEquals(html.includes(`artboard-${size}`), false);
    assertStringIncludes(html, `Phone ${size}`);
  });
});

Deno.test("Artboard - horizontal orientation", () => {
  const html = renderToString(Artboard({
    horizontal: true,
    children: "Horizontal content",
  }));
  assertStringIncludes(html, "artboard-horizontal");
  assertStringIncludes(html, "Horizontal content");
});

Deno.test("Artboard - demo style", () => {
  const html = renderToString(Artboard({
    demo: true,
    children: "Demo content",
  }));
  assertStringIncludes(html, "artboard-demo");
  assertStringIncludes(html, "Demo content");
});

Deno.test("Artboard - custom className", () => {
  const html = renderToString(Artboard({
    className: "custom-artboard",
    children: "Custom content",
  }));
  assertStringIncludes(html, "custom-artboard");
  assertStringIncludes(html, "Custom content");
});

Deno.test("Artboard - all props combined", () => {
  const html = renderToString(Artboard({
    size: "3",
    horizontal: true,
    demo: true,
    className: "test-class",
    children: "Combined props",
  }));
  assertStringIncludes(html, "artboard-3");
  assertStringIncludes(html, "artboard-horizontal");
  assertStringIncludes(html, "artboard-demo");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, "Combined props");
});

Deno.test("Artboard - phone with horizontal", () => {
  const html = renderToString(Artboard({
    phone: true,
    horizontal: true,
    size: "2",
    children: "Phone horizontal",
  }));
  assertStringIncludes(html, "phone-2");
  assertStringIncludes(html, "artboard-horizontal");
  assertStringIncludes(html, "Phone horizontal");
});

Deno.test("Artboard - demo with phone", () => {
  const html = renderToString(Artboard({
    phone: true,
    demo: true,
    size: "4",
    children: "Demo phone",
  }));
  assertStringIncludes(html, "phone-4");
  assertStringIncludes(html, "artboard-demo");
  assertStringIncludes(html, "Demo phone");
});

Deno.test("Artboard - complex children", () => {
  const html = renderToString(Artboard({
    children: [
      "Text content",
      // This tests that the component can handle complex children
    ],
  }));
  assertStringIncludes(html, "artboard");
  assertStringIncludes(html, "Text content");
});

Deno.test("Artboard - size 6 with all options", () => {
  const html = renderToString(Artboard({
    size: "6",
    horizontal: true,
    demo: true,
    phone: false,
    className: "large-artboard",
    children: "Large artboard content",
  }));
  assertStringIncludes(html, "artboard-6");
  assertStringIncludes(html, "artboard-horizontal");
  assertStringIncludes(html, "artboard-demo");
  assertStringIncludes(html, "large-artboard");
  assertStringIncludes(html, "Large artboard content");
});

Deno.test("Artboard - minimal configuration", () => {
  const html = renderToString(Artboard({
    children: "Minimal",
  }));
  assertStringIncludes(html, "artboard");
  assertStringIncludes(html, "artboard-1");
  assertEquals(html.includes("artboard-horizontal"), false);
  assertEquals(html.includes("artboard-demo"), false);
  assertEquals(html.includes("phone-"), false);
  assertStringIncludes(html, "Minimal");
});

Deno.test("Artboard - empty children", () => {
  const html = renderToString(Artboard({
    children: "",
  }));
  assertStringIncludes(html, "artboard");
  assertStringIncludes(html, "artboard-1");
});

Deno.test("Artboard - with id", () => {
  const html = renderToString(Artboard({
    id: "test-artboard",
    children: "ID test",
  }));
  assertStringIncludes(html, 'id="test-artboard"');
  assertStringIncludes(html, "ID test");
});

Deno.test("Artboard - artboard vs phone class logic", () => {
  // Test that phone=false uses artboard-X classes
  const normalHtml = renderToString(Artboard({
    phone: false,
    size: "3",
    children: "Normal",
  }));
  assertStringIncludes(normalHtml, "artboard-3");
  assertEquals(normalHtml.includes("phone-3"), false);

  // Test that phone=true uses phone-X classes
  const phoneHtml = renderToString(Artboard({
    phone: true,
    size: "3",
    children: "Phone",
  }));
  assertStringIncludes(phoneHtml, "phone-3");
  assertEquals(phoneHtml.includes("artboard-3"), false);
});

Deno.test("Artboard - boolean props false", () => {
  const html = renderToString(Artboard({
    horizontal: false,
    phone: false,
    demo: false,
    children: "All false",
  }));
  assertStringIncludes(html, "artboard-1");
  assertEquals(html.includes("artboard-horizontal"), false);
  assertEquals(html.includes("artboard-demo"), false);
  assertEquals(html.includes("phone-"), false);
  assertStringIncludes(html, "All false");
});

Deno.test("Artboard - size 5 phone demo", () => {
  const html = renderToString(Artboard({
    size: "5",
    phone: true,
    demo: true,
    children: "Phone demo size 5",
  }));
  assertStringIncludes(html, "phone-5");
  assertStringIncludes(html, "artboard-demo");
  assertEquals(html.includes("artboard-5"), false);
  assertStringIncludes(html, "Phone demo size 5");
});
