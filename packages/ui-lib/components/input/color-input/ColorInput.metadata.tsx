import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp
} from "../../types.ts";

const colorInputExamples: ComponentExample[] = [
  {
    title: "Basic Color Input",
    description: "Simple color picker input with preview",
    props: {
      value: "#3b82f6",
      placeholder: "Select a color"
    }
  },
  {
    title: "Color Input Sizes",
    description: "Different color input sizes",
    props: [
      { size: "xs", value: "#ef4444" },
      { size: "sm", value: "#f97316" },
      { size: "md", value: "#eab308" },
      { size: "lg", value: "#22c55e" },
      { size: "xl", value: "#3b82f6"
        }
      ]
  },
  {
    title: "Color Input Variants",
    description: "Different visual styles",
    props: [
      { bordered: true, value: "#8b5cf6" },
      { ghost: true, value: "#ec4899" },
      { bordered: false, value: "#06b6d4"
        }
      ]
  },
  {
    title: "Color Input States",
    description: "Different input states and colors",
    props: [
      { value: "#10b981", disabled: false },
      { value: "#6b7280", disabled: true },
      { value: "#dc2626", required: true
        }
      ]
        }
      ];

const colorInputProps: ComponentProp[] = [
  {
    name: "value",
    type: "string",
    description: "The color value in hex format",
    default: "#000000"
  },
  {
    name: "placeholder",
    type: "string",
    description: "Placeholder text for the input"
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
    description: "Size of the color input",
    default: "md"
  },
  {
    name: "color",
    type: "DaisyUIColor",
    description: "Color theme for the input"
  },
  {
    name: "bordered",
    type: "boolean",
    description: "Show input border",
    default: "true"
  },
  {
    name: "ghost",
    type: "boolean",
    description: "Ghost style input",
    default: "false"
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Disable the input",
    default: "false"
  },
  {
    name: "required",
    type: "boolean",
    description: "Mark input as required",
    default: "false"
  },
  {
    name: "showPreview",
    type: "boolean",
    description: "Show color preview swatch",
    default: "true"
  },
  {
    name: "onChange",
    type: "(event: Event) => void",
    description: "Callback when color value changes"
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes"
        }
      ];

export const colorInputMetadata: ComponentMetadata = {
  name: "ColorInput",
  description: "Color picker input field with preview swatch for selecting colors",
  category: ComponentCategory.INPUT,
  path: "/components/input/color-input",
  tags: ["color", "picker", "input", "form", "hex"],
  relatedComponents: ["input", "button", "label"],
  interactive: true,
  preview: (
    <div class="flex gap-2">
      <div class="relative">
        <div
          class="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded border border-base-300"
          style={{ backgroundColor: "#3b82f6" }}
        />
        <input type="color" class="input input-bordered pl-12" value="#3b82f6" />
      </div>
    </div>
  ),
  examples: colorInputExamples,
  props: colorInputProps,
  variants: ["bordered", "ghost", "no-border", "with-preview", "no-preview"],
  useCases: ["Theme customization", "Design tools", "Color selection", "Brand configuration"],
  usageNotes: [
    "Use showPreview to display a color swatch alongside the input",
    "Color values should be in hex format (#rrggbb)",
    "Combine with labels for better accessibility",
    "Consider using validation for proper hex color format",
    "Preview swatch adds visual feedback for better UX",
  ]
};
