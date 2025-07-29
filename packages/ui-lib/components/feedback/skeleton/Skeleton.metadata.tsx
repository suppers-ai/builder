import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Skeleton } from "./Skeleton.tsx";

const skeletonExamples: ComponentExample[] = [
  {
    title: "Basic Skeleton",
    description: "Simple rectangular skeleton loaders for text content",
    props: {
      width: "100%",
      height: "20px"
    }
  },  {
    title: "Circle Skeleton",
    description: "Circular skeletons for avatars and profile pictures",
    props: {
      width: "100%",
      height: "20px"
    }
  },  {
    title: "Card Skeleton",
    description: "Complex skeleton layout mimicking card content",
    props: {
      width: "100%",
      height: "20px"
    }
  },  {
    title: "List Skeleton",
    description: "Skeleton for list items and table rows",
    props: {
      width: "100%",
      height: "20px"
    }
  },  {
    title: "Text Skeleton",
    description: "Skeleton placeholders for text content of various lengths",
    props: {
      width: "100%",
      height: "20px"
    }
  },
];

const skeletonProps: ComponentProp[] = [
  {
    name: "width",
    type: "string | number",
    description: "Width of the skeleton (px number or CSS string like '100%')"},
  {
    name: "height",
    type: "string | number",
    description: "Height of the skeleton (px number or CSS string)"},
  {
    name: "circle",
    type: "boolean",
    description: "Render as a circular skeleton (for avatars)",
    default: "false"},
  {
    name: "rounded",
    type: "boolean",
    description: "Apply rounded corners to rectangular skeletons",
    default: "true"},
  {
    name: "animation",
    type: "'pulse' | 'wave' | 'none'",
    description: "Animation type for the skeleton",
    default: "pulse"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const skeletonMetadata: ComponentMetadata = {
  name: "Skeleton",
  description: "Loading placeholders that mimic content structure while data is being fetched",
  category: ComponentCategory.FEEDBACK,
  path: "/components/feedback/skeleton",
  tags: ["skeleton", "placeholder", "loading", "shimmer", "ghost", "content"],
  relatedComponents: ["loading", "avatar", "card"],
  interactive: false, // Loading placeholder, not interactive
  preview: (
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="skeleton w-10 h-10 rounded-full shrink-0"></div>
        <div class="flex-1">
          <div class="skeleton h-4 w-3/5"></div>
          <div class="skeleton h-3 w-2/5 mt-1"></div>
        </div>
      </div>
      <div class="skeleton h-24 w-full"></div>
    </div>
  ),
  examples: skeletonExamples,
  props: skeletonProps,
  variants: ["basic", "circle", "text", "card", "list"],
  useCases: [
    "Loading states",
    "Content placeholders",
    "Image loading",
    "Text loading",
    "Complex layouts",
  ],
  usageNotes: [
    "Use skeletons that match the actual content structure and dimensions",
    "Vary skeleton widths to create more realistic loading states",
    "Combine circular and rectangular skeletons for complex layouts",
    "Keep skeleton animations subtle to avoid distraction",
    "Replace skeletons with actual content as soon as data loads",
    "Consider accessibility by providing appropriate aria-labels for screen readers",
  ]};
