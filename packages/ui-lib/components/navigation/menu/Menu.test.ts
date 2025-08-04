import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Menu } from "./Menu.tsx";

const mockItems = [
  { label: "Home", href: "/", active: true },
  { label: "About", href: "/about" },
  {
    label: "Services",
    children: [
      { label: "Web Design", href: "/services/web-design" },
      { label: "Development", href: "/services/development" },
    ],
  },
  { label: "Contact", href: "/contact", disabled: true },
  { label: "No Link" },
];

Deno.test("Menu - basic rendering", () => {
  const html = renderToString(Menu({
    items: mockItems,
  }));
  assertStringIncludes(html, "menu");
  assertStringIncludes(html, "menu-md");
  assertStringIncludes(html, "bg-base-200 rounded-box");
  assertStringIncludes(html, "Home");
  assertStringIncludes(html, "About");
  assertStringIncludes(html, "Services");
  assertStringIncludes(html, "Contact");
  assertStringIncludes(html, "No Link");
});

Deno.test("Menu - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Menu({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
      items: [{ label: "Test Item", href: "/test" }],
    }));
    assertStringIncludes(html, `menu-${size}`);
    assertStringIncludes(html, "Test Item");
  });
});

Deno.test("Menu - horizontal orientation", () => {
  const html = renderToString(Menu({
    horizontal: true,
    items: [{ label: "Horizontal Item", href: "/test" }],
  }));
  assertStringIncludes(html, "menu-horizontal");
  assertStringIncludes(html, "Horizontal Item");
});

Deno.test("Menu - vertical orientation", () => {
  const html = renderToString(Menu({
    horizontal: false,
    items: [{ label: "Vertical Item", href: "/test" }],
  }));
  assertEquals(html.includes("menu-horizontal"), false);
  assertStringIncludes(html, "Vertical Item");
});

Deno.test("Menu - compact mode", () => {
  const html = renderToString(Menu({
    compact: true,
    items: [{ label: "Compact Item", href: "/test" }],
  }));
  assertStringIncludes(html, "menu-compact");
  assertStringIncludes(html, "Compact Item");
});

Deno.test("Menu - non-compact mode", () => {
  const html = renderToString(Menu({
    compact: false,
    items: [{ label: "Normal Item", href: "/test" }],
  }));
  assertEquals(html.includes("menu-compact"), false);
  assertStringIncludes(html, "Normal Item");
});

Deno.test("Menu - items with href", () => {
  const html = renderToString(Menu({
    items: [
      { label: "Link Item", href: "/link" },
      { label: "No Link Item" },
    ],
  }));
  assertStringIncludes(html, 'href="/link"');
  assertStringIncludes(html, "Link Item");
  assertStringIncludes(html, "No Link Item");
});

Deno.test("Menu - active items", () => {
  const html = renderToString(Menu({
    items: [
      { label: "Active Item", href: "/active", active: true },
      { label: "Inactive Item", href: "/inactive", active: false },
    ],
  }));
  assertStringIncludes(html, "active"); // Check for active class
  assertStringIncludes(html, "Active Item");
  assertStringIncludes(html, "Inactive Item");
});

Deno.test("Menu - disabled items", () => {
  const html = renderToString(Menu({
    items: [
      { label: "Enabled Item", href: "/enabled", disabled: false },
      { label: "Disabled Item", href: "/disabled", disabled: true },
    ],
  }));
  assertStringIncludes(html, "disabled"); // Check for disabled class
  assertStringIncludes(html, "Enabled Item");
  assertStringIncludes(html, "Disabled Item");
});

Deno.test("Menu - items with children (submenu)", () => {
  const html = renderToString(Menu({
    items: [
      {
        label: "Parent Menu",
        children: [
          { label: "Child 1", href: "/child1" },
          { label: "Child 2", href: "/child2" },
        ],
      },
    ],
  }));
  assertStringIncludes(html, "details");
  assertStringIncludes(html, "summary");
  assertStringIncludes(html, "Parent Menu");
  assertStringIncludes(html, "Child 1");
  assertStringIncludes(html, "Child 2");
  assertStringIncludes(html, 'href="/child1"');
  assertStringIncludes(html, 'href="/child2"');
});

Deno.test("Menu - disabled parent with children", () => {
  const html = renderToString(Menu({
    items: [
      {
        label: "Disabled Parent",
        disabled: true,
        children: [
          { label: "Child", href: "/child" },
        ],
      },
    ],
  }));
  assertStringIncludes(html, "disabled"); // Check for disabled class
  assertStringIncludes(html, "Disabled Parent");
  assertStringIncludes(html, "Child");
});

