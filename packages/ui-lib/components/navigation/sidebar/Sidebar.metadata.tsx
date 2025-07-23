import {
  ComponentCategory,
  ComponentExample,
  ComponentMetadata,
  ComponentProp,
} from "../../types.ts";

const sidebarExamples: ComponentExample[] = [
  {
    title: "Basic Sidebar",
    description: "Simple sidebar with sections and links",
    code: `const config = {
  title: "My App",
  sections: [
    {
      id: "main",
      title: "Main",
      links: [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Settings", path: "/settings" }
      ]
    }
  ]
};

<Sidebar config={config} currentPath="/dashboard" />`,
    showCode: true,
  },
  {
    title: "Sidebar with Quick Links",
    description: "Sidebar with header and quick access links",
    code: `const config = {
  title: "My App",
  showQuickLinks: true,
  quickLinks: [
    { name: "Home", path: "/", icon: <HomeIcon /> },
    { name: "Profile", path: "/profile", icon: <UserIcon /> }
  ],
  sections: [
    {
      id: "tools",
      title: "Tools",
      links: [
        { name: "Analytics", path: "/analytics" },
        { name: "Reports", path: "/reports" }
      ]
    }
  ]
};

<Sidebar config={config} />`,
    showCode: true,
  },
  {
    title: "Sidebar with Search",
    description: "Sidebar with integrated search functionality",
    code: `const config = {
  title: "Documentation",
  showSearch: true,
  sections: [
    {
      id: "docs",
      title: "Documentation",
      defaultOpen: true,
      links: [
        { name: "Getting Started", path: "/docs/start" },
        { name: "API Reference", path: "/docs/api" }
      ]
    }
  ]
};

<Sidebar config={config} />`,
    showCode: true,
  },
  {
    title: "Interactive Sidebar",
    description: "Sidebar with click handlers and badges",
    code: `const config = {
  sections: [
    {
      id: "main",
      title: "Main",
      badge: "3",
      links: [
        { 
          name: "Messages", 
          path: "/messages",
          badge: "5"
        },
        { 
          name: "External", 
          path: "https://example.com",
          external: true 
        }
      ]
    }
  ]
};

<Sidebar 
  config={config} 
  onLinkClick={(link) => console.log('Clicked:', link)}
/>`,
    showCode: true,
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
