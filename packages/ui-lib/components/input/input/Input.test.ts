import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { Input } from "./Input.tsx";

Deno.test("Input - basic rendering", () => {
  const html = renderToString(Input({}));
  assertStringIncludes(html, "input");
  assertStringIncludes(html, "input-md");
  assertStringIncludes(html, "input-bordered");
  assertStringIncludes(html, 'type="text"');
});

Deno.test("Input - text type (default)", () => {
  const html = renderToString(Input({}));
  assertStringIncludes(html, 'type="text"');
});

Deno.test("Input - email type", () => {
  const html = renderToString(Input({
    type: "email",
  }));
  assertStringIncludes(html, 'type="email"');
});

Deno.test("Input - password type", () => {
  const html = renderToString(Input({
    type: "password",
  }));
  assertStringIncludes(html, 'type="password"');
});

Deno.test("Input - number type", () => {
  const html = renderToString(Input({
    type: "number",
  }));
  assertStringIncludes(html, 'type="number"');
});

Deno.test("Input - with placeholder", () => {
  const html = renderToString(Input({
    placeholder: "Enter your name",
  }));
  assertStringIncludes(html, 'placeholder="Enter your name"');
});

Deno.test("Input - with value", () => {
  const html = renderToString(Input({
    value: "Test value",
  }));
  assertStringIncludes(html, 'value="Test value"');
});

Deno.test("Input - disabled", () => {
  const html = renderToString(Input({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
});

Deno.test("Input - enabled (default)", () => {
  const html = renderToString(Input({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
});

Deno.test("Input - bordered (default)", () => {
  const html = renderToString(Input({}));
  assertStringIncludes(html, "input-bordered");
});

Deno.test("Input - not bordered", () => {
  const html = renderToString(Input({
    bordered: false,
  }));
  assertEquals(html.includes("input-bordered"), false);
});

Deno.test("Input - ghost variant", () => {
  const html = renderToString(Input({
    ghost: true,
  }));
  assertStringIncludes(html, "input-ghost");
});

Deno.test("Input - not ghost (default)", () => {
  const html = renderToString(Input({
    ghost: false,
  }));
  assertEquals(html.includes("input-ghost"), false);
});

Deno.test("Input - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Input({
      size: size as any,
    }));
    assertStringIncludes(html, `input-${size}`);
  });
});

Deno.test("Input - color variants", () => {
  const colors = ["primary", "secondary", "accent", "info", "success", "warning", "error"];

  colors.forEach((color) => {
    const html = renderToString(Input({
      color: color as any,
    }));
    assertStringIncludes(html, `input-${color}`);
  });
});

Deno.test("Input - without color", () => {
  const html = renderToString(Input({}));
  // Should not have any color class
  const hasColorClass = ["primary", "secondary", "accent", "info", "success", "warning", "error"]
    .some((color) => html.includes(`input-${color}`));
  assertEquals(hasColorClass, false);
});

Deno.test("Input - custom class", () => {
  const html = renderToString(Input({
    class: "custom-input-class",
  }));
  assertStringIncludes(html, "custom-input-class");
});

Deno.test("Input - with id", () => {
  const html = renderToString(Input({
    id: "test-input",
  }));
  assertStringIncludes(html, 'id="test-input"');
});

Deno.test("Input - all props combined", () => {
  const html = renderToString(Input({
    type: "email",
    placeholder: "Enter your email",
    value: "test@example.com",
    size: "lg",
    color: "primary",
    bordered: true,
    ghost: false,
    disabled: false,
    class: "test-class",
    id: "full-input",
  }));
  assertStringIncludes(html, 'type="email"');
  assertStringIncludes(html, 'placeholder="Enter your email"');
  assertStringIncludes(html, 'value="test@example.com"');
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-primary");
  assertStringIncludes(html, "input-bordered");
  assertEquals(html.includes("input-ghost"), false);
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-input"');
});

Deno.test("Input - email input with primary color", () => {
  const html = renderToString(Input({
    type: "email",
    color: "primary",
    placeholder: "email@example.com",
  }));
  assertStringIncludes(html, 'type="email"');
  assertStringIncludes(html, "input-primary");
  assertStringIncludes(html, 'placeholder="email@example.com"');
});

