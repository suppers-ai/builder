import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { EmailInput } from "./EmailInput.tsx";

const emailInputExamples: ComponentExample[] = [
  {
    title: "Basic Email Input",
    description: "Simple email input with validation",
    code: `<EmailInput placeholder="your@email.com" />
<EmailInput value="user@example.com" />
<EmailInput required placeholder="Required email" />`,
    showCode: true,
  },
  {
    title: "Email Input Sizes",
    description: "Different email input sizes",
    code: `<EmailInput size="xs" placeholder="Extra small" />
<EmailInput size="sm" placeholder="Small" />
<EmailInput placeholder="Normal" />
<EmailInput size="lg" placeholder="Large" />`,
    showCode: true,
  },
  {
    title: "Email Input Variants",
    description: "Different visual styles",
    code: `<EmailInput placeholder="Bordered" />
<EmailInput ghost placeholder="Ghost" />
<EmailInput bordered={false} placeholder="No border" />
<EmailInput disabled placeholder="Disabled" />`,
    showCode: true,
  },
  {
    title: "Email Input States",
    description: "Different input states and validation",
    code: `<EmailInput placeholder="Default" />
<EmailInput color="primary" placeholder="Primary" />
<EmailInput color="success" placeholder="Valid email" />
<EmailInput color="error" placeholder="Invalid email" />`,
    showCode: true,
  },
];

const emailInputProps: ComponentProp[] = [
  {
    name: "value",
    type: "string",
    description: "The email input value",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text for the input",
    default: "your@email.com",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the email input",
    default: "md",
  },
  {
    name: "color",
    type: "DaisyUIColor",
    description: "Color theme for the input",
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
    name: "disabled",
    type: "boolean",
    description: "Disable the input",
    default: "false",
  },
  {
    name: "required",
    type: "boolean",
    description: "Mark input as required",
    default: "false",
  },
  {
    name: "autoComplete",
    type: "string",
    description: "Autocomplete attribute value",
    default: "email",
  },
  {
    name: "onChange",
    type: "(value: string) => void",
    description: "Callback when email value changes",
  },
  {
    name: "onValidationChange",
    type: "(isValid: boolean) => void",
    description: "Callback when email validation state changes",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const emailInputMetadata: ComponentMetadata = {
  name: "EmailInput",
  description: "Email input field with built-in validation and appropriate mobile keyboard",
  category: ComponentCategory.INPUT,
  path: "/components/input/email-input",
  tags: ["email", "input", "form", "validation", "contact"],
  relatedComponents: ["input", "password-input", "text-input"],
  interactive: true,
  preview: (
    <div class="flex flex-col gap-2">
      <input type="email" class="input input-bordered" placeholder="your@email.com" />
      <input type="email" class="input input-bordered input-primary" placeholder="Primary email" />
    </div>
  ),
  examples: emailInputExamples,
  props: emailInputProps,
  variants: ["bordered", "ghost", "no-border"],
  useCases: ["User registration", "Contact forms", "Newsletter signup", "Login forms"],
  usageNotes: [
    "Automatically provides email validation in supported browsers",
    "Shows appropriate keyboard on mobile devices",
    "Use autoComplete='email' for better user experience",
    "Combine with validation states for form feedback",
    "Consider using onValidationChange for real-time validation feedback",
  ],
};
