import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Indicator } from "./Indicator.tsx";

Deno.test("Indicator - basic rendering", () => {
  const html = renderToString(Indicator({
    content: "5",
    children: "Button",
  }));
  assertStringIncludes(html, "indicator");
  assertStringIncludes(html, "indicator-item");
  assertStringIncludes(html, "badge");
  assertStringIncludes(html, "badge-primary");
  assertStringIncludes(html, "indicator-top indicator-end");
  assertStringIncludes(html, "5");
  assertStringIncludes(html, "Button");
});

Deno.test("Indicator - position variants", () => {
  const positions = [
    "top-start",
    "top-center",
    "top-end",
    "middle-start",
    "middle-center",
    "middle-end",
    "bottom-start",
    "bottom-center",
    "bottom-end",
  ];

  const positionClasses = [
    "indicator-top indicator-start",
    "indicator-top indicator-center",
    "indicator-top indicator-end",
    "indicator-middle indicator-start",
    "indicator-middle indicator-center",
    "indicator-middle indicator-end",
    "indicator-bottom indicator-start",
    "indicator-bottom indicator-center",
    "indicator-bottom indicator-end",
  ];

  positions.forEach((position, index) => {
    const html = renderToString(Indicator({
      position: position as string,
      content: "Test",
      children: `Position ${position}`,
    }));
    assertStringIncludes(html, positionClasses[index]);
    assertStringIncludes(html, `Position ${position}`);
  });
});

Deno.test("Indicator - color variants", () => {
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
    const html = renderToString(Indicator({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
      content: "Test",
      children: `Color ${color}`,
    }));
    assertStringIncludes(html, `badge-${color}`);
    assertStringIncludes(html, `Color ${color}`);
  });
});

Deno.test("Indicator - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];
  const sizeClasses = ["badge-xs", "badge-sm", "", "badge-lg"];

  sizes.forEach((size, index) => {
    const html = renderToString(Indicator({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
      content: "Test",
      children: `Size ${size}`,
    }));
    if (sizeClasses[index]) {
      assertStringIncludes(html, sizeClasses[index]);
    }
    assertStringIncludes(html, `Size ${size}`);
  });
});

Deno.test("Indicator - variant types", () => {
  // Badge variant
  const badgeHtml = renderToString(Indicator({
    variant: "badge",
    content: "Badge",
    children: "Badge test",
  }));
  assertStringIncludes(badgeHtml, "badge");
  assertEquals(badgeHtml.includes("animate-"), false);
  assertStringIncludes(badgeHtml, "Badge");

  // Dot variant
  const dotHtml = renderToString(Indicator({
    variant: "dot",
    content: "Dot", // Should be ignored for dot variant
    children: "Dot test",
  }));
  assertStringIncludes(dotHtml, "w-3 h-3 p-0");
  // Check that the indicator span is empty (no content) for dot variant
  const indicatorSpanMatch = dotHtml.match(/<span[^>]*indicator-item[^>]*>([^<]*)<\/span>/);
  const indicatorContent = indicatorSpanMatch ? indicatorSpanMatch[1] : null;
  assertEquals(indicatorContent, ""); // Dot variant should have empty content

  // Ping variant
  const pingHtml = renderToString(Indicator({
    variant: "ping",
    content: "Ping",
    children: "Ping test",
  }));
  assertStringIncludes(pingHtml, "animate-ping");
  assertStringIncludes(pingHtml, "Ping");

  // Pulse variant
  const pulseHtml = renderToString(Indicator({
    variant: "pulse",
    content: "Pulse",
    children: "Pulse test",
  }));
  assertStringIncludes(pulseHtml, "animate-pulse");
  assertStringIncludes(pulseHtml, "Pulse");
});

Deno.test("Indicator - offset enabled", () => {
  const html = renderToString(Indicator({
    offset: true,
    content: "Offset",
    children: "Offset test",
  }));
  assertStringIncludes(html, "indicator-offset");
  assertStringIncludes(html, "Offset test");
});

Deno.test("Indicator - offset disabled", () => {
  const html = renderToString(Indicator({
    offset: false,
    content: "No offset",
    children: "No offset test",
  }));
  assertEquals(html.includes("indicator-offset"), false);
  assertStringIncludes(html, "No offset test");
});