Deno.test("Input - password input with secondary color", () => {
  const html = renderToString(Input({
    type: "password",
    color: "secondary",
    placeholder: "Enter password",
  }));
  assertStringIncludes(html, 'type="password"');
  assertStringIncludes(html, "input-secondary");
  assertStringIncludes(html, 'placeholder="Enter password"');
});

Deno.test("Input - small ghost input", () => {
  const html = renderToString(Input({
    size: "sm",
    ghost: true,
    bordered: false,
  }));
  assertStringIncludes(html, "input-sm");
  assertStringIncludes(html, "input-ghost");
  assertEquals(html.includes("input-bordered"), false);
});

Deno.test("Input - large error input", () => {
  const html = renderToString(Input({
    size: "lg",
    color: "error",
    placeholder: "Invalid input",
  }));
  assertStringIncludes(html, "input-lg");
  assertStringIncludes(html, "input-error");
  assertStringIncludes(html, 'placeholder="Invalid input"');
});

Deno.test("Input - disabled with value", () => {
  const html = renderToString(Input({
    disabled: true,
    value: "Disabled value",
  }));
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, 'value="Disabled value"');
});

Deno.test("Input - number input", () => {
  const html = renderToString(Input({
    type: "number",
    placeholder: "Enter a number",
    value: "42",
  }));
  assertStringIncludes(html, 'type="number"');
  assertStringIncludes(html, 'placeholder="Enter a number"');
  assertStringIncludes(html, 'value="42"');
});

Deno.test("Input - search input", () => {
  const html = renderToString(Input({
    type: "search",
    placeholder: "Search...",
    color: "accent",
  }));
  assertStringIncludes(html, 'type="search"');
  assertStringIncludes(html, 'placeholder="Search..."');
  assertStringIncludes(html, "input-accent");
});

Deno.test("Input - tel input", () => {
  const html = renderToString(Input({
    type: "tel",
    placeholder: "+1 (555) 123-4567",
  }));
  assertStringIncludes(html, 'type="tel"');
  assertStringIncludes(html, 'placeholder="+1 (555) 123-4567"');
});

Deno.test("Input - url input", () => {
  const html = renderToString(Input({
    type: "url",
    placeholder: "https://example.com",
  }));
  assertStringIncludes(html, 'type="url"');
  assertStringIncludes(html, 'placeholder="https://example.com"');
});

// Snapshot tests
Deno.test("Input - HTML snapshot basic", async (t) => {
  const html = renderToString(Input({}));
  await assertSnapshot(t, html);
});

Deno.test("Input - HTML snapshot with all props", async (t) => {
  const html = renderToString(Input({
    type: "email",
    placeholder: "Enter your email address",
    value: "user@example.com",
    size: "lg",
    color: "primary",
    id: "email-input",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Input - HTML snapshot variants", async (t) => {
  const inputs = [
    Input({ type: "text", placeholder: "Text input", size: "sm" }),
    Input({ type: "email", placeholder: "Email input", color: "primary" }),
    Input({ type: "password", placeholder: "Password input", color: "secondary" }),
    Input({ type: "number", placeholder: "Number input", size: "lg" }),
    Input({ ghost: true, placeholder: "Ghost input" }),
    Input({ disabled: true, value: "Disabled input" }),
  ];

  const html = inputs.map((input) => renderToString(input)).join("\n");
  await assertSnapshot(t, html);
});

Deno.test("Input - HTML snapshot sizes", async (t) => {
  const sizes = ["xs", "sm", "md", "lg"];
  const htmls = sizes.map((size) =>
    renderToString(Input({
      size: size as any,
      placeholder: `Size ${size}`,
      color: "primary",
    }))
  );
  await assertSnapshot(t, htmls.join("\n"));
});

Deno.test("Input - HTML snapshot colors", async (t) => {
  const colors = ["primary", "secondary", "accent", "info", "success", "warning", "error"];
  const htmls = colors.map((color) =>
    renderToString(Input({
      color: color as any,
      placeholder: `Color ${color}`,
      size: "md",
    }))
  );
  await assertSnapshot(t, htmls.join("\n"));
});
