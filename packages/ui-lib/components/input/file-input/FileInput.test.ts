import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { FileInput } from "./FileInput.tsx";

Deno.test("FileInput - basic rendering", () => {
  const html = renderToString(FileInput({}));
  assertStringIncludes(html, "file-input");
  assertStringIncludes(html, "file-input-bordered");
  assertStringIncludes(html, "w-full max-w-xs");
  assertStringIncludes(html, 'type="file"');
  assertEquals(html.includes("file-input-xs"), false);
  assertEquals(html.includes("file-input-sm"), false);
  assertEquals(html.includes("file-input-lg"), false);
});

Deno.test("FileInput - with accept", () => {
  const html = renderToString(FileInput({
    accept: "image/*",
  }));
  assertStringIncludes(html, 'accept="image/*"');
});

Deno.test("FileInput - multiple files", () => {
  const html = renderToString(FileInput({
    multiple: true,
  }));
  assertStringIncludes(html, "multiple");
});

Deno.test("FileInput - single file", () => {
  const html = renderToString(FileInput({
    multiple: false,
  }));
  assertEquals(html.includes("multiple"), false);
});

Deno.test("FileInput - disabled state", () => {
  const html = renderToString(FileInput({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "file-input-disabled");
});

Deno.test("FileInput - enabled state", () => {
  const html = renderToString(FileInput({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
  assertEquals(html.includes("file-input-disabled"), false);
});

Deno.test("FileInput - without border", () => {
  const html = renderToString(FileInput({
    bordered: false,
  }));
  assertEquals(html.includes("file-input-bordered"), false);
});

Deno.test("FileInput - with border", () => {
  const html = renderToString(FileInput({
    bordered: true,
  }));
  assertStringIncludes(html, "file-input-bordered");
});

Deno.test("FileInput - ghost style", () => {
  const html = renderToString(FileInput({
    ghost: true,
  }));
  assertStringIncludes(html, "file-input-ghost");
});

Deno.test("FileInput - without ghost style", () => {
  const html = renderToString(FileInput({
    ghost: false,
  }));
  assertEquals(html.includes("file-input-ghost"), false);
});

Deno.test("FileInput - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(FileInput({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    }));

    if (size === "xs") {
      assertStringIncludes(html, "file-input-xs");
    } else if (size === "sm") {
      assertStringIncludes(html, "file-input-sm");
    } else if (size === "lg") {
      assertStringIncludes(html, "file-input-lg");
    }
    // md is the default and doesn't have a specific class
  });
});

Deno.test("FileInput - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(FileInput({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
    }));
    assertStringIncludes(html, `file-input-${color}`);
  });
});

Deno.test("FileInput - custom class", () => {
  const html = renderToString(FileInput({
    class: "custom-file-input",
  }));
  assertStringIncludes(html, "custom-file-input");
});

Deno.test("FileInput - with id", () => {
  const html = renderToString(FileInput({
    id: "test-file-input",
  }));
  assertStringIncludes(html, 'id="test-file-input"');
});

Deno.test("FileInput - all props combined", () => {
  const html = renderToString(FileInput({
    accept: "image/jpeg,image/png",
    multiple: true,
    size: "lg",
    color: "primary",
    disabled: false,
    bordered: true,
    ghost: false,
    class: "test-class",
    id: "full-file-input",
  }));
  assertStringIncludes(html, 'accept="image/jpeg,image/png"');
  assertStringIncludes(html, "multiple");
  assertStringIncludes(html, "file-input-lg");
  assertStringIncludes(html, "file-input-primary");
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "file-input-bordered");
  assertEquals(html.includes("file-input-ghost"), false);
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-file-input"');
});

Deno.test("FileInput - image upload", () => {
  const html = renderToString(FileInput({
    accept: "image/*",
    multiple: true,
    color: "success",
    size: "lg",
  }));
  assertStringIncludes(html, 'accept="image/*"');
  assertStringIncludes(html, "multiple");
  assertStringIncludes(html, "file-input-success");
  assertStringIncludes(html, "file-input-lg");
});

Deno.test("FileInput - document upload", () => {
  const html = renderToString(FileInput({
    accept: ".pdf,.doc,.docx",
    multiple: false,
    color: "info",
  }));
  assertStringIncludes(html, 'accept=".pdf,.doc,.docx"');
  assertEquals(html.includes("multiple"), false);
  assertStringIncludes(html, "file-input-info");
});

Deno.test("FileInput - disabled with accept", () => {
  const html = renderToString(FileInput({
    accept: "video/*",
    disabled: true,
  }));
  assertStringIncludes(html, 'accept="video/*"');
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "file-input-disabled");
});

Deno.test("FileInput - ghost style with accent color", () => {
  const html = renderToString(FileInput({
    ghost: true,
    color: "accent",
    multiple: true,
  }));
  assertStringIncludes(html, "file-input-ghost");
  assertStringIncludes(html, "file-input-accent");
  assertStringIncludes(html, "multiple");
});

Deno.test("FileInput - error color", () => {
  const html = renderToString(FileInput({
    color: "error",
    accept: "text/*",
  }));
  assertStringIncludes(html, "file-input-error");
  assertStringIncludes(html, 'accept="text/*"');
});

Deno.test("FileInput - warning color", () => {
  const html = renderToString(FileInput({
    color: "warning",
    size: "sm",
  }));
  assertStringIncludes(html, "file-input-warning");
  assertStringIncludes(html, "file-input-sm");
});

Deno.test("FileInput - CSV upload", () => {
  const html = renderToString(FileInput({
    accept: ".csv",
    multiple: false,
    color: "primary",
    size: "md",
  }));
  assertStringIncludes(html, 'accept=".csv"');
  assertEquals(html.includes("multiple"), false);
  assertStringIncludes(html, "file-input-primary");
});

Deno.test("FileInput - avatar upload", () => {
  const html = renderToString(FileInput({
    accept: "image/jpeg,image/png",
    multiple: false,
    color: "secondary",
    size: "xs",
  }));
  assertStringIncludes(html, 'accept="image/jpeg,image/png"');
  assertEquals(html.includes("multiple"), false);
  assertStringIncludes(html, "file-input-secondary");
  assertStringIncludes(html, "file-input-xs");
});

Deno.test("FileInput - audio upload", () => {
  const html = renderToString(FileInput({
    accept: "audio/*",
    multiple: true,
    color: "accent",
    size: "lg",
  }));
  assertStringIncludes(html, 'accept="audio/*"');
  assertStringIncludes(html, "multiple");
  assertStringIncludes(html, "file-input-accent");
  assertStringIncludes(html, "file-input-lg");
});
