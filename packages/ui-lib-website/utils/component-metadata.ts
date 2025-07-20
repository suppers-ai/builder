// Component metadata registry
// Import all component metadata files from ui-lib package

// Import all metadata from ui-lib package
import {
  // Data Display
  accordionMetadata,
  // Feedback
  alertMetadata,
  // Layout
  artboardMetadata,
  avatarMetadata,
  badgeMetadata,
  // Navigation
  breadcrumbsMetadata,
  // Mockup
  browserMetadata,
  // Actions
  buttonMetadata,
  cardMetadata,
  carouselMetadata,
  chatBubbleMetadata,
  // Data Input
  checkboxMetadata,
  codeMetadata,
  collapseMetadata,
  countdownMetadata,
  diffMetadata,
  dividerMetadata,
  drawerMetadata,
  dropdownMetadata,
  fileInputMetadata,
  footerMetadata,
  heroMetadata,
  indicatorMetadata,
  joinMetadata,
  kbdMetadata,
  linkMetadata,
  loadingMetadata,
  maskMetadata,
  menuMetadata,
  modalMetadata,
  navbarMetadata,
  paginationMetadata,
  phoneMetadata,
  progressMetadata,
  radialProgressMetadata,
  radioMetadata,
  rangeMetadata,
  ratingMetadata,
  selectMetadata,
  skeletonMetadata,
  stackMetadata,
  statMetadata,
  stepsMetadata,
  swapMetadata,
  tableMetadata,
  tabsMetadata,
  textareaMetadata,
  textInputMetadata,
  themeControllerMetadata,
  timelineMetadata,
  toastMetadata,
  toggleMetadata,
  tooltipMetadata,
  windowMetadata,
} from "@suppers/ui-lib";

// Re-export ComponentMetadata interface from ui-lib
export type { ComponentMetadata } from "@suppers/ui-lib";

// All metadata is now imported from individual .metadata.ts files

// Combine all metadata sources
export const coreComponents: ComponentMetadata[] = [
  // Actions
  buttonMetadata,
  dropdownMetadata,
  modalMetadata,
  swapMetadata,
  themeControllerMetadata,

  // Data Display
  accordionMetadata,
  avatarMetadata,
  badgeMetadata,
  cardMetadata,
  carouselMetadata,
  chatBubbleMetadata,
  collapseMetadata,
  countdownMetadata,
  diffMetadata,
  kbdMetadata,
  statMetadata,
  tableMetadata,
  timelineMetadata,

  // Navigation
  breadcrumbsMetadata,
  linkMetadata,
  menuMetadata,
  navbarMetadata,
  paginationMetadata,
  stepsMetadata,
  tabsMetadata,

  // Data Input
  checkboxMetadata,
  fileInputMetadata,
  radioMetadata,
  rangeMetadata,
  ratingMetadata,
  selectMetadata,
  textInputMetadata,
  textareaMetadata,
  toggleMetadata,

  // Layout
  artboardMetadata,
  dividerMetadata,
  drawerMetadata,
  footerMetadata,
  heroMetadata,
  indicatorMetadata,
  joinMetadata,
  maskMetadata,
  stackMetadata,

  // Feedback
  alertMetadata,
  loadingMetadata,
  progressMetadata,
  radialProgressMetadata,
  skeletonMetadata,
  toastMetadata,
  tooltipMetadata,

  // Mockup
  browserMetadata,
  codeMetadata,
  phoneMetadata,
  windowMetadata,
];

// Page components metadata (manually added since they don't have metadata files yet)
const pageComponentsMetadata = [
  {
    name: "LoginPage",
    description: "Complete login/registration page with OAuth support",
    category: "Page",
    tags: ["login", "authentication", "oauth", "form"],
    path: "/components/page/login-page",
    keywords: ["login", "signin", "signup", "auth", "oauth", "register"],
    daisyUIClasses: ["btn", "input", "card", "alert"],
    hasInteractiveDemo: true,
    complexity: "medium",
    responsive: true,
    accessibility: "high",
    documentation: "complete",
  },
  {
    name: "AdminPage",
    description: "Admin dashboard for managing applications and users",
    category: "Page",
    tags: ["admin", "dashboard", "management", "applications"],
    path: "/components/page/admin-page",
    keywords: ["admin", "dashboard", "management", "review", "approve"],
    daisyUIClasses: ["btn", "card", "table", "badge", "tabs"],
    hasInteractiveDemo: true,
    complexity: "high",
    responsive: true,
    accessibility: "high",
    documentation: "complete",
  },
  {
    name: "UserPage",
    description: "User profile page with settings and statistics",
    category: "Page",
    tags: ["profile", "user", "settings", "statistics"],
    path: "/components/page/user-page",
    keywords: ["profile", "user", "settings", "stats", "account"],
    daisyUIClasses: ["btn", "card", "stat", "avatar", "badge"],
    hasInteractiveDemo: true,
    complexity: "medium",
    responsive: true,
    accessibility: "high",
    documentation: "complete",
  },
  {
    name: "ApplicationsPage",
    description: "User applications management page",
    category: "Page",
    tags: ["applications", "management", "user", "dashboard"],
    path: "/components/page/applications-page",
    keywords: ["applications", "apps", "manage", "create", "edit"],
    daisyUIClasses: ["btn", "card", "table", "badge", "input"],
    hasInteractiveDemo: true,
    complexity: "high",
    responsive: true,
    accessibility: "high",
    documentation: "complete",
  },
  {
    name: "HomePage",
    description: "Application home page with search and showcase",
    category: "Page",
    tags: ["home", "landing", "showcase", "search"],
    path: "/components/page/home-page",
    keywords: ["home", "landing", "search", "showcase", "applications"],
    daisyUIClasses: ["btn", "card", "hero", "input", "badge"],
    hasInteractiveDemo: true,
    complexity: "high",
    responsive: true,
    accessibility: "high",
    documentation: "complete",
  },
];

export const allComponents = [
  ...coreComponents,
  ...pageComponentsMetadata,
];

export const allComponentsMetadata = allComponents;

// Helper functions for searching
export const searchComponents = (query: string): ComponentMetadata[] => {
  if (!query.trim()) return [];

  const lowercaseQuery = query.toLowerCase();
  return allComponents.filter((component) =>
    component.name.toLowerCase().includes(lowercaseQuery) ||
    component.description.toLowerCase().includes(lowercaseQuery) ||
    component.category.toLowerCase().includes(lowercaseQuery) ||
    component.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getComponentsByCategory = (category: string): ComponentMetadata[] => {
  return allComponents.filter((component) =>
    component.category.toLowerCase() === category.toLowerCase()
  );
};

export const getComponentByPath = (path: string): ComponentMetadata | undefined => {
  return allComponents.find((component) => component.path === path);
};

export const getAllCategories = (): string[] => {
  const categories = new Set(allComponents.map((component) => component.category));
  return Array.from(categories).sort();
};
