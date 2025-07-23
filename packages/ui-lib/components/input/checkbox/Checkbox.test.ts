import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { Checkbox } from "./Checkbox.tsx";

Deno.test("Checkbox - basic rendering", () => {
  const html = renderToString(Checkbox({}));
  assertStringIncludes(html, "checkbox");
  assertStringIncludes(html, "checkbox-md");
  assertStringIncludes(html, "checkbox-primary");
  assertStringIncludes(html, 'type="checkbox"');
});

Deno.test("Checkbox - checked state", () => {
  const html = renderToString(Checkbox({
    checked: true,
  }));
  assertStringIncludes(html, "checked");
});

Deno.test("Checkbox - unchecked state", () => {
  const html = renderToString(Checkbox({
    checked: false,
  }));
  assertEquals(html.includes("checked"), false);
});

Deno.test("Checkbox - disabled state", () => {
  const html = renderToString(Checkbox({
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
});

Deno.test("Checkbox - enabled state", () => {
  const html = renderToString(Checkbox({
    disabled: false,
  }));
  assertEquals(html.includes("disabled"), false);
});

Deno.test("Checkbox - with label", () => {
  const html = renderToString(Checkbox({
    label: "Accept terms and conditions",
  }));
  assertStringIncludes(html, "form-control");
  assertStringIncludes(html, "label cursor-pointer");
  assertStringIncludes(html, "label-text");
  assertStringIncludes(html, "Accept terms and conditions");
});

Deno.test("Checkbox - without label", () => {
  const html = renderToString(Checkbox({}));
  assertEquals(html.includes("form-control"), false);
  assertEquals(html.includes("label-text"), false);
});

Deno.test("Checkbox - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Checkbox({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
    }));
    assertStringIncludes(html, `checkbox-${size}`);
  });
});

Deno.test("Checkbox - color variants", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "info", "error"];

  colors.forEach((color) => {
    const html = renderToString(Checkbox({
      color: color as 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error',
    }));
    assertStringIncludes(html, `checkbox-${color}`);
  });
});

Deno.test("Checkbox - custom class", () => {
  const html = renderToString(Checkbox({
    class: "custom-checkbox-class",
  }));
  assertStringIncludes(html, "custom-checkbox-class");
});

Deno.test("Checkbox - with id", () => {
  const html = renderToString(Checkbox({
    id: "test-checkbox",
  }));
  assertStringIncludes(html, 'id="test-checkbox"');
});

Deno.test("Checkbox - with id and label", () => {
  const html = renderToString(Checkbox({
    id: "checkbox-with-label",
    label: "Checkbox with ID",
  }));
  assertStringIncludes(html, 'id="checkbox-with-label"');
  assertStringIncludes(html, "Checkbox with ID");
});

Deno.test("Checkbox - all props combined", () => {
  const html = renderToString(Checkbox({
    checked: true,
    disabled: false,
    size: "lg",
    color: "success",
    label: "Large success checkbox",
    class: "test-class",
    id: "full-checkbox",
  }));
  assertStringIncludes(html, "checked");
  assertEquals(html.includes("disabled"), false);
  assertStringIncludes(html, "checkbox-lg");
  assertStringIncludes(html, "checkbox-success");
  assertStringIncludes(html, "Large success checkbox");
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-checkbox"');
  assertStringIncludes(html, "form-control");
  assertStringIncludes(html, "label cursor-pointer");
});

Deno.test("Checkbox - checked with label", () => {
  const html = renderToString(Checkbox({
    checked: true,
    label: "Checked checkbox with label",
  }));
  assertStringIncludes(html, "checked");
  assertStringIncludes(html, "Checked checkbox with label");
  assertStringIncludes(html, "form-control");
});

Deno.test("Checkbox - disabled with label", () => {
  const html = renderToString(Checkbox({
    disabled: true,
    label: "Disabled checkbox",
  }));
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "Disabled checkbox");
});

Deno.test("Checkbox - small secondary checkbox", () => {
  const html = renderToString(Checkbox({
    size: "sm",
    color: "secondary",
  }));
  assertStringIncludes(html, "checkbox-sm");
  assertStringIncludes(html, "checkbox-secondary");
});

Deno.test("Checkbox - extra large error checkbox", () => {
  const html = renderToString(Checkbox({
    size: "lg",
    color: "error",
    label: "Error state checkbox",
  }));
  assertStringIncludes(html, "checkbox-lg");
  assertStringIncludes(html, "checkbox-error");
  assertStringIncludes(html, "Error state checkbox");
});

Deno.test("Checkbox - checked and disabled", () => {
  const html = renderToString(Checkbox({
    checked: true,
    disabled: true,
    label: "Checked and disabled",
  }));
  assertStringIncludes(html, "checked");
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "Checked and disabled");
});

Deno.test("Checkbox - accent color with extra small size", () => {
  const html = renderToString(Checkbox({
    size: "xs",
    color: "accent",
    label: "Tiny accent checkbox",
  }));
  assertStringIncludes(html, "checkbox-xs");
  assertStringIncludes(html, "checkbox-accent");
  assertStringIncludes(html, "Tiny accent checkbox");
});

Deno.test("Checkbox - warning color", () => {
  const html = renderToString(Checkbox({
    color: "warning",
    label: "Warning checkbox",
  }));
  assertStringIncludes(html, "checkbox-warning");
  assertStringIncludes(html, "Warning checkbox");
});

Deno.test("Checkbox - info color", () => {
  const html = renderToString(Checkbox({
    color: "info",
    label: "Info checkbox",
  }));
  assertStringIncludes(html, "checkbox-info");
  assertStringIncludes(html, "Info checkbox");
});

// Test indeterminate state (note: this is set via ref, so we test the prop)
Deno.test("Checkbox - indeterminate prop", () => {
  const html = renderToString(Checkbox({
    indeterminate: true,
    label: "Indeterminate checkbox",
  }));
  // The indeterminate state is set via ref, so we just test that the component renders
  assertStringIncludes(html, "checkbox");
  assertStringIncludes(html, "Indeterminate checkbox");
});

// Snapshot tests
Deno.test("Checkbox - HTML snapshot basic", async (t) => {
  const html = renderToString(Checkbox({
    checked: false,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Checkbox - HTML snapshot with label", async (t) => {
  const html = renderToString(Checkbox({
    label: "Checkbox with label",
    checked: true,
    color: "primary",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Checkbox - HTML snapshot disabled", async (t) => {
  const html = renderToString(Checkbox({
    label: "Disabled checkbox",
    disabled: true,
    checked: false,
  }));
  await assertSnapshot(t, html);
});

Deno.test("Checkbox - HTML snapshot all sizes", async (t) => {
  const sizes = ["xs", "sm", "md", "lg"];
  const htmls = sizes.map((size) =>
    renderToString(Checkbox({
      size: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
      label: `Size ${size}`,
      color: "primary",
    }))
  );
  await assertSnapshot(t, htmls.join("\n"));
});

Deno.test("Checkbox - HTML snapshot complex", async (t) => {
  const html = renderToString(Checkbox({
    checked: true,
    size: "lg",
    color: "success",
    label: "I agree to the terms and conditions",
    class: "custom-checkbox",
    id: "terms-agreement",
  }));
  await assertSnapshot(t, html);
});
