import { ComponentMetadata } from "../../types.ts";
import { Divider } from "./Divider.tsx";

export const dividerMetadata: ComponentMetadata = {
  name: "Divider",
  description: "Content separator",
  category: "Layout",
  path: "/components/layout/divider",
  tags: ["divider", "separator", "line", "break", "section", "hr"],
  examples: ["basic", "vertical", "with-text", "colors", "responsive"],
  relatedComponents: ["card", "hero", "join"],
  preview: (
    <div class="flex flex-col gap-4 w-full max-w-sm">
      <div>Section 1</div>
      <Divider />
      <div>Section 2</div>
      <Divider text="OR" />
      <div>Section 3</div>
    </div>
  ),
};
