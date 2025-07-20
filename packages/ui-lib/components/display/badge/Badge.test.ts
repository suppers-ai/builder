import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { Badge } from "./Badge.tsx";

Deno.test("Badge - basic rendering", () => {
  const html = renderToString(h(Badge, {
    children: "Badge Text",
  }));
  assertStringIncludes(html, "badge");
  assertStringIncludes(html, "Badge Text");
});

Deno.test("Badge - with content prop", () => {
  const html = renderToString(h(Badge, {
    content: "Content Badge",
  }));
  assertStringIncludes(html, "badge");
  assertStringIncludes(html, "Content Badge");
});

Deno.test("Badge - content prop takes precedence", () => {
  const html = renderToString(h(Badge, {
    content: "Content",
    children: "Children",
  }));
  assertStringIncludes(html, "Content");
  assertEquals(html.includes("Children"), false);
});

Deno.test("Badge - color variants", () => {
  const colors = [
    "primary",
    "secondary",
    "accent",
    "neutral",
    "info",
    "success",
    "warning",
    "error",
  ];

  colors.forEach((color) => {
    const html = renderToString(h(Badge, {
      children: "Test",
      color: color as any,
    }));
    assertStringIncludes(html, `badge-${color}`);
  });
});

Deno.test("Badge - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(h(Badge, {
      children: "Test",
      size: size as any,
    }));
    assertStringIncludes(html, `badge-${size}`);
  });
});

Deno.test("Badge - variant styles", () => {
  const variants = ["outline", "ghost"];

  variants.forEach((variant) => {
    const html = renderToString(h(Badge, {
      children: "Test",
      variant: variant as any,
    }));
    assertStringIncludes(html, `badge-${variant}`);
  });
});

Deno.test("Badge - custom class", () => {
  const html = renderToString(h(Badge, {
    children: "Test",
    class: "custom-badge-class",
  }));
  assertStringIncludes(html, "custom-badge-class");
});

Deno.test("Badge - with id", () => {
  const html = renderToString(h(Badge, {
    children: "Test",
    id: "test-badge",
  }));
  assertStringIncludes(html, 'id="test-badge"');
});

Deno.test("Badge - positioned badge (indicator)", () => {
  const html = renderToString(h(Badge, {
    content: "5",
    position: "top-right",
    children: h("button", {}, "Button"),
  }));
  assertStringIncludes(html, "indicator");
  assertStringIncludes(html, "indicator-item");
  assertStringIncludes(html, "indicator-top-right");
  assertStringIncludes(html, "Button");
  assertStringIncludes(html, "5");
});

Deno.test("Badge - positioned badge all positions", () => {
  const positions = ["top-right", "top-left", "bottom-right", "bottom-left"];

  positions.forEach((position) => {
    const html = renderToString(h(Badge, {
      content: "Badge",
      position: position as any,
      children: h("div", {}, "Content"),
    }));
    assertStringIncludes(html, "indicator");
    assertStringIncludes(html, `indicator-${position}`);
  });
});

Deno.test("Badge - positioned badge without children renders regular badge", () => {
  const html = renderToString(h(Badge, {
    content: "Badge",
    position: "top-right",
  }));
  // Should render as regular badge when no children
  assertStringIncludes(html, "badge");
  assertEquals(html.includes("indicator"), false);
});

Deno.test("Badge - number content", () => {
  const html = renderToString(h(Badge, {
    content: 42,
  }));
  assertStringIncludes(html, "42");
});

Deno.test("Badge - zero content", () => {
  const html = renderToString(h(Badge, {
    content: 0,
  }));
  assertStringIncludes(html, "0");
});

Deno.test("Badge - empty string content", () => {
  const html = renderToString(h(Badge, {
    content: "",
  }));
  assertStringIncludes(html, "badge");
  // Empty content should still render
});

Deno.test("Badge - all props combined", () => {
  const html = renderToString(h(Badge, {
    content: "Full Badge",
    color: "primary",
    size: "lg",
    variant: "outline",
    class: "test-class",
    id: "full-badge",
  }));
  assertStringIncludes(html, "badge-primary");
  assertStringIncludes(html, "badge-lg");
  assertStringIncludes(html, "badge-outline");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-badge"');
  assertStringIncludes(html, "Full Badge");
});

Deno.test("Badge - positioned badge with all props", () => {
  const html = renderToString(h(Badge, {
    content: "99+",
    position: "top-right",
    color: "error",
    size: "sm",
    children: h("div", { class: "btn" }, "Button"),
  }));
  assertStringIncludes(html, "indicator");
  assertStringIncludes(html, "indicator-top-right");
  assertStringIncludes(html, "badge-error");
  assertStringIncludes(html, "badge-sm");
  assertStringIncludes(html, "99+");
  assertStringIncludes(html, "Button");
});

Deno.test("Badge - complex children in positioned badge", () => {
  const html = renderToString(h(Badge, {
    content: "New",
    position: "top-right",
    children: h("div", { class: "card" }, [
      h("div", { class: "card-body" }, [
        h("h2", { class: "card-title" }, "Card Title"),
        h("p", {}, "Card content"),
      ]),
    ]),
  }));
  assertStringIncludes(html, "indicator");
  assertStringIncludes(html, "New");
  assertStringIncludes(html, "card");
  assertStringIncludes(html, "Card Title");
  assertStringIncludes(html, "Card content");
});

Deno.test("Badge - multiple badges", () => {
  const html = renderToString(
    h("div", {}, [
      h(Badge, { color: "primary", children: "Primary" }),
      h(Badge, { color: "secondary", children: "Secondary" }),
      h(Badge, { color: "accent", children: "Accent" }),
    ]),
  );
  assertStringIncludes(html, "badge-primary");
  assertStringIncludes(html, "badge-secondary");
  assertStringIncludes(html, "badge-accent");
  assertStringIncludes(html, "Primary");
  assertStringIncludes(html, "Secondary");
  assertStringIncludes(html, "Accent");
});

// Snapshot tests
Deno.test("Badge - HTML snapshot regular badge", async (t) => {
  const html = renderToString(h(Badge, {
    content: "Regular Badge",
    color: "primary",
    size: "md",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Badge - HTML snapshot positioned badge", async (t) => {
  const html = renderToString(h(Badge, {
    content: "5",
    position: "top-right",
    color: "error",
    size: "sm",
    children: h("button", { class: "btn" }, "Notifications"),
  }));
  await assertSnapshot(t, html);
});

Deno.test("Badge - HTML snapshot all variants", async (t) => {
  const html = renderToString(
    h("div", { class: "flex gap-2" }, [
      h(Badge, { color: "primary", children: "Primary" }),
      h(Badge, { color: "secondary", variant: "outline", children: "Outline" }),
      h(Badge, { color: "accent", size: "lg", children: "Large" }),
      h(Badge, { color: "error", size: "xs", children: "Small" }),
    ]),
  );
  await assertSnapshot(t, html);
});

Deno.test("Badge - HTML snapshot complex positioned", async (t) => {
  const html = renderToString(h(Badge, {
    content: "99+",
    position: "top-right",
    color: "warning",
    children: h("div", { class: "avatar" }, [
      h("div", { class: "w-16 h-16 rounded-full bg-neutral text-neutral-content" }, [
        h("span", {}, "JD"),
      ]),
    ]),
  }));
  await assertSnapshot(t, html);
});
