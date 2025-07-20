import { ComponentMetadata } from "../../types.ts";
import { FileInput } from "./FileInput.tsx";

export const fileInputMetadata: ComponentMetadata = {
  name: "File Input",
  description: "File upload control",
  category: "Data Input",
  path: "/components/input/file-input",
  tags: ["file", "upload", "input", "form", "attachment", "browse"],
  examples: ["basic", "sizes", "colors", "bordered", "ghost", "multiple"],
  relatedComponents: ["button", "form-control", "progress"],
  preview: (
    <div class="flex flex-col gap-3 w-full max-w-sm">
      <FileInput />
      <FileInput color="primary" size="sm" />
      <FileInput ghost multiple />
    </div>
  ),
};
