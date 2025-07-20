import { ComponentMetadata } from "../../types.ts";
import { Artboard } from "./Artboard.tsx";

export const artboardMetadata: ComponentMetadata = {
  name: "Artboard",
  description: "Device mockup frame",
  category: "Layout",
  path: "/components/layout/artboard",
  tags: ["artboard", "mockup", "device", "frame", "demo", "showcase"],
  examples: ["basic", "phone", "horizontal", "demo", "responsive"],
  relatedComponents: ["mockup", "hero", "card"],
  preview: (
    <div class="flex gap-4">
      <Artboard size="2" phone>
        <div class="bg-primary text-primary-content p-4 h-full flex items-center justify-center">
          Mobile View
        </div>
      </Artboard>
      <Artboard size="3" horizontal>
        <div class="bg-secondary text-secondary-content p-4 h-full flex items-center justify-center">
          Desktop View
        </div>
      </Artboard>
    </div>
  ),
};
