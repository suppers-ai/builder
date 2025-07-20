import { ComponentMetadata } from "../../types.ts";
import { Progress } from "./Progress.tsx";

export const progressMetadata: ComponentMetadata = {
  name: "Progress",
  description: "Linear progress bar",
  category: "Feedback",
  path: "/components/feedback/progress",
  tags: ["progress", "bar", "loading", "percentage", "completion", "linear"],
  examples: ["basic", "colors", "sizes", "indeterminate", "with-value"],
  relatedComponents: ["radial-progress", "loading", "stat"],
  preview: (
    <div class="flex flex-col gap-3 w-full max-w-sm">
      <Progress value={32} color="primary" />
      <Progress value={70} color="success" />
      <Progress indeterminate color="accent" />
    </div>
  ),
};
