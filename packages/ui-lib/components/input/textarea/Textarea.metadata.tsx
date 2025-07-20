import { ComponentMetadata } from "../../types.ts";
import { Textarea } from "./Textarea.tsx";

export const textareaMetadata: ComponentMetadata = {
  name: "Textarea",
  description: "Multi-line text input",
  category: "Data Input",
  path: "/components/input/textarea",
  tags: ["textarea", "text", "input", "form", "multiline", "area"],
  examples: ["basic", "sizes", "colors", "bordered", "ghost", "disabled"],
  relatedComponents: ["text-input", "form-control", "label"],
  preview: (
    <div class="flex flex-col gap-3 w-full max-w-sm">
      <Textarea placeholder="Basic textarea" rows={2} />
      <Textarea placeholder="Primary textarea" color="primary" rows={2} />
      <Textarea placeholder="Ghost textarea" ghost rows={2} />
    </div>
  ),
};
