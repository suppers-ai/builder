import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts";
import { renderToString } from "preact-render-to-string";
import { BreadcrumbItemProps, Breadcrumbs } from "./Breadcrumbs.tsx";
import { h } from "preact";

// Mock DOMParser for testing
const parser = new DOMParser();

const basicBreadcrumbs: BreadcrumbItemProps[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Electronics", href: "/products/electronics" },
  { label: "Laptops", active: true },
];

Deno.test("Breadcrumbs - basic rendering", () => {
  const html = renderToString(Breadcrumbs({
    items: basicBreadcrumbs,
  }));

  assertStringIncludes(html, 'class="breadcrumbs text-md"');
  assertStringIncludes(html, "<ul>");
  assertStringIncludes(html, "Home");
  assertStringIncludes(html, "Products");
  assertStringIncludes(html, "Electronics");
  assertStringIncludes(html, "Laptops");
});

Deno.test("Breadcrumbs - with custom class", () => {
  const html = renderToString(Breadcrumbs({
    items: basicBreadcrumbs,
    class: "custom-breadcrumbs",
  }));
  assertStringIncludes(html, 'class="breadcrumbs text-md custom-breadcrumbs"');
});

Deno.test("Breadcrumbs - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"];

  sizes.forEach((size) => {
    const html = renderToString(Breadcrumbs({
      items: basicBreadcrumbs,
      size: size as any,
    }));
    assertStringIncludes(html, `text-${size}`);
  });
});

Deno.test("Breadcrumbs - with href links", () => {
  const html = renderToString(Breadcrumbs({
    items: basicBreadcrumbs,
  }));

  assertStringIncludes(html, 'href="/"'); // Check href attributes
  assertStringIncludes(html, ">Home</a>"); // Check content
  assertStringIncludes(html, 'href="/products"');
  assertStringIncludes(html, ">Products</a>");
  assertStringIncludes(html, 'href="/products/electronics"');
  assertStringIncludes(html, ">Electronics</a>");
});

Deno.test("Breadcrumbs - active item as span", () => {
  const html = renderToString(Breadcrumbs({
    items: basicBreadcrumbs,
  }));

  assertStringIncludes(html, "text-primary font-semibold"); // Check classes
  assertStringIncludes(html, ">Laptops</span>"); // Check content

  const document = parser.parseFromString(html, "text/html");
  const laptopLink = document?.querySelector('a[href*="laptop"]');
  assertEquals(laptopLink, null); // Active item should not be a link
});

Deno.test("Breadcrumbs - disabled items", () => {
  const breadcrumbsWithDisabled: BreadcrumbItemProps[] = [
    { label: "Home", href: "/" },
    { label: "Disabled Section", href: "/disabled", disabled: true },
    { label: "Current", active: true },
  ];

  const html = renderToString(Breadcrumbs({
    items: breadcrumbsWithDisabled,
  }));

  assertStringIncludes(html, "opacity-50"); // Check opacity class only
  assertStringIncludes(html, ">Disabled Section</span>"); // Check disabled item content
});

Deno.test("Breadcrumbs - item without href", () => {
  const breadcrumbsNoHref: BreadcrumbItemProps[] = [
    { label: "Home", href: "/" },
    { label: "No Link Item" }, // No href
    { label: "Current", active: true },
  ];

  const html = renderToString(Breadcrumbs({
    items: breadcrumbsNoHref,
  }));

  assertStringIncludes(html, ">No Link Item</span>"); // Check content without class specifics
});

Deno.test("Breadcrumbs - default separator", () => {
  const html = renderToString(Breadcrumbs({
    items: basicBreadcrumbs,
  }));

  assertStringIncludes(html, '<svg xmlns="http://www.w3.org/2000/svg"');
  assertStringIncludes(html, "w-4 h-4 stroke-current");
  assertStringIncludes(html, "m9 5 7 7-7 7"); // Default arrow path
});

Deno.test("Breadcrumbs - custom separator", () => {
  const customSeparator = h("span", {}, ">");

  const html = renderToString(Breadcrumbs({
    items: basicBreadcrumbs,
    separator: customSeparator,
  }));

  assertStringIncludes(html, "<span>></span>");
});

Deno.test("Breadcrumbs - separator placement", () => {
  const shortBreadcrumbs: BreadcrumbItemProps[] = [
    { label: "Home", href: "/" },
    { label: "Current", active: true },
  ];

  const html = renderToString(Breadcrumbs({
    items: shortBreadcrumbs,
  }));

  const document = parser.parseFromString(html, "text/html");
  const separators = document?.querySelectorAll(".mx-2.opacity-50");
  assertEquals(separators?.length, 1); // Only one separator between two items
});

Deno.test("Breadcrumbs - no separator for last item", () => {
  const html = renderToString(Breadcrumbs({
    items: basicBreadcrumbs,
  }));

  const document = parser.parseFromString(html, "text/html");
  const listItems = document?.querySelectorAll("li");
  const lastItem = listItems?.[listItems.length - 1];
  const separatorInLastItem = lastItem?.querySelector(".mx-2.opacity-50");
  assertEquals(separatorInLastItem, null);
});

