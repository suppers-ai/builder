import { ComponentMetadata } from "../../types.ts";
import { Stack } from "./Stack.tsx";

export const stackMetadata: ComponentMetadata = {
  name: "Stack",
  description: "Layered content stack",
  category: "Layout",
  path: "/components/layout/stack",
  tags: ["stack", "layer", "overlay", "z-index", "positioned", "cards"],
  examples: ["basic", "stacked-cards", "with-text", "image-stack", "shadowed"],
  relatedComponents: ["card", "hero", "indicator"],
  preview: (
    <div class="w-48">
      <Stack>
        <div class="bg-primary text-primary-content p-4 rounded-lg">Layer 1</div>
        <div class="bg-secondary text-secondary-content p-4 rounded-lg">Layer 2</div>
        <div class="bg-accent text-accent-content p-4 rounded-lg">Layer 3</div>
      </Stack>
    </div>
  ),
};