Deno.test("Menu - nested structure", () => {
  const html = renderToString(Menu({
    items: [
      {
        label: "Level 1",
        children: [
          {
            label: "Level 2",
            children: [
              { label: "Level 3", href: "/level3" },
            ],
          },
        ],
      },
    ],
  }));
  assertStringIncludes(html, "Level 1");
  assertStringIncludes(html, "Level 2");
  assertStringIncludes(html, "Level 3");
  assertStringIncludes(html, 'href="/level3"');
});

Deno.test("Menu - custom className", () => {
  const html = renderToString(Menu({
    class: "custom-menu",
    items: [{ label: "Custom Item", href: "/custom" }],
  }));
  assertStringIncludes(html, "custom-menu");
  assertStringIncludes(html, "Custom Item");
});

Deno.test("Menu - with id", () => {
  const html = renderToString(Menu({
    id: "main-menu",
    items: [{ label: "ID Item", href: "/id" }],
  }));
  assertStringIncludes(html, 'id="main-menu"');
  assertStringIncludes(html, "ID Item");
});

Deno.test("Menu - empty items", () => {
  const html = renderToString(Menu({
    items: [],
  }));
  assertStringIncludes(html, "menu");
  assertStringIncludes(html, "bg-base-200 rounded-box");
});

Deno.test("Menu - all props combined", () => {
  const html = renderToString(Menu({
    size: "lg",
    horizontal: true,
    compact: true,
    class: "test-class",
    id: "test-menu",
    items: [
      {
        label: "Combined Menu",
        active: true,
        children: [
          { label: "Sub Item", href: "/sub", disabled: true },
        ],
      },
    ],
  }));
  assertStringIncludes(html, "menu-lg");
  assertStringIncludes(html, "menu-horizontal");
  assertStringIncludes(html, "menu-compact");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="test-menu"');
  assertStringIncludes(html, "Combined Menu");
  assertStringIncludes(html, "Sub Item");
  assertStringIncludes(html, 'href="/sub"');
});

Deno.test("Menu - item types", () => {
  const html = renderToString(Menu({
    items: [
      { label: "Link with href", href: "/link" },
      { label: "Span without href" },
      {
        label: "Parent with children",
        children: [
          { label: "Child", href: "/child" },
        ],
      },
    ],
  }));
  // Link item
  assertStringIncludes(html, 'href="/link"');
  assertStringIncludes(html, "Link with href");

  // Span item
  assertStringIncludes(html, "Span without href");

  // Parent with children
  assertStringIncludes(html, "details");
  assertStringIncludes(html, "Parent with children");
  assertStringIncludes(html, "Child");
});

Deno.test("Menu - active and disabled combinations", () => {
  const html = renderToString(Menu({
    items: [
      { label: "Active Enabled", href: "/ae", active: true, disabled: false },
      { label: "Active Disabled", href: "/ad", active: true, disabled: true },
      { label: "Inactive Enabled", href: "/ie", active: false, disabled: false },
      { label: "Inactive Disabled", href: "/id", active: false, disabled: true },
    ],
  }));
  assertStringIncludes(html, "active"); // Check for active class
  assertStringIncludes(html, 'class="active disabled"');
  // Default items have class=" " (space), not empty class
  assertStringIncludes(html, "disabled"); // Check for disabled class
  assertStringIncludes(html, "Active Enabled");
  assertStringIncludes(html, "Active Disabled");
  assertStringIncludes(html, "Inactive Enabled");
  assertStringIncludes(html, "Inactive Disabled");
});

Deno.test("Menu - default values", () => {
  const html = renderToString(Menu({
    items: [{ label: "Default Item", href: "/default" }],
  }));
  // Check defaults: size=md, horizontal=false, compact=false
  assertStringIncludes(html, "menu-md");
  assertEquals(html.includes("menu-horizontal"), false);
  assertEquals(html.includes("menu-compact"), false);
  assertStringIncludes(html, "Default Item");
});

Deno.test("Menu - list structure", () => {
  const html = renderToString(Menu({
    items: [
      { label: "Item 1", href: "/1" },
      { label: "Item 2", href: "/2" },
    ],
  }));
  assertStringIncludes(html, "<ul");
  assertStringIncludes(html, "<li");
  assertStringIncludes(html, "Item 1");
  assertStringIncludes(html, "Item 2");
});

Deno.test("Menu - submenu structure", () => {
  const html = renderToString(Menu({
    items: [
      {
        label: "Menu with submenu",
        children: [
          { label: "Submenu item", href: "/sub" },
        ],
      },
    ],
  }));
  assertStringIncludes(html, "<details>");
  assertStringIncludes(html, "<summary");
  assertStringIncludes(html, "<ul>");
  assertStringIncludes(html, "Menu with submenu");
  assertStringIncludes(html, "Submenu item");
});
