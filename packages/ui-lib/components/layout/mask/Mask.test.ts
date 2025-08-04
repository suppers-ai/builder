import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Mask } from "./Mask.tsx";

Deno.test("Mask - basic rendering", () => {
  const html = renderToString(Mask({
    children: "Test content",
  }));
  assertStringIncludes(html, "mask");
  assertStringIncludes(html, "mask-squircle");
  assertStringIncludes(html, "Test content");
});

Deno.test("Mask - variant shapes", () => {
  const variants = [
    "squircle",
    "heart",
    "hexagon",
    "hexagon-2",
    "decagon",
    "pentagon",
    "diamond",
    "square",
    "circle",
    "parallelogram",
    "parallelogram-2",
    "parallelogram-3",
    "parallelogram-4",
    "star",
    "star-2",
    "triangle",
    "triangle-2",
    "triangle-3",
    "triangle-4",
  ];

  variants.forEach((variant) => {
    const html = renderToString(Mask({
      variant: variant as string,
      children: `${variant} content`,
    }));
    assertStringIncludes(html, `mask-${variant}`);
    assertStringIncludes(html, `${variant} content`);
  });
});

Deno.test("Mask - size variants", () => {
  const sizes = ["half", "full"];

  sizes.forEach((size) => {
    const html = renderToString(Mask({
      size: size as "xs" | "sm" | "md" | "lg" | "xl",
      children: `Size ${size}`,
    }));
    assertStringIncludes(html, `mask-${size}`);
    assertStringIncludes(html, `Size ${size}`);
  });
});

Deno.test("Mask - without size", () => {
  const html = renderToString(Mask({
    children: "No size",
  }));
  assertStringIncludes(html, "mask");
  assertStringIncludes(html, "mask-squircle");
  assertEquals(html.includes("mask-half"), false);
  assertEquals(html.includes("mask-full"), false);
  assertStringIncludes(html, "No size");
});

Deno.test("Mask - custom className", () => {
  const html = renderToString(Mask({
    className: "custom-mask",
    children: "Custom content",
  }));
  assertStringIncludes(html, "custom-mask");
  assertStringIncludes(html, "Custom content");
});

Deno.test("Mask - heart variant", () => {
  const html = renderToString(Mask({
    variant: "heart",
    children: "Heart shape",
  }));
  assertStringIncludes(html, "mask-heart");
  assertStringIncludes(html, "Heart shape");
});

Deno.test("Mask - circle variant with full size", () => {
  const html = renderToString(Mask({
    variant: "circle",
    size: "full",
    children: "Full circle",
  }));
  assertStringIncludes(html, "mask-circle");
  assertStringIncludes(html, "mask-full");
  assertStringIncludes(html, "Full circle");
});

Deno.test("Mask - square variant with half size", () => {
  const html = renderToString(Mask({
    variant: "square",
    size: "half",
    children: "Half square",
  }));
  assertStringIncludes(html, "mask-square");
  assertStringIncludes(html, "mask-half");
  assertStringIncludes(html, "Half square");
});

Deno.test("Mask - diamond variant", () => {
  const html = renderToString(Mask({
    variant: "diamond",
    children: "Diamond shape",
  }));
  assertStringIncludes(html, "mask-diamond");
  assertStringIncludes(html, "Diamond shape");
});

Deno.test("Mask - star variants", () => {
  const starVariants = ["star", "star-2"];

  starVariants.forEach((variant) => {
    const html = renderToString(Mask({
      variant: variant as string,
      children: `${variant} content`,
    }));
    assertStringIncludes(html, `mask-${variant}`);
    assertStringIncludes(html, `${variant} content`);
  });
});

Deno.test("Mask - triangle variants", () => {
  const triangleVariants = ["triangle", "triangle-2", "triangle-3", "triangle-4"];

  triangleVariants.forEach((variant) => {
    const html = renderToString(Mask({
      variant: variant as string,
      children: `${variant} content`,
    }));
    assertStringIncludes(html, `mask-${variant}`);
    assertStringIncludes(html, `${variant} content`);
  });
});

Deno.test("Mask - parallelogram variants", () => {
  const parallelogramVariants = [
    "parallelogram",
    "parallelogram-2",
    "parallelogram-3",
    "parallelogram-4",
  ];

  parallelogramVariants.forEach((variant) => {
    const html = renderToString(Mask({
      variant: variant as string,
      children: `${variant} content`,
    }));
    assertStringIncludes(html, `mask-${variant}`);
    assertStringIncludes(html, `${variant} content`);
  });
});

Deno.test("Mask - hexagon variants", () => {
  const hexagonVariants = ["hexagon", "hexagon-2"];

  hexagonVariants.forEach((variant) => {
    const html = renderToString(Mask({
      variant: variant as string,
      children: `${variant} content`,
    }));
    assertStringIncludes(html, `mask-${variant}`);
    assertStringIncludes(html, `${variant} content`);
  });
});

Deno.test("Mask - pentagon variant", () => {
  const html = renderToString(Mask({
    variant: "pentagon",
    children: "Pentagon shape",
  }));
  assertStringIncludes(html, "mask-pentagon");
  assertStringIncludes(html, "Pentagon shape");
});

Deno.test("Mask - decagon variant", () => {
  const html = renderToString(Mask({
    variant: "decagon",
    children: "Decagon shape",
  }));
  assertStringIncludes(html, "mask-decagon");
  assertStringIncludes(html, "Decagon shape");
});

Deno.test("Mask - all props combined", () => {
  const html = renderToString(Mask({
    variant: "heart",
    size: "full",
    className: "test-class",
    children: "Combined props",
  }));
  assertStringIncludes(html, "mask-heart");
  assertStringIncludes(html, "mask-full");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, "Combined props");
});

Deno.test("Mask - with id", () => {
  const html = renderToString(Mask({
    id: "test-mask",
    children: "ID test",
  }));
  assertStringIncludes(html, 'id="test-mask"');
  assertStringIncludes(html, "ID test");
});

Deno.test("Mask - complex children", () => {
  const html = renderToString(Mask({
    children: ["Multiple", "Children"],
  }));
  assertStringIncludes(html, "mask");
  assertStringIncludes(html, "Multiple");
  assertStringIncludes(html, "Children");
});

Deno.test("Mask - default variant", () => {
  const html = renderToString(Mask({
    children: "Default variant",
  }));
  assertStringIncludes(html, "mask-squircle");
  assertStringIncludes(html, "Default variant");
});

Deno.test("Mask - empty children", () => {
  const html = renderToString(Mask({
    children: "",
  }));
  assertStringIncludes(html, "mask");
  assertStringIncludes(html, "mask-squircle");
});
