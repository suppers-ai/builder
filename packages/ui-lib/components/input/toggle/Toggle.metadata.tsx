import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const toggleExamples: ComponentExample[] = [
  {
    title: "Basic Toggle",
    description: "Simple on/off toggle switches",
    code: `<Toggle>Enable notifications</Toggle>
<Toggle checked>Auto-save enabled</Toggle>
<Toggle>Dark mode</Toggle>`,
    showCode: true,
  },
  {
    title: "Toggle Sizes",
    description: "Different sizes for various contexts",
    code: `<Toggle size="xs">Extra small</Toggle>
<Toggle size="sm">Small toggle</Toggle>
<Toggle size="md">Medium toggle</Toggle>
<Toggle size="lg">Large toggle</Toggle>`,
    showCode: true,
  },
  {
    title: "Toggle Colors",
    description: "Various color themes",
    code: `<Toggle color="primary" checked>Primary</Toggle>
<Toggle color="secondary" checked>Secondary</Toggle>
<Toggle color="accent" checked>Accent</Toggle>
<Toggle color="success" checked>Success</Toggle>
<Toggle color="warning" checked>Warning</Toggle>
<Toggle color="error" checked>Error</Toggle>`,
    showCode: true,
  },
  {
    title: "Toggle States",
    description: "Different states and configurations",
    code: `<Toggle>Normal toggle</Toggle>
<Toggle checked>Checked toggle</Toggle>
<Toggle disabled>Disabled toggle</Toggle>
<Toggle disabled checked>Disabled checked</Toggle>`,
    showCode: true,
  },
  {
    title: "Toggle Groups",
    description: "Multiple toggles for settings panels",
    code: `<div class="space-y-4">
  <div class="font-semibold">Privacy Settings</div>
  <Toggle checked>Show profile publicly</Toggle>
  <Toggle>Allow friend requests</Toggle>
  <Toggle checked>Email notifications</Toggle>
  <Toggle>SMS notifications</Toggle>
  <Toggle>Marketing emails</Toggle>
</div>`,
    showCode: true,
  },
];

const toggleProps: ComponentProp[] = [
  {
    name: "checked",
    type: "boolean",
    description: "Whether the toggle is checked (on)",
    default: "false",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the toggle",
    default: "md",
  },
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'",
    description: "Color theme for the toggle",
    default: "primary",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Whether the toggle is disabled",
    default: "false",
  },
  {
    name: "onChange",
    type: "(event: Event) => void",
    description: "Change event handler",
  },
  {
    name: "children",
    type: "ComponentChildren",
    description: "Label text for the toggle",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const toggleMetadata: ComponentMetadata = {
  name: "Toggle",
  description: "On/off switches for binary state controls and settings",
  category: ComponentCategory.INPUT,
  path: "/components/input/toggle",
  tags: ["toggle", "switch", "binary", "checkbox", "control"],
  relatedComponents: ["checkbox", "swap", "form-control"],
  interactive: true, // User can toggle on/off
  preview: (
    <div class="flex gap-2">
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-3">
          <input type="checkbox" class="toggle" checked />
          <span class="label-text">On</span>
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-3">
          <input type="checkbox" class="toggle toggle-primary" checked />
          <span class="label-text">Primary</span>
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-3">
          <input type="checkbox" class="toggle toggle-secondary" />
          <span class="label-text">Off</span>
        </label>
      </div>
    </div>
  ),
  examples: toggleExamples,
  props: toggleProps,
  variants: ["basic", "sizes", "colors", "disabled", "with-labels"],
  useCases: [
    "Settings panels",
    "Feature toggles",
    "Preferences",
    "Notifications",
    "Privacy controls",
  ],
  usageNotes: [
    "Use toggles for immediate binary state changes (on/off)",
    "Provide clear labels to indicate what the toggle controls",
    "Use appropriate colors to convey meaning (success for enabled features)",
    "Consider grouping related toggles in settings panels",
    "Disabled state should be used when toggle cannot be changed",
    "Toggle automatically includes proper form control structure",
  ],
};
