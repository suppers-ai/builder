import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { Drawer } from "./Drawer.tsx";

Deno.test("Drawer - basic rendering", () => {
  const html = renderToString(Drawer({
    sidebarContent: "Sidebar content",
    children: "Main content",
  }));
  assertStringIncludes(html, "drawer");
  assertStringIncludes(html, "drawer-toggle");
  assertStringIncludes(html, "drawer-content");
  assertStringIncludes(html, "drawer-side");
  assertStringIncludes(html, "Sidebar content");
  assertStringIncludes(html, "Main content");
});

Deno.test("Drawer - side variants", () => {
  // Left side (default)
  const leftHtml = renderToString(Drawer({
    side: "left",
    sidebarContent: "Left sidebar",
    children: "Left content",
  }));
  assertEquals(leftHtml.includes("drawer-end"), false);
  assertStringIncludes(leftHtml, "Left sidebar");

  // Right side
  const rightHtml = renderToString(Drawer({
    side: "right",
    sidebarContent: "Right sidebar",
    children: "Right content",
  }));
  assertStringIncludes(rightHtml, "drawer-end");
  assertStringIncludes(rightHtml, "Right sidebar");
});

Deno.test("Drawer - open state", () => {
  const html = renderToString(Drawer({
    open: true,
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertStringIncludes(html, "checked");
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - closed state", () => {
  const html = renderToString(Drawer({
    open: false,
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertEquals(html.includes("checked"), false);
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - overlay enabled", () => {
  const html = renderToString(Drawer({
    overlay: true,
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertStringIncludes(html, "drawer-overlay");
  assertStringIncludes(html, 'aria-label="close sidebar"');
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - overlay disabled", () => {
  const html = renderToString(Drawer({
    overlay: false,
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertEquals(html.includes("drawer-overlay"), false);
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - custom className", () => {
  const html = renderToString(Drawer({
    class: "custom-drawer",
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertStringIncludes(html, "custom-drawer");
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - custom id", () => {
  const html = renderToString(Drawer({
    id: "custom-drawer-id",
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertStringIncludes(html, 'id="custom-drawer-id"');
  assertStringIncludes(html, 'for="custom-drawer-id"');
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - default id", () => {
  const html = renderToString(Drawer({
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertStringIncludes(html, 'id="drawer-toggle"');
  assertStringIncludes(html, 'for="drawer-toggle"');
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - sidebar styling", () => {
  const html = renderToString(Drawer({
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertStringIncludes(html, "bg-base-200 min-h-full w-80 p-4");
  assertStringIncludes(html, "aside");
  assertStringIncludes(html, "Sidebar");
});

Deno.test("Drawer - drawer content layout", () => {
  const html = renderToString(Drawer({
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertStringIncludes(html, "drawer-content flex flex-col");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - all props combined", () => {
  const html = renderToString(Drawer({
    side: "right",
    open: true,
    overlay: true,
    class: "test-class",
    id: "test-drawer",
    sidebarContent: "Combined sidebar",
    children: "Combined content",
  }));
  assertStringIncludes(html, "drawer-end");
  assertStringIncludes(html, "checked");
  assertStringIncludes(html, "drawer-overlay");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="test-drawer"');
  assertStringIncludes(html, "Combined sidebar");
  assertStringIncludes(html, "Combined content");
});

Deno.test("Drawer - checkbox input", () => {
  const html = renderToString(Drawer({
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertStringIncludes(html, 'type="checkbox"');
  assertStringIncludes(html, "drawer-toggle");
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - complex children", () => {
  const html = renderToString(Drawer({
    sidebarContent: ["Nav", "Menu"],
    children: ["Header", "Body", "Footer"],
  }));
  assertStringIncludes(html, "drawer");
  assertStringIncludes(html, "Nav");
  assertStringIncludes(html, "Menu");
  assertStringIncludes(html, "Header");
  assertStringIncludes(html, "Body");
  assertStringIncludes(html, "Footer");
});

Deno.test("Drawer - default values", () => {
  const html = renderToString(Drawer({
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  // Check defaults: side=left, open=false, overlay=true
  assertEquals(html.includes("drawer-end"), false);
  assertEquals(html.includes("checked"), false);
  assertStringIncludes(html, "drawer-overlay");
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - left side without overlay", () => {
  const html = renderToString(Drawer({
    side: "left",
    overlay: false,
    sidebarContent: "Left sidebar",
    children: "Left content",
  }));
  assertEquals(html.includes("drawer-end"), false);
  assertEquals(html.includes("drawer-overlay"), false);
  assertStringIncludes(html, "Left sidebar");
  assertStringIncludes(html, "Left content");
});

Deno.test("Drawer - right side open", () => {
  const html = renderToString(Drawer({
    side: "right",
    open: true,
    sidebarContent: "Right sidebar",
    children: "Right content",
  }));
  assertStringIncludes(html, "drawer-end");
  assertStringIncludes(html, "checked");
  assertStringIncludes(html, "Right sidebar");
  assertStringIncludes(html, "Right content");
});

Deno.test("Drawer - label for attribute", () => {
  const html = renderToString(Drawer({
    id: "my-drawer",
    sidebarContent: "Sidebar",
    children: "Content",
  }));
  assertStringIncludes(html, 'for="my-drawer"');
  assertStringIncludes(html, 'id="my-drawer"');
  assertStringIncludes(html, "Sidebar");
  assertStringIncludes(html, "Content");
});

Deno.test("Drawer - empty sidebar content", () => {
  const html = renderToString(Drawer({
    sidebarContent: "",
    children: "Content only",
  }));
  assertStringIncludes(html, "drawer");
  assertStringIncludes(html, "Content only");
});

Deno.test("Drawer - empty main content", () => {
  const html = renderToString(Drawer({
    sidebarContent: "Sidebar only",
    children: "",
  }));
  assertStringIncludes(html, "drawer");
  assertStringIncludes(html, "Sidebar only");
});
