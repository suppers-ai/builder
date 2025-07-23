import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const tooltipExamples: ComponentExample[] = [
  {
    title: "Basic Tooltip",
    description: "Simple tooltips on different elements",
    code: `<Tooltip tip="This is a basic tooltip">
  <button class="btn">Hover me</button>
</Tooltip>
<Tooltip tip="Helpful information about this input">
  <input type="text" class="input input-bordered" placeholder="Input with tooltip" />
</Tooltip>
<Tooltip tip="Click to learn more">
  <div class="badge badge-info cursor-help">Info</div>
</Tooltip>`,
    showCode: true,
  },
  {
    title: "Tooltip Positions",
    description: "Tooltips positioned around the target element",
    code: `<div class="flex gap-4 items-center">
  <Tooltip tip="Top tooltip" position="top">
    <button class="btn btn-sm">Top</button>
  </Tooltip>
  <Tooltip tip="Right tooltip" position="right">
    <button class="btn btn-sm">Right</button>
  </Tooltip>
  <Tooltip tip="Bottom tooltip" position="bottom">
    <button class="btn btn-sm">Bottom</button>
  </Tooltip>
  <Tooltip tip="Left tooltip" position="left">
    <button class="btn btn-sm">Left</button>
  </Tooltip>
</div>`,
    showCode: true,
  },
  {
    title: "Tooltip Colors",
    description: "Different colored tooltips for various contexts",
    code: `<div class="flex gap-4 items-center flex-wrap">
  <Tooltip tip="Primary tooltip" color="primary">
    <button class="btn btn-primary btn-sm">Primary</button>
  </Tooltip>
  <Tooltip tip="Secondary tooltip" color="secondary">
    <button class="btn btn-secondary btn-sm">Secondary</button>
  </Tooltip>
  <Tooltip tip="Success message" color="success">
    <button class="btn btn-success btn-sm">Success</button>
  </Tooltip>
  <Tooltip tip="Warning alert" color="warning">
    <button class="btn btn-warning btn-sm">Warning</button>
  </Tooltip>
  <Tooltip tip="Error information" color="error">
    <button class="btn btn-error btn-sm">Error</button>
  </Tooltip>
</div>`,
    showCode: true,
  },
  {
    title: "Always Visible Tooltips",
    description: "Tooltips that are always shown (useful for demonstrations)",
    code: `<div class="flex gap-8 items-center">
  <Tooltip tip="Always visible tooltip" open>
    <button class="btn btn-outline">Always shown</button>
  </Tooltip>
  <Tooltip tip="Force open with color" color="accent" open>
    <div class="badge badge-accent">Permanent tip</div>
  </Tooltip>
</div>`,
    showCode: true,
  },
  {
    title: "Tooltips in Real Contexts",
    description: "Practical examples of tooltips in UI elements",
    code: `<div class="space-y-6">
  <div class="card bg-base-100 shadow-md">
    <div class="card-body">
      <div class="flex items-center gap-2">
        <h2 class="card-title">User Settings</h2>
        <Tooltip tip="Configure your account preferences">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Tooltip>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text flex items-center gap-2">
            Email notifications
            <Tooltip tip="Receive email alerts for important updates" position="right">
              <span class="text-info cursor-help">?</span>
            </Tooltip>
          </span>
        </label>
        <input type="checkbox" class="toggle toggle-primary" />
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text flex items-center gap-2">
            Privacy level
            <Tooltip tip="Control who can see your profile information" position="right" color="warning">
              <span class="text-warning cursor-help">⚠</span>
            </Tooltip>
          </span>
        </label>
        <select class="select select-bordered">
          <option>Public</option>
          <option>Friends only</option>
          <option>Private</option>
        </select>
      </div>
    </div>
  </div>
</div>`,
    showCode: true,
  },
];

const tooltipProps: ComponentProp[] = [
  {
    name: "tip",
    type: "string",
    description: "Text content to display in the tooltip",
    required: true,
  },
  {
    name: "position",
    type: "'top' | 'bottom' | 'left' | 'right'",
    description: "Position of tooltip relative to the target element",
    default: "top",
  },
  {
    name: "color",
    type: "'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'",
    description: "Color theme for the tooltip",
  },
  {
    name: "open",
    type: "boolean",
    description: "Force tooltip to always be visible",
    default: "false",
  },
  {
    name: "children",
    type: "ComponentChildren",
    description: "Element that triggers the tooltip on hover",
    required: true,
  },
  {
    name: "onShow",
    type: "() => void",
    description: "Callback when tooltip becomes visible",
  },
  {
    name: "onHide",
    type: "() => void",
    description: "Callback when tooltip becomes hidden",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const tooltipMetadata: ComponentMetadata = {
  name: "Tooltip",
  description:
    "Contextual information popups that appear on hover to provide helpful hints and details",
  category: ComponentCategory.FEEDBACK,
  path: "/components/feedback/tooltip",
  tags: ["tooltip", "hover", "popup", "help", "information", "hint"],
  relatedComponents: ["dropdown", "modal", "button"],
  interactive: false, // Triggered by hover, not click
  preview: (
    <div class="flex gap-4 items-center">
      <div class="tooltip tooltip-top" data-tip="This is a tooltip">
        <button class="btn btn-sm">Hover me</button>
      </div>
      <div class="tooltip tooltip-bottom tooltip-primary" data-tip="Bottom tooltip">
        <button class="btn btn-sm btn-primary">Primary</button>
      </div>
      <div class="tooltip tooltip-right tooltip-accent" data-tip="Right side">
        <button class="btn btn-sm btn-accent">Accent</button>
      </div>
    </div>
  ),
  examples: tooltipExamples,
  props: tooltipProps,
  variants: ["basic", "positions", "colors", "always-visible"],
  useCases: [
    "Help text",
    "Additional information",
    "Form field hints",
    "Icon explanations",
    "Feature guidance",
  ],
  usageNotes: [
    "Keep tooltip text concise and helpful - aim for one sentence",
    "Position tooltips to avoid covering important UI elements",
    "Use appropriate colors to convey meaning (warning for cautions, info for help)",
    "Consider accessibility - tooltips should also be accessible via keyboard",
    "Don't use tooltips for critical information that users must see",
    "Test tooltip positioning on mobile devices where hover doesn't work",
  ],
};
