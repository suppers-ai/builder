import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { Navbar } from "./Navbar.tsx";

Deno.test("Navbar - basic rendering", () => {
  const html = renderToString(Navbar({}));
  assertStringIncludes(html, "navbar");
  assertStringIncludes(html, "bg-base-100");
});

Deno.test("Navbar - with start content", () => {
  const html = renderToString(Navbar({
    start: "Logo",
  }));
  assertStringIncludes(html, "navbar-start");
  assertStringIncludes(html, "Logo");
});

Deno.test("Navbar - with center content", () => {
  const html = renderToString(Navbar({
    center: "Navigation Menu",
  }));
  assertStringIncludes(html, "navbar-center");
  assertStringIncludes(html, "Navigation Menu");
});

Deno.test("Navbar - with end content", () => {
  const html = renderToString(Navbar({
    end: "User Profile",
  }));
  assertStringIncludes(html, "navbar-end");
  assertStringIncludes(html, "User Profile");
});

Deno.test("Navbar - with all sections", () => {
  const html = renderToString(Navbar({
    start: "Brand Logo",
    center: "Main Navigation",
    end: "User Actions",
  }));
  assertStringIncludes(html, "navbar-start");
  assertStringIncludes(html, "navbar-center");
  assertStringIncludes(html, "navbar-end");
  assertStringIncludes(html, "Brand Logo");
  assertStringIncludes(html, "Main Navigation");
  assertStringIncludes(html, "User Actions");
});

Deno.test("Navbar - with children (fallback)", () => {
  const html = renderToString(Navbar({
    children: "Fallback content",
  }));
  assertStringIncludes(html, "flex-1");
  assertStringIncludes(html, "Fallback content");
});

Deno.test("Navbar - children ignored when sections provided", () => {
  const html = renderToString(Navbar({
    start: "Start",
    children: "Should not appear",
  }));
  assertStringIncludes(html, "navbar-start");
  assertStringIncludes(html, "Start");
  assertEquals(html.includes("flex-1"), false);
  assertEquals(html.includes("Should not appear"), false);
});

Deno.test("Navbar - custom className", () => {
  const html = renderToString(Navbar({
    class: "custom-navbar",
    start: "Custom Start",
  }));
  assertStringIncludes(html, "custom-navbar");
  assertStringIncludes(html, "Custom Start");
});

Deno.test("Navbar - with id", () => {
  const html = renderToString(Navbar({
    id: "main-navbar",
    start: "ID Test",
  }));
  assertStringIncludes(html, 'id="main-navbar"');
  assertStringIncludes(html, "ID Test");
});

Deno.test("Navbar - only start section", () => {
  const html = renderToString(Navbar({
    start: "Only Start",
  }));
  assertStringIncludes(html, "navbar-start");
  assertStringIncludes(html, "Only Start");
  assertEquals(html.includes("navbar-center"), false);
  assertEquals(html.includes("navbar-end"), false);
  assertEquals(html.includes("flex-1"), false);
});

Deno.test("Navbar - only center section", () => {
  const html = renderToString(Navbar({
    center: "Only Center",
  }));
  assertStringIncludes(html, "navbar-center");
  assertStringIncludes(html, "Only Center");
  assertEquals(html.includes("navbar-start"), false);
  assertEquals(html.includes("navbar-end"), false);
  assertEquals(html.includes("flex-1"), false);
});

Deno.test("Navbar - only end section", () => {
  const html = renderToString(Navbar({
    end: "Only End",
  }));
  assertStringIncludes(html, "navbar-end");
  assertStringIncludes(html, "Only End");
  assertEquals(html.includes("navbar-start"), false);
  assertEquals(html.includes("navbar-center"), false);
  assertEquals(html.includes("flex-1"), false);
});

Deno.test("Navbar - start and end sections", () => {
  const html = renderToString(Navbar({
    start: "Start Content",
    end: "End Content",
  }));
  assertStringIncludes(html, "navbar-start");
  assertStringIncludes(html, "navbar-end");
  assertStringIncludes(html, "Start Content");
  assertStringIncludes(html, "End Content");
  assertEquals(html.includes("navbar-center"), false);
  assertEquals(html.includes("flex-1"), false);
});

