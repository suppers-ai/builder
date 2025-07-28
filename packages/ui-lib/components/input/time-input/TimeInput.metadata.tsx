import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";

const timeInputExamples: ComponentExample[] = [
  {
    title: "Basic Time Input",
    description: "Simple time input for time selection",
    props: {
      value: "14:30"
    }
  },  {
    title: "Time Input with Range",
    description: "Time input with min/max constraints",
    props: {
      value: "14:30"
    }
  },  {
    title: "Time Input Sizes",
    description: "Different time input sizes",
    props: {
      value: "14:30",
      size: "lg"
    }
  },  {
    title: "Time Input States",
    description: "Different input states and colors",
    props: {
      value: "14:30"
    }
  },
];

const timeInputProps: ComponentProp[] = [
  {
    name: "value",
    type: "string",
    description: "The time value in HH:MM format"},
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text for the input"},
  {
    name: "min",
    type: "string",
    description: "Minimum allowed time in HH:MM format"},
  {
    name: "max",
    type: "string",
    description: "Maximum allowed time in HH:MM format"},
  {
    name: "step",
    type: "string",
    description: "Step value for time increments (in minutes)"},
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the time input",
    default: "md"},
  {
    name: "color",
    type: "DaisyUIColor",
    description: "Color theme for the input"},
  {
    name: "bordered",
    type: "boolean",
    description: "Show input border",
    default: "true"},
  {
    name: "ghost",
    type: "boolean",
    description: "Ghost style input",
    default: "false"},
  {
    name: "disabled",
    type: "boolean",
    description: "Disable the input",
    default: "false"},
  {
    name: "required",
    type: "boolean",
    description: "Mark input as required",
    default: "false"},
  {
    name: "onChange",
    type: "(event: Event) => void",
    description: "Callback when time value changes"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const timeInputMetadata: ComponentMetadata = {
  name: "TimeInput",
  description: "Time input field for selecting time with native browser controls",
  category: ComponentCategory.INPUT,
  path: "/components/input/time-input",
  tags: ["time", "input", "form", "picker", "clock"],
  relatedComponents: ["date-input", "datetime-input", "input"],
  interactive: true,
  preview: (
    <div class="flex gap-2">
      <input type="time" class="input input-bordered" value="14:30" />
    </div>
  ),
  examples: timeInputExamples,
  props: timeInputProps,
  variants: ["bordered", "ghost", "no-border"],
  useCases: ["Appointment scheduling", "Work hours input", "Meeting times", "Event planning"],
  usageNotes: [
    "Uses native browser time picker for consistent UX",
    "Value format should be HH:MM (24-hour format)",
    "Use min/max props to restrict selectable time range",
    "Step prop controls time increment precision (in minutes)",
    "Automatically handles 12/24 hour format based on user locale",
  ]};
