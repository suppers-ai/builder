import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const selectExamples: ComponentExample[] = [
  {
    title: "Basic Select",
    description: "Simple select with options and placeholder",
    code: `<Select 
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" }
  ]} 
  placeholder="Choose an option" 
/>`,
    showCode: true,
  },
  {
    title: "Select Sizes",
    description: "Different size variants for various contexts",
    code: `<Select 
  size="xs" 
  options={[
    { value: "xs1", label: "Extra Small 1" },
    { value: "xs2", label: "Extra Small 2" }
  ]} 
  placeholder="Extra small" 
/>
<Select 
  size="sm" 
  options={[
    { value: "sm1", label: "Small 1" },
    { value: "sm2", label: "Small 2" }
  ]} 
  placeholder="Small" 
/>
<Select 
  size="lg" 
  options={[
    { value: "lg1", label: "Large 1" },
    { value: "lg2", label: "Large 2" }
  ]} 
  placeholder="Large" 
/>`,
    showCode: true,
  },
  {
    title: "Select Colors",
    description: "Various color themes for different states",
    code: `<Select 
  color="primary" 
  options={[
    { value: "p1", label: "Primary Option 1" },
    { value: "p2", label: "Primary Option 2" }
  ]} 
  placeholder="Primary" 
/>
<Select 
  color="success" 
  options={[
    { value: "s1", label: "Success Option 1" },
    { value: "s2", label: "Success Option 2" }
  ]} 
  placeholder="Success" 
/>
<Select 
  color="error" 
  options={[
    { value: "e1", label: "Error Option 1" },
    { value: "e2", label: "Error Option 2" }
  ]} 
  placeholder="Error" 
/>`,
    showCode: true,
  },
  {
    title: "Select Variants",
    description: "Different visual styles",
    code: `<Select 
  bordered 
  options={[
    { value: "b1", label: "Bordered Option 1" },
    { value: "b2", label: "Bordered Option 2" }
  ]} 
  placeholder="Bordered" 
/>
<Select 
  ghost 
  options={[
    { value: "g1", label: "Ghost Option 1" },
    { value: "g2", label: "Ghost Option 2" }
  ]} 
  placeholder="Ghost" 
/>`,
    showCode: true,
  },
  {
    title: "Select with Disabled Options",
    description: "Select with some disabled options",
    code: `<Select 
  options={[
    { value: "enabled1", label: "Enabled Option 1" },
    { value: "disabled1", label: "Disabled Option 1", disabled: true },
    { value: "enabled2", label: "Enabled Option 2" },
    { value: "disabled2", label: "Disabled Option 2", disabled: true }
  ]} 
  placeholder="Select with disabled options" 
/>`,
    showCode: true,
  },
];

const selectProps: ComponentProp[] = [
  {
    name: "options",
    type: "Array<{value: string, label: string, disabled?: boolean}>",
    description: "Array of select options",
    required: true,
  },
  {
    name: "value",
    type: "string",
    description: "Selected value",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text when no option is selected",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size variant of the select",
    default: "md",
  },
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'",
    description: "Color theme for the select",
  },
  {
    name: "bordered",
    type: "boolean",
    description: "Whether to show border",
    default: "true",
  },
  {
    name: "ghost",
    type: "boolean",
    description: "Ghost style variant",
    default: "false",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Disabled state",
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

export const selectMetadata: ComponentMetadata = {
  name: "Select",
  description: "Dropdown selection component with customizable options and styling",
  category: ComponentCategory.INPUT,
  path: "/components/input/select",
  tags: ["select", "dropdown", "input", "form", "choice", "options"],
  relatedComponents: ["dropdown", "radio", "input"],
  interactive: true, // User can select options
  preview: (
    <div class="flex gap-4">
      <select class="select select-bordered w-full max-w-xs">
        <option disabled selected>Choose...</option>
        <option>Option 1</option>
        <option>Option 2</option>
        <option>Option 3</option>
      </select>
      <select class="select select-bordered select-primary w-full max-w-xs">
        <option disabled>Choose...</option>
        <option selected>Primary</option>
        <option>Secondary</option>
      </select>
    </div>
  ),
  examples: selectExamples,
  props: selectProps,
  variants: ["basic", "sizes", "colors", "bordered", "ghost", "with-disabled"],
  useCases: ["Forms", "Settings", "Filters", "Configuration", "Data entry"],
  usageNotes: [
    "Options can be disabled individually using the disabled property",
    "Supports both controlled and uncontrolled usage patterns",
    "Multiple size and color variants available for different contexts",
    "Use onChange handler for form integration and state management",
    "Ghost variant provides subtle styling for minimal designs",
    "Placeholder option is automatically disabled and not selectable",
  ],
};
