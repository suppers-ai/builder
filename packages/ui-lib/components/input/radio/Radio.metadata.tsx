import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Radio } from "./Radio.tsx";

const radioExamples: ComponentExample[] = [
  {
    title: "Basic Radio",
    description: "Simple radio button groups for single selection",
    props: {
      name: "example",
      options: [
        {
          value: "option1",
      label: "Option 1"
        },
        {
          value: "option2",
      label: "Option 2"
        },
        {
          value: "option3",
      label: "Option 3"
        }
      ]
    }
  },  {
    title: "Radio Sizes",
    description: "Different sizes for various contexts",
    props: {
      name: "example",
      options: [
        {
          value: "option1",
      label: "Option 1"
        },
        {
          value: "option2",
      label: "Option 2"
        },
        {
          value: "option3",
      label: "Option 3"
        }
      ],
      size: "lg"
    }
  },  {
    title: "Radio Colors",
    description: "Various color themes",
    props: {
      name: "example",
      options: [
        {
          value: "option1",
      label: "Option 1"
        },
        {
          value: "option2",
      label: "Option 2"
        },
        {
          value: "option3",
      label: "Option 3"
        }
      ],
      color: "primary"
    }
  },  {
    title: "Radio States",
    description: "Different states and configurations",
    props: {
      name: "example",
      options: [
        {
          value: "option1",
      label: "Option 1"
        },
        {
          value: "option2",
      label: "Option 2"
        },
        {
          value: "option3",
      label: "Option 3"
        }
      ]
    }
  },  {
    title: "Radio Group Form",
    description: "Real-world example in a form context",
    props: {
      name: "example",
      options: [
        {
          value: "option1",
      label: "Option 1"
        },
        {
          value: "option2",
      label: "Option 2"
        },
        {
          value: "option3",
      label: "Option 3"
        }
      ]
    }
  },
];

const radioProps: ComponentProp[] = [
  {
    name: "name",
    type: "string",
    description: "Name attribute for radio group (same name groups radios together)"},
  {
    name: "value",
    type: "string",
    description: "Value of this radio option"},
  {
    name: "label",
    type: "string",
    description: "Label text displayed next to the radio button"},
  {
    name: "checked",
    type: "boolean",
    description: "Whether this radio option is selected",
    default: "false"},
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the radio button",
    default: "md"},
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'",
    description: "Color theme for the radio button",
    default: "primary"},
  {
    name: "disabled",
    type: "boolean",
    description: "Whether the radio button is disabled",
    default: "false"},
  {
    name: "onChange",
    type: "(event: Event) => void",
    description: "Change event handler"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const radioMetadata: ComponentMetadata = {
  name: "Radio",
  description: "Radio buttons for single choice selection from a group of options",
  category: ComponentCategory.INPUT,
  path: "/components/input/radio",
  tags: ["radio", "input", "form", "choice", "selection", "option"],
  relatedComponents: ["checkbox", "select", "form-control"],
  interactive: true, // User can select options
  preview: (
    <div class="flex flex-col gap-2">
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-3">
          <input type="radio" name="preview" class="radio radio-primary" checked />
          <span class="label-text">Option 1</span>
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-3">
          <input type="radio" name="preview" class="radio" />
          <span class="label-text">Option 2</span>
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-3">
          <input type="radio" name="preview" class="radio radio-secondary" />
          <span class="label-text">Option 3</span>
        </label>
      </div>
    </div>
  ),
  examples: radioExamples,
  props: radioProps,
  variants: ["basic", "sizes", "colors", "disabled", "with-labels"],
  useCases: ["Forms", "Settings", "Surveys", "Preferences", "Multiple choice questions"],
  usageNotes: [
    "All radio buttons in a group must share the same 'name' attribute",
    "Only one radio button in a group can be selected at a time",
    "Use clear, descriptive labels for accessibility",
    "Consider using fieldsets to group related radio buttons",
    "Provide a default selection when appropriate",
    "Use consistent sizing within the same form section",
  ]};
