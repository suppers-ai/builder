import { ComponentMetadata } from "../../types.ts";
import { Accordion } from "./Accordion.tsx";

export const accordionMetadata: ComponentMetadata = {
  name: "Accordion",
  description: "Collapsible content",
  category: "Data Display",
  path: "/components/display/accordion",
  tags: ["collapsible", "expand", "collapse", "foldable", "sections"],
  examples: ["basic", "multiple", "arrow", "plus-minus"],
  relatedComponents: ["collapse", "card", "details"],
  preview: (
    <Accordion
      items={[
        {
          id: "1",
          title: "Getting Started",
          content: "Learn the basics of our platform",
        },
        {
          id: "2",
          title: "Advanced Features",
          content: "Explore advanced functionality",
        },
      ]}
      defaultOpen={["1"]}
    />
  ),
};
