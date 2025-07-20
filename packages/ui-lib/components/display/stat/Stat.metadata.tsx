import { ComponentMetadata } from "../../types.ts";
import { Stat } from "./Stat.tsx";

export const statMetadata: ComponentMetadata = {
  name: "Stat",
  description: "Statistics display",
  category: "Data Display",
  path: "/components/display/stat",
  tags: ["statistics", "metrics", "numbers", "data", "dashboard", "analytics"],
  examples: ["basic", "with-description", "with-actions", "icons", "colors", "responsive"],
  relatedComponents: ["card", "progress", "countdown"],
  preview: (
    <div class="stats shadow">
      <Stat
        title="Downloads"
        value="31K"
        description="Jan 1st - Feb 1st"
      />
      <Stat
        title="Users"
        value="4,200"
        description="↗︎ 400 (22%)"
      />
    </div>
  ),
};
