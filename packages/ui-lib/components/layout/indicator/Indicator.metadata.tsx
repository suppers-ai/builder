import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Indicator } from "./Indicator.tsx";

const indicatorExamples: ComponentExample[] = [
  {
    title: "Basic Indicator",
    description: "Simple indicator with numeric value",
    props: {
      item: "5",
      children: <button class="btn">Messages</button>
    }
  },
  {
    title: "Position Variants",
    description: "Indicators in different positions"},
  {
    title: "Color Variants",
    description: "Indicators with different color themes"},
  {
    title: "Indicator on Button",
    description: "Common pattern for notification buttons"},
  {
    title: "Indicator on Avatar",
    description: "Status indicators on user avatars"},
  {
    title: "Text Indicators",
    description: "Indicators with custom text labels"},
];

export const indicatorMetadata: ComponentMetadata = {
  name: "Indicator",
  description: "Position indicator",
  category: ComponentCategory.LAYOUT,
  path: "/components/layout/indicator",
  tags: ["indicator", "badge", "position", "overlay", "notification", "marker"],
  examples: indicatorExamples,
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
  )};
