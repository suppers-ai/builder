import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Checkbox } from "./Checkbox.tsx";

const checkboxExamples: ComponentExample[] = [
  {
    title: "Basic Checkbox",
    description: "Simple checkbox with labels",
    props: {
      label: "Check me",
      checked: false,
    },
  },
  {
    title: "Checkbox Sizes",
    description: "Different sizes for various contexts",
    props: {
      label: "Check me",
      checked: false,
      size: "lg",
    },
  },
  {
    title: "Checkbox Colors",
    description: "Various color themes",
    props: {
      label: "Check me",
      checked: false,
      color: "primary",
    },
  },
  {
    title: "Checkbox States",
    description: "Different states and variants",
    props: {
      label: "Check me",
      checked: false,
    },
  },
  {
    title: "Checkbox Group",
    description: "Group of related checkboxes",
    props: {
      label: "Check me",
      checked: false,
    },
  },
];

const checkboxProps: ComponentProp[] = [
  {
    name: "label",
    type: "string",
    description: "Checkbox label text",
  },
  {
    name: "checked",
    type: "boolean",
    description: "Whether checkbox is checked",
    default: "false",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Checkbox size",
    default: "md",
  },
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'",
    description: "Checkbox color theme",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Whether checkbox is disabled",
    default: "false",
  },
  {
    name: "indeterminate",
    type: "boolean",
    description: "Show indeterminate state",
    default: "false",
  },
  {
    name: "onChange",
    type: "(checked: boolean) => void",
    description: "Function called when checkbox state changes",
  },
  {
    name: "name",
    type: "string",
    description: "Form input name attribute",
  },
  {
    name: "value",
    type: "string",
    description: "Form input value attribute",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const checkboxMetadata: ComponentMetadata = {
  name: "Checkbox",
  description: "Form checkbox input with customizable styling and states",
  category: ComponentCategory.INPUT,
  path: "/components/input/checkbox",
  tags: ["checkbox", "form", "input", "selection", "toggle"],
  relatedComponents: ["radio", "toggle", "button"],
  interactive: true, // User can check/uncheck
  preview: (
    <div class="space-y-2">
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-2">
          <input type="checkbox" class="checkbox checkbox-primary" checked />
          <span class="label-text">Checked</span>
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-2">
          <input type="checkbox" class="checkbox" />
          <span class="label-text">Unchecked</span>
        </label>
      </div>
    </div>
  ),
  examples: checkboxExamples,
  props: checkboxProps,
  variants: ["basic", "sizes", "colors", "states", "groups"],
  useCases: ["Forms", "Settings", "Filters", "Preferences", "Multi-selection"],
  usageNotes: [
    "Use clear, descriptive labels for accessibility",
    "Group related checkboxes with proper semantic structure",
    "Provide visual feedback for checked/unchecked states",
    "Consider using fieldsets for checkbox groups",
    "Ensure sufficient contrast for all color variants",
    "Support keyboard navigation with proper tabindex",
  ],
};
