import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { RadialProgress } from "./RadialProgress.tsx";

Deno.test("RadialProgress - basic rendering", () => {
  const html = renderToString(RadialProgress({
    value: 50,
  }));
  assertStringIncludes(html, "radial-progress");
  assertStringIncludes(html, "text-primary");
  assertStringIncludes(html, "50%");
  assertStringIncludes(html, 'role="progressbar"');
  assertStringIncludes(html, 'aria-valuenow="50"');
  assertStringIncludes(html, 'aria-valuemin="0"');
  assertStringIncludes(html, 'aria-valuemax="100"');
});

Deno.test("RadialProgress - default props", () => {
  const html = renderToString(RadialProgress({}));
  assertStringIncludes(html, "radial-progress");
  assertStringIncludes(html, "text-primary");
  assertStringIncludes(html, "w-16 h-16");
  assertStringIncludes(html, "0%");
  assertStringIncludes(html, 'aria-valuenow="0"');
  assertStringIncludes(html, 'aria-valuemax="100"');
});

Deno.test("RadialProgress - value prop", () => {
  const html = renderToString(RadialProgress({
    value: 75,
  }));
  assertStringIncludes(html, "75%");
  assertStringIncludes(html, 'aria-valuenow="75"');
});

Deno.test("RadialProgress - max prop", () => {
  const html = renderToString(RadialProgress({
    value: 150,
    max: 200,
  }));
  assertStringIncludes(html, "75%"); // 150/200 * 100 = 75%
  assertStringIncludes(html, 'aria-valuenow="150"');
  assertStringIncludes(html, 'aria-valuemax="200"');
});

Deno.test("RadialProgress - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const expectedClasses = ["w-8 h-8", "w-12 h-12", "w-16 h-16", "w-20 h-20", "w-24 h-24"];

  sizes.forEach((size, index) => {
    const html = renderToString(RadialProgress({
      size,
      value: 50,
    }));
    assertStringIncludes(html, expectedClasses[index]);
  });
});

Deno.test("RadialProgress - color variants", () => {
  const colors = ["primary", "secondary", "accent", "info", "success", "warning", "error"] as const;

  colors.forEach((color) => {
    const html = renderToString(RadialProgress({
      color,
      value: 50,
    }));
    assertStringIncludes(html, `text-${color}`);
  });
});

Deno.test("RadialProgress - base color variants", () => {
  const baseColors = ["base-100", "base-200", "base-300"] as const;

  baseColors.forEach((color) => {
    const html = renderToString(RadialProgress({
      color,
      value: 50,
    }));
    assertStringIncludes(html, `text-${color}`);
  });
});

Deno.test("RadialProgress - neutral color", () => {
  const html = renderToString(RadialProgress({
    color: "neutral",
    value: 50,
  }));
  assertStringIncludes(html, "text-neutral");
});

Deno.test("RadialProgress - thickness prop", () => {
  const html = renderToString(RadialProgress({
    thickness: 8,
    value: 50,
  }));
  assertStringIncludes(html, "--size:8px");
});

Deno.test("RadialProgress - showValue true", () => {
  const html = renderToString(RadialProgress({
    showValue: true,
    value: 42,
  }));
  assertStringIncludes(html, "42%");
  assertStringIncludes(html, "font-bold");
});

Deno.test("RadialProgress - showValue false", () => {
  const html = renderToString(RadialProgress({
    showValue: false,
    value: 42,
  }));
  assertEquals(html.includes("42%"), false);
  assertEquals(html.includes("font-bold"), false);
});

Deno.test("RadialProgress - label prop", () => {
  const html = renderToString(RadialProgress({
    label: "Loading Progress",
    value: 60,
  }));
  assertStringIncludes(html, "Loading Progress");
  assertStringIncludes(html, "text-sm font-medium");
});

Deno.test("RadialProgress - without label", () => {
  const html = renderToString(RadialProgress({
    value: 60,
  }));
  assertEquals(html.includes("text-sm font-medium"), false);
});

Deno.test("RadialProgress - animatedValue prop", () => {
  const html = renderToString(RadialProgress({
    value: 50,
    animatedValue: 75,
  }));
  assertStringIncludes(html, "75%");
  assertStringIncludes(html, 'aria-valuenow="75"');
  assertStringIncludes(html, "--value:75");
});

