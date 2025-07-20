import { ComponentMetadata } from "../../types.ts";
import { Badge } from "./Badge.tsx";

export const badgeMetadata: ComponentMetadata = {
  name: "Badge",
  description: "Small labels and indicators for status, categories, and notifications",
  category: "Display",
  path: "/components/display/badge",
  tags: ["label", "status", "indicator"],
  examples: ["basic", "colors", "sizes", "outline", "neutral", "in-button"],
  relatedComponents: ["avatar", "button", "indicator"],
  preview: (
    <div class="flex gap-2">
      <Badge color="primary">New</Badge>
      <Badge color="success">Active</Badge>
      <Badge variant="outline">Badge</Badge>
    </div>
  ),
};