Deno.test("Indicator - custom className", () => {
  const html = renderToString(Indicator({
    className: "custom-indicator",
    content: "Custom",
    children: "Custom test",
  }));
  assertStringIncludes(html, "custom-indicator");
  assertStringIncludes(html, "Custom test");
});

Deno.test("Indicator - numeric content", () => {
  const html = renderToString(Indicator({
    content: 42,
    children: "Numeric test",
  }));
  assertStringIncludes(html, "42");
  assertStringIncludes(html, "Numeric test");
});

Deno.test("Indicator - string content", () => {
  const html = renderToString(Indicator({
    content: "NEW",
    children: "String test",
  }));
  assertStringIncludes(html, "NEW");
  assertStringIncludes(html, "String test");
});

Deno.test("Indicator - no content", () => {
  const html = renderToString(Indicator({
    children: "No content test",
  }));
  assertStringIncludes(html, "indicator");
  assertStringIncludes(html, "No content test");
});

Deno.test("Indicator - all props combined", () => {
  const html = renderToString(Indicator({
    content: "99+",
    position: "bottom-start",
    color: "error",
    size: "lg",
    variant: "badge",
    offset: true,
    className: "test-class",
    children: "Combined props",
  }));
  assertStringIncludes(html, "indicator-bottom indicator-start");
  assertStringIncludes(html, "badge-error");
  assertStringIncludes(html, "badge-lg");
  assertStringIncludes(html, "badge");
  assertStringIncludes(html, "indicator-offset");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, "99+");
  assertStringIncludes(html, "Combined props");
});

Deno.test("Indicator - notification badge", () => {
  const html = renderToString(Indicator({
    content: "3",
    position: "top-end",
    color: "error",
    size: "sm",
    children: "Notification icon",
  }));
  assertStringIncludes(html, "indicator-top indicator-end");
  assertStringIncludes(html, "badge-error");
  assertStringIncludes(html, "badge-sm");
  assertStringIncludes(html, "3");
  assertStringIncludes(html, "Notification icon");
});

Deno.test("Indicator - online status dot", () => {
  const html = renderToString(Indicator({
    variant: "dot",
    position: "bottom-end",
    color: "success",
    children: "Avatar",
  }));
  assertStringIncludes(html, "w-3 h-3 p-0");
  assertStringIncludes(html, "indicator-bottom indicator-end");
  assertStringIncludes(html, "badge-success");
  assertStringIncludes(html, "Avatar");
});

Deno.test("Indicator - pulsing indicator", () => {
  const html = renderToString(Indicator({
    variant: "pulse",
    position: "top-start",
    color: "warning",
    content: "!",
    children: "Warning button",
  }));
  assertStringIncludes(html, "animate-pulse");
  assertStringIncludes(html, "indicator-top indicator-start");
  assertStringIncludes(html, "badge-warning");
  assertStringIncludes(html, "!");
  assertStringIncludes(html, "Warning button");
});

Deno.test("Indicator - with id", () => {
  const html = renderToString(Indicator({
    id: "test-indicator",
    content: "Test",
    children: "ID test",
  }));
  assertStringIncludes(html, 'id="test-indicator"');
  assertStringIncludes(html, "ID test");
});

Deno.test("Indicator - default values", () => {
  const html = renderToString(Indicator({
    content: "Default",
    children: "Default test",
  }));
  // Check defaults: top-end, primary, md, badge, no offset
  assertStringIncludes(html, "indicator-top indicator-end");
  assertStringIncludes(html, "badge-primary");
  assertStringIncludes(html, "badge");
  assertEquals(html.includes("badge-xs"), false);
  assertEquals(html.includes("badge-sm"), false);
  assertEquals(html.includes("badge-lg"), false);
  assertEquals(html.includes("indicator-offset"), false);
  assertStringIncludes(html, "Default");
  assertStringIncludes(html, "Default test");
});

Deno.test("Indicator - middle center position", () => {
  const html = renderToString(Indicator({
    position: "middle-center",
    content: "Center",
    children: "Center test",
  }));
  assertStringIncludes(html, "indicator-middle indicator-center");
  assertStringIncludes(html, "Center");
  assertStringIncludes(html, "Center test");
});

Deno.test("Indicator - complex children", () => {
  const html = renderToString(Indicator({
    content: "Badge",
    children: ["Button", "Text"],
  }));
  assertStringIncludes(html, "indicator");
  assertStringIncludes(html, "Badge");
  assertStringIncludes(html, "Button");
  assertStringIncludes(html, "Text");
});
