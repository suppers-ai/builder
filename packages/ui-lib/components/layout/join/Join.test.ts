import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Join } from "./Join.tsx";

Deno.test("Join - basic rendering", () => {
  const html = renderToString(Join({
    children: "Test content",
  }));
  assertStringIncludes(html, "join");
  assertStringIncludes(html, "join-vertical lg:join-horizontal");
  assertStringIncludes(html, "Test content");
});

Deno.test("Join - vertical layout", () => {
  const html = renderToString(Join({
    vertical: true,
    children: "Vertical content",
  }));
  assertStringIncludes(html, "join-vertical");
  assertStringIncludes(html, "Vertical content");
});

Deno.test("Join - horizontal layout", () => {
  const html = renderToString(Join({
    vertical: false,
    responsive: false, // Disable responsive to get pure horizontal
    children: "Horizontal content",
  }));
  assertEquals(html.includes("join-vertical"), false);
  assertStringIncludes(html, "Horizontal content");
});

Deno.test("Join - responsive enabled", () => {
  const html = renderToString(Join({
    responsive: true,
    children: "Responsive content",
  }));
  assertStringIncludes(html, "join-vertical lg:join-horizontal");
  assertStringIncludes(html, "Responsive content");
});

Deno.test("Join - responsive disabled", () => {
  const html = renderToString(Join({
    responsive: false,
    children: "Non-responsive content",
  }));
  assertEquals(html.includes("join-vertical lg:join-horizontal"), false);
  assertStringIncludes(html, "Non-responsive content");
});

Deno.test("Join - vertical with responsive disabled", () => {
  const html = renderToString(Join({
    vertical: true,
    responsive: false,
    children: "Vertical non-responsive",
  }));
  assertStringIncludes(html, "join-vertical");
  assertEquals(html.includes("lg:join-horizontal"), false);
  assertStringIncludes(html, "Vertical non-responsive");
});

Deno.test("Join - custom className", () => {
  const html = renderToString(Join({
    className: "custom-join",
    children: "Custom content",
  }));
  assertStringIncludes(html, "custom-join");
  assertStringIncludes(html, "Custom content");
});

Deno.test("Join - with id", () => {
  const html = renderToString(Join({
    id: "test-join",
    children: "ID test",
  }));
  assertStringIncludes(html, 'id="test-join"');
  assertStringIncludes(html, "ID test");
});

Deno.test("Join - string children", () => {
  const html = renderToString(Join({
    children: "Simple string",
  }));
  assertStringIncludes(html, "join");
  assertStringIncludes(html, "Simple string");
});

Deno.test("Join - array children", () => {
  const html = renderToString(Join({
    children: ["Item 1", "Item 2", "Item 3"],
  }));
  assertStringIncludes(html, "join");
  assertStringIncludes(html, "Item 1");
  assertStringIncludes(html, "Item 2");
  assertStringIncludes(html, "Item 3");
});

Deno.test("Join - all props combined", () => {
  const html = renderToString(Join({
    vertical: true,
    responsive: false,
    className: "test-class",
    children: "Combined props",
  }));
  assertStringIncludes(html, "join-vertical");
  assertEquals(html.includes("lg:join-horizontal"), false);
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, "Combined props");
});

Deno.test("Join - default values", () => {
  const html = renderToString(Join({
    children: "Default values",
  }));
  // Check defaults: vertical=false, responsive=true
  // responsive=true adds "join-vertical lg:join-horizontal"
  assertStringIncludes(html, "join-vertical lg:join-horizontal");
  assertStringIncludes(html, "Default values");
});

Deno.test("Join - empty children", () => {
  const html = renderToString(Join({
    children: "",
  }));
  assertStringIncludes(html, "join");
});

Deno.test("Join - null children", () => {
  const html = renderToString(Join({
    children: null,
  }));
  assertStringIncludes(html, "join");
});

Deno.test("Join - boolean props false", () => {
  const html = renderToString(Join({
    vertical: false,
    responsive: false,
    children: "All false",
  }));
  assertEquals(html.includes("join-vertical"), false);
  assertEquals(html.includes("lg:join-horizontal"), false);
  assertStringIncludes(html, "join");
  assertStringIncludes(html, "All false");
});

Deno.test("Join - boolean props true", () => {
  const html = renderToString(Join({
    vertical: true,
    responsive: true,
    children: "All true",
  }));
  assertStringIncludes(html, "join-vertical");
  assertStringIncludes(html, "lg:join-horizontal");
  assertStringIncludes(html, "All true");
});

Deno.test("Join - responsive only", () => {
  const html = renderToString(Join({
    vertical: false,
    responsive: true,
    children: "Responsive only",
  }));
  // responsive=true adds "join-vertical lg:join-horizontal" class
  assertStringIncludes(html, "join-vertical lg:join-horizontal");
  assertStringIncludes(html, "Responsive only");
});

Deno.test("Join - vertical only", () => {
  const html = renderToString(Join({
    vertical: true,
    responsive: false,
    children: "Vertical only",
  }));
  assertStringIncludes(html, "join-vertical");
  assertEquals(html.includes("lg:join-horizontal"), false);
  assertStringIncludes(html, "Vertical only");
});

Deno.test("Join - mixed content types", () => {
  const html = renderToString(Join({
    children: [
      "String",
      null,
      "Another string",
    ],
  }));
  assertStringIncludes(html, "join");
  assertStringIncludes(html, "String");
  assertStringIncludes(html, "Another string");
});

Deno.test("Join - class combination", () => {
  const html = renderToString(Join({
    vertical: true,
    responsive: true,
    className: "custom-class",
    children: "Class test",
  }));
  assertStringIncludes(html, "join");
  assertStringIncludes(html, "join-vertical");
  assertStringIncludes(html, "join-vertical lg:join-horizontal");
  assertStringIncludes(html, "custom-class");
  assertStringIncludes(html, "Class test");
});
