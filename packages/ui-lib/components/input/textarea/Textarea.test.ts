import { assertEquals, assertStringIncludes } from "@std/assert";
import { renderToString } from "preact-render-to-string";
import { Textarea } from "./Textarea.tsx";

Deno.test("Textarea - basic rendering", () => {
  const html = renderToString(Textarea({}));
  assertStringIncludes(html, "textarea");
  assertStringIncludes(html, "textarea-md");
  assertStringIncludes(html, "textarea-bordered");
  assertStringIncludes(html, "w-full");
  assertStringIncludes(html, 'rows="3"');
});

Deno.test("Textarea - with value", () => {
  const html = renderToString(Textarea({
    value: "Test textarea content",
  }));
  assertStringIncludes(html, ">Test textarea content</textarea>");
});

Deno.test("Textarea - with placeholder", () => {
  const html = renderToString(Textarea({
    placeholder: "Enter your message here...",
  }));
  assertStringIncludes(html, 'placeholder="Enter your message here..."');
});

Deno.test("Textarea - disabled state", () => {
  const html = renderToString(Textarea({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
});

Deno.test("Textarea - enabled state", () => {
  const html = renderToString(Textarea({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
});

Deno.test("Textarea - custom rows", () => {
  const html = renderToString(Textarea({
    rows: 10,
  }));
  assertStringIncludes(html, 'rows="10"');
});

Deno.test("Textarea - without border", () => {
  const html = renderToString(Textarea({
    bordered: false,
  }));
  assertEquals(html.includes("textarea-bordered"), false);
});

Deno.test("Textarea - with border", () => {
  const html = renderToString(Textarea({
    bordered: true,
  }));
  assertStringIncludes(html, "textarea-bordered");
});

Deno.test("Textarea - ghost style", () => {
  const html = renderToString(Textarea({
    ghost: true,
  }));
  assertStringIncludes(html, "textarea-ghost");
});

Deno.test("Textarea - without ghost style", () => {
  const html = renderToString(Textarea({
    ghost: false,
  }));
  assertEquals(html.includes("textarea-ghost"), false);
});

Deno.test("Textarea - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Textarea({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    }));
    assertStringIncludes(html, `textarea-${size}`);
  });
});

Deno.test("Textarea - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(Textarea({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
    }));
    assertStringIncludes(html, `textarea-${color}`);
  });
});

Deno.test("Textarea - custom class", () => {
  const html = renderToString(Textarea({
    class: "custom-textarea-class",
  }));
  assertStringIncludes(html, "custom-textarea-class");
});

Deno.test("Textarea - with id", () => {
  const html = renderToString(Textarea({
    id: "test-textarea",
  }));
  assertStringIncludes(html, 'id="test-textarea"');
});

Deno.test("Textarea - all props combined", () => {
  const html = renderToString(Textarea({
    value: "Combined props test",
    placeholder: "Enter text",
    disabled: false,
    size: "lg",
    color: "success",
    rows: 5,
    bordered: true,
    ghost: false,
    class: "test-class",
    id: "full-textarea",
  }));
  assertStringIncludes(html, ">Combined props test</textarea>");
  assertStringIncludes(html, 'placeholder="Enter text"');
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "textarea-lg");
  assertStringIncludes(html, "textarea-success");
  assertStringIncludes(html, 'rows="5"');
  assertStringIncludes(html, "textarea-bordered");
  assertEquals(html.includes("textarea-ghost"), false);
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-textarea"');
});

Deno.test("Textarea - large primary textarea", () => {
  const html = renderToString(Textarea({
    size: "lg",
    color: "primary",
    placeholder: "Large primary textarea",
  }));
  assertStringIncludes(html, "textarea-lg");
  assertStringIncludes(html, "textarea-primary");
  assertStringIncludes(html, 'placeholder="Large primary textarea"');
});

Deno.test("Textarea - small secondary textarea", () => {
  const html = renderToString(Textarea({
    size: "sm",
    color: "secondary",
    rows: 2,
  }));
  assertStringIncludes(html, "textarea-sm");
  assertStringIncludes(html, "textarea-secondary");
  assertStringIncludes(html, 'rows="2"');
});

Deno.test("Textarea - disabled with value", () => {
  const html = renderToString(Textarea({
    disabled: true,
    value: "Disabled content",
  }));
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, ">Disabled content</textarea>");
});

Deno.test("Textarea - ghost style with accent color", () => {
  const html = renderToString(Textarea({
    ghost: true,
    color: "accent",
    placeholder: "Ghost accent textarea",
  }));
  assertStringIncludes(html, "textarea-ghost");
  assertStringIncludes(html, "textarea-accent");
  assertStringIncludes(html, 'placeholder="Ghost accent textarea"');
});

Deno.test("Textarea - error color", () => {
  const html = renderToString(Textarea({
    color: "error",
    placeholder: "Error textarea",
  }));
  assertStringIncludes(html, "textarea-error");
  assertStringIncludes(html, 'placeholder="Error textarea"');
});

Deno.test("Textarea - warning color", () => {
  const html = renderToString(Textarea({
    color: "warning",
    placeholder: "Warning textarea",
  }));
  assertStringIncludes(html, "textarea-warning");
  assertStringIncludes(html, 'placeholder="Warning textarea"');
});

Deno.test("Textarea - info color", () => {
  const html = renderToString(Textarea({
    color: "info",
    placeholder: "Info textarea",
  }));
  assertStringIncludes(html, "textarea-info");
  assertStringIncludes(html, 'placeholder="Info textarea"');
});
