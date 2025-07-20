import { ComponentMetadata } from "../../types.ts";
import { Indicator } from "./Indicator.tsx";

export const indicatorMetadata: ComponentMetadata = {
  name: "Indicator",
  description: "Position indicator",
  category: "Layout",
  path: "/components/layout/indicator",
  tags: ["indicator", "badge", "position", "overlay", "notification", "marker"],
  examples: ["basic", "positions", "colors", "in-button", "in-avatar", "text"],
  relatedComponents: ["badge", "avatar", "button"],
  preview: (
    <div class="flex gap-4 items-center">
      <Indicator item="5" position="top-right">
        <button class="btn">Messages</button>
      </Indicator>
      <Indicator item="!" position="top-right" color="error">
        <div class="avatar">
          <div class="w-12 rounded-full bg-primary"></div>
        </div>
      </Indicator>
    </div>
  ),
};
