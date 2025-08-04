import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { Dropdown } from "./Dropdown.tsx";

// Unit Tests
Deno.test("Dropdown - renders dropdown div", () => {
  const html = renderToString(Dropdown({
    trigger: "Click me",
    content: "Menu items",
  }));

  assertStringIncludes(html, 'class="dropdown');
  assertStringIncludes(html, "dropdown-trigger");
  assertStringIncludes(html, "dropdown-content");
});

Deno.test("Dropdown - applies custom classes", () => {
  const html = renderToString(Dropdown({
    class: "custom-dropdown",
    trigger: "Test",
    content: "Content",
  }));

  assertStringIncludes(html, "custom-dropdown");
});

Deno.test("Dropdown - handles position classes", () => {
  const positions = ["top", "bottom", "left", "right"];

  positions.forEach((pos) => {
    const html = renderToString(Dropdown({
      position: pos as any,
      trigger: "Test",
      content: "Content",
    }));
    assertStringIncludes(html, `dropdown-${pos}`);
  });
});

Deno.test("Dropdown - open state", () => {
  const html = renderToString(Dropdown({
    open: true,
    trigger: "Test",
    content: "Content",
  }));

  assertStringIncludes(html, "dropdown-open");
});

// Edge Cases
Deno.test("Dropdown - empty content", () => {
  const html = renderToString(Dropdown({
    trigger: "Click me",
    content: "",
  }));

  assertStringIncludes(html, "dropdown");
  assertStringIncludes(html, "Click me");
});

Deno.test("Dropdown - with hover modifier", () => {
  const html = renderToString(Dropdown({
    hover: true,
    trigger: "Hover me",
    content: "Menu content",
  }));

  assertStringIncludes(html, "dropdown-hover");
});

Deno.test("Dropdown - position variants", () => {
  const html = renderToString(Dropdown({
    position: "top-end",
    trigger: "Menu",
    content: "Items",
  }));

  assertStringIncludes(html, "dropdown-top");
  assertStringIncludes(html, "dropdown-end");
});

Deno.test("Dropdown - force open", () => {
  const html = renderToString(Dropdown({
    forceOpen: true,
    trigger: "Always open",
    content: "Always visible",
  }));

  assertStringIncludes(html, "dropdown-open");
});

Deno.test("Dropdown - complex trigger and content", () => {
  const html = renderToString(Dropdown({
    trigger: h("button", { class: "btn btn-primary" }, "Primary Menu"),
    content: h("div", {}, [
      h("li", {}, h("a", {}, "Dashboard")),
      h("li", {}, h("a", {}, "Profile")),
      h("li", {}, h("a", {}, "Settings")),
    ]),
  }));

  assertStringIncludes(html, "btn-primary");
  assertStringIncludes(html, "Primary Menu");
  assertStringIncludes(html, "Dashboard");
  assertStringIncludes(html, "Profile");
  assertStringIncludes(html, "Settings");
});
