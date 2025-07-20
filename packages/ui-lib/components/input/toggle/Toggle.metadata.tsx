import { ComponentMetadata } from "../../types.ts";
import { Toggle } from "./Toggle.tsx";

export const toggleMetadata: ComponentMetadata = {
  name: "Toggle",
  description: "On/off switches for binary state controls",
  category: "Input",
  path: "/components/input/toggle",
  tags: ["toggle", "switch", "binary"],
  examples: ["basic", "sizes", "colors", "disabled", "with-labels", "indeterminate"],
  relatedComponents: ["checkbox", "swap", "form-control"],
  preview: (
    <div class="flex gap-2">
      <Toggle checked />
      <Toggle color="primary" checked />
      <Toggle color="secondary" />
    </div>
  ),
};
