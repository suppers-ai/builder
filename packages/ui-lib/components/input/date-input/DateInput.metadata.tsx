import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { DateInput } from "./DateInput.tsx";

const dateInputExamples: ComponentExample[] = [
  {
    title: "Basic Date Input",
    description: "Simple date input with default styling",
    props: {
      value: "2024-01-15",
    },
  },
  {
    title: "Date Input Sizes",
    description: "Different sizes for various contexts",
    props: {
      value: "2024-01-15",
      size: "lg",
    },
  },
  {
    title: "Date Input Colors",
    description: "Different color variants",
    props: {
      value: "2024-01-15",
      color: "primary",
    },
  },
  {
    title: "Date Input with Constraints",
    description: "Date inputs with min/max restrictions",
    props: {
      value: "2024-01-15",
    },
  },
  {
    title: "Date Input States",
    description: "Different states and variants",
    props: {
      value: "2024-01-15",
    },
  },
];

const dateInputProps: ComponentProp[] = [
  {
    name: "value",
    type: "string",
    description: "Selected date value in YYYY-MM-DD format",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text when no date is selected",
  },
  {
    name: "min",
    type: "string",
    description: "Minimum selectable date (YYYY-MM-DD)",
  },
  {
    name: "max",
    type: "string",
    description: "Maximum selectable date (YYYY-MM-DD)",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Input size",
    default: "md",
  },
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
    description: "Input color theme",
  },
  {
    name: "bordered",
    type: "boolean",
    description: "Show input border",
    default: "true",
  },
  {
    name: "ghost",
    type: "boolean",
    description: "Ghost style input",
    default: "false",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Disable the input",
    default: "false",
  },
  {
    name: "required",
    type: "boolean",
    description: "Mark as required field",
    default: "false",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const dateInputMetadata: ComponentMetadata = {
  name: "DateInput",
  description: "Date picker input with built-in calendar widget and date validation",
  category: ComponentCategory.INPUT,
  path: "/components/input/date-input",
  tags: ["date", "calendar", "picker", "input", "form"],
  relatedComponents: ["input", "datetime-input", "time-input"],
  interactive: true, // User can select dates from calendar
  preview: (
    <div class="flex flex-col gap-2">
      <input type="date" class="input input-bordered" />
      <input type="date" class="input input-bordered input-primary" value="2024-01-15" />
    </div>
  ),
  examples: dateInputExamples,
  props: dateInputProps,
  variants: ["bordered", "ghost", "disabled", "with-constraints"],
  useCases: ["Forms", "Booking systems", "Event scheduling", "Date filters"],
  usageNotes: [
    "Uses native HTML5 date input for best accessibility",
    "Automatically validates date format and constraints",
    "min and max props restrict selectable date range",
    "Browser shows native date picker UI",
    "Value should be in YYYY-MM-DD format",
    "Consider timezone implications for date handling",
    "Ghost variant works well in minimal form designs",
  ],
};
