import { ComponentMetadata } from "../../types.ts";
import { Diff } from "./Diff.tsx";

export const diffMetadata: ComponentMetadata = {
  name: "Diff",
  description: "Code difference display",
  category: "Data Display",
  path: "/components/display/diff",
  tags: ["diff", "comparison", "code", "changes", "additions", "deletions"],
  examples: ["basic", "line-numbers", "inline", "side-by-side"],
  relatedComponents: ["code", "mockup", "pre"],
  preview: (
    <div class="w-full max-w-md">
      <Diff
        oldContent={"function hello() {\n  console.log('Hello');\n}"}
        newContent={"function hello() {\n  console.log('Hello World!');\n  return true;\n}"}
        oldLabel="Before"
        newLabel="After"
        size="sm"
      />
    </div>
  ),
};
