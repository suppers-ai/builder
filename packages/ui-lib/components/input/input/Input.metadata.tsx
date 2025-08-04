import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Input } from "./Input.tsx";

const inputExamples: ComponentExample[] = [
  {
    title: "Basic Input",
    description: "Simple text input with different types",
    props: {
      placeholder: "Enter text...",
    },
  },
  {
    title: "Input Sizes",
    description: "Different input sizes",
    props: {
      placeholder: "Enter text...",
      size: "lg",
    },
  },
  {
    title: "Input Colors",
    description: "Input with different colors",
    props: {
      placeholder: "Enter text...",
      color: "primary",
    },
  },
  {
    title: "Input States",
    description: "Different input states",
    props: {
      placeholder: "Enter text...",
    },
  },
  {
    title: "Input Variants",
    description: "Different visual styles",
    props: {
      placeholder: "Enter text...",
      variant: "outlined",
    },
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
  description:
    "Text input fields for capturing user input with various styles and states, fully compatible with DaisyUI 5 and Tailwind 4 with enhanced features",
  category: ComponentCategory.INPUT,
  path: "/components/input/input",
  tags: [
    "input",
    "text",
    "form",
    "field",
    "daisyui-5",
    "tailwind-4",
    "enhanced-validation",
    "accessibility",
    "ssr-compatible",
  ],
  relatedComponents: ["textarea", "button", "label", "checkbox", "radio", "select"],
  interactive: true, // Inputs are inherently interactive
  preview: (
    <div class="flex flex-col gap-2">
      <input class="input input-bordered" placeholder="Type here" />
      <input class="input input-bordered input-primary" placeholder="Primary" />
      <input class="input input-bordered input-error" placeholder="Error state" />
    </div>
  ),
  examples: inputExamples,
  props: inputProps,
  variants: [
    "bordered",
    "ghost",
    "no-border",
    "primary",
    "secondary",
    "accent",
    "success",
    "warning",
    "error",
  ],
  useCases: [
    "Forms",
    "Search fields",
    "User authentication",
    "Data entry",
    "Validation feedback",
    "Real-time input",
  ],
  usageNotes: [
    "Use bordered style for most form inputs with enhanced DaisyUI 5 styling",
    "Ghost style works well for search inputs in navigation with improved focus states",
    "Combine with labels for better accessibility and screen reader support",
    "Use appropriate input types for better mobile keyboards and validation",
    "Enhanced validation states (success, error) with better color contrast",
    "Password inputs support optional toggle buttons for client-side enhancement",
    "Number inputs include default step=1 and increment/decrement controls",
    "Color inputs include preview swatches by default with better color handling",
    "Improved focus rings and accessibility with DaisyUI 5 enhancements",
    "Better placeholder contrast and readability across themes",
    "Enhanced disabled states with clearer visual indication",
    "SSR-compatible with client-side enhancement via data attributes",
    "Supports Tailwind 4 arbitrary values for custom styling",
    "Transform utilities simplified - no explicit 'transform' class needed",
    "Better responsive behavior with container queries support",
    "Optimized performance with improved CSS generation",
    "Fully backward compatible - all existing usage patterns continue to work",
    "Enhanced TypeScript support with optional properties and better defaults",
  ],
};
