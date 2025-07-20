import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { Skeleton } from "./Skeleton.tsx";

Deno.test("Skeleton - basic rendering", () => {
  const html = renderToString(Skeleton({}));
  assertStringIncludes(html, "skeleton");
  assertStringIncludes(html, "rounded");
  assertStringIncludes(html, "animate-pulse");
});

Deno.test("Skeleton - default props", () => {
  const html = renderToString(Skeleton({}));
  assertStringIncludes(html, "skeleton");
  assertStringIncludes(html, "rounded");
  assertStringIncludes(html, "animate-pulse");
  assertEquals(html.includes("w-12 h-12 rounded-full"), false);
});

Deno.test("Skeleton - circle prop", () => {
  const html = renderToString(Skeleton({
    circle: true,
  }));
  assertStringIncludes(html, "w-12 h-12 rounded-full");
  assertEquals(html.includes("rounded") && !html.includes("rounded-full"), false);
});

Deno.test("Skeleton - rounded prop true", () => {
  const html = renderToString(Skeleton({
    rounded: true,
  }));
  assertStringIncludes(html, "rounded");
  assertEquals(html.includes("rounded-full"), false);
});

Deno.test("Skeleton - rounded prop false", () => {
  const html = renderToString(Skeleton({
    rounded: false,
  }));
  assertEquals(html.includes("rounded"), false);
});

Deno.test("Skeleton - circle overrides rounded", () => {
  const html = renderToString(Skeleton({
    circle: true,
    rounded: true,
  }));
  assertStringIncludes(html, "rounded-full");
  assertEquals(html.includes("rounded") && !html.includes("rounded-full"), false);
});

Deno.test("Skeleton - animation pulse", () => {
  const html = renderToString(Skeleton({
    animation: "pulse",
  }));
  assertStringIncludes(html, "animate-pulse");
});

Deno.test("Skeleton - animation wave", () => {
  const html = renderToString(Skeleton({
    animation: "wave",
  }));
  assertEquals(html.includes("animate-pulse"), false);
});

Deno.test("Skeleton - animation none", () => {
  const html = renderToString(Skeleton({
    animation: "none",
  }));
  assertEquals(html.includes("animate-pulse"), false);
});

Deno.test("Skeleton - width as number", () => {
  const html = renderToString(Skeleton({
    width: 200,
  }));
  assertStringIncludes(html, "width:200px");
});

Deno.test("Skeleton - width as string", () => {
  const html = renderToString(Skeleton({
    width: "100%",
  }));
  assertStringIncludes(html, "width:100%");
});

Deno.test("Skeleton - height as number", () => {
  const html = renderToString(Skeleton({
    height: 50,
  }));
  assertStringIncludes(html, "height:50px");
});

Deno.test("Skeleton - height as string", () => {
  const html = renderToString(Skeleton({
    height: "2rem",
  }));
  assertStringIncludes(html, "height:2rem");
});

Deno.test("Skeleton - width and height together", () => {
  const html = renderToString(Skeleton({
    width: 150,
    height: 100,
  }));
  assertStringIncludes(html, "width:150px");
  assertStringIncludes(html, "height:100px");
});

Deno.test("Skeleton - width ignored when circle", () => {
  const html = renderToString(Skeleton({
    circle: true,
    width: 200,
  }));
  assertEquals(html.includes("width:200px"), false);
  assertStringIncludes(html, "w-12 h-12 rounded-full");
});

Deno.test("Skeleton - height ignored when circle", () => {
  const html = renderToString(Skeleton({
    circle: true,
    height: 200,
  }));
  assertEquals(html.includes("height:200px"), false);
  assertStringIncludes(html, "w-12 h-12 rounded-full");
});

Deno.test("Skeleton - custom class", () => {
  const html = renderToString(Skeleton({
    class: "custom-skeleton-class",
  }));
  assertStringIncludes(html, "custom-skeleton-class");
});