Deno.test("Breadcrumbs - with id", () => {
  const html = renderToString(Breadcrumbs({
    items: basicBreadcrumbs,
    id: "test-breadcrumbs",
  }));
  assertStringIncludes(html, 'id="test-breadcrumbs"');
});

Deno.test("Breadcrumbs - single item", () => {
  const singleItem: BreadcrumbItemProps[] = [
    { label: "Single Item", active: true },
  ];

  const html = renderToString(Breadcrumbs({
    items: singleItem,
  }));

  assertStringIncludes(html, "text-primary font-semibold"); // Check classes
  assertStringIncludes(html, ">Single Item</span>"); // Check content

  const document = parser.parseFromString(html, "text/html");
  const separators = document?.querySelectorAll(".mx-2.opacity-50");
  assertEquals(separators?.length, 0); // No separators for single item
});

Deno.test("Breadcrumbs - empty items array", () => {
  const html = renderToString(Breadcrumbs({
    items: [],
  }));

  assertStringIncludes(html, 'class="breadcrumbs text-md"');
  assertStringIncludes(html, "<ul></ul>");

  const document = parser.parseFromString(html, "text/html");
  const listItems = document?.querySelectorAll("li");
  assertEquals(listItems?.length, 0);
});

Deno.test("Breadcrumbs - active item styling", () => {
  const breadcrumbsWithActive: BreadcrumbItemProps[] = [
    { label: "Home", href: "/" },
    { label: "Active Link", href: "/active", active: true },
    { label: "Current Page", active: true }, // No href
  ];

  const html = renderToString(Breadcrumbs({
    items: breadcrumbsWithActive,
  }));

  assertStringIncludes(
    html,
    'href="/active"', // Check href
    "text-primary font-semibold", // Check classes
    ">Active Link</a>", // Check content
  );
  assertStringIncludes(html, "text-primary font-semibold"); // Check classes
  assertStringIncludes(html, ">Current Page</span>"); // Check content
});

Deno.test("Breadcrumbs - disabled with href", () => {
  const breadcrumbsDisabledWithHref: BreadcrumbItemProps[] = [
    { label: "Home", href: "/" },
    { label: "Disabled Link", href: "/disabled", disabled: true },
  ];

  const html = renderToString(Breadcrumbs({
    items: breadcrumbsDisabledWithHref,
  }));

  // Disabled items with href should render as span, not link
  assertStringIncludes(html, "opacity-50"); // Check opacity class
  assertStringIncludes(html, ">Disabled Link</span>"); // Check content
  const document = parser.parseFromString(html, "text/html");
  const disabledLink = document?.querySelector('a[href="/disabled"]');
  assertEquals(disabledLink, null);
});

Deno.test("Breadcrumbs - complex navigation path", () => {
  const complexPath: BreadcrumbItemProps[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "User Management", href: "/dashboard/users" },
    { label: "Role Management", href: "/dashboard/users/roles" },
    { label: "Edit Role", href: "/dashboard/users/roles/edit", disabled: true },
    { label: "Administrator Role", active: true },
  ];

  const html = renderToString(Breadcrumbs({
    items: complexPath,
    size: "sm",
  }));

  assertStringIncludes(html, "text-sm");
  assertStringIncludes(html, "Dashboard");
  assertStringIncludes(html, "User Management");
  assertStringIncludes(html, "Role Management");
  assertStringIncludes(html, "opacity-50");
  assertStringIncludes(html, "text-primary font-semibold");

  const document = parser.parseFromString(html, "text/html");
  const separators = document?.querySelectorAll(".mx-2.opacity-50");
  assertEquals(separators?.length, 4); // 4 separators for 5 items
});

Deno.test("Breadcrumbs - default values", () => {
  const html = renderToString(Breadcrumbs({
    items: basicBreadcrumbs,
  }));

  assertStringIncludes(html, "text-md"); // Default size
  assertStringIncludes(html, 'class="breadcrumbs text-md"');
});

Deno.test("Breadcrumbs - all props combined", () => {
  const complexBreadcrumbs: BreadcrumbItemProps[] = [
    { label: "Home", href: "/" },
    { label: "Disabled", href: "/disabled", disabled: true },
    { label: "Active Page", active: true },
  ];

  const customSeparator = h("span", { class: "text-accent" }, "→");

  const html = renderToString(Breadcrumbs({
    class: "navigation-breadcrumbs",
    size: "lg",
    items: complexBreadcrumbs,
    separator: customSeparator,
    id: "full-breadcrumbs",
  }));

  assertStringIncludes(html, 'class="breadcrumbs text-lg navigation-breadcrumbs"');
  assertStringIncludes(html, 'id="full-breadcrumbs"');
  assertStringIncludes(html, '<span class="text-accent">→</span>');
  assertStringIncludes(html, "opacity-50");
  assertStringIncludes(html, "text-primary font-semibold");
});
