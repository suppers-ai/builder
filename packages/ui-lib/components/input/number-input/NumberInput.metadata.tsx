import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const numberInputExamples: ComponentExample[] = [
  {
    title: "Basic Number Input",
    description: "Simple number input with increment/decrement buttons",
    props: {
      placeholder: "Enter number...",
      value: 42,
    },
  },
  {
    title: "Number Input with Range",
    description: "Number input with min/max constraints",
    props: {
      placeholder: "Enter number...",
      value: 42,
    },
  },
  {
    title: "Number Input Sizes",
    description: "Different number input sizes",
    props: {
      placeholder: "Enter number...",
      value: 42,
      size: "lg",
    },
  },
  {
    title: "Number Input States",
    description: "Different input states and colors",
    props: {
      placeholder: "Enter number...",
      value: 42,
    },
  },
];

const numberInputProps: ComponentProp[] = [
  {
    name: "value",
    type: "number",
    description: "The number input value",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text for the input",
    default: "0",
  },
  {
    name: "min",
    type: "number",
    description: "Minimum allowed value",
  },
  {
    name: "max",
    type: "number",
    description: "Maximum allowed value",
  },
  {
    name: "step",
    type: "number",
    description: "Step value for increment/decrement",
    default: "1",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the number input",
    default: "md",
  },
  {
    name: "color",
    type: "DaisyUIColor",
    description: "Color theme for the input",
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
    description: "Mark input as required",
    default: "false",
  },
  {
    name: "onChange",
    type: "(value: number) => void",
    description: "Callback when number value changes",
  },
  {
    name: "onIncrement",
    type: "() => void",
    description: "Callback when increment button is clicked",
  },
  {
    name: "onDecrement",
    type: "() => void",
    description: "Callback when decrement button is clicked",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const numberInputMetadata: ComponentMetadata = {
  name: "NumberInput",
  description: "Number input field with increment/decrement controls and range validation",
  category: ComponentCategory.INPUT,
  path: "/components/input/number-input",
  tags: ["number", "input", "form", "numeric", "counter"],
  relatedComponents: ["input", "range", "rating"],
  interactive: true,
  preview: (
    <div class="flex gap-2">
      <div class="relative">
        <input type="number" class="input input-bordered pr-8" value="42" />
        <div class="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
          <button type="button" class="text-xs text-base-content/50">▲</button>
          <button type="button" class="text-xs text-base-content/50">▼</button>
        </div>
      </div>
    </div>
  ),
  examples: numberInputExamples,
  props: numberInputProps,
  variants: ["bordered", "ghost", "no-border", "with-controls"],
  useCases: ["Quantity selection", "Age input", "Price entry", "Settings configuration"],
  usageNotes: [
    "Use min/max props to enforce value constraints",
    "Step prop controls increment/decrement amount",
    "Increment/decrement buttons respect min/max limits",
    "Shows numeric keyboard on mobile devices",
    "Consider using for any numeric data entry",
  ],
};
