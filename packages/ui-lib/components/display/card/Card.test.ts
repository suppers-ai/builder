import { assertEquals, assertStringIncludes } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { Card } from "./Card.tsx";

Deno.test("Card - basic rendering", () => {
  const html = renderToString(h(Card, {
    children: "Card content",
  }));
  assertStringIncludes(html, "card");
  assertStringIncludes(html, "card-body");
  assertStringIncludes(html, "bg-base-100 shadow-xl");
  assertStringIncludes(html, "Card content");
});

Deno.test("Card - with title", () => {
  const html = renderToString(h(Card, {
    title: "Card Title",
    children: "Card content",
  }));
  assertStringIncludes(html, "card-title");
  assertStringIncludes(html, "Card Title");
});

Deno.test("Card - without title", () => {
  const html = renderToString(h(Card, {
    children: "Card content",
  }));
  assertEquals(html.includes("card-title"), false);
});

Deno.test("Card - with image", () => {
  const html = renderToString(h(Card, {
    image: "https://example.com/image.jpg",
    imageAlt: "Test image",
    children: "Card content",
  }));
  assertStringIncludes(html, "figure");
  assertStringIncludes(html, "https://example.com/image.jpg");
  assertStringIncludes(html, "Test image");
});

Deno.test("Card - without image", () => {
  const html = renderToString(h(Card, {
    children: "Card content",
  }));
  assertEquals(html.includes("figure"), false);
});

Deno.test("Card - image with default alt", () => {
  const html = renderToString(h(Card, {
    image: "test.jpg",
    children: "Card content",
  }));
  assertStringIncludes(html, "test.jpg");
  assertStringIncludes(html, "alt");
});

Deno.test("Card - compact variant", () => {
  const html = renderToString(h(Card, {
    compact: true,
    children: "Compact card",
  }));
  assertStringIncludes(html, "card-compact");
});

Deno.test("Card - side variant", () => {
  const html = renderToString(h(Card, {
    side: true,
    children: "Side card",
  }));
  assertStringIncludes(html, "card-side");
});

Deno.test("Card - glass variant", () => {
  const html = renderToString(h(Card, {
    glass: true,
    children: "Glass card",
  }));
  assertStringIncludes(html, "glass");
});

Deno.test("Card - bordered variant", () => {
  const html = renderToString(h(Card, {
    bordered: true,
    children: "Bordered card",
  }));
  assertStringIncludes(html, "card-bordered");
});

Deno.test("Card - with actions", () => {
  const html = renderToString(h(Card, {
    children: "Card content",
    actions: h("div", {}, [
      h("button", { class: "btn btn-primary" }, "Action"),
    ]),
  }));
  assertStringIncludes(html, "card-actions justify-end");
  assertStringIncludes(html, "btn btn-primary");
  assertStringIncludes(html, "Action");
});

Deno.test("Card - without actions", () => {
  const html = renderToString(h(Card, {
    children: "Card content",
  }));
  assertEquals(html.includes("card-actions"), false);
});

Deno.test("Card - custom class", () => {
  const html = renderToString(h(Card, {
    class: "custom-card-class",
    children: "Card content",
  }));
  assertStringIncludes(html, "custom-card-class");
});

Deno.test("Card - with id", () => {
  const html = renderToString(h(Card, {
    id: "test-card",
    children: "Card content",
  }));
  assertStringIncludes(html, 'id="test-card"');
});

Deno.test("Card - all props combined", () => {
  const html = renderToString(h(Card, {
    title: "Full Card",
    image: "image.jpg",
    imageAlt: "Card image",
    compact: true,
    side: true,
    glass: true,
    bordered: true,
    actions: h("button", { class: "btn" }, "Action"),
    class: "test-class",
    id: "full-card",
    children: "Full card content",
  }));
  assertStringIncludes(html, "card-title");
  assertStringIncludes(html, "Full Card");
  assertStringIncludes(html, "image.jpg");
  assertStringIncludes(html, "Card image");
  assertStringIncludes(html, "card-compact");
  assertStringIncludes(html, "card-side");
  assertStringIncludes(html, "glass");
  assertStringIncludes(html, "card-bordered");
  assertStringIncludes(html, "card-actions");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-card"');
  assertStringIncludes(html, "Full card content");
});

