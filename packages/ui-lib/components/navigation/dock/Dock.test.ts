import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Dock } from "./Dock.tsx";

const mockItems = [
  { id: "home", label: "Home", icon: "🏠", active: true },
  { id: "search", label: "Search", icon: "🔍" },
  { id: "profile", label: "Profile", icon: "👤", badge: "3" },
  { id: "settings", label: "Settings", icon: "⚙️", disabled: true },
];

Deno.test("Dock - basic rendering", () => {
  const html = renderToString(Dock({
    items: mockItems,
  }));
  assertStringIncludes(html, "dock");
  assertStringIncludes(html, "flex items-center");
  assertStringIncludes(html, "h-16");
  assertStringIncludes(html, "bg-base-100 border-base-300");
  assertStringIncludes(html, "flex-row justify-center");
  assertStringIncludes(html, "Home");
  assertStringIncludes(html, "Search");
  assertStringIncludes(html, "Profile");
  assertStringIncludes(html, "Settings");
});

Deno.test("Dock - position variants", () => {
  const positions = ["bottom", "top", "left", "right"];

  positions.forEach((position) => {
    const html = renderToString(Dock({
      position: position as string,
      items: [{ id: "test", label: "Test", icon: "✓" }],
    }));

    if (position === "left" || position === "right") {
      assertStringIncludes(html, "flex-col justify-start");
      assertStringIncludes(html, "w-16");
      assertStringIncludes(html, "border-r");
    } else {
      assertStringIncludes(html, "flex-row justify-center");
      assertStringIncludes(html, "border-t");
    }
    assertStringIncludes(html, "Test");
  });
});

Deno.test("Dock - fixed positioning", () => {
  // Fixed bottom
  const bottomHtml = renderToString(Dock({
    position: "bottom",
    fixed: true,
    items: [{ id: "test", label: "Test" }],
  }));
  assertStringIncludes(bottomHtml, "fixed bottom-0 left-0 right-0 w-full");

  // Fixed top
  const topHtml = renderToString(Dock({
    position: "top",
    fixed: true,
    items: [{ id: "test", label: "Test" }],
  }));
  assertStringIncludes(topHtml, "fixed top-0 left-0 right-0 w-full");

  // Fixed left
  const leftHtml = renderToString(Dock({
    position: "left",
    fixed: true,
    items: [{ id: "test", label: "Test" }],
  }));
  assertStringIncludes(leftHtml, "fixed left-0 top-0 bottom-0 h-full");

  // Fixed right
  const rightHtml = renderToString(Dock({
    position: "right",
    fixed: true,
    items: [{ id: "test", label: "Test" }],
  }));
  assertStringIncludes(rightHtml, "fixed right-0 top-0 bottom-0 h-full");
});

Deno.test("Dock - non-fixed positioning", () => {
  const html = renderToString(Dock({
    position: "bottom",
    fixed: false,
    items: [{ id: "test", label: "Test" }],
  }));
  assertStringIncludes(html, "w-full");
  assertEquals(html.includes("fixed"), false);
});

Deno.test("Dock - size variants", () => {
  const sizes = ["sm", "md", "lg"];
  const sizeClasses = ["h-14", "h-16", "h-20"];
  const itemSizeClasses = ["w-12 h-12 text-xs", "w-14 h-14 text-sm", "w-16 h-16 text-base"];

  sizes.forEach((size, index) => {
    const html = renderToString(Dock({
      size: size as "xs" | "sm" | "md" | "lg" | "xl",
      items: [{ id: "test", label: "Test", icon: "✓" }],
    }));
    assertStringIncludes(html, sizeClasses[index]);
    assertStringIncludes(html, itemSizeClasses[index]);
    assertStringIncludes(html, "Test");
  });
});

Deno.test("Dock - variant styles", () => {
  const variants = ["default", "primary", "secondary", "accent", "neutral", "ghost"];
  const variantClasses = [
    "bg-base-100 border-base-300",
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-neutral text-neutral-content",
    "bg-transparent",
  ];

  variants.forEach((variant, index) => {
    const html = renderToString(Dock({
      variant: variant as string,
      items: [{ id: "test", label: "Test" }],
    }));
    assertStringIncludes(html, variantClasses[index]);
    assertStringIncludes(html, "Test");
  });
});

Deno.test("Dock - show/hide labels", () => {
  // With labels
  const withLabelsHtml = renderToString(Dock({
    showLabels: true,
    items: [{ id: "test", label: "Test Label", icon: "✓" }],
  }));
  assertStringIncludes(withLabelsHtml, "dock-label");
  assertStringIncludes(withLabelsHtml, "Test Label");

  // Without labels
  const withoutLabelsHtml = renderToString(Dock({
    showLabels: false,
    items: [{ id: "test", label: "Test Label", icon: "✓" }],
  }));
  assertEquals(withoutLabelsHtml.includes("dock-label"), false);
  assertEquals(withoutLabelsHtml.includes("Test Label"), false);
});

Deno.test("Dock - active items", () => {
  const html = renderToString(Dock({
    items: [
      { id: "active", label: "Active", active: true },
      { id: "inactive", label: "Inactive", active: false },
    ],
  }));
  assertStringIncludes(html, "text-primary");
  assertStringIncludes(html, "absolute -bottom-1 w-1 h-1 bg-primary rounded-full");
  assertStringIncludes(html, "Active");
  assertStringIncludes(html, "Inactive");
});

