import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Swap } from "./Swap.tsx";

const swapExamples: ComponentExample[] = [
  {
    title: "Rotate Animation",
    description: "Swap with rotate animation between states",
    props: {
      rotate: true,
      on: <span>📄</span>,
      off: <span>📁</span>
    }
  },
  {
    title: "Flip Animation", 
    description: "Swap with flip animation between states",
    props: {
      flip: true,
      on: <span>😄</span>,
      off: <span>😐</span>
    }
  },
  {
    title: "On/Off Toggle",
    description: "Simple on/off state toggle",
    props: {
      on: <span>🌞</span>,
      off: <span>🌙</span>
    }
  },
  {
    title: "Animated Text",
    description: "Text-based swap with animation",
    props: {
      rotate: true,
      on: <span class="text-lg font-bold">ON</span>,
      off: <span class="text-lg font-bold">OFF</span>}
        }
      ];;

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
  )};
