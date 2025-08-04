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
    props: {
      min: 0,
      max: 100,
      value: 50,
    },
  },
  {
    title: "Range Sizes",
    description: "Different sizes for various contexts",
    props: {
      min: 0,
      max: 100,
      value: 50,
      size: "lg",
    },
  },
  {
    title: "Range Colors",
    description: "Various color themes",
    props: {
      min: 0,
      max: 100,
      value: 50,
      color: "primary",
    },
  },
  {
    title: "Range with Custom Steps",
    description: "Different step increments and ranges",
    props: {
      min: 0,
      max: 100,
      value: 50,
    },
  },
  {
    title: "Range with Value Display",
    description: "Showing current values with the range slider",
    props: {
      min: 0,
      max: 100,
      value: 50,
    },
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
