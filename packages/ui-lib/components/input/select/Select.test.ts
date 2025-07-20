import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertSnapshot } from "https://deno.land/std@0.224.0/testing/snapshot.ts";
import { renderToString } from "preact-render-to-string";
import { Select } from "./Select.tsx";

const basicOptions = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

Deno.test("Select - basic rendering", () => {
  const html = renderToString(Select({
    options: basicOptions,
  }));
  assertStringIncludes(html, "select");
  assertStringIncludes(html, "select-md");
  assertStringIncludes(html, "select-bordered");
  assertStringIncludes(html, "w-full max-w-xs");
  assertStringIncludes(html, "Option 1");
  assertStringIncludes(html, "Option 2");
  assertStringIncludes(html, "Option 3");
});

Deno.test("Select - with placeholder", () => {
  const html = renderToString(Select({
    options: basicOptions,
    placeholder: "Choose an option",
  }));
  assertStringIncludes(html, "Choose an option");
  assertStringIncludes(html, "disabled");
  assertStringIncludes(html, "selected");
});

Deno.test("Select - without placeholder", () => {
  const html = renderToString(Select({
    options: basicOptions,
  }));
  assertEquals(html.includes("Choose an option"), false);
});

Deno.test("Select - with selected value", () => {
  const html = renderToString(Select({
    options: basicOptions,
    value: "option2",
  }));
  assertStringIncludes(html, 'value="option2"');
});

Deno.test("Select - disabled", () => {
  const html = renderToString(Select({
    options: basicOptions,
    disabled: true,
  }));
  assertStringIncludes(html, "disabled");
});

Deno.test("Select - enabled (default)", () => {
  const html = renderToString(Select({
    options: basicOptions,
    disabled: false,
  }));
  // Should not have disabled on the select element
  const selectDisabled = html.match(/<select[^>]*disabled/);
  assertEquals(selectDisabled, null);
});

Deno.test("Select - bordered (default)", () => {
  const html = renderToString(Select({
    options: basicOptions,
  }));
  assertStringIncludes(html, "select-bordered");
});

Deno.test("Select - not bordered", () => {
  const html = renderToString(Select({
    options: basicOptions,
    bordered: false,
  }));
  assertEquals(html.includes("select-bordered"), false);
});

Deno.test("Select - ghost variant", () => {
  const html = renderToString(Select({
    options: basicOptions,
    ghost: true,
  }));
  assertStringIncludes(html, "select-ghost");
});

Deno.test("Select - not ghost (default)", () => {
  const html = renderToString(Select({
    options: basicOptions,
    ghost: false,
  }));
  assertEquals(html.includes("select-ghost"), false);
});

Deno.test("Select - size variants", () => {
  const sizes = ["xs", "sm", "md", "lg"];

  sizes.forEach((size) => {
    const html = renderToString(Select({
      options: basicOptions,
      size: size as any,
    }));
    assertStringIncludes(html, `select-${size}`);
  });
});

Deno.test("Select - color variants", () => {
  const colors = ["primary", "secondary", "accent", "info", "success", "warning", "error"];

  colors.forEach((color) => {
    const html = renderToString(Select({
      options: basicOptions,
      color: color as any,
    }));
    assertStringIncludes(html, `select-${color}`);
  });
});

Deno.test("Select - without color", () => {
  const html = renderToString(Select({
    options: basicOptions,
  }));
  // Should not have any color class
  const hasColorClass = ["primary", "secondary", "accent", "info", "success", "warning", "error"]
    .some((color) => html.includes(`select-${color}`));
  assertEquals(hasColorClass, false);
});

Deno.test("Select - custom class", () => {
  const html = renderToString(Select({
    options: basicOptions,
    class: "custom-select-class",
  }));
  assertStringIncludes(html, "custom-select-class");
});

Deno.test("Select - with id", () => {
  const html = renderToString(Select({
    options: basicOptions,
    id: "test-select",
  }));
  assertStringIncludes(html, 'id="test-select"');
});

Deno.test("Select - options with disabled items", () => {
  const optionsWithDisabled = [
    { value: "enabled1", label: "Enabled Option 1" },
    { value: "disabled1", label: "Disabled Option 1", disabled: true },
    { value: "enabled2", label: "Enabled Option 2" },
    { value: "disabled2", label: "Disabled Option 2", disabled: true },
  ];

  const html = renderToString(Select({
    options: optionsWithDisabled,
  }));

  assertStringIncludes(html, "Enabled Option 1");
  assertStringIncludes(html, "Disabled Option 1");
  assertStringIncludes(html, "Enabled Option 2");
  assertStringIncludes(html, "Disabled Option 2");

  // Count disabled options (check for disabled attribute on option tags)
  const disabledCount = (html.match(/<option[^>]*disabled[^>]*>/g) || []).length;
  assertEquals(disabledCount, 2); // Two disabled options
});

Deno.test("Select - empty options array", () => {
  const html = renderToString(Select({
    options: [],
  }));
  assertStringIncludes(html, "select");
  // Should render select but no options
});

