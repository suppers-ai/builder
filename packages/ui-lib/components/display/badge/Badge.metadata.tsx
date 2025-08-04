import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Badge } from "./Badge.tsx";

const badgeExamples: ComponentExample[] = [
  {
    title: "Basic Badges",
    description: "Simple badges with text content",
    props: {
      children: "New",
    },
  },
  {
    title: "Badge Colors",
    description: "Different color variants for various use cases",
    props: {
      children: "New",
      color: "primary",
    },
  },
  {
    title: "Badge Sizes",
    description: "Different sizes from xs to lg",
    props: {
      children: "New",
      size: "lg",
    },
  },
  {
    title: "Badge Variants",
    description: "Filled and dashed styles",
    props: {
      children: "New",
      variant: "dash",
    },
  },
  {
    title: "Status Badges",
    description: "Badges for showing various status states",
    props: {
      children: "New",
    },
  },
];

const badgeProps: ComponentProp[] = [
  {
    name: "children",
    type: "ComponentChildren",
    description: "Badge content (text, icons, etc.)",
  },
  {
    name: "content",
    type: "string | number",
    description: "Alternative way to set badge content",
  },
  {
    name: "color",
    type:
      "'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error'",
    description: "Badge color variant",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Badge size",
    default: "md",
  },
  {
    name: "variant",
    type: "'outline'",
    description: "Badge style variant",
  },
  {
    name: "position",
    type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'",
    description: "Position when used as indicator",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const badgeMetadata: ComponentMetadata = {
  name: "Badge",
  description: "Small labels and indicators for status, categories, and notifications",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/badge",
  tags: ["label", "status", "indicator"],
  relatedComponents: ["avatar", "button", "indicator"],
  interactive: false, // Static display component
  preview: (
    <div class="flex gap-2">
      <span class="badge badge-primary">New</span>
      <span class="badge badge-success">Active</span>
      <span class="badge badge-outline">Badge</span>
    </div>
  ),
  examples: badgeExamples,
  props: badgeProps,
  variants: ["basic", "colors", "sizes", "outline", "status"],
  useCases: ["Status indicators", "Notifications", "Categories", "Labels", "Counters"],
  usageNotes: [
    "Use descriptive text that clearly indicates the badge purpose",
    "Choose appropriate colors that match the semantic meaning",
    "Content prop can be used for simple text or numbers",
    "Children prop allows for complex content like icons",
    "Outline variant provides a subtle alternative to filled badges",
    "Position prop creates indicator-style badges",
    "Keep badge text concise for better readability",
  ],
};
