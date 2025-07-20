import {
  BarChart3,
  BookOpen,
  Building2,
  Code2,
  Edit3,
  FileText,
  Home,
  Layers,
  Layout,
  MessageCircle,
  Navigation,
  Puzzle,
  Smartphone,
  Palmtree,
  Zap,
} from "lucide-preact";

export interface SidebarLink {
  name: string;
  path: string;
  icon?: any;
  description?: string;
  badge?: string | number;
  external?: boolean;
}

export interface SidebarSection {
  id: string;
  title: string;
  icon?: any;
  links: SidebarLink[];
  defaultOpen?: boolean;
  badge?: string | number;
}

export interface SidebarConfig {
  sections: SidebarSection[];
  showSearch?: boolean;
  showQuickLinks?: boolean;
  quickLinks?: SidebarLink[];
  title?: string;
  logo?: any;
}

// Icon mapping for categories
export const categoryIcons: Record<string, any> = {
  "Actions": <Zap size={16} />,
  "Data Display": <BarChart3 size={16} />,
  "Navigation": <Navigation size={16} />,
  "Data Input": <Edit3 size={16} />,
  "Layout": <Building2 size={16} />,
  "Feedback": <MessageCircle size={16} />,
  "Mockup": <Smartphone size={16} />,
  "Components": <Puzzle size={16} />,
  "Islands": <Palmtree size={16} />,
  "Pages": <Layout size={16} />,
  "Getting Started": <BookOpen size={16} />,
  "Documentation": <FileText size={16} />,
  "Home": <Home size={16} />,
};

// Default configuration for UI Library site (clean, like Ionic)
export const defaultUISidebarConfig: SidebarConfig = {
  showSearch: false,
  showQuickLinks: false,
  sections: [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: categoryIcons["Getting Started"],
      defaultOpen: true,
      links: [
        {
          name: "UI Components",
          path: "/components",
        },
        {
          name: "Interactive Islands",
          path: "/islands",
        },
        {
          name: "Page Templates",
          path: "/pages",
        },
      ],
    },
    {
      id: "actions",
      title: "Actions",
      icon: categoryIcons["Actions"],
      defaultOpen: true,
      links: [
        {
          name: "Button",
          path: "/components/actions/button",
        },
        {
          name: "Dropdown",
          path: "/components/actions/dropdown",
        },
        {
          name: "Modal",
          path: "/components/actions/modal",
        },
        {
          name: "Swap",
          path: "/components/actions/swap",
        },
      ],
    },
    {
      id: "data-display",
      title: "Data Display",
      icon: categoryIcons["Data Display"],
      defaultOpen: true,
      links: [
        {
          name: "Accordion",
          path: "/components/data-display/accordion",
        },
        {
          name: "Avatar",
          path: "/components/data-display/avatar",
        },
        {
          name: "Badge",
          path: "/components/data-display/badge",
        },
        {
          name: "Card",
          path: "/components/data-display/card",
        },
        {
          name: "Carousel",
          path: "/components/data-display/carousel",
        },
        {
          name: "Chat",
          path: "/components/data-display/chat",
        },
        {
          name: "Collapse",
          path: "/components/data-display/collapse",
        },
        {
          name: "Countdown",
          path: "/components/data-display/countdown",
        },
        {
          name: "Diff",
          path: "/components/data-display/diff",
        },
        {
          name: "Kbd",
          path: "/components/data-display/kbd",
        },
        {
          name: "Stat",
          path: "/components/data-display/stat",
        },
        {
          name: "Table",
          path: "/components/data-display/table",
        },
        {
          name: "Timeline",
          path: "/components/data-display/timeline",
        },
      ],
    },
    {
      id: "navigation",
      title: "Navigation",
      icon: categoryIcons["Navigation"],
      defaultOpen: true,
      links: [
        {
          name: "Breadcrumbs",
          path: "/components/navigation/breadcrumbs",
        },
        {
          name: "Bottom Navigation",
          path: "/components/navigation/btm-nav",
        },
        {
          name: "Link",
          path: "/components/navigation/link",
        },
        {
          name: "Menu",
          path: "/components/navigation/menu",
        },
        {
          name: "Navbar",
          path: "/components/navigation/navbar",
        },
        {
          name: "Pagination",
          path: "/components/navigation/pagination",
        },
        {
          name: "Steps",
          path: "/components/navigation/steps",
        },
        {
          name: "Tab",
          path: "/components/navigation/tab",
        },
      ],
    },
    {
      id: "data-input",
      title: "Data Input",
      icon: categoryIcons["Data Input"],
      defaultOpen: true,
      links: [
        {
          name: "Checkbox",
          path: "/components/data-input/checkbox",
        },
        {
          name: "File Input",
          path: "/components/data-input/file-input",
        },
        {
          name: "Input",
          path: "/components/data-input/input",
        },
        {
          name: "Radio",
          path: "/components/data-input/radio",
        },
        {
          name: "Range",
          path: "/components/data-input/range",
        },
        {
          name: "Rating",
          path: "/components/data-input/rating",
        },
        {
          name: "Select",
          path: "/components/data-input/select",
        },
        {
          name: "Textarea",
          path: "/components/data-input/textarea",
        },
        {
          name: "Toggle",
          path: "/components/data-input/toggle",
        },
      ],
    },
    {
      id: "layout",
      title: "Layout",
      icon: categoryIcons["Layout"],
      defaultOpen: true,
      links: [
        {
          name: "Artboard",
          path: "/components/layout/artboard",
        },
        {
          name: "Divider",
          path: "/components/layout/divider",
        },
        {
          name: "Drawer",
          path: "/components/layout/drawer",
        },
        {
          name: "Footer",
          path: "/components/layout/footer",
        },
        {
          name: "Hero",
          path: "/components/layout/hero",
        },
        {
          name: "Indicator",
          path: "/components/layout/indicator",
        },
        {
          name: "Join",
          path: "/components/layout/join",
        },
        {
          name: "Mask",
          path: "/components/layout/mask",
        },
        {
          name: "Stack",
          path: "/components/layout/stack",
        },
      ],
    },
    {
      id: "feedback",
      title: "Feedback",
      icon: categoryIcons["Feedback"],
      defaultOpen: true,
      links: [
        {
          name: "Alert",
          path: "/components/feedback/alert",
        },
        {
          name: "Loading",
          path: "/components/feedback/loading",
        },
        {
          name: "Progress",
          path: "/components/feedback/progress",
        },
        {
          name: "Radial Progress",
          path: "/components/feedback/radial-progress",
        },
        {
          name: "Skeleton",
          path: "/components/feedback/skeleton",
        },
        {
          name: "Toast",
          path: "/components/feedback/toast",
        },
        {
          name: "Tooltip",
          path: "/components/feedback/tooltip",
        },
      ],
    },
    {
      id: "mockup",
      title: "Mockup",
      icon: categoryIcons["Mockup"],
      defaultOpen: true,
      links: [
        {
          name: "Browser",
          path: "/components/mockup/mockup-browser",
        },
        {
          name: "Code",
          path: "/components/mockup/mockup-code",
        },
        {
          name: "Phone",
          path: "/components/mockup/mockup-phone",
        },
        {
          name: "Window",
          path: "/components/mockup/mockup-window",
        },
      ],
    },
  ],
};

