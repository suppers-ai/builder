// Component metadata registry
// Import all component metadata files from ui-lib package

// Import all metadata from local components
// Actions
import { buttonMetadata } from "../components/action/button/Button.metadata.tsx";
import { dropdownMetadata } from "../components/action/dropdown/Dropdown.metadata.tsx";
import { modalMetadata } from "../components/action/modal/Modal.metadata.tsx";
import { swapMetadata } from "../components/action/swap/Swap.metadata.tsx";
import { themeControllerMetadata } from "../components/action/theme-controller/ThemeController.metadata.tsx";

// Data Display
import { accordionMetadata } from "../components/display/accordion/Accordion.metadata.tsx";
import { avatarMetadata } from "../components/display/avatar/Avatar.metadata.tsx";
import { badgeMetadata } from "../components/display/badge/Badge.metadata.tsx";
import { cardMetadata } from "../components/display/card/Card.metadata.tsx";
import { carouselMetadata } from "../components/display/carousel/Carousel.metadata.tsx";
import { chatBubbleMetadata } from "../components/display/chat-bubble/ChatBubble.metadata.tsx";
import { collapseMetadata } from "../components/display/collapse/Collapse.metadata.tsx";
import { countdownMetadata } from "../components/display/countdown/Countdown.metadata.tsx";
import { diffMetadata } from "../components/display/diff/Diff.metadata.tsx";
import { kbdMetadata } from "../components/display/kbd/Kbd.metadata.tsx";
import { statMetadata } from "../components/display/stat/Stat.metadata.tsx";
import { tableMetadata } from "../components/display/table/Table.metadata.tsx";
import { timelineMetadata } from "../components/display/timeline/Timeline.metadata.tsx";

// Navigation
import { breadcrumbsMetadata } from "../components/navigation/breadcrumbs/Breadcrumbs.metadata.tsx";
import { linkMetadata } from "../components/navigation/link/Link.metadata.tsx";
import { menuMetadata } from "../components/navigation/menu/Menu.metadata.tsx";
import { navbarMetadata } from "../components/navigation/navbar/Navbar.metadata.tsx";
import { paginationMetadata } from "../components/navigation/pagination/Pagination.metadata.tsx";
import { stepsMetadata } from "../components/navigation/steps/Steps.metadata.tsx";
import { tabsMetadata } from "../components/navigation/tabs/Tabs.metadata.tsx";

// Data Input
import { checkboxMetadata } from "../components/input/checkbox/Checkbox.metadata.tsx";
import { fileInputMetadata } from "../components/input/file-input/FileInput.metadata.tsx";
import { radioMetadata } from "../components/input/radio/Radio.metadata.tsx";
import { rangeMetadata } from "../components/input/range/Range.metadata.tsx";
import { ratingMetadata } from "../components/input/rating/Rating.metadata.tsx";
import { selectMetadata } from "../components/input/select/Select.metadata.tsx";
import { textInputMetadata } from "../components/input/text-input/TextInput.metadata.ts";
import { textareaMetadata } from "../components/input/textarea/Textarea.metadata.tsx";
import { toggleMetadata } from "../components/input/toggle/Toggle.metadata.tsx";

// Layout
import { artboardMetadata } from "../components/layout/artboard/Artboard.metadata.tsx";
import { dividerMetadata } from "../components/layout/divider/Divider.metadata.tsx";
import { drawerMetadata } from "../components/layout/drawer/Drawer.metadata.tsx";
import { footerMetadata } from "../components/layout/footer/Footer.metadata.tsx";
import { heroMetadata } from "../components/layout/hero/Hero.metadata.tsx";
import { indicatorMetadata } from "../components/layout/indicator/Indicator.metadata.tsx";
import { joinMetadata } from "../components/layout/join/Join.metadata.tsx";
import { maskMetadata } from "../components/layout/mask/Mask.metadata.tsx";
import { stackMetadata } from "../components/layout/stack/Stack.metadata.tsx";

// Feedback
import { alertMetadata } from "../components/feedback/alert/Alert.metadata.tsx";
import { loadingMetadata } from "../components/feedback/loading/Loading.metadata.tsx";
import { progressMetadata } from "../components/feedback/progress/Progress.metadata.tsx";
import { radialProgressMetadata } from "../components/feedback/radial-progress/RadialProgress.metadata.tsx";
import { skeletonMetadata } from "../components/feedback/skeleton/Skeleton.metadata.tsx";
import { toastMetadata } from "../components/feedback/toast/Toast.metadata.tsx";
import { tooltipMetadata } from "../components/feedback/tooltip/Tooltip.metadata.tsx";

// Mockup
import { browserMetadata } from "../components/mockup/browser/Browser.metadata.tsx";
import { codeMetadata } from "../components/mockup/code/Code.metadata.tsx";
import { phoneMetadata } from "../components/mockup/phone/Phone.metadata.tsx";
import { windowMetadata } from "../components/mockup/window/Window.metadata.tsx";

// Component metadata interface
import type { ComponentChildren } from "preact";

export interface ComponentMetadata {
  name: string;
  description: string;
  category: string;
  path: string;
  tags: string[];
  examples: string[];
  relatedComponents: string[];
  preview: ComponentChildren;
}

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
