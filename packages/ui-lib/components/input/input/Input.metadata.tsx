import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Input } from "./Input.tsx";

const inputExamples: ComponentExample[] = [
  {
    title: "Basic Input",
    description: "Simple text input with different types",
    props: {
      placeholder: "Enter text..."
    }
  },  {
    title: "Input Sizes",
    description: "Different input sizes",
    props: {
      placeholder: "Enter text...",
      size: "lg"
    }
  },  {
    title: "Input Colors",
    description: "Input with different colors",
    props: {
      placeholder: "Enter text...",
      color: "primary"
    }
  },  {
    title: "Input States",
    description: "Different input states",
    props: {
      placeholder: "Enter text..."
    }
  },  {
    title: "Input Variants",
    description: "Different visual styles",
    props: {
      placeholder: "Enter text...",
      variant: "outlined"
    }
  },
];

const inputProps: ComponentProp[] = [
  {
    name: "type",
    type: "string",
    description: "Input type (text, email, password, etc.)",
    default: "text"},
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text"},
  {
    name: "value",
    type: "string",
    description: "Input value"},
  {
    name: "bordered",
    type: "boolean",
    description: "Show input border",
    default: "true"},
  {
    name: "ghost",
    type: "boolean",
    description: "Ghost style input",
    default: "false"},
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Input size",
    default: "md"},
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
    description: "Input color theme"},
  {
    name: "disabled",
    type: "boolean",
    description: "Disable the input",
    default: "false"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const inputMetadata: ComponentMetadata = {
  name: "Input",
  description: "Text input fields for capturing user input with various styles and states, compatible with DaisyUI 5 and Tailwind 4",
  category: ComponentCategory.INPUT,
  path: "/components/input/input",
  tags: ["input", "text", "form", "field", "daisyui-5", "tailwind-4"],
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
    "Password inputs support optional toggle buttons for client-side enhancement",
    "Number inputs include default step=1 and increment/decrement controls",
    "Color inputs include preview swatches by default",
    "Updated for DaisyUI 5 and Tailwind 4 compatibility with modern class patterns",
  ]};
