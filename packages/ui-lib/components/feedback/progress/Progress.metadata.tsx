import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const progressExamples: ComponentExample[] = [
  {
    title: "Basic Progress",
    description: "Simple progress bars with different values",
    code: `<Progress value={25} />
<Progress value={50} />
<Progress value={75} />
<Progress value={100} />`,
    showCode: true,
  },
  {
    title: "Progress Colors",
    description: "Different color themes for various contexts",
    code: `<Progress value={60} color="primary" />
<Progress value={40} color="secondary" />
<Progress value={80} color="accent" />
<Progress value={90} color="success" />
<Progress value={30} color="warning" />
<Progress value={20} color="error" />`,
    showCode: true,
  },
  {
    title: "Progress Sizes",
    description: "Different sizes for various use cases",
    code: `<Progress value={45} size="xs" />
<Progress value={45} size="sm" />
<Progress value={45} size="md" />
<Progress value={45} size="lg" />`,
    showCode: true,
  },
  {
    title: "Indeterminate Progress",
    description: "Progress bars without specific progress value",
    code: `<Progress indeterminate />
<Progress indeterminate color="primary" />
<Progress indeterminate color="success" />`,
    showCode: true,
  },
  {
    title: "Progress with Labels",
    description: "Progress bars with value labels and descriptions",
    code: `<div class="space-y-4">
  <div>
    <div class="flex justify-between mb-1">
      <span class="text-sm font-medium">Download Progress</span>
      <span class="text-sm">45%</span>
    </div>
    <Progress value={45} color="primary" />
  </div>
  
  <div>
    <div class="flex justify-between mb-1">
      <span class="text-sm font-medium">Upload Complete</span>
      <span class="text-sm">100%</span>
    </div>
    <Progress value={100} color="success" />
  </div>
</div>`,
    showCode: true,
  },
];

const progressProps: ComponentProp[] = [
  {
    name: "value",
    type: "number",
    description: "Progress value (0-100)",
  },
  {
    name: "max",
    type: "number",
    description: "Maximum value",
    default: "100",
  },
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
    description: "Progress bar color theme",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Progress bar size",
    default: "md",
  },
  {
    name: "indeterminate",
    type: "boolean",
    description: "Show indeterminate (loading) animation",
    default: "false",
  },
  {
    name: "striped",
    type: "boolean",
    description: "Show striped pattern",
    default: "false",
  },
  {
    name: "animated",
    type: "boolean",
    description: "Animate the striped pattern",
    default: "false",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
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
  ],
};
