import { ComponentMetadata } from "../../types.ts";
import { RadialProgress } from "./RadialProgress.tsx";

export const radialProgressMetadata: ComponentMetadata = {
  name: "Radial Progress",
  description: "Circular progress indicator",
  category: "Feedback",
  path: "/components/feedback/radial-progress",
  tags: ["progress", "circular", "radial", "percentage", "completion", "ring"],
  examples: ["basic", "colors", "sizes", "with-value", "thick", "custom"],
  relatedComponents: ["progress", "countdown", "stat"],
  preview: (
    <div class="flex gap-4 items-center">
      <RadialProgress value={25} size="sm" showValue />
      <RadialProgress value={60} color="primary" showValue />
      <RadialProgress value={85} color="success" size="lg" showValue />
    </div>
  ),
};