Deno.test("Skeleton - with id", () => {
  const html = renderToString(Skeleton({
    id: "test-skeleton",
  }));
  assertStringIncludes(html, 'id="test-skeleton"');
});

Deno.test("Skeleton - rectangular with dimensions", () => {
  const html = renderToString(Skeleton({
    width: "300px",
    height: "20px",
    rounded: true,
    animation: "pulse",
  }));
  assertStringIncludes(html, "width:300px");
  assertStringIncludes(html, "height:20px");
  assertStringIncludes(html, "rounded");
  assertStringIncludes(html, "animate-pulse");
});

Deno.test("Skeleton - square with equal dimensions", () => {
  const html = renderToString(Skeleton({
    width: 100,
    height: 100,
    rounded: false,
    animation: "none",
  }));
  assertStringIncludes(html, "width:100px");
  assertStringIncludes(html, "height:100px");
  assertEquals(html.includes("rounded"), false);
  assertEquals(html.includes("animate-pulse"), false);
});

Deno.test("Skeleton - text line skeleton", () => {
  const html = renderToString(Skeleton({
    width: "80%",
    height: "1rem",
    rounded: true,
    animation: "pulse",
  }));
  assertStringIncludes(html, "width:80%");
  assertStringIncludes(html, "height:1rem");
  assertStringIncludes(html, "rounded");
  assertStringIncludes(html, "animate-pulse");
});

Deno.test("Skeleton - avatar skeleton", () => {
  const html = renderToString(Skeleton({
    circle: true,
    animation: "wave",
  }));
  assertStringIncludes(html, "w-12 h-12 rounded-full");
  assertEquals(html.includes("animate-pulse"), false);
});

Deno.test("Skeleton - card skeleton", () => {
  const html = renderToString(Skeleton({
    width: "100%",
    height: 200,
    rounded: true,
    animation: "pulse",
    class: "card-skeleton",
  }));
  assertStringIncludes(html, "width:100%");
  assertStringIncludes(html, "height:200px");
  assertStringIncludes(html, "rounded");
  assertStringIncludes(html, "animate-pulse");
  assertStringIncludes(html, "card-skeleton");
});

Deno.test("Skeleton - all props combined", () => {
  const html = renderToString(Skeleton({
    width: 250,
    height: 150,
    rounded: true,
    animation: "pulse",
    class: "test-class",
    id: "test-skeleton",
  }));
  assertStringIncludes(html, "width:250px");
  assertStringIncludes(html, "height:150px");
  assertStringIncludes(html, "rounded");
  assertStringIncludes(html, "animate-pulse");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="test-skeleton"');
});

Deno.test("Skeleton - circle with custom class", () => {
  const html = renderToString(Skeleton({
    circle: true,
    animation: "none",
    class: "avatar-skeleton",
    id: "user-avatar",
  }));
  assertStringIncludes(html, "w-12 h-12 rounded-full");
  assertEquals(html.includes("animate-pulse"), false);
  assertStringIncludes(html, "avatar-skeleton");
  assertStringIncludes(html, 'id="user-avatar"');
});

Deno.test("Skeleton - mixed string and number dimensions", () => {
  const html = renderToString(Skeleton({
    width: "50%",
    height: 40,
    rounded: false,
    animation: "wave",
  }));
  assertStringIncludes(html, "width:50%");
  assertStringIncludes(html, "height:40px");
  assertEquals(html.includes("rounded"), false);
  assertEquals(html.includes("animate-pulse"), false);
});

Deno.test("Skeleton - extra props passthrough", () => {
  const html = renderToString(Skeleton({
    width: 100,
    ...{ "data-testid": "skeleton-loader", title: "Loading content", role: "status" },
  }));
  assertStringIncludes(html, 'data-testid="skeleton-loader"');
  assertStringIncludes(html, 'title="Loading content"');
  assertStringIncludes(html, 'role="status"');
});
