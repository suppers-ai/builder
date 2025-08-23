import { ComponentCategory, ComponentExample, ComponentMetadata } from "../../types.ts";
import { Stack } from "./Stack.tsx";

const stackExamples: ComponentExample[] = [
  {
    title: "Basic Stack",
    description: "Simple layered content stack",
    props: {
      children: [
        <div key="layer1" class="bg-primary text-primary-content p-6 rounded-lg">Layer 1</div>,
        <div key="layer2" class="bg-secondary text-secondary-content p-6 rounded-lg">Layer 2</div>,
        <div key="layer3" class="bg-accent text-accent-content p-6 rounded-lg">Layer 3</div>,
      ],
    },
  },
  {
    title: "Stacked Cards",
    description: "Card components arranged in a stack",
  },
  {
    title: "Stack with Text",
    description: "Text elements layered with different backgrounds",
  },
  {
    title: "Image Stack",
    description: "Stacked images with different effects",
  },
  {
    title: "Shadowed Stack",
    description: "Stack with shadow effects and depth",
  },
];

export const stackMetadata: ComponentMetadata = {
  name: "Stack",
  description: "Layered content stack",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/stack",
  tags: ["stack", "layer", "overlay", "z-index", "positioned", "cards"],
  examples: stackExamples,
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
