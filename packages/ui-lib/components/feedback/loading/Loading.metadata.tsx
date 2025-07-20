import { ComponentMetadata } from "../../types.ts";
import { Loading } from "./Loading.tsx";

export const loadingMetadata: ComponentMetadata = {
  name: "Loading",
  description: "Loading spinner indicator",
  category: "Feedback",
  path: "/components/feedback/loading",
  tags: ["loading", "spinner", "indicator", "progress", "waiting", "busy"],
  examples: ["basic", "sizes", "colors", "dots", "ring", "ball"],
  relatedComponents: ["progress", "skeleton", "button"],
  preview: (
    <div class="flex gap-4 items-center">
      <Loading variant="spinner" size="sm" />
      <Loading variant="dots" size="md" />
      <Loading variant="ring" size="lg" color="primary" />
    </div>
  ),
};
