import { ComponentMetadata } from "../../types.ts";
import { Timeline } from "./Timeline.tsx";

export const timelineMetadata: ComponentMetadata = {
  name: "Timeline",
  description: "Chronological event display",
  category: "Data Display",
  path: "/components/display/timeline",
  tags: ["timeline", "chronological", "events", "history", "progress", "steps"],
  examples: ["basic", "with-icons", "horizontal", "responsive", "colors"],
  relatedComponents: ["steps", "progress", "badge"],
  preview: (
    <div class="w-full max-w-sm">
      <Timeline
        items={[
          {
            title: "Project started",
            content: "Initial planning phase",
            timestamp: "Jan 1, 2024"
          },
          {
            title: "Development",
            content: "Core features implemented",
            timestamp: "Feb 15, 2024"
          },
          {
            title: "Testing",
            content: "Quality assurance phase",
            timestamp: "Mar 1, 2024"
          }
        ]}
      />
    </div>
  ),
};
