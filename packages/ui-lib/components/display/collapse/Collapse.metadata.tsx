import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
  ComponentSchema,
} from "../../types.ts";
import { Collapse } from "./Collapse.tsx";
import {
  CollapsePropsSchema,
  safeValidateCollapseProps,
  validateCollapseProps,
} from "./Collapse.schema.ts";

const collapseExamples: ComponentExample[] = [
  {
    title: "Basic Collapse",
    description: "Simple expandable content with different trigger styles",
    props: [
      {
        title: "Click to expand",
        children:
          "This content is hidden by default and can be expanded by clicking the title above.",
      },
      {
        title: "Arrow style",
        arrow: true,
        children: "This collapse uses an arrow indicator to show expand/collapse state.",
      },
      {
        title: "Plus/minus style",
        plus: true,
        children: "This collapse uses plus/minus icons to indicate the state.",
      },
    ],
  },
  {
    title: "Collapse with Checkbox",
    description: "Checkbox-controlled collapse for form-like interfaces",
    props: [
      {
        title: "Checkbox controlled",
        checkbox: true,
        children:
          "This collapse is controlled by a checkbox, which can be useful in forms or settings.",
      },
      {
        title: "Pre-opened collapse",
        checkbox: true,
        open: true,
        children: "This collapse starts in an open state and can be closed by unchecking.",
      },
    ],
  },
  {
    title: "Collapse with Rich Content",
    description: "Collapses containing complex content and components",
    props: [
      {
        title: "📊 Statistics Overview",
        arrow: true,
        children: (
          <div class="stats stats-vertical lg:stats-horizontal shadow">
            <div class="stat">
              <div class="stat-title">Total Users</div>
              <div class="stat-value">31,547</div>
              <div class="stat-desc">+12% from last month</div>
            </div>
            <div class="stat">
              <div class="stat-title">Revenue</div>
              <div class="stat-value">$89,400</div>
              <div class="stat-desc">+18% from last month</div>
            </div>
          </div>
        ),
      },
      {
        title: "⚙️ Advanced Settings",
        plus: true,
        children: (
          <div class="form-control w-full max-w-xs">
            <label class="label">
              <span class="label-text">API Endpoint</span>
            </label>
            <input type="text" class="input input-bordered" value="https://api.example.com" />

            <label class="label mt-4">
              <span class="label-text">Timeout (seconds)</span>
            </label>
            <input type="number" class="input input-bordered" value="30" />
          </div>
        ),
      },
    ],
  },
  {
    title: "FAQ-style Collapses",
    description: "Multiple collapses for FAQ or help sections",
    props: [
      {
        title: "What is this component library?",
        arrow: true,
        children:
          "This is a comprehensive UI component library built with Deno, Fresh, and daisyUI, providing reusable components for building modern web applications.",
      },
      {
        title: "How do I customize the styling?",
        arrow: true,
        children:
          "You can customize styling by passing additional CSS classes through the 'class' prop, or by modifying the daisyUI theme configuration.",
      },
      {
        title: "Is it mobile responsive?",
        arrow: true,
        children:
          "Yes! All components are built with responsive design in mind and work great on mobile, tablet, and desktop devices.",
      },
      {
        title: "Can I use custom icons?",
        arrow: true,
        children:
          "Absolutely! You can pass custom icons through the 'icon' prop to replace the default arrow, plus, or checkbox indicators.",
      },
    ],
  },
  {
    title: "Nested Collapses",
    description: "Collapses containing other collapses for hierarchical content",
    props: {
      title: "🏢 Company Information",
      arrow: true,
      open: true,
      children: (
        <div class="space-y-4">
          <p>Welcome to our company overview section.</p>
          <div class="space-y-2">
            <div class="collapse collapse-plus bg-base-200">
              <input type="checkbox" />
              <div class="collapse-title text-lg font-medium">📍 Locations</div>
              <div class="collapse-content">
                <div class="space-y-2">
                  <div class="collapse collapse-checkbox bg-base-100">
                    <input type="checkbox" />
                    <div class="collapse-title">🇺🇸 United States</div>
                    <div class="collapse-content">
                      <ul class="list-disc list-inside pl-4">
                        <li>New York - Headquarters</li>
                        <li>San Francisco - Engineering</li>
                        <li>Austin - Sales</li>
                      </ul>
                    </div>
                  </div>
                  <div class="collapse collapse-checkbox bg-base-100">
                    <input type="checkbox" />
                    <div class="collapse-title">🇪🇺 Europe</div>
                    <div class="collapse-content">
                      <ul class="list-disc list-inside pl-4">
                        <li>London - European HQ</li>
                        <li>Berlin - R&D</li>
                        <li>Amsterdam - Operations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="collapse collapse-plus bg-base-200">
              <input type="checkbox" />
              <div class="collapse-title text-lg font-medium">👥 Departments</div>
              <div class="collapse-content">
                <div class="grid grid-cols-2 gap-4">
                  <div class="badge badge-primary">Engineering</div>
                  <div class="badge badge-secondary">Marketing</div>
                  <div class="badge badge-accent">Sales</div>
                  <div class="badge badge-success">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  },
];

const collapseProps: ComponentProp[] = [
  {
    name: "title",
    type: "ComponentChildren",
    description: "Title/header content that triggers the collapse",
    required: true,
  },
  {
    name: "children",
    type: "ComponentChildren",
    description: "Content to show/hide when toggling",
    required: true,
  },
  {
    name: "open",
    type: "boolean",
    description: "Whether the collapse starts open",
    default: "false",
  },
  {
    name: "arrow",
    type: "boolean",
    description: "Show arrow indicator",
    default: "false",
  },
  {
    name: "plus",
    type: "boolean",
    description: "Show plus/minus indicator",
    default: "false",
  },
  {
    name: "checkbox",
    type: "boolean",
    description: "Use checkbox control style",
    default: "false",
  },
  {
    name: "icon",
    type: "ComponentChildren",
    description: "Custom icon to display in the header",
  },
  {
    name: "isOpen",
    type: "boolean",
    description: "Controlled mode: current open state",
  },
  {
    name: "onToggle",
    type: "(open: boolean) => void",
    description: "Controlled mode: callback when state changes",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

const collapseSchema: ComponentSchema = {
  schema: CollapsePropsSchema,
  validateFn: validateCollapseProps,
  safeValidateFn: safeValidateCollapseProps,
};

export const collapseMetadata: ComponentMetadata = {
  name: "Collapse",
  description: "Expandable content container with customizable triggers and smooth animations",
  category: ComponentCategory.DISPLAY,
  path: "/components/display/collapse",
  tags: ["expand", "collapse", "toggle", "accordion", "foldable", "show-hide"],
  relatedComponents: ["accordion", "details", "drawer"],
  interactive: true, // Can be clicked to expand/collapse
  preview: (
    <div class="w-full max-w-sm">
      <Collapse title="Click to expand" arrow>
        This content is hidden by default and can be expanded by clicking the title above.
      </Collapse>
    </div>
  ),
  examples: collapseExamples,
  schema: collapseSchema,
  props: collapseProps,
  variants: ["basic", "arrow", "plus", "checkbox", "nested"],
  useCases: [
    "FAQ sections",
    "Settings panels",
    "Content organization",
    "Space-saving layouts",
    "Progressive disclosure",
  ],
  usageNotes: [
    "Use arrow variant for general expand/collapse UI patterns",
    "Checkbox variant works well in forms and settings interfaces",
    "Plus/minus variant is intuitive for add/remove or expand/contract actions",
    "Custom icons can be used to match your design system",
    "Nested collapses create hierarchical content organization",
    "Consider accessibility by ensuring keyboard navigation works properly",
  ],
};
