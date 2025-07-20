import { ComponentPageTemplate } from "@suppers/ui-lib";
import { Input } from "@suppers/ui-lib";

export default function InputDemo() {
  const examples = [
    {
      title: "Basic Input",
      description: "Standard text input field",
      code: `<Input placeholder="Enter text..." />`,
      preview: (
        <div class="space-y-4">
          <Input placeholder="Enter text..." />
          <Input placeholder="With some text" value="Sample text" />
          <Input placeholder="Disabled input" disabled />
        </div>
      ),
    },
    {
      title: "Input Colors",
      description: "Different color variants for validation states",
      code: `<Input color="primary" placeholder="Primary input" />
<Input color="success" placeholder="Success input" />
<Input color="error" placeholder="Error input" />`,
      preview: (
        <div class="space-y-4">
          <Input color="primary" placeholder="Primary input" />
          <Input color="secondary" placeholder="Secondary input" />
          <Input color="accent" placeholder="Accent input" />
          <Input color="success" placeholder="Success input" />
          <Input color="warning" placeholder="Warning input" />
          <Input color="error" placeholder="Error input" />
        </div>
      ),
    },
    {
      title: "Input Sizes",
      description: "Different sizes from xs to lg",
      code: `<Input size="lg" placeholder="Large input" />`,
      preview: (
        <div class="space-y-4">
          <Input size="xs" placeholder="Extra small input" />
          <Input size="sm" placeholder="Small input" />
          <Input size="md" placeholder="Medium input" />
          <Input size="lg" placeholder="Large input" />
        </div>
      ),
    },
    {
      title: "Input Types",
      description: "Different input types for various data",
      code: `<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="123" />`,
      preview: (
        <div class="space-y-4">
          <Input type="text" placeholder="Text input" />
          <Input type="email" placeholder="email@example.com" />
          <Input type="password" placeholder="Password" />
          <Input type="number" placeholder="123" />
          <Input type="tel" placeholder="Phone number" />
          <Input type="url" placeholder="https://example.com" />
        </div>
      ),
    },
    {
      title: "Input with Labels",
      description: "Form inputs with proper labels",
      code: `<div class="form-control w-full max-w-xs">
  <label class="label">
    <span class="label-text">Username</span>
  </label>
  <Input type="text" placeholder="Enter username" />
  <label class="label">
    <span class="label-text-alt">Must be unique</span>
  </label>
</div>`,
      preview: (
        <div class="space-y-4">
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">Username</span>
            </label>
            <Input type="text" placeholder="Enter username" />
            <label class="label">
              <span class="label-text-alt">Must be unique</span>
            </label>
          </div>
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">Email</span>
              <span class="label-text-alt">Required</span>
            </label>
            <Input type="email" placeholder="email@example.com" color="primary" />
          </div>
        </div>
      ),
    },
  ];

  const apiProps = [
    {
      name: "type",
      type: "text | email | password | number | tel | url | search",
      default: "text",
      description: "HTML input type",
    },
    {
      name: "placeholder",
      type: "string",
      description: "Placeholder text",
    },
    {
      name: "value",
      type: "string",
      description: "Input value",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Whether input is disabled",
    },
    {
      name: "readonly",
      type: "boolean",
      default: "false",
      description: "Whether input is read-only",
    },
    {
      name: "required",
      type: "boolean",
      default: "false",
      description: "Whether input is required",
    },
    {
      name: "color",
      type: "primary | secondary | accent | success | warning | error | info",
      description: "Input color variant",
    },
    {
      name: "size",
      type: "xs | sm | md | lg",
      default: "md",
      description: "Input size",
    },
    {
      name: "bordered",
      type: "boolean",
      default: "true",
      description: "Whether input has border",
    },
    {
      name: "ghost",
      type: "boolean",
      default: "false",
      description: "Ghost style without background",
    },
    {
      name: "class",
      type: "string",
      description: "Additional CSS classes",
    },
  ];

  const usageNotes = [
    "Use Input for server-side rendered forms",
    "For interactive inputs with onChange handlers, create an island component",
    "Always associate inputs with labels for accessibility",
    "Use appropriate input types for better mobile keyboards",
    "Color variants help indicate validation states",
    "Provide helpful placeholder text and descriptions",
    "Group related inputs in form-control containers",
  ];

  const accessibilityNotes = [
    "Always associate inputs with descriptive labels",
    "Use proper input types for semantic meaning",
    "Provide error messages that are programmatically associated",
    "Ensure sufficient color contrast for all states",
    "Use aria-describedby for additional help text",
    "Required fields should be clearly indicated",
    "Focus indicators must be clearly visible",
  ];

  const relatedComponents = [
    { name: "Textarea", path: "/components/input/textarea" },
    { name: "Select", path: "/components/input/select" },
    { name: "Checkbox", path: "/components/input/checkbox" },
    { name: "Button", path: "/components/action/button" },
  ];

  return (
    <ComponentPageTemplate
      title="Input"
      description="Text input fields with various types, sizes, and validation states"
      category="Input"
      examples={examples}
      apiProps={apiProps}
      usageNotes={usageNotes}
      accessibilityNotes={accessibilityNotes}
      relatedComponents={relatedComponents}
    />
  );
}
