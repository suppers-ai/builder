import { ComponentMetadata, ComponentCategory, ComponentExample, ComponentProp } from "../../types.ts";

const inputExamples: ComponentExample[] = [
  {
    title: "Basic Input",
    description: "Simple text input with different types",
    code: `<Input type="text" placeholder="Type here" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />`,
    showCode: true,
  },
  {
    title: "Input Sizes",
    description: "Different input sizes",
    code: `<Input size="xs" placeholder="Extra small" />
<Input size="sm" placeholder="Small" />
<Input placeholder="Normal" />
<Input size="lg" placeholder="Large" />`,
    showCode: true,
  },
  {
    title: "Input Colors",
    description: "Input with different colors",
    code: `<Input placeholder="Default" />
<Input color="primary" placeholder="Primary" />
<Input color="secondary" placeholder="Secondary" />
<Input color="accent" placeholder="Accent" />`,
    showCode: true,
  },
  {
    title: "Input States",
    description: "Different input states",
    code: `<Input placeholder="Normal" />
<Input color="info" placeholder="Info" />
<Input color="success" placeholder="Success" />
<Input color="warning" placeholder="Warning" />
<Input color="error" placeholder="Error" />`,
    showCode: true,
  },
  {
    title: "Input Variants",
    description: "Different visual styles",
    code: `<Input placeholder="Bordered" />
<Input ghost placeholder="Ghost" />
<Input bordered={false} placeholder="No border" />
<Input disabled placeholder="Disabled" />`,
    showCode: true,
  },
];

const inputProps: ComponentProp[] = [
  {
    name: "type",
    type: "string",
    description: "Input type (text, email, password, etc.)",
    default: "text",
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
    name: "bordered",
    type: "boolean",
    description: "Show input border",
    default: "true",
  },
  {
    name: "ghost",
    type: "boolean",
    description: "Ghost style input",
    default: "false",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Input size",
    default: "md",
  },
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
    description: "Input color theme",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Disable the input",
    default: "false",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const inputMetadata: ComponentMetadata = {
  name: "Input",
  description: "Text input fields for capturing user input with various styles and states",
  category: ComponentCategory.INPUT,
  path: "/components/input/input",
  tags: ["input", "text", "form", "field"],
  relatedComponents: ["textarea", "button", "label"],
  interactive: true, // Inputs are inherently interactive
  preview: (
    <div class="flex flex-col gap-2">
      <input class="input input-bordered" placeholder="Type here" />
      <input class="input input-bordered input-primary" placeholder="Primary" />
    </div>
  ),
  examples: inputExamples,
  props: inputProps,
  variants: ["bordered", "ghost", "no-border"],
  useCases: ["Forms", "Search fields", "User authentication", "Data entry"],
  usageNotes: [
    "Use bordered style for most form inputs",
    "Ghost style works well for search inputs in navigation",
    "Combine with labels for better accessibility",
    "Use appropriate input types for better mobile keyboards",
    "Consider using validation states (success, error) for form feedback",
  ],
};