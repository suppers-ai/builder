import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { FileInput } from "./FileInput.tsx";

const fileInputExamples: ComponentExample[] = [
  {
    title: "Basic File Input",
    description: "Standard file input with default styling",
    code: `<FileInput />`,
    showCode: true,
  },
  {
    title: "Different Sizes",
    description: "File inputs in various sizes",
    code: `<FileInput size="xs" />
<FileInput size="sm" />
<FileInput size="md" />
<FileInput size="lg" />`,
    showCode: true,
  },
  {
    title: "Color Variants",
    description: "File inputs with different color themes",
    code: `<FileInput color="primary" />
<FileInput color="secondary" />
<FileInput color="accent" />
<FileInput color="success" />`,
    showCode: true,
  },
  {
    title: "Bordered and Ghost",
    description: "Different visual styles for file inputs",
    code: `<FileInput bordered />
<FileInput ghost />
<FileInput bordered={false} />`,
    showCode: true,
  },
  {
    title: "Multiple Files",
    description: "File input that accepts multiple files with specific types",
    code: `<FileInput 
  multiple
  accept="image/*"
  color="primary"
/>`,
    showCode: true,
  },
  {
    title: "PDF and Document Upload",
    description: "File input restricted to document types",
    code: `<FileInput 
  accept=".pdf,.doc,.docx"
  color="info"
  size="lg"
/>`,
    showCode: true,
  },
];

export const fileInputMetadata: ComponentMetadata = {
  name: "File Input",
  description: "File upload control",
  category: ComponentCategory.DISPLAY,
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
};
