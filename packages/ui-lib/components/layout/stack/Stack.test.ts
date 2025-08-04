import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Stack } from "./Stack.tsx";

Deno.test("Stack - basic rendering", () => {
  const html = renderToString(Stack({
    children: "Test content",
  }));
  assertStringIncludes(html, "flex");
  assertStringIncludes(html, "flex-col");
  assertStringIncludes(html, "gap-4");
  assertStringIncludes(html, "items-start");
  assertStringIncludes(html, "justify-start");
  assertStringIncludes(html, "Test content");
});

Deno.test("Stack - direction variants", () => {
  // Vertical (default)
  const verticalHtml = renderToString(Stack({
    direction: "vertical",
    children: "Vertical content",
  }));
  assertStringIncludes(verticalHtml, "flex-col");
  assertEquals(verticalHtml.includes("flex-row"), false);

  // Horizontal
  const horizontalHtml = renderToString(Stack({
    direction: "horizontal",
    children: "Horizontal content",
  }));
  assertStringIncludes(horizontalHtml, "flex-row");
  assertEquals(horizontalHtml.includes("flex-col"), false);
});

Deno.test("Stack - gap variants", () => {
  const gaps = ["xs", "sm", "md", "lg", "xl"];
  const gapClasses = ["gap-1", "gap-2", "gap-4", "gap-6", "gap-8"];

  gaps.forEach((gap, index) => {
    const html = renderToString(Stack({
      gap: gap as string,
      children: `Gap ${gap}`,
    }));
    assertStringIncludes(html, gapClasses[index]);
    assertStringIncludes(html, `Gap ${gap}`);
  });
});

Deno.test("Stack - align variants", () => {
  const alignments = ["start", "center", "end", "stretch"];
  const alignClasses = ["items-start", "items-center", "items-end", "items-stretch"];

  alignments.forEach((align, index) => {
    const html = renderToString(Stack({
      align: align as string,
      children: `Align ${align}`,
    }));
    assertStringIncludes(html, alignClasses[index]);
    assertStringIncludes(html, `Align ${align}`);
  });
});

Deno.test("Stack - justify variants", () => {
  const justifications = ["start", "center", "end", "between", "around", "evenly"];
  const justifyClasses = [
    "justify-start",
    "justify-center",
    "justify-end",
    "justify-between",
    "justify-around",
    "justify-evenly",
  ];

  justifications.forEach((justify, index) => {
    const html = renderToString(Stack({
      justify: justify as string,
      children: `Justify ${justify}`,
    }));
    assertStringIncludes(html, justifyClasses[index]);
    assertStringIncludes(html, `Justify ${justify}`);
  });
});

Deno.test("Stack - wrap enabled", () => {
  const html = renderToString(Stack({
    wrap: true,
    children: "Wrapped content",
  }));
  assertStringIncludes(html, "flex-wrap");
  assertStringIncludes(html, "Wrapped content");
});

Deno.test("Stack - wrap disabled", () => {
  const html = renderToString(Stack({
    wrap: false,
    children: "No wrap content",
  }));
  assertEquals(html.includes("flex-wrap"), false);
  assertStringIncludes(html, "No wrap content");
});

Deno.test("Stack - custom class", () => {
  const html = renderToString(Stack({
    class: "custom-stack",
    children: "Custom content",
  }));
  assertStringIncludes(html, "custom-stack");
  assertStringIncludes(html, "Custom content");
});

Deno.test("Stack - all props combined", () => {
  const html = renderToString(Stack({
    direction: "horizontal",
    gap: "lg",
    align: "center",
    justify: "between",
    wrap: true,
    class: "test-class",
    children: "Combined props",
  }));
  assertStringIncludes(html, "flex-row");
  assertStringIncludes(html, "gap-6");
  assertStringIncludes(html, "items-center");
  assertStringIncludes(html, "justify-between");
  assertStringIncludes(html, "flex-wrap");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, "Combined props");
});

Deno.test("Stack - vertical with center alignment", () => {
  const html = renderToString(Stack({
    direction: "vertical",
    align: "center",
    justify: "center",
    children: "Centered vertical",
  }));
  assertStringIncludes(html, "flex-col");
  assertStringIncludes(html, "items-center");
  assertStringIncludes(html, "justify-center");
  assertStringIncludes(html, "Centered vertical");
});

Deno.test("Stack - horizontal with end alignment", () => {
  const html = renderToString(Stack({
    direction: "horizontal",
    align: "end",
    justify: "end",
    children: "End aligned horizontal",
  }));
  assertStringIncludes(html, "flex-row");
  assertStringIncludes(html, "items-end");
  assertStringIncludes(html, "justify-end");
  assertStringIncludes(html, "End aligned horizontal");
});

Deno.test("Stack - stretch alignment", () => {
  const html = renderToString(Stack({
    align: "stretch",
    children: "Stretched content",
  }));
  assertStringIncludes(html, "items-stretch");
  assertStringIncludes(html, "Stretched content");
});

Deno.test("Stack - small gap with wrap", () => {
  const html = renderToString(Stack({
    gap: "xs",
    wrap: true,
    children: "Small gap wrapped",
  }));
  assertStringIncludes(html, "gap-1");
  assertStringIncludes(html, "flex-wrap");
  assertStringIncludes(html, "Small gap wrapped");
});

Deno.test("Stack - large gap horizontal", () => {
  const html = renderToString(Stack({
    direction: "horizontal",
    gap: "xl",
    children: "Large gap horizontal",
  }));
  assertStringIncludes(html, "flex-row");
  assertStringIncludes(html, "gap-8");
  assertStringIncludes(html, "Large gap horizontal");
});

Deno.test("Stack - justify around with center align", () => {
  const html = renderToString(Stack({
    align: "center",
    justify: "around",
    children: "Around justified",
  }));
  assertStringIncludes(html, "items-center");
  assertStringIncludes(html, "justify-around");
  assertStringIncludes(html, "Around justified");
});

Deno.test("Stack - justify evenly", () => {
  const html = renderToString(Stack({
    justify: "evenly",
    children: "Evenly justified",
  }));
  assertStringIncludes(html, "justify-evenly");
  assertStringIncludes(html, "Evenly justified");
});

Deno.test("Stack - with id", () => {
  const html = renderToString(Stack({
    id: "test-stack",
    children: "ID test",
  }));
  assertStringIncludes(html, 'id="test-stack"');
  assertStringIncludes(html, "ID test");
});

Deno.test("Stack - complex children", () => {
  const html = renderToString(Stack({
    children: ["Item 1", "Item 2"],
  }));
  assertStringIncludes(html, "flex");
  assertStringIncludes(html, "Item 1");
  assertStringIncludes(html, "Item 2");
});

Deno.test("Stack - default values", () => {
  const html = renderToString(Stack({
    children: "Default values",
  }));
  // Check defaults: vertical, gap-md, align-start, justify-start, no wrap
  assertStringIncludes(html, "flex-col");
  assertStringIncludes(html, "gap-4");
  assertStringIncludes(html, "items-start");
  assertStringIncludes(html, "justify-start");
  assertEquals(html.includes("flex-wrap"), false);
  assertStringIncludes(html, "Default values");
});

Deno.test("Stack - medium gap vertical", () => {
  const html = renderToString(Stack({
    direction: "vertical",
    gap: "md",
    children: "Medium gap vertical",
  }));
  assertStringIncludes(html, "flex-col");
  assertStringIncludes(html, "gap-4");
  assertStringIncludes(html, "Medium gap vertical");
});