Deno.test("Navbar - start and center sections", () => {
  const html = renderToString(Navbar({
    start: "Start Content",
    center: "Center Content",
  }));
  assertStringIncludes(html, "navbar-start");
  assertStringIncludes(html, "navbar-center");
  assertStringIncludes(html, "Start Content");
  assertStringIncludes(html, "Center Content");
  assertEquals(html.includes("navbar-end"), false);
  assertEquals(html.includes("flex-1"), false);
});

Deno.test("Navbar - center and end sections", () => {
  const html = renderToString(Navbar({
    center: "Center Content",
    end: "End Content",
  }));
  assertStringIncludes(html, "navbar-center");
  assertStringIncludes(html, "navbar-end");
  assertStringIncludes(html, "Center Content");
  assertStringIncludes(html, "End Content");
  assertEquals(html.includes("navbar-start"), false);
  assertEquals(html.includes("flex-1"), false);
});

Deno.test("Navbar - empty sections", () => {
  const html = renderToString(Navbar({
    start: "",
    center: "",
    end: "",
  }));
  assertEquals(html.includes("navbar-start"), false);
  assertEquals(html.includes("navbar-center"), false);
  assertEquals(html.includes("navbar-end"), false);
  assertEquals(html.includes("flex-1"), false);
});

Deno.test("Navbar - complex content", () => {
  const html = renderToString(Navbar({
    start: ["Logo", "Brand"],
    center: ["Home", "About", "Contact"],
    end: ["Login", "Signup"],
  }));
  assertStringIncludes(html, "navbar-start");
  assertStringIncludes(html, "navbar-center");
  assertStringIncludes(html, "navbar-end");
  assertStringIncludes(html, "Logo");
  assertStringIncludes(html, "Brand");
  assertStringIncludes(html, "Home");
  assertStringIncludes(html, "About");
  assertStringIncludes(html, "Contact");
  assertStringIncludes(html, "Login");
  assertStringIncludes(html, "Signup");
});

Deno.test("Navbar - null sections", () => {
  const html = renderToString(Navbar({
    start: null,
    center: null,
    end: null,
    children: "Fallback for null sections",
  }));
  assertEquals(html.includes("navbar-start"), false);
  assertEquals(html.includes("navbar-center"), false);
  assertEquals(html.includes("navbar-end"), false);
  assertStringIncludes(html, "flex-1");
  assertStringIncludes(html, "Fallback for null sections");
});

Deno.test("Navbar - undefined sections", () => {
  const html = renderToString(Navbar({
    start: undefined,
    center: undefined,
    end: undefined,
    children: "Fallback for undefined sections",
  }));
  assertEquals(html.includes("navbar-start"), false);
  assertEquals(html.includes("navbar-center"), false);
  assertEquals(html.includes("navbar-end"), false);
  assertStringIncludes(html, "flex-1");
  assertStringIncludes(html, "Fallback for undefined sections");
});

Deno.test("Navbar - whitespace sections", () => {
  const html = renderToString(Navbar({
    start: "   ",
    center: " ",
    end: "",
    children: "Fallback content",
  }));
  assertStringIncludes(html, "navbar-start");
  assertStringIncludes(html, "navbar-center");
  assertEquals(html.includes("navbar-end"), false);
  assertEquals(html.includes("flex-1"), false);
  assertEquals(html.includes("Fallback content"), false);
});

Deno.test("Navbar - default structure", () => {
  const html = renderToString(Navbar({
    children: "Default structure",
  }));
  assertStringIncludes(html, "navbar");
  assertStringIncludes(html, "bg-base-100");
  assertStringIncludes(html, "flex-1");
  assertStringIncludes(html, "Default structure");
});

Deno.test("Navbar - empty component", () => {
  const html = renderToString(Navbar({}));
  assertStringIncludes(html, "navbar");
  assertStringIncludes(html, "bg-base-100");
  assertEquals(html.includes("navbar-start"), false);
  assertEquals(html.includes("navbar-center"), false);
  assertEquals(html.includes("navbar-end"), false);
  assertEquals(html.includes("flex-1"), false);
});
