import { ComponentMetadata } from "../../types.ts";
import { Swap } from "./Swap.tsx";

export const swapMetadata: ComponentMetadata = {
  name: "Swap",
  description: "Toggle states",
  category: "Actions",
  path: "/components/action/swap",
  tags: ["toggle", "state", "switch", "animation", "transition"],
  examples: ["rotate", "flip", "on-off", "animated"],
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
