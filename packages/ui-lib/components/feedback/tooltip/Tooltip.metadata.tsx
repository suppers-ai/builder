import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Tooltip } from "./Tooltip.tsx";

const tooltipExamples: ComponentExample[] = [
  {
    title: "Basic Tooltip",
    description: "Simple tooltips on different elements",
    props: {
      content: "This is a helpful tooltip",
      children: "Hover me"
    }
  },  {
    title: "Tooltip Positions",
    description: "Tooltips positioned around the target element",
    props: {
      content: "This is a helpful tooltip",
      children: "Hover me"
    }
  },  {
    title: "Tooltip Colors",
    description: "Different colored tooltips for various contexts",
    props: {
      content: "This is a helpful tooltip",
      children: "Hover me",
      color: "primary"
    }
  },  {
    title: "Always Visible Tooltips",
    description: "Tooltips that are always shown (useful for demonstrations)",
    props: {
      content: "This is a helpful tooltip",
      children: "Hover me"
    }
  },  {
    title: "Tooltips in Real Contexts",
    description: "Practical examples of tooltips in UI elements",
    props: {
      content: "This is a helpful tooltip",
      children: "Hover me"
    }
  },
];

const tooltipProps: ComponentProp[] = [
  {
    name: "tip",
    type: "string",
    description: "Text content to display in the tooltip",
    required: true},
  {
    name: "position",
    type: "'top' | 'bottom' | 'left' | 'right'",
    description: "Position of tooltip relative to the target element",
    default: "top"},
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
    description: "Color theme for the tooltip"},
  {
    name: "open",
    type: "boolean",
    description: "Force tooltip to always be visible",
    default: "false"},
  {
    name: "children",
    type: "ComponentChildren",
    description: "Element that triggers the tooltip on hover",
    required: true},
  {
    name: "onShow",
    type: "() => void",
    description: "Callback when tooltip becomes visible"},
  {
    name: "onHide",
    type: "() => void",
    description: "Callback when tooltip becomes hidden"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const tooltipMetadata: ComponentMetadata = {
  name: "Tooltip",
  description:
    "Contextual information popups that appear on hover to provide helpful hints and details",
  category: ComponentCategory.FEEDBACK,
  path: "/components/feedback/tooltip",
  tags: ["tooltip", "hover", "popup", "help", "information", "hint"],
  relatedComponents: ["dropdown", "modal", "button"],
  interactive: false, // Triggered by hover, not click
  preview: (
    <div class="flex gap-4 items-center">
      <div class="tooltip tooltip-top" data-tip="This is a tooltip">
        <button type="button" class="btn btn-sm">Hover me</button>
      </div>
      <div class="tooltip tooltip-bottom tooltip-primary" data-tip="Bottom tooltip">
        <button type="button" class="btn btn-sm btn-primary">Primary</button>
      </div>
      <div class="tooltip tooltip-right tooltip-accent" data-tip="Right side">
        <button type="button" class="btn btn-sm btn-accent">Accent</button>
      </div>
    </div>
  ),
  examples: tooltipExamples,
  props: tooltipProps,
  variants: ["basic", "positions", "colors", "always-visible"],
  useCases: [
    "Help text",
    "Additional information",
    "Form field hints",
    "Icon explanations",
    "Feature guidance",
  ],
  usageNotes: [
    "Keep tooltip text concise and helpful - aim for one sentence",
    "Position tooltips to avoid covering important UI elements",
    "Use appropriate colors to convey meaning (warning for cautions, info for help)",
    "Consider accessibility - tooltips should also be accessible via keyboard",
    "Don't use tooltips for critical information that users must see",
    "Test tooltip positioning on mobile devices where hover doesn't work",
  ]};
