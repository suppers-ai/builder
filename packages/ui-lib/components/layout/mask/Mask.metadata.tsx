import { ComponentMetadata } from "../../types.ts";
import { Mask } from "./Mask.tsx";

export const maskMetadata: ComponentMetadata = {
  name: "Mask",
  description: "Shape masking utility",
  category: "Layout",
  path: "/components/layout/mask",
  tags: ["mask", "shape", "clip", "cut", "geometric", "design"],
  examples: ["squircle", "heart", "hexagon", "triangle", "star", "circle"],
  relatedComponents: ["avatar", "artboard", "card"],
  preview: (
    <div class="flex gap-3">
      <Mask variant="heart">
        <div class="bg-primary w-16 h-16"></div>
      </Mask>
      <Mask variant="hexagon">
        <div class="bg-secondary w-16 h-16"></div>
      </Mask>
      <Mask variant="star">
        <div class="bg-accent w-16 h-16"></div>
      </Mask>
    </div>
  ),
};
