import {
  BarChart3,
  BookOpen,
  Building2,
  Edit3,
  FileText,
  Home,
  MessageCircle,
  Navigation,
  Puzzle,
  Smartphone,
  Zap,
} from "lucide-preact";
import {
  SidebarConfig,
} from "@suppers/ui-lib";
import { componentsMetadata } from "@suppers/ui-lib/components/metadata.tsx";

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
  "Getting Started": <BookOpen size={16} />,
  "Documentation": <FileText size={16} />,
  "Home": <Home size={16} />,
};

// Default configuration for UI Library site (clean, like Ionic)
export const defaultUISidebarConfig: SidebarConfig = {
  showSearch: false,
  showQuickLinks: true,
  quickLinks: [
    {
      name: "Home",
      path: "/",
      icon: categoryIcons["Home"],
    },
    {
      name: "UI Components",
      path: "/components",
      icon: categoryIcons["Components"],
    },
  ],
  sections: [
    {
      id: "actions",
      title: "Actions",
      icon: categoryIcons["Actions"],
      defaultOpen: true,
      links: componentsMetadata.action.map((value) => ({
        name: value.name,
        path: value.path,
      })),
    },
    {
      id: "display",
      title: "Display",
      icon: categoryIcons["Data Display"],
      defaultOpen: true,
      links: componentsMetadata.display.map((value) => ({
        name: value.name,
        path: value.path,
      })),
    },
    {
      id: "navigation",
      title: "Navigation",
      icon: categoryIcons["Navigation"],
      defaultOpen: true,
      links: componentsMetadata.navigation.map((value) => ({
        name: value.name,
        path: value.path,
      })),
    },
    {
      id: "input",
      title: "Input",
      icon: categoryIcons["Data Input"],
      defaultOpen: true,
      links: componentsMetadata.input.map((value) => ({
        name: value.name,
        path: value.path,
      })),
    },
    {
      id: "layout",
      title: "Layout",
      icon: categoryIcons["Layout"],
      defaultOpen: true,
      links: componentsMetadata.layout.map((value) => ({
        name: value.name,
        path: value.path,
      })),
    },
    {
      id: "feedback",
      title: "Feedback",
      icon: categoryIcons["Feedback"],
      defaultOpen: true,
      links: componentsMetadata.feedback.map((value) => ({
        name: value.name,
        path: value.path,
      })),
    },
    {
      id: "mockup",
      title: "Mockup",
      icon: categoryIcons["Mockup"],
      defaultOpen: true,
      links: componentsMetadata.mockup.map((value) => ({
        name: value.name,
        path: value.path,
      })),
    },
  ],
};

// Full-featured sidebar configuration (with search and quick links)
export const fullSidebarConfig: SidebarConfig = {
  showSearch: false,
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
