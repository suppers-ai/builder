import { ComponentMetadata } from "../../types.ts";
import { Checkbox } from "./Checkbox.tsx";

export const checkboxMetadata: ComponentMetadata = {
  name: "Checkbox",
  description: "Boolean input control",
  category: "Data Input",
  path: "/components/input/checkbox",
  tags: ["checkbox", "input", "form", "boolean", "selection", "tick"],
  examples: ["basic", "sizes", "colors", "disabled", "indeterminate", "in-form"],
  relatedComponents: ["radio", "toggle", "form-control"],
  preview: (
    <div class="flex flex-col gap-2">
      <Checkbox label="Default checkbox" checked />
      <Checkbox label="Primary checkbox" color="primary" checked />
      <Checkbox label="Indeterminate" indeterminate />
    </div>
  ),
};