// Full-featured sidebar configuration (with search and quick links)
export const fullSidebarConfig: SidebarConfig = {
  showSearch: true,
  showQuickLinks: true,
  quickLinks: [
    {
      name: "Home",
      path: "/",
      icon: categoryIcons["Home"],
    },
    {
      name: "Components",
      path: "/components",
      icon: categoryIcons["Components"],
    },
    {
      name: "Islands",
      path: "/islands",
      icon: categoryIcons["Islands"],
    },
    {
      name: "Pages",
      path: "/pages",
      icon: categoryIcons["Pages"],
    },
    {
      name: "Getting Started",
      path: "/docs/getting-started",
      icon: categoryIcons["Getting Started"],
    },
  ],
  sections: defaultUISidebarConfig.sections,
};

// Minimal sidebar configuration
export const minimalSidebarConfig: SidebarConfig = {
  showSearch: false,
  showQuickLinks: false,
  sections: [
    {
      id: "quick-access",
      title: "Quick Access",
      defaultOpen: true,
      links: [
        {
          name: "Components",
          path: "/components",
        },
        {
          name: "Islands",
          path: "/islands",
        },
        {
          name: "Documentation",
          path: "/docs",
        },
      ],
    },
  ],
};

// Utility function to create custom sidebar configurations
export function createSidebarConfig(options: Partial<SidebarConfig>): SidebarConfig {
  return {
    showSearch: options.showSearch ?? false,
    showQuickLinks: options.showQuickLinks ?? false,
    sections: options.sections || defaultUISidebarConfig.sections,
    quickLinks: options.quickLinks || [],
    title: options.title,
    logo: options.logo,
  };
}
