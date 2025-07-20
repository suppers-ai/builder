// Component metadata registry
// Import all component metadata files from ui-lib package

// Import all metadata from local components
// Actions
import { buttonMetadata } from "../components/action/button/Button.metadata.ts";
import { dropdownMetadata } from "../components/action/dropdown/Dropdown.metadata.ts";
import { modalMetadata } from "../components/action/modal/Modal.metadata.ts";
import { swapMetadata } from "../components/action/swap/Swap.metadata.ts";
import { themeControllerMetadata } from "../components/action/theme-controller/ThemeController.metadata.ts";

// Data Display
import { accordionMetadata } from "../components/display/accordion/Accordion.metadata.ts";
import { avatarMetadata } from "../components/display/avatar/Avatar.metadata.ts";
import { badgeMetadata } from "../components/display/badge/Badge.metadata.ts";
import { cardMetadata } from "../components/display/card/Card.metadata.ts";
import { carouselMetadata } from "../components/display/carousel/Carousel.metadata.ts";
import { chatBubbleMetadata } from "../components/display/chat-bubble/ChatBubble.metadata.ts";
import { collapseMetadata } from "../components/display/collapse/Collapse.metadata.ts";
import { countdownMetadata } from "../components/display/countdown/Countdown.metadata.ts";
import { diffMetadata } from "../components/display/diff/Diff.metadata.ts";
import { kbdMetadata } from "../components/display/kbd/Kbd.metadata.ts";
import { statMetadata } from "../components/display/stat/Stat.metadata.ts";
import { tableMetadata } from "../components/display/table/Table.metadata.ts";
import { timelineMetadata } from "../components/display/timeline/Timeline.metadata.ts";

// Navigation
import { breadcrumbsMetadata } from "../components/navigation/breadcrumbs/Breadcrumbs.metadata.ts";
import { linkMetadata } from "../components/navigation/link/Link.metadata.ts";
import { menuMetadata } from "../components/navigation/menu/Menu.metadata.ts";
import { navbarMetadata } from "../components/navigation/navbar/Navbar.metadata.ts";
import { paginationMetadata } from "../components/navigation/pagination/Pagination.metadata.ts";
import { stepsMetadata } from "../components/navigation/steps/Steps.metadata.ts";
import { tabsMetadata } from "../components/navigation/tabs/Tabs.metadata.ts";

// Data Input
import { checkboxMetadata } from "../components/input/checkbox/Checkbox.metadata.ts";
import { fileInputMetadata } from "../components/input/file-input/FileInput.metadata.ts";
import { radioMetadata } from "../components/input/radio/Radio.metadata.ts";
import { rangeMetadata } from "../components/input/range/Range.metadata.ts";
import { ratingMetadata } from "../components/input/rating/Rating.metadata.ts";
import { selectMetadata } from "../components/input/select/Select.metadata.ts";
import { textInputMetadata } from "../components/input/text-input/TextInput.metadata.ts";
import { textareaMetadata } from "../components/input/textarea/Textarea.metadata.ts";
import { toggleMetadata } from "../components/input/toggle/Toggle.metadata.ts";

// Layout
import { artboardMetadata } from "../components/layout/artboard/Artboard.metadata.ts";
import { dividerMetadata } from "../components/layout/divider/Divider.metadata.ts";
import { drawerMetadata } from "../components/layout/drawer/Drawer.metadata.ts";
import { footerMetadata } from "../components/layout/footer/Footer.metadata.ts";
import { heroMetadata } from "../components/layout/hero/Hero.metadata.ts";
import { indicatorMetadata } from "../components/layout/indicator/Indicator.metadata.ts";
import { joinMetadata } from "../components/layout/join/Join.metadata.ts";
import { maskMetadata } from "../components/layout/mask/Mask.metadata.ts";
import { stackMetadata } from "../components/layout/stack/Stack.metadata.ts";

// Feedback
import { alertMetadata } from "../components/feedback/alert/Alert.metadata.ts";
import { loadingMetadata } from "../components/feedback/loading/Loading.metadata.ts";
import { progressMetadata } from "../components/feedback/progress/Progress.metadata.ts";
import { radialProgressMetadata } from "../components/feedback/radial-progress/RadialProgress.metadata.ts";
import { skeletonMetadata } from "../components/feedback/skeleton/Skeleton.metadata.ts";
import { toastMetadata } from "../components/feedback/toast/Toast.metadata.ts";
import { tooltipMetadata } from "../components/feedback/tooltip/Tooltip.metadata.ts";

// Mockup
import { browserMetadata } from "../components/mockup/browser/Browser.metadata.ts";
import { codeMetadata } from "../components/mockup/code/Code.metadata.ts";
import { phoneMetadata } from "../components/mockup/phone/Phone.metadata.ts";
import { windowMetadata } from "../components/mockup/window/Window.metadata.ts";

// Component metadata interface
export interface ComponentMetadata {
  name: string;
  description: string;
  category: string;
  path: string;
  tags: string[];
  examples: string[];
  relatedComponents: string[];
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
