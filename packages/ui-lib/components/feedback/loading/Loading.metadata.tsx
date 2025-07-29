import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Loading } from "./Loading.tsx";

const loadingExamples: ComponentExample[] = [
  {
    title: "Basic Loading",
    description: "Simple loading spinners with different variants",
    props: {
      size: "md",
      loading: true
    }
  },  {
    title: "Loading Sizes",
    description: "Different sizes for various contexts",
    props: {
      size: "lg"
    }
  },  {
    title: "Loading Colors",
    description: "Various color themes",
    props: {
      size: "md",
      color: "primary"
    }
  },  {
    title: "Loading Variants",
    description: "Different animation styles",
    props: {
      size: "md",
      variant: "outlined"
    }
  },  {
    title: "Loading with Text",
    description: "Loading indicators with accompanying text",
    props: {
      size: "md",
      loading: true
    }
  },
];

const loadingProps: ComponentProp[] = [
  {
    name: "variant",
    type: "'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity'",
    description: "Loading animation style",
    default: "spinner"},
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the loading indicator",
    default: "md"},
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'",
    description: "Color theme for the loading indicator"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const loadingMetadata: ComponentMetadata = {
  name: "Loading",
  description: "Loading indicators and spinners for showing async operations and wait states",
  category: ComponentCategory.FEEDBACK,
  path: "/components/feedback/loading",
  tags: ["loading", "spinner", "indicator", "progress", "waiting", "busy"],
  relatedComponents: ["progress", "skeleton", "button"],
  interactive: false, // Display component, not interactive
  preview: (
    <div class="flex gap-4 items-center">
      <span class="loading loading-spinner loading-sm"></span>
      <span class="loading loading-dots loading-md"></span>
      <span class="loading loading-ring loading-lg text-primary"></span>
    </div>
  ),
  examples: loadingExamples,
  props: loadingProps,
  variants: ["spinner", "dots", "ring", "ball", "bars", "infinity"],
  useCases: [
    "Button loading states",
    "Page transitions",
    "Data fetching",
    "Form submissions",
    "File uploads",
  ],
  usageNotes: [
    "Choose appropriate variant based on design context and space available",
    "Use consistent sizes within the same interface section",
    "Consider accessibility by providing proper aria labels for screen readers",
    "Combine with text labels to provide context about what's loading",
    "Use colors sparingly - neutral colors work best for most cases",
    "Position loading indicators where users expect to see content appear",
  ]};
