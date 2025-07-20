import { ComponentMetadata } from "../../types.ts";
import { Collapse } from "./Collapse.tsx";

export const collapseMetadata: ComponentMetadata = {
  name: "Collapse",
  description: "Expandable content",
  category: "Data Display",
  path: "/components/display/collapse",
  tags: ["expand", "collapse", "toggle", "accordion", "foldable", "show-hide"],
  examples: ["basic", "with-arrow", "with-plus", "checkbox", "focus"],
  relatedComponents: ["accordion", "details", "drawer"],
  preview: (
    <div class="w-full max-w-sm">
      <Collapse title="Click to expand" arrow>
        This content is hidden by default and can be expanded by clicking the title above.
      </Collapse>
    </div>
  ),
};
