import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { FileInput } from "./FileInput.tsx";

const fileInputExamples: ComponentExample[] = [
  {
    title: "Basic File Input",
    description: "Standard file input with default styling",
    props: {
      accept: "image/*",
    },
  },
  {
    title: "Different Sizes",
    description: "File inputs in various sizes",
    props: {
      accept: "image/*",
      size: "lg",
    },
  },
  {
    title: "Color Variants",
    description: "File inputs with different color themes",
    props: {
      accept: "image/*",
      color: "primary",
    },
  },
  {
    title: "Bordered and Ghost",
    description: "Different visual styles for file inputs",
    props: {
      accept: "image/*",
      bordered: true,
    },
  },
  {
    title: "Image Upload",
    description: "File input for uploading multiple images (profile photos, gallery)",
    props: {
      accept: "image/*",
    },
  },
  {
    title: "Document Upload",
    description: "File input for uploading documents (resumes, contracts, reports)",
    props: {
      accept: "image/*",
    },
  },
];

const fileInputProps: ComponentProp[] = [
  {
    name: "accept",
    type: "string",
    description: "Comma-separated list of file types or extensions to accept",
  },
  {
    name: "multiple",
    type: "boolean",
    description: "Allow multiple file selection",
    default: "false",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the file input",
    default: "md",
  },
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
    description: "Color theme for the file input",
  },
  {
    name: "bordered",
    type: "boolean",
    description: "Show border around the input",
    default: "true",
  },
  {
    name: "ghost",
    type: "boolean",
    description: "Ghost style variant",
    default: "false",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Disable the file input",
    default: "false",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text when no file is selected",
  },
  {
    name: "onChange",
    type: "(files: FileList | null) => void",
    description: "Callback when files are selected",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const fileInputMetadata: ComponentMetadata = {
  name: "File Input",
  description: "File upload control",
  category: ComponentCategory.INPUT,
  path: "/components/input/file-input",
  tags: ["file", "upload", "input", "form", "attachment", "browse"],
  examples: fileInputExamples,
  relatedComponents: ["button", "form-control", "progress"],
  preview: (
    <div class="flex flex-col gap-3 w-full max-w-sm">
      <FileInput />
      <FileInput color="primary" size="sm" />
      <FileInput ghost multiple />
    </div>
  ),
  props: fileInputProps,
  variants: ["basic", "sizes", "colors", "bordered", "ghost", "multiple"],
  useCases: [
    "File uploads",
    "Document submission",
    "Image galleries",
    "Avatar uploads",
    "Attachment uploads",
  ],
  usageNotes: [
    "Use accept attribute to restrict file types for better user experience",
    "Multiple files can be selected when multiple prop is true",
    "Consider file size limits and validation in your implementation",
    "Use appropriate colors to indicate upload status (success/error)",
    "Provide clear feedback when files are selected or upload completes",
  ],
};
