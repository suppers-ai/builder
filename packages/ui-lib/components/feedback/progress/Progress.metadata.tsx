import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Progress } from "./Progress.tsx";

const progressExamples: ComponentExample[] = [
  {
    title: "Basic Progress",
    description: "Simple progress bars with different values",
    props: {
      value: 70,
      max: 100
    }
  },  {
    title: "Progress Colors",
    description: "Different color themes for various contexts",
    props: {
      value: 70,
      max: 100,
      color: "primary"
    }
  },  {
    title: "Progress Sizes",
    description: "Different sizes for various use cases",
    props: {
      value: 70,
      max: 100,
      size: "lg"
    }
  },  {
    title: "Indeterminate Progress",
    description: "Progress bars without specific progress value",
    props: {
      value: 70,
      max: 100
    }
  },  {
    title: "Progress with Labels",
    description: "Progress bars with value labels and descriptions",
    props: {
      value: 70,
      max: 100
    }
  },
];

const progressProps: ComponentProp[] = [
  {
    name: "value",
    type: "number",
    description: "Progress value (0-100)"},
  {
    name: "max",
    type: "number",
    description: "Maximum value",
    default: "100"},
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
    description: "Progress bar color theme"},
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Progress bar size",
    default: "md"},
  {
    name: "indeterminate",
    type: "boolean",
    description: "Show indeterminate (loading) animation",
    default: "false"},
  {
    name: "striped",
    type: "boolean",
    description: "Show striped pattern",
    default: "false"},
  {
    name: "animated",
    type: "boolean",
    description: "Animate the striped pattern",
    default: "false"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const progressMetadata: ComponentMetadata = {
  name: "Progress",
  description: "Linear progress bars for showing completion status and loading states",
  category: ComponentCategory.FEEDBACK,
  path: "/components/feedback/progress",
  tags: ["progress", "bar", "loading", "percentage", "completion"],
  relatedComponents: ["radial-progress", "loading", "stat"],
  interactive: false, // Display component, not interactive
  preview: (
    <div class="space-y-3 w-full max-w-sm">
      <progress class="progress progress-primary w-full" value={32} max={100}></progress>
      <progress class="progress progress-success w-full" value={70} max={100}></progress>
      <progress class="progress progress-accent w-full"></progress>
    </div>
  ),
  examples: progressExamples,
  props: progressProps,
  variants: ["basic", "colors", "sizes", "indeterminate", "with-labels"],
  useCases: ["File uploads", "Downloads", "Form completion", "Loading states", "Task progress"],
  usageNotes: [
    "Use appropriate colors to convey meaning (success for completion, error for failures)",
    "Provide clear labels when showing specific progress values",
    "Use indeterminate state when progress cannot be measured",
    "Consider accessibility by providing aria-label or aria-describedby",
    "Combine with text labels for better user experience",
    "Use consistent sizing within the same interface",
  ]};
