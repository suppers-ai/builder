import { SearchableComponent } from "../utils/search.ts";

export interface IslandComponent extends SearchableComponent {
  associatedComponent?: string;
  hooksDependencies?: string[];
  interactivityLevel: "basic" | "medium" | "advanced";
}

export const allIslands: IslandComponent[] = [
  // Core App Infrastructure
  {
    name: "Theme Controller",
    description: "Theme switching with localStorage persistence and document manipulation",
    category: "Actions",
    tags: ["theme", "persistence", "localStorage", "document"],
    path: "/islands/theme-controller",
    keywords: ["theme", "switch", "dark", "light"],
    associatedComponent: "action/theme-controller/ThemeController",
    hooksDependencies: ["useState", "useEffect"],
    interactivityLevel: "medium",
  },
  {
    name: "Header Layout",
    description: "App header with navigation, command palette, and responsive behavior",
    category: "Layout",
    tags: ["header", "navigation", "command-palette", "responsive"],
    path: "/islands/header-layout",
    keywords: ["header", "navigation", "responsive", "menu"],
    associatedComponent: "Header",
    hooksDependencies: ["useState", "useEffect"],
    interactivityLevel: "advanced",
  },
  {
    name: "Sidebar Layout",
    description: "App sidebar with collapsible sections and search functionality",
    category: "Layout",
    tags: ["sidebar", "collapsible", "search", "navigation"],
    path: "/islands/sidebar-layout",
    keywords: ["sidebar", "collapsible", "layout", "menu"],
    associatedComponent: "Sidebar",
    hooksDependencies: ["useState", "useEffect"],
    interactivityLevel: "advanced",
  },

  // Interactive Component Controls
  {
    name: "Interactive Chat Controls",
    description: "Interactive chat interface with real-time messaging and bot responses",
    category: "Display",
    tags: ["chat", "messaging", "realtime", "interactive"],
    path: "/islands/interactive-chat-controls",
    keywords: ["chat", "message", "conversation", "bot"],
    associatedComponent: "ChatBubble",
    hooksDependencies: ["useState", "useEffect"],
    interactivityLevel: "advanced",
  },
  {
    name: "Interactive Collapse Controls",
    description: "Collapsible content with different expansion styles and custom icons",
    category: "Display",
    tags: ["collapse", "accordion", "expandable", "toggle"],
    path: "/islands/interactive-collapse-controls",
    keywords: ["collapse", "accordion", "expand", "toggle"],
    associatedComponent: "Collapse",
    hooksDependencies: ["useState"],
    interactivityLevel: "medium",
  },
  {
    name: "Interactive Carousel Controls",
    description: "Image carousel with auto-slide functionality and navigation controls",
    category: "Display",
    tags: ["carousel", "slider", "images", "navigation"],
    path: "/islands/interactive-carousel-controls",
    keywords: ["carousel", "slider", "images", "gallery"],
    associatedComponent: "Carousel",
    hooksDependencies: ["useState"],
    interactivityLevel: "medium",
  },
  {
    name: "Interactive Drawer Controls",
    description: "Drawer component with various positions and overlay configurations",
    category: "Layout",
    tags: ["drawer", "sidebar", "overlay", "navigation"],
    path: "/islands/interactive-drawer-controls",
    keywords: ["drawer", "sidebar", "overlay", "slide"],
    associatedComponent: "Drawer",
    hooksDependencies: ["useState"],
    interactivityLevel: "medium",
  },
  {
    name: "Interactive Stats Controls",
    description: "Animated statistics display with real-time updates and charts",
    category: "Display",
    tags: ["stats", "charts", "animation", "data"],
    path: "/islands/interactive-stats-controls",
    keywords: ["stats", "statistics", "charts", "data"],
    associatedComponent: "Stats",
    hooksDependencies: ["useState", "useEffect"],
    interactivityLevel: "advanced",
  },
  {
    name: "Interactive Table Controls",
    description: "Data table with sorting, filtering, and pagination functionality",
    category: "Display",
    tags: ["table", "data", "sorting", "filtering"],
    path: "/islands/interactive-table-controls",
    keywords: ["table", "data", "sort", "filter"],
    associatedComponent: "Table",
    hooksDependencies: ["useState", "useEffect"],
    interactivityLevel: "advanced",
  },
  {
    name: "Interactive Pagination Controls",
    description: "Pagination component with customizable page sizes and navigation",
    category: "Navigation",
    tags: ["pagination", "navigation", "pages", "data"],
    path: "/islands/interactive-pagination-controls",
    keywords: ["pagination", "pages", "navigation", "data"],
    associatedComponent: "Pagination",
    hooksDependencies: ["useState"],
    interactivityLevel: "medium",
  },
  {
    name: "Paginated Table Demo",
    description: "Complete example of paginated table with search and sorting",
    category: "Display",
    tags: ["table", "pagination", "search", "demo"],
    path: "/islands/paginated-table-demo",
    keywords: ["table", "pagination", "search", "demo"],
    associatedComponent: "Table",
    hooksDependencies: ["useState", "useEffect"],
    interactivityLevel: "advanced",
  },
  {
    name: "Page Layout",
    description: "Full page layout with responsive sidebar and footer",
    category: "Layout",
    tags: ["layout", "page", "responsive", "sidebar"],
    path: "/islands/page-layout",
    keywords: ["layout", "page", "responsive", "structure"],
    associatedComponent: "PageLayout",
    hooksDependencies: ["useEffect"],
    interactivityLevel: "basic",
  },
];

export const getIslandsByCategory = (category: string) => {
  return allIslands.filter((island) => island.category.toLowerCase() === category.toLowerCase());
};

export const getIslandByPath = (path: string) => {
  return allIslands.find((island) => island.path === path);
};

export const getAllIslandCategories = () => {
  const categories = new Set(allIslands.map((island) => island.category));
  return Array.from(categories);
};

export const getIslandCount = () => allIslands.length;

export const getIslandCategoryCount = (category: string) => {
  return allIslands.filter((island) => island.category.toLowerCase() === category.toLowerCase())
    .length;
};

export const getIslandsByInteractivity = (level: "basic" | "medium" | "advanced") => {
  return allIslands.filter((island) => island.interactivityLevel === level);
};

export const getIslandsWithHook = (hook: string) => {
  return allIslands.filter((island) => island.hooksDependencies?.includes(hook));
};
