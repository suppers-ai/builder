import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { EmailInput } from "./EmailInput.tsx";

Deno.test("EmailInput - basic rendering", () => {
  const html = renderToString(EmailInput({}));
  assertStringIncludes(html, "input");
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-bordered");
  assertStringIncludes(html, 'type="email"');
  assertStringIncludes(html, 'placeholder="your@email.com"');
  assertStringIncludes(html, 'autocomplete="email"');
});

Deno.test("EmailInput - with value", () => {
  const html = renderToString(EmailInput({
    value: "test@example.com",
  }));
  assertStringIncludes(html, 'value="test@example.com"');
});

Deno.test("EmailInput - with custom placeholder", () => {
  const html = renderToString(EmailInput({
    placeholder: "Enter your email address",
  }));
  assertStringIncludes(html, 'placeholder="Enter your email address"');
});

Deno.test("EmailInput - with custom autoComplete", () => {
  const html = renderToString(EmailInput({
    autoComplete: "work-email",
  }));
  assertStringIncludes(html, 'autocomplete="work-email"');
});

Deno.test("EmailInput - disabled state", () => {
  const html = renderToString(EmailInput({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
  // Note: DaisyUI uses HTML disabled attribute, not input-disabled class
});

Deno.test("EmailInput - enabled state", () => {
  const html = renderToString(EmailInput({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
  assertEquals(html.includes("input-disabled"), false);
});

Deno.test("EmailInput - required state", () => {
  const html = renderToString(EmailInput({
    required: true,
  }));
  assertStringIncludes(html, "required");
});

Deno.test("EmailInput - not required state", () => {
  const html = renderToString(EmailInput({
    required: false,
  }));
  assertEquals(html.includes("required"), false);
});

Deno.test("EmailInput - without border", () => {
  const html = renderToString(EmailInput({
    bordered: false,
  }));
  assertEquals(html.includes("input-bordered"), false);
});

Deno.test("EmailInput - with border", () => {
  const html = renderToString(EmailInput({
    bordered: true,
  }));
  assertStringIncludes(html, "input-bordered");
});

Deno.test("EmailInput - ghost style", () => {
  const html = renderToString(EmailInput({
    ghost: true,
  }));
  assertStringIncludes(html, "input-ghost");
});

Deno.test("EmailInput - without ghost style", () => {
  const html = renderToString(EmailInput({
    ghost: false,
  }));
  assertEquals(html.includes("input-ghost"), false);
});

Deno.test("EmailInput - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(EmailInput({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    }));
    assertStringIncludes(html, `input-${size}`);
  });
});

Deno.test("EmailInput - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(EmailInput({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
    }));
    assertStringIncludes(html, `input-${color}`);
  });
});

Deno.test("EmailInput - custom class", () => {
  const html = renderToString(EmailInput({
    class: "custom-email-input",
  }));
  assertStringIncludes(html, "custom-email-input");
});

Deno.test("EmailInput - with id", () => {
  const html = renderToString(EmailInput({
    id: "test-email-input",
  }));
  assertStringIncludes(html, 'id="test-email-input"');
});

Deno.test("EmailInput - all props combined", () => {
  const html = renderToString(EmailInput({
    value: "user@company.com",
    placeholder: "Enter work email",
    size: "lg",
    color: "primary",
    disabled: false,
    bordered: true,
    ghost: false,
    required: true,
    autoComplete: "work-email",
    class: "test-class",
    id: "full-email-input",
  }));
  assertStringIncludes(html, 'value="user@company.com"');
  assertStringIncludes(html, 'placeholder="Enter work email"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-primary");
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "input-bordered");
  assertEquals(html.includes("input-ghost"), false);
  assertStringIncludes(html, "required");
  assertStringIncludes(html, 'autocomplete="work-email"');
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-email-input"');
});

Deno.test("EmailInput - work email", () => {
  const html = renderToString(EmailInput({
    placeholder: "Work email",
    autoComplete: "work-email",
    color: "success",
    required: true,
  }));
  assertStringIncludes(html, 'placeholder="Work email"');
  assertStringIncludes(html, 'autocomplete="work-email"');
  assertStringIncludes(html, "input-success");
  assertStringIncludes(html, "required");
});

Deno.test("EmailInput - personal email", () => {
  const html = renderToString(EmailInput({
    value: "john.doe@gmail.com",
    size: "lg",
    color: "info",
    autoComplete: "personal-email",
  }));
  assertStringIncludes(html, 'value="john.doe@gmail.com"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-info");
  assertStringIncludes(html, 'autocomplete="personal-email"');
});

Deno.test("EmailInput - disabled with value", () => {
  const html = renderToString(EmailInput({
    value: "readonly@example.com",
    disabled: true,
  }));
  assertStringIncludes(html, 'value="readonly@example.com"');
  assertStringIncludes(html, "disabled");
  // Note: DaisyUI uses HTML disabled attribute, not input-disabled class
});

Deno.test("EmailInput - ghost style with accent color", () => {
  const html = renderToString(EmailInput({
    ghost: true,
    color: "accent",
    placeholder: "Ghost accent email",
  }));
  assertStringIncludes(html, "input-ghost");
  assertStringIncludes(html, "input-accent");
  assertStringIncludes(html, 'placeholder="Ghost accent email"');
});

Deno.test("EmailInput - error color", () => {
  const html = renderToString(EmailInput({
    color: "error",
    placeholder: "Error email input",
  }));
  assertStringIncludes(html, "input-error");
  assertStringIncludes(html, 'placeholder="Error email input"');
});

Deno.test("EmailInput - warning color", () => {
  const html = renderToString(EmailInput({
    color: "warning",
    placeholder: "Warning email input",
  }));
  assertStringIncludes(html, "input-warning");
  assertStringIncludes(html, 'placeholder="Warning email input"');
});

Deno.test("EmailInput - registration form", () => {
  const html = renderToString(EmailInput({
    placeholder: "Enter your email to register",
    size: "lg",
    color: "primary",
    required: true,
    autoComplete: "email",
  }));
  assertStringIncludes(html, 'placeholder="Enter your email to register"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-primary");
  assertStringIncludes(html, "required");
  assertStringIncludes(html, 'autocomplete="email"');
});
