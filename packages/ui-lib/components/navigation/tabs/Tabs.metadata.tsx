import { ComponentMetadata } from "../../types.ts";
import { Tabs } from "./Tabs.tsx";

export const tabsMetadata: ComponentMetadata = {
  name: "Tabs",
  description: "Tabbed content navigation",
  category: "Navigation",
  path: "/components/navigation/tabs",
  tags: ["tabs", "navigation", "switch", "toggle", "content", "panels"],
  examples: ["basic", "bordered", "lifted", "boxed", "sizes", "responsive"],
  relatedComponents: ["radio", "collapse", "card"],
  preview: (
    <div class="w-full max-w-sm">
      <Tabs
        tabs={[
          { id: "tab1", label: "Overview", content: "Overview content" },
          { id: "tab2", label: "Details", content: "Details content" },
          { id: "tab3", label: "Settings", content: "Settings content" }
        ]}
        activeTab="tab1"
        bordered
      />
    </div>
  ),
};
