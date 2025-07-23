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
    code: `<NumberInput placeholder="0" />
<NumberInput value={42} />
<NumberInput step={5} placeholder="Step by 5" />`,
    showCode: true,
  },
  {
    title: "Number Input with Range",
    description: "Number input with min/max constraints",
    code: `<NumberInput min={0} max={100} placeholder="0-100" />
<NumberInput min={-10} max={10} step={0.5} placeholder="-10 to 10" />
<NumberInput min={1} placeholder="Minimum 1" />`,
    showCode: true,
  },
  {
    title: "Number Input Sizes",
    description: "Different number input sizes",
    code: `<NumberInput size="xs" value={1} />
<NumberInput size="sm" value={2} />
<NumberInput value={3} />
<NumberInput size="lg" value={4} />`,
    showCode: true,
  },
  {
    title: "Number Input States",
    description: "Different input states and colors",
    code: `<NumberInput placeholder="Default" />
<NumberInput color="primary" value={100} />
<NumberInput color="success" value={50} />
<NumberInput disabled value={25} />`,
    showCode: true,
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