Deno.test("RadialProgress - value normalization - below 0", () => {
  const html = renderToString(RadialProgress({
    value: -25,
  }));
  assertStringIncludes(html, "0%");
  assertStringIncludes(html, "--value:0");
});

Deno.test("RadialProgress - value normalization - above max", () => {
  const html = renderToString(RadialProgress({
    value: 150,
    max: 100,
  }));
  assertStringIncludes(html, "100%");
  assertStringIncludes(html, "--value:100");
});

Deno.test("RadialProgress - percentage calculation", () => {
  const html = renderToString(RadialProgress({
    value: 25,
    max: 50,
  }));
  assertStringIncludes(html, "50%"); // 25/50 * 100 = 50%
  assertStringIncludes(html, "--value:50");
});

Deno.test("RadialProgress - custom class", () => {
  const html = renderToString(RadialProgress({
    class: "custom-progress-class",
    value: 50,
  }));
  assertStringIncludes(html, "custom-progress-class");
});

Deno.test("RadialProgress - with id", () => {
  const html = renderToString(RadialProgress({
    id: "test-progress",
    value: 50,
  }));
  assertStringIncludes(html, 'id="test-progress"');
});

Deno.test("RadialProgress - decimal values", () => {
  const html = renderToString(RadialProgress({
    value: 33.33,
  }));
  assertStringIncludes(html, "33%"); // Should round to 33%
  assertStringIncludes(html, "--value:33.33");
});

Deno.test("RadialProgress - zero value", () => {
  const html = renderToString(RadialProgress({
    value: 0,
  }));
  assertStringIncludes(html, "0%");
  assertStringIncludes(html, 'aria-valuenow="0"');
  assertStringIncludes(html, "--value:0");
});

Deno.test("RadialProgress - max value", () => {
  const html = renderToString(RadialProgress({
    value: 100,
  }));
  assertStringIncludes(html, "100%");
  assertStringIncludes(html, 'aria-valuenow="100"');
  assertStringIncludes(html, "--value:100");
});

Deno.test("RadialProgress - all props combined", () => {
  const html = renderToString(RadialProgress({
    value: 80,
    max: 100,
    size: "lg",
    color: "success",
    thickness: 6,
    showValue: true,
    label: "Upload Progress",
    class: "test-class",
    id: "upload-progress",
  }));
  assertStringIncludes(html, "80%");
  assertStringIncludes(html, "w-20 h-20");
  assertStringIncludes(html, "text-success");
  assertStringIncludes(html, "--size:6px");
  assertStringIncludes(html, "Upload Progress");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="upload-progress"');
  assertStringIncludes(html, 'aria-valuenow="80"');
  assertStringIncludes(html, 'aria-valuemax="100"');
});

Deno.test("RadialProgress - controlled mode with animatedValue", () => {
  const html = renderToString(RadialProgress({
    value: 30,
    animatedValue: 90,
    max: 100,
    showValue: true,
    label: "Animation Progress",
  }));
  assertStringIncludes(html, "90%"); // Should use animatedValue
  assertStringIncludes(html, 'aria-valuenow="90"');
  assertStringIncludes(html, "--value:90");
  assertStringIncludes(html, "Animation Progress");
});

Deno.test("RadialProgress - custom max with label", () => {
  const html = renderToString(RadialProgress({
    value: 3,
    max: 5,
    label: "Tasks Completed",
    size: "xl",
    color: "accent",
  }));
  assertStringIncludes(html, "60%"); // 3/5 * 100 = 60%
  assertStringIncludes(html, "Tasks Completed");
  assertStringIncludes(html, "w-24 h-24");
  assertStringIncludes(html, "text-accent");
  assertStringIncludes(html, 'aria-valuemax="5"');
});

Deno.test("RadialProgress - extra props passthrough", () => {
  const html = renderToString(RadialProgress({
    value: 50,
    ...{ "data-testid": "progress-bar", title: "Progress indicator" },
  }));
  assertStringIncludes(html, 'data-testid="progress-bar"');
  assertStringIncludes(html, 'title="Progress indicator"');
});
