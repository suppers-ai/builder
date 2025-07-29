import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp} from "../../types.ts";
import { Textarea } from "./Textarea.tsx";

const textareaExamples: ComponentExample[] = [
  {
    title: "Basic Textarea",
    description: "Simple multi-line text inputs with different configurations",
    props: {
      placeholder: "Enter your message..."
    }
  },  {
    title: "Textarea Sizes",
    description: "Different sizes for various contexts",
    props: {
      placeholder: "Enter your message...",
      size: "lg"
    }
  },  {
    title: "Textarea Colors",
    description: "Various color themes for different states",
    props: {
      placeholder: "Enter your message...",
      color: "primary"
    }
  },  {
    title: "Textarea Variants",
    description: "Different visual styles",
    props: {
      placeholder: "Enter your message...",
      variant: "outlined"
    }
  },  {
    title: "Textarea States",
    description: "Different states and configurations",
    props: {
      placeholder: "Enter your message..."
    }
  },
];

const textareaProps: ComponentProp[] = [
  {
    name: "value",
    type: "string",
    description: "Text content of the textarea"},
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text shown when empty"},
  {
    name: "rows",
    type: "number",
    description: "Number of visible text lines",
    default: "3"},
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size variant of the textarea",
    default: "md"},
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'",
    description: "Color theme for the textarea"},
  {
    name: "bordered",
    type: "boolean",
    description: "Whether to show border",
    default: "true"},
  {
    name: "ghost",
    type: "boolean",
    description: "Ghost style variant with subtle appearance",
    default: "false"},
  {
    name: "disabled",
    type: "boolean",
    description: "Disabled state",
    default: "false"},
  {
    name: "onChange",
    type: "(event: Event) => void",
    description: "Change event handler"},
  {
    name: "onInput",
    type: "(event: Event) => void",
    description: "Input event handler for real-time updates"},
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"},
];

export const textareaMetadata: ComponentMetadata = {
  name: "Textarea",
  description: "Multi-line text input component for longer text content",
  category: ComponentCategory.INPUT,
  path: "/components/input/textarea",
  tags: ["textarea", "text", "input", "form", "multiline", "area"],
  relatedComponents: ["input", "form-control", "label"],
  interactive: true, // User can type text
  preview: (
    <div class="flex flex-col gap-3 w-full max-w-sm">
      <textarea class="textarea textarea-bordered w-full" placeholder="Basic textarea" rows={2}>
      </textarea>
      <textarea
        class="textarea textarea-bordered textarea-primary w-full"
        placeholder="Primary textarea"
        rows={2}
      >
      </textarea>
      <textarea class="textarea textarea-ghost w-full" placeholder="Ghost textarea" rows={2}>
      </textarea>
    </div>
  ),
  examples: textareaExamples,
  props: textareaProps,
  variants: ["basic", "sizes", "colors", "bordered", "ghost", "states"],
  useCases: ["Forms", "Comments", "Descriptions", "Messages", "Long text input"],
  usageNotes: [
    "Use appropriate row count based on expected content length",
    "Provide clear placeholder text to guide user input",
    "Consider using onInput for real-time validation or character counting",
    "Ghost variant works well in minimal design contexts",
    "Use color variants to indicate validation states (success, error)",
    "Ensure proper labeling for accessibility",
  ]};