Deno.test("Dock - disabled items", () => {
  const html = renderToString(Dock({
    items: [
      { id: "enabled", label: "Enabled", disabled: false },
      { id: "disabled", label: "Disabled", disabled: true },
    ],
  }));
  assertStringIncludes(html, "opacity-50 cursor-not-allowed");
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "Enabled");
  assertStringIncludes(html, "Disabled");
});

Deno.test("Dock - items with badges", () => {
  const html = renderToString(Dock({
    items: [
      { id: "no-badge", label: "No Badge" },
      { id: "string-badge", label: "String Badge", badge: "NEW" },
      { id: "number-badge", label: "Number Badge", badge: 5 },
    ],
  }));
  assertStringIncludes(html, "badge badge-primary badge-xs absolute -top-1 -right-1");
  assertStringIncludes(html, "NEW");
  assertStringIncludes(html, "5");
  assertStringIncludes(html, "No Badge");
  assertStringIncludes(html, "String Badge");
  assertStringIncludes(html, "Number Badge");
});

Deno.test("Dock - items with icons", () => {
  const html = renderToString(Dock({
    items: [
      { id: "with-icon", label: "With Icon", icon: "🚀" },
      { id: "without-icon", label: "Without Icon" },
    ],
  }));
  assertStringIncludes(html, "dock-icon");
  assertStringIncludes(html, "🚀");
  assertStringIncludes(html, "With Icon");
  assertStringIncludes(html, "Without Icon");
});

Deno.test("Dock - items with href", () => {
  const html = renderToString(Dock({
    items: [
      { id: "link", label: "Link", href: "/page" },
      { id: "button", label: "Button" },
    ],
  }));
  assertStringIncludes(html, 'href="/page"');
  assertStringIncludes(html, "Link");
  assertStringIncludes(html, "Button");
});

Deno.test("Dock - custom className", () => {
  const html = renderToString(Dock({
    className: "custom-dock",
    items: [{ id: "test", label: "Test" }],
  }));
  assertStringIncludes(html, "custom-dock");
  assertStringIncludes(html, "Test");
});

Deno.test("Dock - empty items", () => {
  const html = renderToString(Dock({
    items: [],
  }));
  assertStringIncludes(html, "dock");
  assertStringIncludes(html, "flex items-center");
});

Deno.test("Dock - all props combined", () => {
  const html = renderToString(Dock({
    items: [
      {
        id: "complex",
        label: "Complex Item",
        icon: "⭐",
        active: true,
        badge: "99+",
        href: "/complex",
      },
    ],
    position: "top",
    size: "lg",
    variant: "primary",
    showLabels: true,
    fixed: true,
    className: "test-class",
  }));
  assertStringIncludes(html, "fixed top-0 left-0 right-0 w-full");
  assertStringIncludes(html, "h-20");
  assertStringIncludes(html, "bg-primary text-primary-content");
  assertStringIncludes(html, "w-16 h-16 text-base");
  assertStringIncludes(html, "dock-label");
  assertStringIncludes(html, "Complex Item");
  assertStringIncludes(html, "⭐");
  assertStringIncludes(html, "99+");
  assertStringIncludes(html, 'href="/complex"');
  assertStringIncludes(html, "text-primary");
  assertStringIncludes(html, "absolute -bottom-1 w-1 h-1 bg-primary rounded-full");
  assertStringIncludes(html, "test-class");
});

Deno.test("Dock - horizontal layout", () => {
  const html = renderToString(Dock({
    position: "bottom",
    items: [{ id: "test", label: "Test" }],
  }));
  assertStringIncludes(html, "flex-row justify-center");
  assertStringIncludes(html, "px-4");
  assertStringIncludes(html, "Test");
});

Deno.test("Dock - vertical layout", () => {
  const html = renderToString(Dock({
    position: "left",
    items: [{ id: "test", label: "Test" }],
  }));
  assertStringIncludes(html, "flex-col justify-start");
  assertStringIncludes(html, "py-4");
  assertStringIncludes(html, "Test");
});

Deno.test("Dock - with id", () => {
  const html = renderToString(Dock({
    id: "main-dock",
    items: [{ id: "test", label: "Test" }],
  }));
  assertStringIncludes(html, 'id="main-dock"');
  assertStringIncludes(html, "Test");
});

Deno.test("Dock - default values", () => {
  const html = renderToString(Dock({
    items: [{ id: "test", label: "Test" }],
  }));
  // Check defaults: position=bottom, size=md, variant=default, showLabels=true, fixed=false
  assertStringIncludes(html, "w-full");
  assertEquals(html.includes("fixed"), false);
  assertStringIncludes(html, "h-16");
  assertStringIncludes(html, "bg-base-100 border-base-300");
  assertStringIncludes(html, "flex-row justify-center");
  assertStringIncludes(html, "dock-label");
  assertStringIncludes(html, "Test");
});

Deno.test("Dock - item styling classes", () => {
  const html = renderToString(Dock({
    items: [{ id: "test", label: "Test", icon: "✓" }],
  }));
  assertStringIncludes(html, "dock-item");
  assertStringIncludes(html, "flex flex-col items-center justify-center");
  assertStringIncludes(html, "relative transition-all duration-200");
  assertStringIncludes(html, "hover:scale-110 active:scale-95");
  assertStringIncludes(html, "rounded-lg hover:bg-base-200/50");
  assertStringIncludes(html, "Test");
});
