import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { renderToString } from "preact-render-to-string";
import { PasswordInput } from "./PasswordInput.tsx";

// Note: This component uses hooks, which means it's interactive and should ideally be an Island component
// For now, we test only the initial render state

Deno.test("PasswordInput - basic rendering", () => {
  const html = renderToString(PasswordInput({}));
  assertStringIncludes(html, "input");
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-bordered");
  assertStringIncludes(html, 'type="password"');
  assertStringIncludes(html, 'placeholder="••••••••"');
  assertStringIncludes(html, 'autocomplete="current-password"');
  assertStringIncludes(html, "relative");
  assertStringIncludes(html, "pr-12"); // toggle button padding
});

Deno.test("PasswordInput - with value", () => {
  const html = renderToString(PasswordInput({
    value: "secret123",
  }));
  assertStringIncludes(html, 'value="secret123"');
});

Deno.test("PasswordInput - with custom placeholder", () => {
  const html = renderToString(PasswordInput({
    placeholder: "Enter your password",
  }));
  assertStringIncludes(html, 'placeholder="Enter your password"');
});

Deno.test("PasswordInput - with custom autoComplete", () => {
  const html = renderToString(PasswordInput({
    autoComplete: "new-password",
  }));
  assertStringIncludes(html, 'autocomplete="new-password"');
});

Deno.test("PasswordInput - disabled state", () => {
  const html = renderToString(PasswordInput({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "input-disabled");
});

Deno.test("PasswordInput - enabled state", () => {
  const html = renderToString(PasswordInput({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
  assertEquals(html.includes("input-disabled"), false);
});

Deno.test("PasswordInput - required state", () => {
  const html = renderToString(PasswordInput({
    required: true,
  }));
  assertStringIncludes(html, "required");
});

Deno.test("PasswordInput - not required state", () => {
  const html = renderToString(PasswordInput({
    required: false,
  }));
  assertEquals(html.includes("required"), false);
});

Deno.test("PasswordInput - without border", () => {
  const html = renderToString(PasswordInput({
    bordered: false,
  }));
  assertEquals(html.includes("input-bordered"), false);
});

Deno.test("PasswordInput - with border", () => {
  const html = renderToString(PasswordInput({
    bordered: true,
  }));
  assertStringIncludes(html, "input-bordered");
});

Deno.test("PasswordInput - ghost style", () => {
  const html = renderToString(PasswordInput({
    ghost: true,
  }));
  assertStringIncludes(html, "input-ghost");
});

Deno.test("PasswordInput - without ghost style", () => {
  const html = renderToString(PasswordInput({
    ghost: false,
  }));
  assertEquals(html.includes("input-ghost"), false);
});

Deno.test("PasswordInput - without toggle", () => {
  const html = renderToString(PasswordInput({
    showToggle: false,
  }));
  assertEquals(html.includes("pr-12"), false);
  assertEquals(html.includes("button"), false);
});

Deno.test("PasswordInput - with toggle", () => {
  const html = renderToString(PasswordInput({
    showToggle: true,
  }));
  assertStringIncludes(html, "pr-12");
  assertStringIncludes(html, "button");
  assertStringIncludes(html, "absolute right-3");
});

Deno.test("PasswordInput - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(PasswordInput({
      size: size as any,
    }));
    assertStringIncludes(html, `input-${size}`);
  });
});

Deno.test("PasswordInput - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(PasswordInput({
      color: color as any,
    }));
    assertStringIncludes(html, `input-${color}`);
  });
});

Deno.test("PasswordInput - custom class", () => {
  const html = renderToString(PasswordInput({
    class: "custom-password-input",
  }));
  assertStringIncludes(html, "custom-password-input");
});

Deno.test("PasswordInput - with id", () => {
  const html = renderToString(PasswordInput({
    id: "test-password-input",
  }));
  assertStringIncludes(html, 'id="test-password-input"');
});

Deno.test("PasswordInput - all props combined", () => {
  const html = renderToString(PasswordInput({
    value: "mypassword123",
    placeholder: "Enter secure password",
    size: "lg",
    color: "primary",
    disabled: false,
    bordered: true,
    ghost: false,
    required: true,
    autoComplete: "new-password",
    showToggle: true,
    class: "test-class",
    id: "full-password-input",
  }));
  assertStringIncludes(html, 'value="mypassword123"');
  assertStringIncludes(html, 'placeholder="Enter secure password"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-primary");
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "input-bordered");
  assertEquals(html.includes("input-ghost"), false);
  assertStringIncludes(html, "required");
  assertStringIncludes(html, 'autocomplete="new-password"');
  assertStringIncludes(html, "pr-12");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-password-input"');
});

Deno.test("PasswordInput - login form", () => {
  const html = renderToString(PasswordInput({
    placeholder: "Password",
    autoComplete: "current-password",
    color: "success",
    required: true,
  }));
  assertStringIncludes(html, 'placeholder="Password"');
  assertStringIncludes(html, 'autocomplete="current-password"');
  assertStringIncludes(html, "input-success");
  assertStringIncludes(html, "required");
});

Deno.test("PasswordInput - registration form", () => {
  const html = renderToString(PasswordInput({
    placeholder: "Create password",
    autoComplete: "new-password",
    color: "info",
    size: "lg",
    required: true,
  }));
  assertStringIncludes(html, 'placeholder="Create password"');
  assertStringIncludes(html, 'autocomplete="new-password"');
  assertStringIncludes(html, "input-info");
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "required");
});

Deno.test("PasswordInput - disabled with value", () => {
  const html = renderToString(PasswordInput({
    value: "readonly123",
    disabled: true,
  }));
  assertStringIncludes(html, 'value="readonly123"');
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "input-disabled");
});

Deno.test("PasswordInput - ghost style with accent color", () => {
  const html = renderToString(PasswordInput({
    ghost: true,
    color: "accent",
    placeholder: "Ghost accent password",
  }));
  assertStringIncludes(html, "input-ghost");
  assertStringIncludes(html, "input-accent");
  assertStringIncludes(html, 'placeholder="Ghost accent password"');
});

Deno.test("PasswordInput - error color", () => {
  const html = renderToString(PasswordInput({
    color: "error",
    placeholder: "Error password input",
  }));
  assertStringIncludes(html, "input-error");
  assertStringIncludes(html, 'placeholder="Error password input"');
});

Deno.test("PasswordInput - warning color", () => {
  const html = renderToString(PasswordInput({
    color: "warning",
    placeholder: "Warning password input",
  }));
  assertStringIncludes(html, "input-warning");
  assertStringIncludes(html, 'placeholder="Warning password input"');
});

Deno.test("PasswordInput - confirm password", () => {
  const html = renderToString(PasswordInput({
    placeholder: "Confirm password",
    autoComplete: "new-password",
    color: "primary",
    required: true,
  }));
  assertStringIncludes(html, 'placeholder="Confirm password"');
  assertStringIncludes(html, 'autocomplete="new-password"');
  assertStringIncludes(html, "input-primary");
  assertStringIncludes(html, "required");
});

Deno.test("PasswordInput - toggle button visibility", () => {
  const html = renderToString(PasswordInput({
    showToggle: true,
  }));
  assertStringIncludes(html, "button");
  assertStringIncludes(html, "absolute right-3");
  assertStringIncludes(html, "svg");
  assertStringIncludes(html, "w-5 h-5");
});
