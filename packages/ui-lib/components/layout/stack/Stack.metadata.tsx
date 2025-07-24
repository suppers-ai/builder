import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Stack } from "./Stack.tsx";

const stackExamples: ComponentExample[] = [
  {
    title: "Basic Stack",
    description: "Simple layered content stack",
    code: `<Stack>
  <div class="bg-primary text-primary-content p-6 rounded-lg">Layer 1</div>
  <div class="bg-secondary text-secondary-content p-6 rounded-lg">Layer 2</div>
  <div class="bg-accent text-accent-content p-6 rounded-lg">Layer 3</div>
</Stack>`,
    showCode: true,
  },
  {
    title: "Stacked Cards",
    description: "Card components arranged in a stack",
    code: `<Stack>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Card 1</h2>
      <p>This is the bottom card in the stack</p>
    </div>
  </div>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Card 2</h2>
      <p>This is the middle card</p>
    </div>
  </div>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Card 3</h2>
      <p>This is the top card</p>
    </div>
  </div>
</Stack>`,
    showCode: true,
  },
  {
    title: "Stack with Text",
    description: "Text elements layered with different backgrounds",
    code: `<Stack class="w-64">
  <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-lg text-center">
    <h3 class="text-xl font-bold">Background Layer</h3>
  </div>
  <div class="bg-white/90 backdrop-blur p-6 rounded-lg text-center shadow-lg">
    <h3 class="text-gray-800 font-semibold">Middle Layer</h3>
    <p class="text-gray-600">Semi-transparent overlay</p>
  </div>
  <div class="bg-primary text-primary-content p-4 rounded-lg text-center">
    <h4 class="font-bold">Top Layer</h4>
  </div>
</Stack>`,
    showCode: true,
  },
  {
    title: "Image Stack",
    description: "Stacked images with different effects",
    code: `<Stack class="w-48">
  <img 
    src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg" 
    alt="Background" 
    class="rounded-lg w-full h-32 object-cover"
  />
  <div class="bg-black/50 w-full h-32 rounded-lg flex items-center justify-center">
    <span class="text-white font-bold text-lg">Overlay Text</span>
  </div>
  <div class="bg-primary text-primary-content p-2 rounded w-fit self-end mr-2 mb-2">
    <span class="text-sm font-semibold">Badge</span>
  </div>
</Stack>`,
    showCode: true,
  },
  {
    title: "Shadowed Stack",
    description: "Stack with shadow effects and depth",
    code: `<Stack class="w-56">
  <div class="bg-gray-300 p-8 rounded-lg shadow-2xl transform translate-x-2 translate-y-2">
    <div class="text-gray-500 text-center">Shadow Layer</div>
  </div>
  <div class="bg-gray-200 p-8 rounded-lg shadow-xl transform translate-x-1 translate-y-1">
    <div class="text-gray-600 text-center">Middle Shadow</div>
  </div>
  <div class="bg-white p-8 rounded-lg shadow-lg">
    <div class="text-gray-800 text-center font-semibold">Top Card</div>
  </div>
</Stack>`,
    showCode: true,
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
