import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";
import { Sidebar } from "./Sidebar.tsx";
import { BarChart3, FileText, Home, Settings, User } from "lucide-preact";

const sidebarExamples: ComponentExample[] = [
  {
    title: "Basic Sidebar",
    description: "Simple sidebar with sections and links",
    props: {
      config: {
        title: "My App",
        sections: [
          {
            id: "main",
            title: "Main",
            defaultOpen: true,
            icon: <Home size={16} />,
            links: [
              { name: "Dashboard", path: "/dashboard" },
              { name: "Settings", path: "/settings" },
            ],
          },
        ],
      },
      currentPath: "/dashboard",
    },
  },
  {
    title: "Sidebar with Quick Links",
    description: "Sidebar with header and quick access links",
    props: {
      config: {
        title: "My App",
        showQuickLinks: true,
        quickLinks: [
          { name: "Home", path: "/", icon: <Home size={16} /> },
          { name: "Profile", path: "/profile", icon: <User size={16} /> },
        ],
        sections: [
          {
            id: "tools",
            title: "Tools",
            defaultOpen: true,
            icon: <BarChart3 size={16} />,
            links: [
              { name: "Analytics", path: "/analytics" },
              { name: "Reports", path: "/reports" },
            ],
          },
        ],
      },
    },
  },
  {
    title: "Sidebar with Search",
    description: "Sidebar with integrated search functionality",
    props: {
      config: {
        title: "Documentation",
        showSearch: true,
        sections: [
          {
            id: "docs",
            title: "Documentation",
            defaultOpen: true,
            icon: <FileText size={16} />,
            links: [
              { name: "Getting Started", path: "/docs/start" },
              { name: "API Reference", path: "/docs/api" },
              { name: "Examples", path: "/docs/examples" },
            ],
          },
        ],
      },
    },
  },
  {
    title: "Interactive Sidebar",
    description: "Sidebar with click handlers and badges",
    props: {
      config: {
        sections: [
          {
            id: "main",
            title: "Main",
            badge: "3",
            defaultOpen: true,
            icon: <Settings size={16} />,
            links: [
              {
                name: "Messages",
                path: "/messages",
                badge: "5",
              },
              {
                name: "Notifications",
                path: "/notifications",
                badge: "2",
              },
              {
                name: "External Link",
                path: "https://example.com",
                external: true,
              },
            ],
          },
        ],
      },
      onLinkClick: (link) => console.log("Clicked:", link),
    },
  },
];

const sidebarProps: ComponentProp[] = [
  {
    name: "config",
    type: "SidebarConfig",
    description: "Configuration object defining sidebar structure and behavior",
    required: true,
  },
  {
    name: "currentPath",
    type: "string",
    description: "Current active path for highlighting active links",
    default: "''",
  },
  {
    name: "onLinkClick",
    type: "(link: SidebarLink) => void",
    description: "Callback when a sidebar link is clicked",
  },
  {
    name: "class",
    type: "string",
    description: "Additional CSS classes for the sidebar container",
  },
];

export const sidebarMetadata: ComponentMetadata = {
  name: "Sidebar",
  description:
    "Configurable sidebar navigation with sections, quick links, search, and collapsible groups",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/sidebar",
  tags: ["sidebar", "navigation", "menu", "collapsible", "sections"],
  relatedComponents: ["navbar", "menu", "drawer"],
  interactive: true,
  preview: (
    <div class="w-64 bg-base-100 border-r border-base-300 h-96">
      <div class="p-4 border-b border-base-300">
        <h2 class="text-lg font-semibold">My App</h2>
      </div>
      <div class="p-2">
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary">
          <span>Dashboard</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg text-base-content/80">
          <span>Settings</span>
        </div>
      </div>
    </div>
  ),
  examples: sidebarExamples,
  props: sidebarProps,
  variants: ["with-header", "with-search", "with-quick-links", "collapsible"],
  useCases: ["App navigation", "Documentation sites", "Admin panels", "Multi-section menus"],
  usageNotes: [
    "Configure sections and links through the config prop",
    "Use currentPath to highlight active navigation items",
    "Sections can be collapsible with defaultOpen property",
    "Quick links provide rapid access to important pages",
    "Badges can show counts or status indicators",
    "External links automatically show external indicators",
  ],
};
