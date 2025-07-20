import { ComponentMetadata } from "../../types.ts";
import { Tooltip } from "./Tooltip.tsx";

export const tooltipMetadata: ComponentMetadata = {
  name: "Tooltip",
  description: "Hover information popup",
  category: "Feedback",
  path: "/components/feedback/tooltip",
  tags: ["tooltip", "hover", "popup", "help", "information", "hint"],
  examples: ["basic", "positions", "colors", "with-force-open", "responsive"],
  relatedComponents: ["dropdown", "modal", "button"],
  preview: (
    <div class="flex gap-4 items-center">
      <Tooltip tip="This is a tooltip" position="top">
        <button class="btn btn-sm">Hover me</button>
      </Tooltip>
      <Tooltip tip="Bottom tooltip" position="bottom" color="primary">
        <button class="btn btn-sm btn-primary">Primary</button>
      </Tooltip>
    </div>
  ),
};