Deno.test("Select - single option", () => {
  const singleOption = [{ value: "only", label: "Only Option" }];

  const html = renderToString(Select({
    options: singleOption,
  }));
  assertStringIncludes(html, "Only Option");
  assertStringIncludes(html, 'value="only"');
});

Deno.test("Select - all props combined", () => {
  const html = renderToString(Select({
    options: basicOptions,
    value: "option1",
    placeholder: "Select an option",
    size: "lg",
    color: "primary",
    bordered: true,
    ghost: false,
    disabled: false,
    class: "test-class",
    id: "full-select",
  }));

  assertStringIncludes(html, 'value="option1"');
  assertStringIncludes(html, "Select an option");
  assertStringIncludes(html, "select-lg");
  assertStringIncludes(html, "select-primary");
  assertStringIncludes(html, "select-bordered");
  assertEquals(html.includes("select-ghost"), false);
  assertStringIncludes(html, "test-class");
  assertStringIncludes(html, 'id="full-select"');
  assertStringIncludes(html, "Option 1");
  assertStringIncludes(html, "Option 2");
  assertStringIncludes(html, "Option 3");
});

Deno.test("Select - large error select", () => {
  const html = renderToString(Select({
    options: basicOptions,
    size: "lg",
    color: "error",
    placeholder: "Error state",
  }));
  assertStringIncludes(html, "select-lg");
  assertStringIncludes(html, "select-error");
  assertStringIncludes(html, "Error state");
});

Deno.test("Select - small success select", () => {
  const html = renderToString(Select({
    options: basicOptions,
    size: "sm",
    color: "success",
    value: "option3",
  }));
  assertStringIncludes(html, "select-sm");
  assertStringIncludes(html, "select-success");
  assertStringIncludes(html, 'value="option3"');
});

Deno.test("Select - ghost select without border", () => {
  const html = renderToString(Select({
    options: basicOptions,
    ghost: true,
    bordered: false,
  }));
  assertStringIncludes(html, "select-ghost");
  assertEquals(html.includes("select-bordered"), false);
});

Deno.test("Select - placeholder with selected value", () => {
  const html = renderToString(Select({
    options: basicOptions,
    placeholder: "Choose option",
    value: "option2",
  }));
  assertStringIncludes(html, "Choose option");
  assertStringIncludes(html, 'value="option2"');
  // Placeholder should not be selected when value is present
  const placeholderOptionMatch = html.match(/<option[^>]*>Choose option<\/option>/);
  const placeholderSelected = placeholderOptionMatch &&
    placeholderOptionMatch[0].includes("selected");
  assertEquals(placeholderSelected, false);
});

Deno.test("Select - complex option values", () => {
  const complexOptions = [
    { value: "complex_value_1", label: "Complex Label with Spaces" },
    { value: "UPPER_CASE", label: "UPPERCASE LABEL" },
    { value: "special-chars!", label: "Special Characters: @#$%" },
    { value: "123", label: "Numeric Label 123" },
  ];

  const html = renderToString(Select({
    options: complexOptions,
  }));

  assertStringIncludes(html, 'value="complex_value_1"');
  assertStringIncludes(html, "Complex Label with Spaces");
  assertStringIncludes(html, 'value="UPPER_CASE"');
  assertStringIncludes(html, "UPPERCASE LABEL");
  assertStringIncludes(html, 'value="special-chars!"');
  assertStringIncludes(html, "Special Characters: @#$%");
  assertStringIncludes(html, 'value="123"');
  assertStringIncludes(html, "Numeric Label 123");
});

// Snapshot tests
Deno.test("Select - HTML snapshot basic", async (t) => {
  const html = renderToString(Select({
    options: basicOptions,
    placeholder: "Select option",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Select - HTML snapshot with selection", async (t) => {
  const html = renderToString(Select({
    options: basicOptions,
    value: "option2",
    color: "primary",
    size: "md",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Select - HTML snapshot with disabled options", async (t) => {
  const optionsWithDisabled = [
    { value: "active1", label: "Active Option 1" },
    { value: "inactive1", label: "Inactive Option 1", disabled: true },
    { value: "active2", label: "Active Option 2" },
    { value: "inactive2", label: "Inactive Option 2", disabled: true },
  ];

  const html = renderToString(Select({
    options: optionsWithDisabled,
    placeholder: "Choose wisely",
    size: "lg",
    color: "warning",
  }));
  await assertSnapshot(t, html);
});

Deno.test("Select - HTML snapshot all sizes", async (t) => {
  const sizes = ["xs", "sm", "md", "lg"];
  const htmls = sizes.map((size) =>
    renderToString(Select({
      options: basicOptions,
      size: size as any,
      placeholder: `Size ${size}`,
      color: "primary",
    }))
  );
  await assertSnapshot(t, htmls.join("\n"));
});

Deno.test("Select - HTML snapshot all colors", async (t) => {
  const colors = ["primary", "secondary", "accent", "info", "success", "warning", "error"];
  const htmls = colors.map((color) =>
    renderToString(Select({
      options: basicOptions,
      color: color as any,
      placeholder: `Color ${color}`,
      size: "md",
    }))
  );
  await assertSnapshot(t, htmls.join("\n"));
});
