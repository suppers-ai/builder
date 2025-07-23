import { ComponentMetadata, ComponentCategory, ComponentExample, ComponentProp } from "../../types.ts";

const tabsExamples: ComponentExample[] = [
  {
    title: "Basic Tabs",
    description: "Simple tab navigation with content panels",
    code: `<Tabs
  tabs={[
    { id: "tab1", label: "Home", content: "Welcome to the home page!" },
    { id: "tab2", label: "About", content: "Learn more about us here." },
    { id: "tab3", label: "Contact", content: "Get in touch with our team." }
  ]}
  activeTab="tab1"
/>`,
    showCode: true,
  },
  {
    title: "Tabs Variants",
    description: "Different tab styles and appearances",
    code: `<Tabs
  bordered
  tabs={[
    { id: "tab1", label: "Bordered", content: "This tab has borders" },
    { id: "tab2", label: "Style", content: "Different tab styling" }
  ]}
/>
<Tabs
  lifted
  tabs={[
    { id: "tab1", label: "Lifted", content: "This tab appears lifted" },
    { id: "tab2", label: "Design", content: "Elevated tab design" }
  ]}
/>
<Tabs
  boxed
  tabs={[
    { id: "tab1", label: "Boxed", content: "This tab has a boxed style" },
    { id: "tab2", label: "Layout", content: "Boxed tab layout" }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Tabs Sizes",
    description: "Different tab sizes for various contexts",
    code: `<Tabs
  size="xs"
  tabs={[
    { id: "tab1", label: "Extra Small", content: "Extra small tabs" },
    { id: "tab2", label: "XS Tab", content: "Compact tab size" }
  ]}
/>
<Tabs
  size="sm"
  tabs={[
    { id: "tab1", label: "Small", content: "Small tabs" },
    { id: "tab2", label: "SM Tab", content: "Small tab size" }
  ]}
/>
<Tabs
  size="lg"
  tabs={[
    { id: "tab1", label: "Large", content: "Large tabs" },
    { id: "tab2", label: "LG Tab", content: "Large tab size" }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Tabs with Rich Content",
    description: "Tabs containing complex content and components",
    code: `<Tabs
  bordered
  tabs={[
    {
      id: "dashboard",
      label: "Dashboard",
      content: (
        <div class="space-y-4">
          <div class="stats shadow">
            <div class="stat">
              <div class="stat-title">Total Users</div>
              <div class="stat-value">1,234</div>
            </div>
          </div>
          <p>Welcome to your dashboard overview.</p>
        </div>
      )
    },
    {
      id: "settings",
      label: "Settings",
      content: (
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Theme</span>
          </label>
          <select class="select select-bordered">
            <option>Light</option>
            <option>Dark</option>
          </select>
        </div>
      )
    }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Tabs with Disabled State",
    description: "Tabs with some options disabled",
    code: `<Tabs
  tabs={[
    { id: "available", label: "Available", content: "This tab is available and active." },
    { id: "disabled", label: "Disabled", content: "This content won't show.", disabled: true },
    { id: "enabled", label: "Enabled", content: "This tab is also available." }
  ]}
  activeTab="available"
/>`,
    showCode: true,
  },
];

const tabsProps: ComponentProp[] = [
  {
    name: "tabs",
    type: "TabItemProps[]",
    description: "Array of tab items with id, label, content, and optional disabled state",
    required: true,
  },
  {
    name: "activeTab",
    type: "string",
    description: "ID of the currently active tab",
  },
  {
    name: "size",
    type: "'xs' | 'sm' | 'md' | 'lg'",
    description: "Size of the tabs",
    default: "md",
  },
  {
    name: "bordered",
    type: "boolean",
    description: "Show border around tabs",
    default: "false",
  },
  {
    name: "lifted",
    type: "boolean",
    description: "Lifted appearance with shadow effect",
    default: "false",
  },
  {
    name: "boxed",
    type: "boolean",
    description: "Boxed style with background",
    default: "false",
  },
  {
    name: "onTabChange",
    type: "(tabId: string) => void",
    description: "Callback function called when tab is changed",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const tabsMetadata: ComponentMetadata = {
  name: "Tabs",
  description: "Tabbed interface for organizing content into separate panels with navigation",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/tabs",
  tags: ["tabs", "navigation", "switch", "toggle", "content", "panels"],
  relatedComponents: ["radio", "collapse", "card"],
  interactive: true, // Can have click handlers for tab switching
  preview: (
    <div class="w-full max-w-sm">
      <div class="tabs tabs-bordered">
        <a class="tab tab-active">Overview</a>
        <a class="tab">Details</a>
        <a class="tab">Settings</a>
      </div>
      <div class="tab-content bg-base-100 border-base-300 rounded-box p-4 mt-2">
        <p class="text-sm">Tab content example</p>
      </div>
    </div>
  ),
  examples: tabsExamples,
  props: tabsProps,
  variants: ["basic", "bordered", "lifted", "boxed", "sizes", "disabled"],
  useCases: ["Settings panels", "Product details", "Content organization", "Feature toggles"],
  usageNotes: [
    "Each tab item needs a unique ID for proper navigation",
    "Content can be simple text or complex JSX components",
    "Use onTabChange callback for controlled tab switching",
    "Bordered variant works well for form-like interfaces",
    "Lifted variant adds depth and visual hierarchy",
    "Boxed variant provides clear separation between tabs",
    "Disabled tabs prevent user interaction but remain visible",
  ],
};