import { ComponentMetadata, ComponentCategory, ComponentExample, ComponentProp } from "../../types.ts";

const collapseExamples: ComponentExample[] = [
  {
    title: "Basic Collapse",
    description: "Simple expandable content with different trigger styles",
    code: `<Collapse title="Click to expand">
  This content is hidden by default and can be expanded by clicking the title above.
</Collapse>
<Collapse title="Arrow style" arrow>
  This collapse uses an arrow indicator to show expand/collapse state.
</Collapse>
<Collapse title="Plus/minus style" plus>
  This collapse uses plus/minus icons to indicate the state.
</Collapse>`,
    showCode: true,
  },
  {
    title: "Collapse with Checkbox",
    description: "Checkbox-controlled collapse for form-like interfaces",
    code: `<Collapse title="Checkbox controlled" checkbox>
  This collapse is controlled by a checkbox, which can be useful in forms or settings.
</Collapse>
<Collapse title="Pre-opened collapse" checkbox open>
  This collapse starts in an open state and can be closed by unchecking.
</Collapse>`,
    showCode: true,
  },
  {
    title: "Collapse with Rich Content",
    description: "Collapses containing complex content and components",
    code: `<Collapse title="📊 Statistics Overview" arrow>
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
</Collapse>

<Collapse title="⚙️ Advanced Settings" plus>
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
</Collapse>`,
    showCode: true,
  },
  {
    title: "FAQ-style Collapses",
    description: "Multiple collapses for FAQ or help sections",
    code: `<div class="space-y-2">
  <Collapse title="What is this component library?" arrow>
    This is a comprehensive UI component library built with Deno, Fresh, and DaisyUI, 
    providing reusable components for building modern web applications.
  </Collapse>
  
  <Collapse title="How do I customize the styling?" arrow>
    You can customize styling by passing additional CSS classes through the 'class' prop,
    or by modifying the DaisyUI theme configuration.
  </Collapse>
  
  <Collapse title="Is it mobile responsive?" arrow>
    Yes! All components are built with responsive design in mind and work great on 
    mobile, tablet, and desktop devices.
  </Collapse>
  
  <Collapse title="Can I use custom icons?" arrow>
    Absolutely! You can pass custom icons through the 'icon' prop to replace the 
    default arrow, plus, or checkbox indicators.
  </Collapse>
</div>`,
    showCode: true,
  },
  {
    title: "Nested Collapses",
    description: "Collapses containing other collapses for hierarchical content",
    code: `<Collapse title="🏢 Company Information" arrow open>
  <div class="space-y-4">
    <p>Welcome to our company overview section.</p>
    
    <Collapse title="📍 Locations" plus>
      <div class="space-y-2">
        <Collapse title="🇺🇸 United States" checkbox>
          <ul class="list-disc list-inside pl-4">
            <li>New York - Headquarters</li>
            <li>San Francisco - Engineering</li>
            <li>Austin - Sales</li>
          </ul>
        </Collapse>
        
        <Collapse title="🇪🇺 Europe" checkbox>
          <ul class="list-disc list-inside pl-4">
            <li>London - European HQ</li>
            <li>Berlin - R&D</li>
            <li>Amsterdam - Operations</li>
          </ul>
        </Collapse>
      </div>
    </Collapse>
    
    <Collapse title="👥 Departments" plus>
      <div class="grid grid-cols-2 gap-4">
        <div class="badge badge-primary">Engineering</div>
        <div class="badge badge-secondary">Marketing</div>
        <div class="badge badge-accent">Sales</div>
        <div class="badge badge-success">Support</div>
      </div>
    </Collapse>
  </div>
</Collapse>`,
    showCode: true,
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
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title text-xl font-medium">
          Click to expand
        </div>
        <div class="collapse-content">
          <p>This content is hidden by default and can be expanded by clicking the title above.</p>
        </div>
      </div>
    </div>
  ),
  examples: collapseExamples,
  props: collapseProps,
  variants: ["basic", "arrow", "plus", "checkbox", "nested"],
  useCases: ["FAQ sections", "Settings panels", "Content organization", "Space-saving layouts", "Progressive disclosure"],
  usageNotes: [
    "Use arrow variant for general expand/collapse UI patterns",
    "Checkbox variant works well in forms and settings interfaces",
    "Plus/minus variant is intuitive for add/remove or expand/contract actions",
    "Custom icons can be used to match your design system",
    "Nested collapses create hierarchical content organization",
    "Consider accessibility by ensuring keyboard navigation works properly",
  ],
};