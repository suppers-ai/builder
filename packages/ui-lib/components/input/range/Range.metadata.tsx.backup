import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Range } from "./Range.tsx";

const rangeExamples: ComponentExample[] = [
  {
    title: "Basic Range",
    description: "Simple range sliders with different values",
    code: `<Range value={25} />
<Range value={50} />
<Range value={75} />`,
    showCode: true,
  },
  {
    title: "Range Sizes",
    description: "Different sizes for various contexts",
    code: `<Range size="xs" value={30} />
<Range size="sm" value={50} />
<Range size="md" value={70} />
<Range size="lg" value={90} />`,
    showCode: true,
  },
  {
    title: "Range Colors",
    description: "Various color themes",
    code: `<Range color="primary" value={60} />
<Range color="secondary" value={60} />
<Range color="accent" value={60} />
<Range color="success" value={60} />
<Range color="warning" value={60} />
<Range color="error" value={60} />`,
    showCode: true,
  },
  {
    title: "Range with Custom Steps",
    description: "Different step increments and ranges",
    code: `<div class="space-y-4">
  <div>
    <div class="mb-2 text-sm">Volume (0-100, step 10)</div>
    <Range min={0} max={100} step={10} value={70} />
  </div>
  <div>
    <div class="mb-2 text-sm">Price ($10-$1000, step $50)</div>
    <Range min={10} max={1000} step={50} value={250} />
  </div>
  <div>
    <div class="mb-2 text-sm">Precision (0-1, step 0.1)</div>
    <Range min={0} max={1} step={0.1} value={0.7} />
  </div>
</div>`,
    showCode: true,
  },
  {
    title: "Range with Value Display",
    description: "Showing current values with the range slider",
    code: `<div class="space-y-4">
  <div>
    <div class="flex justify-between text-sm mb-2">
      <span>Brightness</span>
      <span>75%</span>
    </div>
    <Range value={75} color="primary" />
  </div>
  <div>
    <div class="flex justify-between text-sm mb-2">
      <span>Temperature</span>
      <span>22°C</span>
    </div>
    <Range min={10} max={35} value={22} color="accent" />
  </div>
  <div>
    <div class="flex justify-between text-sm mb-2">
      <span>Difficulty</span>
      <span class="badge badge-error badge-sm">Hard</span>
    </div>
    <Range min={1} max={5} value={4} color="error" />
  </div>
</div>`,
    showCode: true,
  },
];

const rangeProps: ComponentProp[] = [
  {
    name: "value",
    type: "number",
    description: "Current value of the range slider",
    default: "50",
  },
  {
    name: "min",
    type: "number",
    description: "Minimum value",
    default: "0",
  },
  {
    name: "max",
    type: "number",
    description: "Maximum value",
    default: "100",
  },
  {
    name: "step",
    type: "number",
    description: "Step increment for the slider",
    default: "1",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the range slider",
    default: "md",
  },
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'",
    description: "Color theme for the range slider",
    default: "primary",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Whether the range slider is disabled",
    default: "false",
  },
  {
    name: "onChange",
    type: "(event: Event) => void",
    description: "Change event handler",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const rangeMetadata: ComponentMetadata = {
  name: "Range",
  description: "Range slider input for selecting numeric values within a specified range",
  category: ComponentCategory.INPUT,
  path: "/components/input/range",
  tags: ["range", "slider", "input", "form", "numeric", "control"],
  relatedComponents: ["progress", "form-control", "input"],
  interactive: true, // User can drag to change value
  preview: (
    <div class="flex flex-col gap-4 w-full">
      <input type="range" class="range range-primary" value={40} min={0} max={100} />
      <input type="range" class="range range-secondary range-sm" value={70} min={0} max={100} />
      <input type="range" class="range range-accent" value={25} min={0} max={100} step={5} />
    </div>
  ),
  examples: rangeExamples,
  props: rangeProps,
  variants: ["basic", "sizes", "colors", "steps", "with-labels"],
  useCases: [
    "Volume controls",
    "Price filters",
    "Settings sliders",
    "Progress adjustments",
    "Quantity selectors",
  ],
  usageNotes: [
    "Use appropriate min/max values based on the data range",
    "Consider step size for precision - smaller steps for fine control",
    "Display current values to provide user feedback",
    "Use colors to convey meaning (success for good values, warning for limits)",
    "Label ranges clearly to indicate what values represent",
    "Consider accessibility by providing keyboard navigation support",
  ],
};