Deno.test("Card - complex content", () => {
  const html = renderToString(Card({
    title: "Complex Card",
    children: h("div", {}, [
      h("p", {}, "Card description goes here."),
      h("ul", {}, [
        h("li", {}, "Feature 1"),
        h("li", {}, "Feature 2"),
        h("li", {}, "Feature 3"),
      ]),
    ]),
    actions: h("div", {}, [
      h("button", { class: "btn btn-ghost" }, "Cancel"),
      h("button", { class: "btn btn-primary" }, "Save"),
    ]),
  }));
  assertStringIncludes(html, "Complex Card");
  assertStringIncludes(html, "Card description goes here.");
  assertStringIncludes(html, "Feature 1");
  assertStringIncludes(html, "Feature 2");
  assertStringIncludes(html, "Feature 3");
  assertStringIncludes(html, "btn-ghost");
  assertStringIncludes(html, "btn-primary");
  assertStringIncludes(html, "Cancel");
  assertStringIncludes(html, "Save");
});

Deno.test("Card - image with title and content", () => {
  const html = renderToString(Card({
    title: "Image Card",
    image: "featured.jpg",
    imageAlt: "Featured image",
    children: "This card has an image, title, and content.",
  }));
  assertStringIncludes(html, "figure");
  assertStringIncludes(html, "featured.jpg");
  assertStringIncludes(html, "Featured image");
  assertStringIncludes(html, "card-title");
  assertStringIncludes(html, "Image Card");
  assertStringIncludes(html, "This card has an image, title, and content.");
});

Deno.test("Card - side card with image", () => {
  const html = renderToString(Card({
    side: true,
    image: "side-image.jpg",
    title: "Side Card",
    children: "Side layout card content",
  }));
  assertStringIncludes(html, "card-side");
  assertStringIncludes(html, "side-image.jpg");
  assertStringIncludes(html, "Side Card");
  assertStringIncludes(html, "Side layout card content");
});

Deno.test("Card - multiple action buttons", () => {
  const html = renderToString(Card({
    title: "Actions Card",
    children: "Card with multiple actions",
    actions: h("div", {}, [
      h("button", { class: "btn btn-sm btn-outline" }, "Edit"),
      h("button", { class: "btn btn-sm btn-error" }, "Delete"),
      h("button", { class: "btn btn-sm btn-primary" }, "View"),
    ]),
  }));
  assertStringIncludes(html, "card-actions justify-end");
  assertStringIncludes(html, "btn-outline");
  assertStringIncludes(html, "btn-error");
  assertStringIncludes(html, "btn-primary");
  assertStringIncludes(html, "Edit");
  assertStringIncludes(html, "Delete");
  assertStringIncludes(html, "View");
});

Deno.test("Card - glass with all features", () => {
  const html = renderToString(Card({
    glass: true,
    bordered: true,
    title: "Glass Card",
    image: "glass-bg.jpg",
    children: "Glass effect card",
    actions: h("button", { class: "btn btn-ghost" }, "Transparent"),
  }));
  assertStringIncludes(html, "glass");
  assertStringIncludes(html, "card-bordered");
  assertStringIncludes(html, "Glass Card");
  assertStringIncludes(html, "glass-bg.jpg");
  assertStringIncludes(html, "Glass effect card");
  assertStringIncludes(html, "btn-ghost");
  assertStringIncludes(html, "Transparent");
});

// Snapshot tests
Deno.test("Card - HTML snapshot simple", async (t) => {
  const html = renderToString(Card({
    title: "Simple Card",
    children: "Simple card content",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Card - HTML snapshot with image", async (t) => {
  const html = renderToString(Card({
    title: "Image Card",
    image: "https://example.com/card-image.jpg",
    imageAlt: "Example image",
    children: "Card with image content",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Card - HTML snapshot with actions", async (t) => {
  const html = renderToString(Card({
    title: "Action Card",
    children: "Card with actions",
    actions: h("div", {}, [
      h("button", { class: "btn btn-primary" }, "Primary"),
      h("button", { class: "btn btn-secondary" }, "Secondary"),
    ]),
  }));
  await assertSnapshot(t, html);
});

Deno.test("Card - HTML snapshot complex", async (t) => {
  const html = renderToString(Card({
    title: "Complex Card",
    image: "complex-image.jpg",
    imageAlt: "Complex card image",
    compact: true,
    bordered: true,
    children: h("div", {}, [
      h("p", { class: "text-base-content" }, "Complex card with multiple features."),
      h("div", { class: "space-y-2" }, [
        h("div", { class: "badge badge-primary" }, "Feature 1"),
        h("div", { class: "badge badge-secondary" }, "Feature 2"),
      ]),
    ]),
    actions: h("div", {}, [
      h("button", { class: "btn btn-ghost" }, "Cancel"),
      h("button", { class: "btn btn-primary" }, "Confirm"),
    ]),
    class: "custom-card",
  }));
  await assertSnapshot(t, html);
});
