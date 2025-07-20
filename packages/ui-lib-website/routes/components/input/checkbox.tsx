import { ComponentPageTemplate } from "@suppers/ui-lib";
import { Checkbox } from "@suppers/ui-lib";

export default function CheckboxDemo() {
  const examples = [
    {
      title: "Basic Checkbox",
      description: "Simple checkbox in different states",
      code: `<Checkbox />
<Checkbox checked />
<Checkbox disabled />`,
      preview: (
        <div class="flex gap-4">
          <Checkbox />
          <Checkbox checked />
          <Checkbox disabled />
          <Checkbox checked disabled />
        </div>
      ),
    },
    {
      title: "Checkbox Colors",
      description: "Different color variants",
      code: `<Checkbox color="primary" checked />
<Checkbox color="success" checked />
<Checkbox color="error" checked />`,
      preview: (
        <div class="flex gap-4">
          <Checkbox color="primary" checked />
          <Checkbox color="secondary" checked />
          <Checkbox color="accent" checked />
          <Checkbox color="success" checked />
          <Checkbox color="warning" checked />
          <Checkbox color="error" checked />
        </div>
      ),
    },
    {
      title: "Checkbox Sizes",
      description: "Different sizes from xs to lg",
      code: `<Checkbox size="lg" checked color="primary" />`,
      preview: (
        <div class="flex items-center gap-4">
          <Checkbox size="xs" checked color="primary" />
          <Checkbox size="sm" checked color="primary" />
          <Checkbox size="md" checked color="primary" />
          <Checkbox size="lg" checked color="primary" />
        </div>
      ),
    },
    {
      title: "Checkbox with Labels",
      description: "Checkboxes with accompanying text labels",
      code: `<label class="label cursor-pointer">
  <span class="label-text">Remember me</span>
  <Checkbox checked />
</label>`,
      preview: (
        <div class="space-y-4">
          <label class="label cursor-pointer">
            <span class="label-text">Remember me</span>
            <Checkbox checked />
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">Subscribe to newsletter</span>
            <Checkbox color="primary" />
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">Accept terms and conditions</span>
            <Checkbox color="success" />
          </label>
        </div>
      ),
    },
    {
      title: "Form Checkbox Groups",
      description: "Multiple checkboxes for form selections",
      code: `<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">JavaScript</span>
    <Checkbox color="primary" checked />
  </label>
</div>`,
      preview: (
        <div class="space-y-2">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">JavaScript</span>
              <Checkbox color="primary" checked />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">TypeScript</span>
              <Checkbox color="secondary" checked />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Python</span>
              <Checkbox color="accent" />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Rust</span>
              <Checkbox color="success" />
            </label>
          </div>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "checked",
      type: "boolean",
      default: "false",
      description: "Whether checkbox is checked",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Whether checkbox is disabled",
    },
    {
      name: "color",
      type: "primary | secondary | accent | success | warning | error | info",
      description: "Checkbox color variant",
    },
    {
      name: "size",
      type: "xs | sm | md | lg",
      default: "md",
      description: "Checkbox size",
    },
    {
      name: "name",
      type: "string",
      description: "Form field name attribute",
    },
    {
      name: "value",
      type: "string",
      description: "Form field value attribute",
    },
    {
      name: "class",
      type: "string",
      description: "Additional CSS classes",
    },
  ];

  const usageNotes = [
    "Use Checkbox for server-side rendered forms",
    "For interactive checkboxes with onChange handlers, create an island component",
    "Always associate checkboxes with labels using label element",
    "Group related checkboxes in form-control containers",
    "Use appropriate colors to indicate state or category",
    "Consider using fieldsets for groups of related checkboxes",
    "Provide clear, descriptive labels for accessibility",
  ];

  const accessibilityNotes = [
    "Always associate checkboxes with descriptive labels",
    "Use fieldset and legend for groups of related checkboxes",
    "Ensure sufficient color contrast for all states",
    "Test keyboard navigation with Tab and Space keys",
    "Provide context for required checkbox groups",
    "Use aria-describedby for additional help text",
    "Screen readers should announce checkbox state changes",
  ];

  const relatedComponents = [
    { name: "Radio", path: "/components/input/radio" },
    { name: "Toggle", path: "/components/input/toggle" },
    { name: "Button", path: "/components/action/button" },
    { name: "Input", path: "/components/input/input" },
  ];

  return (
    <ComponentPageTemplate
      title="Checkbox"
      description="Selection checkboxes for multiple choice inputs and forms"
      category="Input"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
