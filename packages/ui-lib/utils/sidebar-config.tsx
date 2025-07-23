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
  Palmtree,
  Puzzle,
  Smartphone,
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
          path: "/components/action/button",
        },
        {
          name: "Dropdown",
          path: "/components/action/dropdown",
        },
        {
          name: "Login Button",
          path: "/components/action/login-button",
        },
        {
          name: "Modal",
          path: "/components/action/modal",
        },
        {
          name: "Search Button",
          path: "/components/action/search-button",
        },
        {
          name: "Search Modal",
          path: "/components/action/search-modal",
        },
        {
          name: "Swap",
          path: "/components/action/swap",
        },
        {
          name: "Theme Controller",
          path: "/components/action/theme-controller",
        },
      ],
    },
    {
      id: "display",
      title: "Display",
      icon: categoryIcons["Data Display"],
      defaultOpen: true,
      links: [
        {
          name: "Accordion",
          path: "/components/display/accordion",
        },
        {
          name: "Avatar",
          path: "/components/display/avatar",
        },
        {
          name: "Badge",
          path: "/components/display/badge",
        },
        {
          name: "Card",
          path: "/components/display/card",
        },
        {
          name: "Carousel",
          path: "/components/display/carousel",
        },
        {
          name: "Chat Bubble",
          path: "/components/display/chat-bubble",
        },
        {
          name: "Collapse",
          path: "/components/display/collapse",
        },
        {
          name: "Countdown",
          path: "/components/display/countdown",
        },
        {
          name: "Diff",
          path: "/components/display/diff",
        },
        {
          name: "Kbd",
          path: "/components/display/kbd",
        },
        {
          name: "Stat",
          path: "/components/display/stat",
        },
        {
          name: "Table",
          path: "/components/display/table",
        },
        {
          name: "Timeline",
          path: "/components/display/timeline",
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
          name: "Tabs",
          path: "/components/navigation/tabs",
        },
        {
          name: "User Profile Dropdown",
          path: "/components/navigation/user-profile-dropdown",
        },
      ],
    },
    {
      id: "input",
      title: "Input",
      icon: categoryIcons["Data Input"],
      defaultOpen: true,
      links: [
        {
          name: "Checkbox",
          path: "/components/input/checkbox",
        },
        {
          name: "Color Input",
          path: "/components/input/color-input",
        },
        {
          name: "Date Input",
          path: "/components/input/date-input",
        },
        {
          name: "Datetime Input",
          path: "/components/input/datetime-input",
        },
        {
          name: "Email Input",
          path: "/components/input/email-input",
        },
        {
          name: "File Input",
          path: "/components/input/file-input",
        },
        {
          name: "Input",
          path: "/components/input/input",
        },
        {
          name: "Number Input",
          path: "/components/input/number-input",
        },
        {
          name: "Password Input",
          path: "/components/input/password-input",
        },
        {
          name: "Radio",
          path: "/components/input/radio",
        },
        {
          name: "Range",
          path: "/components/input/range",
        },
        {
          name: "Rating",
          path: "/components/input/rating",
        },
        {
          name: "Select",
          path: "/components/input/select",
        },
        {
          name: "Textarea",
          path: "/components/input/textarea",
        },
        {
          name: "Time Input",
          path: "/components/input/time-input",
        },
        {
          name: "Toggle",
          path: "/components/input/toggle",
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
          name: "Browser Mockup",
          path: "/components/mockup/browser-mockup",
        },
        {
          name: "Code Mockup",
          path: "/components/mockup/code-mockup",
        },
        {
          name: "Phone Mockup",
          path: "/components/mockup/phone-mockup",
        },
        {
          name: "Window Mockup",
          path: "/components/mockup/window-mockup",
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
