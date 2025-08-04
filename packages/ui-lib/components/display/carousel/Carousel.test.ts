import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { renderToString } from "preact-render-to-string";
import { Carousel } from "./Carousel.tsx";

Deno.test("Carousel - basic rendering", () => {
  const html = renderToString(Carousel({
    children: "Test content",
  }));
  assertStringIncludes(html, "carousel");
  assertStringIncludes(html, "Test content");
});

Deno.test("Carousel - with multiple children", () => {
  const html = renderToString(Carousel({
    children: ["Item 1", "Item 2", "Item 3"],
  }));
  assertStringIncludes(html, "carousel");
  assertStringIncludes(html, "Item 1");
  assertStringIncludes(html, "Item 2");
  assertStringIncludes(html, "Item 3");
});

Deno.test("Carousel - vertical orientation", () => {
  const html = renderToString(Carousel({
    children: "Test content",
    vertical: true,
  }));
  assertStringIncludes(html, "carousel-vertical");
});

Deno.test("Carousel - with custom class", () => {
  const html = renderToString(Carousel({
    children: "Test content",
    class: "custom-carousel",
  }));
  assertStringIncludes(html, "custom-carousel");
});

Deno.test("Carousel - with snap alignment", () => {
  const html = renderToString(Carousel({
    children: "Test content",
    snap: "center",
  }));
  assertStringIncludes(html, "carousel");
});

Deno.test("Carousel - HTML snapshot", async (t) => {
  const html = renderToString(Carousel({
    children: "Carousel content",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Carousel - HTML snapshot with items", async (t) => {
  const html = renderToString(Carousel({
    children: ["First item", "Second item"],
  }));
  await assertSnapshot(t, html);
});
