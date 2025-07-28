import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const dockExamples: ComponentExample[] = [
  {
    title: "Basic Dock",
    description: "Simple dock with navigation items",
    code: `<Dock 
  items={[
    { id: "home", label: "Home", icon: "🏠", active: true },
    { id: "search", label: "Search", icon: "🔍" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Dock Positions",
    description: "Different dock positions",
    code: `<Dock 
  position="bottom"
  items={[
    { id: "1", label: "Home", icon: "🏠" },
    { id: "2", label: "Search", icon: "🔍" }
  ]}
/>

<Dock 
  position="top"
  items={[
    { id: "1", label: "File", icon: "📁" },
    { id: "2", label: "Edit", icon: "✏️" }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Dock Sizes",
    description: "Different sizes for various contexts",
    code: `<Dock 
  size="sm"
  items={[
    { id: "1", label: "Small", icon: "📱" },
    { id: "2", label: "Dock", icon: "⚡" }
  ]}
/>

<Dock 
  size="lg"
  items={[
    { id: "1", label: "Large", icon: "💻" },
    { id: "2", label: "Dock", icon: "🚀" }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Dock with Badges",
    description: "Dock items with notification badges",
    code: `<Dock 
  items={[
    { id: "messages", label: "Messages", icon: "💬", badge: "3" },
    { id: "notifications", label: "Alerts", icon: "🔔", badge: "12" },
    { id: "inbox", label: "Inbox", icon: "📥", badge: "99+" },
    { id: "profile", label: "Profile", icon: "👤" }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Dock Variants",
    description: "Different visual styles",
    code: `<Dock 
  variant="primary"
  items={[
    { id: "1", label: "Primary", icon: "🎨" },
    { id: "2", label: "Style", icon: "✨" }
  ]}
/>

<Dock 
  variant="ghost"
  items={[
    { id: "1", label: "Ghost", icon: "👻" },
    { id: "2", label: "Style", icon: "🌟" }
  ]}
/>`,
    showCode: true,
  },
];

const dockProps: ComponentProp[] = [
  {
    name: "items",
    type: "DockItem[]",
    description: "Array of dock items to display",
    required: true,
  },
  {
    name: "position",
    type: "'bottom' | 'top' | 'left' | 'right'",
    description: "Position of the dock",
    default: "bottom",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    description: "Size variant of the dock",
    default: "md",
  },
  {
    name: "variant",
    type: "'default' | 'primary' | 'secondary' | 'accent' | 'neutral' | 'ghost'",
    description: "Visual style variant",
    default: "default",
  },
  {
    name: "showLabels",
    type: "boolean",
    description: "Whether to show item labels",
    default: "true",
  },
  {
    name: "fixed",
    type: "boolean",
    description: "Whether dock has fixed positioning",
    default: "false",
  },
  {
    name: "onItemClick",
    type: "(item: DockItem, index: number) => void",
    description: "Callback when any item is clicked",
  },
  {
    name: "className",
    type: "string",
    description: "Additional CSS classes",
  },
];

export const dockMetadata: ComponentMetadata = {
  name: "Dock",
  description: "macOS-style dock component for primary navigation with icons, labels, and badges",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/dock",
  tags: ["navigation", "dock", "bar", "menu", "icons"],
  relatedComponents: ["navbar", "menu", "tabs", "badge"],
  interactive: true, // Has click handlers and navigation
  preview: (
    <div class="w-full bg-base-200 p-4 rounded-lg">
      <div class="flex justify-center items-center gap-1 bg-base-100 rounded-lg p-2 shadow">
        <button class="flex flex-col items-center justify-center w-12 h-12 rounded-lg hover:bg-base-200/50 text-primary">
          <span class="text-lg">🏠</span>
          <span class="text-xs">Home</span>
        </button>
        <button class="flex flex-col items-center justify-center w-12 h-12 rounded-lg hover:bg-base-200/50">
          <span class="text-lg">🔍</span>
          <span class="text-xs">Search</span>
        </button>
        <button class="flex flex-col items-center justify-center w-12 h-12 rounded-lg hover:bg-base-200/50 relative">
          <span class="text-lg">💬</span>
          <span class="text-xs">Chat</span>
          <span class="absolute -top-1 -right-1 bg-primary text-primary-content text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </div>
  ),
  examples: dockExamples,
  props: dockProps,
  variants: ["bottom", "top", "left", "right", "with-badges", "different-sizes"],
  useCases: ["App navigation", "Toolbar", "Quick actions", "Mobile navigation"],
  usageNotes: [
    "DockItem interface includes id, label, icon, active, disabled, badge, onClick, href",
    "Supports both button (onClick) and link (href) items",
    "Active items are highlighted with primary color and indicator dot",
    "Badges automatically position in top-right corner of items",
    "fixed=true adds CSS fixed positioning for overlay docks",
    "Hover animations include scale effects for better feedback",
    "Labels can be hidden with showLabels=false for icon-only docks",
    "Responsive design adapts layout based on position",
  ],
};
