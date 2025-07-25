import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Swap } from "./Swap.tsx";

const swapExamples: ComponentExample[] = [
  {
    title: "Rotate Animation",
    description: "Swap with rotate animation between states",
    code: `<Swap
  rotate
  on={<span>📄</span>}
  off={<span>📁</span>}
/>`,
    props: {
      rotate: true,
      on: <span>📄</span>,
      off: <span>📁</span>,
    },
    showCode: true,
  },
  {
    title: "Flip Animation", 
    description: "Swap with flip animation between states",
    code: `<Swap
  flip
  on={<span>😄</span>}
  off={<span>😐</span>}
/>`,
    props: {
      flip: true,
      on: <span>😄</span>,
      off: <span>😐</span>,
    },
    showCode: true,
  },
  {
    title: "On/Off Toggle",
    description: "Simple on/off state toggle",
    code: `<Swap
  on={<span>🌞</span>}
  off={<span>🌙</span>}
/>`,
    props: {
      on: <span>🌞</span>,
      off: <span>🌙</span>,
    },
    showCode: true,
  },
  {
    title: "Animated Text",
    description: "Text-based swap with animation",
    code: `<Swap
  rotate
  on={<span class="text-lg font-bold">ON</span>}
  off={<span class="text-lg font-bold">OFF</span>}
/>`,
    props: {
      rotate: true,
      on: <span class="text-lg font-bold">ON</span>,
      off: <span class="text-lg font-bold">OFF</span>,
    },
    showCode: true,
  },
];

export const swapMetadata: ComponentMetadata = {
  name: "Swap",
  description: "Toggle states",
  category: ComponentCategory.ACTION,
  path: "/components/action/swap",
  tags: ["toggle", "state", "switch", "animation", "transition"],
  examples: swapExamples,
  relatedComponents: ["toggle", "button"],
  preview: (
    <div class="flex gap-4">
      <Swap
        rotate
        on={<span>📄</span>}
        off={<span>📁</span>}
      />
      <Swap
        flip
        on={<span>😄</span>}
        off={<span>😐</span>}
      />
    </div>
  ),
};
