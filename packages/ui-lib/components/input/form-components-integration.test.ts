/**
 * Integration test for Checkbox, Radio, and Toggle components
 * Tests that all form input components work together consistently
 */

import { assertEquals, assertStringIncludes } from "jsr:@std/assert";
import { renderToString } from "preact-render-to-string";
import { Checkbox } from "./checkbox/Checkbox.tsx";
import { Radio } from "./radio/Radio.tsx";
import { Toggle } from "./toggle/Toggle.tsx";

Deno.test("Form Components Integration - all components render with consistent DaisyUI classes", () => {
  const checkboxHtml = renderToString(Checkbox({
    size: "md",
    color: "primary",
    label: "Checkbox option",
  }));

  const radioHtml = renderToString(Radio({
    size: "md",
    color: "primary",
    label: "Radio option",
    name: "test-group",
  }));

  const toggleHtml = renderToString(Toggle({
    size: "md",
    color: "primary",
    children: "Toggle option",
  }));

  // All should use consistent DaisyUI form classes
  assertStringIncludes(checkboxHtml, "form-control");
  assertStringIncludes(radioHtml, "form-control");
  assertStringIncludes(toggleHtml, "form-control");

  assertStringIncludes(checkboxHtml, "label cursor-pointer");
  assertStringIncludes(radioHtml, "label cursor-pointer");
  assertStringIncludes(toggleHtml, "label cursor-pointer");

  assertStringIncludes(checkboxHtml, "label-text");
  assertStringIncludes(radioHtml, "label-text");
  assertStringIncludes(toggleHtml, "label-text");

  // Each should have their specific DaisyUI classes
  assertStringIncludes(checkboxHtml, "checkbox checkbox-md checkbox-primary");
  assertStringIncludes(radioHtml, "radio radio-md radio-primary");
  assertStringIncludes(toggleHtml, "toggle toggle-md toggle-primary");
});

Deno.test("Form Components Integration - all components support size variants consistently", () => {
  const sizes = ["xs", "sm", "md", "lg"] as const;

  sizes.forEach((size) => {
    const checkboxHtml = renderToString(Checkbox({ size }));
    const radioHtml = renderToString(Radio({ size }));
    const toggleHtml = renderToString(Toggle({ size }));

    assertStringIncludes(checkboxHtml, `checkbox-${size}`);
    assertStringIncludes(radioHtml, `radio-${size}`);
    assertStringIncludes(toggleHtml, `toggle-${size}`);
  });
});

Deno.test("Form Components Integration - all components support color variants consistently", () => {
  const colors = ["primary", "secondary", "accent", "success", "warning", "error", "info"] as const;

  colors.forEach((color) => {
    const checkboxHtml = renderToString(Checkbox({ color }));
    const radioHtml = renderToString(Radio({ color }));
    const toggleHtml = renderToString(Toggle({ color }));

    assertStringIncludes(checkboxHtml, `checkbox-${color}`);
    assertStringIncludes(radioHtml, `radio-${color}`);
    assertStringIncludes(toggleHtml, `toggle-${color}`);
  });
});

Deno.test("Form Components Integration - all components support disabled state consistently", () => {
  const checkboxHtml = renderToString(Checkbox({ disabled: true, label: "Disabled checkbox" }));
  const radioHtml = renderToString(Radio({ disabled: true, label: "Disabled radio" }));
  const toggleHtml = renderToString(Toggle({ disabled: true, children: "Disabled toggle" }));

  assertStringIncludes(checkboxHtml, "disabled");
  assertStringIncludes(radioHtml, "disabled");
  assertStringIncludes(toggleHtml, "disabled");
});

Deno.test("Form Components Integration - all components support checked state consistently", () => {
  const checkboxHtml = renderToString(Checkbox({ checked: true, label: "Checked checkbox" }));
  const radioHtml = renderToString(Radio({ checked: true, label: "Checked radio" }));
  const toggleHtml = renderToString(Toggle({ checked: true, children: "Checked toggle" }));

  assertStringIncludes(checkboxHtml, "checked");
  assertStringIncludes(radioHtml, "checked");
  assertStringIncludes(toggleHtml, "checked");
});

Deno.test("Form Components Integration - all components support custom classes consistently", () => {
  const customClass = "custom-form-input";
  
  const checkboxHtml = renderToString(Checkbox({ class: customClass }));
  const radioHtml = renderToString(Radio({ class: customClass }));
  const toggleHtml = renderToString(Toggle({ class: customClass }));

  assertStringIncludes(checkboxHtml, customClass);
  assertStringIncludes(radioHtml, customClass);
  assertStringIncludes(toggleHtml, customClass);
});

Deno.test("Form Components Integration - radio group functionality", () => {
  const radio1Html = renderToString(Radio({
    name: "preference",
    value: "option1",
    label: "Option 1",
    checked: true,
  }));

  const radio2Html = renderToString(Radio({
    name: "preference",
    value: "option2",
    label: "Option 2",
    checked: false,
  }));

  const radio3Html = renderToString(Radio({
    name: "preference",
    value: "option3",
    label: "Option 3",
    checked: false,
  }));

  // All should have the same name for grouping
  assertStringIncludes(radio1Html, 'name="preference"');
  assertStringIncludes(radio2Html, 'name="preference"');
  assertStringIncludes(radio3Html, 'name="preference"');

  // Only first should be checked
  assertStringIncludes(radio1Html, "checked");
  assertEquals(radio2Html.includes("checked"), false);
  assertEquals(radio3Html.includes("checked"), false);

  // All should have different values
  assertStringIncludes(radio1Html, 'value="option1"');
  assertStringIncludes(radio2Html, 'value="option2"');
  assertStringIncludes(radio3Html, 'value="option3"');
});

Deno.test("Form Components Integration - checkbox indeterminate state", () => {
  const indeterminateCheckboxHtml = renderToString(Checkbox({
    indeterminate: true,
    label: "Indeterminate checkbox",
  }));

  // Component should render (indeterminate is set via ref in browser)
  assertStringIncludes(indeterminateCheckboxHtml, "checkbox");
  assertStringIncludes(indeterminateCheckboxHtml, "Indeterminate checkbox");
});

Deno.test("Form Components Integration - complex form with all components", () => {
  const formHtml = [
    renderToString(Checkbox({
      id: "terms",
      label: "I agree to the terms and conditions",
      size: "sm",
      color: "success",
    })),
    renderToString(Radio({
      id: "plan-basic",
      name: "plan",
      value: "basic",
      label: "Basic Plan",
      checked: true,
      size: "sm",
      color: "primary",
    })),
    renderToString(Radio({
      id: "plan-premium",
      name: "plan",
      value: "premium",
      label: "Premium Plan",
      size: "sm",
      color: "primary",
    })),
    renderToString(Toggle({
      id: "notifications",
      children: "Enable notifications",
      size: "sm",
      color: "accent",
    })),
  ].join("\n");

  // Check that all components are present and properly configured
  assertStringIncludes(formHtml, 'id="terms"');
  assertStringIncludes(formHtml, "I agree to the terms and conditions");
  assertStringIncludes(formHtml, "checkbox-sm checkbox-success");

  assertStringIncludes(formHtml, 'name="plan"');
  assertStringIncludes(formHtml, 'value="basic"');
  assertStringIncludes(formHtml, 'value="premium"');
  assertStringIncludes(formHtml, "radio-sm radio-primary");

  assertStringIncludes(formHtml, 'id="notifications"');
  assertStringIncludes(formHtml, "Enable notifications");
  assertStringIncludes(formHtml, "toggle-sm toggle-accent");
});