import { ComponentMetadata } from "../../types.ts";
import { Select } from "./Select.tsx";

export const selectMetadata: ComponentMetadata = {
  name: "Select",
  description: "Dropdown selection",
  category: "Data Input",
  path: "/components/input/select",
  tags: ["select", "dropdown", "input", "form", "choice", "options"],
  examples: ["basic", "sizes", "colors", "bordered", "ghost", "multiple"],
  relatedComponents: ["dropdown", "radio", "form-control"],
  preview: (
    <div class="flex gap-4">
      <Select
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
          { value: "3", label: "Option 3" },
        ]}
        placeholder="Choose..."
        size="sm"
      />
      <Select
        options={[
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
        ]}
        value="primary"
        color="primary"
        size="sm"
      />
    </div>
  ),
};
