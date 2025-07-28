import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";

const datetimeInputExamples: ComponentExample[] = [
  {
    title: "Basic DateTime Input",
    description: "Simple datetime input for date and time selection",
    props: {
      value: "2024-01-15T14:30"
    }
  },  {
    title: "DateTime Input with Range",
    description: "DateTime input with min/max constraints",
    props: {
      value: "2024-01-15T14:30"
    }
  },  {
    title: "DateTime Input Sizes",
    description: "Different datetime input sizes",
    props: {
      value: "2024-01-15T14:30",
      size: "lg"
    }
  },  {
    title: "DateTime Input States",
    description: "Different input states and colors",
    props: {
      value: "2024-01-15T14:30"
    }
  },
];

const datetimeInputProps: ComponentProp[] = [
  {
    name: "value",
    type: "string",
    description: "The datetime value in ISO format (YYYY-MM-DDTHH:MM)"},
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text for the input"},
  {
    name: "min",
    type: "string",
    description: "Minimum allowed datetime in ISO format"},
  {
    name: "max",
    type: "string",
    description: "Maximum allowed datetime in ISO format"},
  {
    name: "step",
    type: "string",
    description: "Step value for datetime increments"},
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the datetime input",
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
    description: "Callback when datetime value changes"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const datetimeInputMetadata: ComponentMetadata = {
  name: "DatetimeInput",
  description: "DateTime input field for selecting both date and time with native browser controls",
  category: ComponentCategory.INPUT,
  path: "/components/input/datetime-input",
  tags: ["datetime", "date", "time", "input", "form", "picker"],
  relatedComponents: ["date-input", "time-input", "input"],
  interactive: true,
  preview: (
    <div class="flex gap-2">
      <input type="datetime-local" class="input input-bordered" value="2024-01-15T14:30" />
    </div>
  ),
  examples: datetimeInputExamples,
  props: datetimeInputProps,
  variants: ["bordered", "ghost", "no-border"],
  useCases: ["Event scheduling", "Appointment booking", "Meeting planning", "Task deadlines"],
  usageNotes: [
    "Uses native browser datetime picker for consistent UX",
    "Value format should be YYYY-MM-DDTHH:MM",
    "Use min/max props to restrict selectable date/time range",
    "Step prop can control time increment precision",
    "Consider timezone handling for international applications",
  ]};
