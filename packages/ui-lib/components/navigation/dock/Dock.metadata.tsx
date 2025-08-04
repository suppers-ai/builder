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
    props: {
      items: [
        {
          label: "Home",
          icon: "🏠",
          href: "/",
        },
        {
          label: "Search",
          icon: "🔍",
          href: "/search",
        },
        {
          label: "Profile",
          icon: "👤",
          href: "/profile",
        },
      ],
    },
  },
  {
    title: "Dock Positions",
    description: "Different dock positions",
    props: {
      items: [
        {
          label: "Home",
          icon: "🏠",
          href: "/",
        },
        {
          label: "Search",
          icon: "🔍",
          href: "/search",
        },
        {
          label: "Profile",
          icon: "👤",
          href: "/profile",
        },
      ],
    },
  },
  {
    title: "Dock Sizes",
    description: "Different sizes for various contexts",
    props: {
      items: [
        {
          label: "Home",
          icon: "🏠",
          href: "/",
        },
        {
          label: "Search",
          icon: "🔍",
          href: "/search",
        },
        {
          label: "Profile",
          icon: "👤",
          href: "/profile",
        },
      ],
      size: "lg",
    },
  },
  {
    title: "Dock with Badges",
    description: "Dock items with notification badges",
    props: {
      items: [
        {
          label: "Home",
          icon: "🏠",
          href: "/",
        },
        {
          label: "Search",
          icon: "🔍",
          href: "/search",
        },
        {
          label: "Profile",
          icon: "👤",
          href: "/profile",
        },
      ],
    },
  },
  {
    title: "Dock Variants",
    description: "Different visual styles",
    props: {
      items: [
        {
          label: "Home",
          icon: "🏠",
          href: "/",
        },
        {
          label: "Search",
          icon: "🔍",
          href: "/search",
        },
        {
          label: "Profile",
          icon: "👤",
          href: "/profile",
        },
      ],
      variant: "outlined",
    },
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
