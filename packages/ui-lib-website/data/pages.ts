import { SearchableComponent } from "../utils/search.ts";

export interface PageComponent extends SearchableComponent {
  type: "route" | "page" | "demo" | "shared";
  authRequired?: boolean;
  layoutUsed?: string;
  features?: string[];
}

export const allPages: PageComponent[] = [
  // Main Application Routes
  {
    name: "Home Page",
    description: "Landing page showcasing published applications and community content",
    category: "Main Routes",
    tags: ["home", "landing", "applications", "community"],
    path: "/",
    keywords: ["home", "landing", "main", "applications"],
    type: "route",
    authRequired: false,
    layoutUsed: "MainLayout",
    features: ["application-showcase", "search", "filters", "responsive"],
  },
  {
    name: "Components Page",
    description: "Interactive component library browser and showcase",
    category: "Main Routes",
    tags: ["components", "library", "showcase", "interactive"],
    path: "/components",
    keywords: ["components", "library", "showcase", "demo"],
    type: "route",
    authRequired: false,
    layoutUsed: "MainLayout",
    features: ["component-browser", "search", "categories", "live-demos"],
  },
  {
    name: "Theme Islands Demo",
    description: "Demonstration of theme system with interactive islands",
    category: "Demo Routes",
    tags: ["theme", "islands", "demo", "interactive"],
    path: "/demo/theme-islands",
    keywords: ["theme", "islands", "demo", "showcase"],
    type: "demo",
    authRequired: false,
    layoutUsed: "MainLayout",
    features: ["theme-switching", "island-demos", "live-preview"],
  },

  // Page Routes
  {
    name: "Admin Dashboard",
    description: "Administrative interface for system management",
    category: "Page Routes",
    tags: ["admin", "dashboard", "management", "system"],
    path: "/pages/admin",
    keywords: ["admin", "dashboard", "management", "system"],
    type: "page",
    authRequired: true,
    layoutUsed: "AdminLayout",
    features: ["user-management", "system-stats", "configuration", "monitoring"],
  },
  {
    name: "User Home Dashboard",
    description: "Personalized user dashboard with applications and activity",
    category: "Page Routes",
    tags: ["user", "dashboard", "personal", "activity"],
    path: "/pages/home",
    keywords: ["user", "dashboard", "personal", "home"],
    type: "page",
    authRequired: true,
    layoutUsed: "MainLayout",
    features: ["personal-apps", "activity-feed", "quick-actions", "stats"],
  },
  {
    name: "Login Page",
    description: "Authentication interface with login and signup options",
    category: "Page Routes",
    tags: ["login", "auth", "signup", "authentication"],
    path: "/pages/login",
    keywords: ["login", "auth", "signup", "signin"],
    type: "page",
    authRequired: false,
    layoutUsed: "AuthLayout",
    features: ["oauth", "email-auth", "signup", "password-reset"],
  },
  {
    name: "My Applications",
    description: "User's application management interface",
    category: "Page Routes",
    tags: ["applications", "management", "user", "personal"],
    path: "/pages/my-applications",
    keywords: ["applications", "my-apps", "management", "personal"],
    type: "page",
    authRequired: true,
    layoutUsed: "MainLayout",
    features: ["app-creation", "app-editing", "publishing", "analytics"],
  },
  {
    name: "User Profile",
    description: "User account management and profile settings",
    category: "Page Routes",
    tags: ["user", "profile", "settings", "account"],
    path: "/pages/user",
    keywords: ["user", "profile", "settings", "account"],
    type: "page",
    authRequired: true,
    layoutUsed: "MainLayout",
    features: ["profile-editing", "preferences", "security", "billing"],
  },

  // Component Demo Routes - Actions
  {
    name: "Button Demo",
    description: "Interactive demonstration of button component variants",
    category: "Component Demos",
    tags: ["button", "demo", "variants", "interactive"],
    path: "/components/action/button",
    keywords: ["button", "demo", "variants", "showcase"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "code-snippets", "variant-showcase", "interactive-props"],
  },
  {
    name: "Dropdown Demo",
    description: "Interactive demonstration of dropdown component",
    category: "Component Demos",
    tags: ["dropdown", "demo", "menu", "interactive"],
    path: "/components/action/dropdown",
    keywords: ["dropdown", "demo", "menu", "showcase"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "code-snippets", "menu-variations", "positioning"],
  },
  {
    name: "Modal Demo",
    description: "Interactive demonstration of modal dialogs",
    category: "Component Demos",
    tags: ["modal", "demo", "dialog", "interactive"],
    path: "/components/action/modal",
    keywords: ["modal", "demo", "dialog", "popup"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "code-snippets", "modal-types", "animations"],
  },
  {
    name: "Swap Demo",
    description: "Interactive demonstration of swap toggle component",
    category: "Component Demos",
    tags: ["swap", "demo", "toggle", "animation"],
    path: "/components/action/swap",
    keywords: ["swap", "demo", "toggle", "animation"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "code-snippets", "animation-types", "state-management"],
  },
  {
    name: "Theme Controller Demo",
    description: "Interactive demonstration of theme switching",
    category: "Component Demos",
    tags: ["theme", "demo", "controller", "switching"],
    path: "/components/action/theme-controller",
    keywords: ["theme", "demo", "controller", "switching"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "theme-preview", "persistence", "custom-themes"],
  },

  // Component Demo Routes - Display
  {
    name: "Accordion Demo",
    description: "Interactive demonstration of accordion component",
    category: "Component Demos",
    tags: ["accordion", "demo", "collapsible", "content"],
    path: "/components/display/accordion",
    keywords: ["accordion", "demo", "collapsible", "expand"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "code-snippets", "animation-options", "nested-content"],
  },
  {
    name: "Avatar Demo",
    description: "Interactive demonstration of avatar component",
    category: "Component Demos",
    tags: ["avatar", "demo", "profile", "image"],
    path: "/components/display/avatar",
    keywords: ["avatar", "demo", "profile", "user"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "size-variants", "placeholder-options", "status-indicators"],
  },
  {
    name: "Badge Demo",
    description: "Interactive demonstration of badge component",
    category: "Component Demos",
    tags: ["badge", "demo", "label", "indicator"],
    path: "/components/display/badge",
    keywords: ["badge", "demo", "label", "status"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "color-variants", "size-options", "positioning"],
  },
  {
    name: "Card Demo",
    description: "Interactive demonstration of card component",
    category: "Component Demos",
    tags: ["card", "demo", "container", "content"],
    path: "/components/display/card",
    keywords: ["card", "demo", "container", "layout"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "layout-variants", "content-types", "interactive-elements"],
  },
  {
    name: "Carousel Demo",
    description: "Interactive demonstration of carousel component",
    category: "Component Demos",
    tags: ["carousel", "demo", "slider", "gallery"],
    path: "/components/display/carousel",
    keywords: ["carousel", "demo", "slider", "gallery"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "navigation-types", "autoplay", "responsive-behavior"],
  },
  {
    name: "Chat Bubble Demo",
    description: "Interactive demonstration of chat bubble component",
    category: "Component Demos",
    tags: ["chat", "demo", "bubble", "messaging"],
    path: "/components/display/chat-bubble",
    keywords: ["chat", "demo", "bubble", "message"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["live-examples", "message-types", "positioning", "typing-indicators"],
  },

  // Shared Route Components
  {
    name: "Application Card",
    description: "Reusable application display card component",
    category: "Shared Components",
    tags: ["application", "card", "shared", "reusable"],
    path: "/components/application-card",
    keywords: ["application", "card", "shared", "display"],
    type: "shared",
    authRequired: false,
    features: ["app-info", "actions", "status", "responsive"],
  },
  {
    name: "Application Form",
    description: "Application creation and editing form",
    category: "Shared Components",
    tags: ["application", "form", "creation", "editing"],
    path: "/components/application-form",
    keywords: ["application", "form", "create", "edit"],
    type: "shared",
    authRequired: true,
    features: ["validation", "auto-save", "templates", "preview"],
  },
  {
    name: "Auth Provider",
    description: "Authentication state management wrapper",
    category: "Shared Components",
    tags: ["auth", "provider", "state", "management"],
    path: "/components/auth-provider",
    keywords: ["auth", "provider", "authentication", "state"],
    type: "shared",
    authRequired: false,
    features: ["state-management", "context", "persistence", "refresh"],
  },
  {
    name: "Protected Route",
    description: "Route protection and authentication wrapper",
    category: "Shared Components",
    tags: ["protected", "route", "auth", "wrapper"],
    path: "/components/protected-route",
    keywords: ["protected", "route", "auth", "security"],
    type: "shared",
    authRequired: true,
    features: ["auth-check", "redirects", "loading-states", "error-handling"],
  },
  {
    name: "SSO Callback",
    description: "Single sign-on callback handler",
    category: "Shared Components",
    tags: ["sso", "callback", "oauth", "auth"],
    path: "/components/sso-callback",
    keywords: ["sso", "callback", "oauth", "signin"],
    type: "shared",
    authRequired: false,
    features: ["oauth-handling", "token-exchange", "redirects", "error-handling"],
  },
  {
    name: "SSO Login",
    description: "Single sign-on login interface",
    category: "Shared Components",
    tags: ["sso", "login", "oauth", "auth"],
    path: "/components/sso-login",
    keywords: ["sso", "login", "oauth", "providers"],
    type: "shared",
    authRequired: false,
    features: ["provider-buttons", "oauth-flow", "branding", "error-states"],
  },
  {
    name: "User Avatar",
    description: "User profile avatar display component",
    category: "Shared Components",
    tags: ["user", "avatar", "profile", "display"],
    path: "/components/user-avatar",
    keywords: ["user", "avatar", "profile", "image"],
    type: "shared",
    authRequired: false,
    features: ["profile-image", "fallbacks", "status", "menu"],
  },

  // Additional Component Demos (condensed for brevity)
  {
    name: "Input Components Demo",
    description: "Comprehensive showcase of all input components",
    category: "Component Demos",
    tags: ["input", "forms", "demo", "comprehensive"],
    path: "/components/input",
    keywords: ["input", "forms", "demo", "showcase"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["form-controls", "validation", "accessibility", "responsive"],
  },
  {
    name: "Layout Components Demo",
    description: "Comprehensive showcase of layout components",
    category: "Component Demos",
    tags: ["layout", "structure", "demo", "responsive"],
    path: "/components/layout",
    keywords: ["layout", "structure", "demo", "responsive"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["layout-patterns", "responsive-design", "grid-systems", "positioning"],
  },
  {
    name: "Navigation Components Demo",
    description: "Comprehensive showcase of navigation components",
    category: "Component Demos",
    tags: ["navigation", "menu", "demo", "interactive"],
    path: "/components/navigation",
    keywords: ["navigation", "menu", "demo", "links"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["navigation-patterns", "responsive-menus", "breadcrumbs", "pagination"],
  },
  {
    name: "Feedback Components Demo",
    description: "Comprehensive showcase of feedback components",
    category: "Component Demos",
    tags: ["feedback", "notifications", "demo", "status"],
    path: "/components/feedback",
    keywords: ["feedback", "notifications", "demo", "status"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["notifications", "loading-states", "progress", "alerts"],
  },
  {
    name: "Mockup Components Demo",
    description: "Comprehensive showcase of mockup components",
    category: "Component Demos",
    tags: ["mockup", "frames", "demo", "devices"],
    path: "/components/mockup",
    keywords: ["mockup", "frames", "demo", "devices"],
    type: "demo",
    authRequired: false,
    layoutUsed: "ComponentPageTemplate",
    features: ["device-frames", "responsive-mockups", "content-display", "branding"],
  },
];

export const getPagesByCategory = (category: string) => {
  return allPages.filter((page) => page.category.toLowerCase() === category.toLowerCase());
};

export const getPagesByType = (type: "route" | "page" | "demo" | "shared") => {
  return allPages.filter((page) => page.type === type);
};

export const getPageByPath = (path: string) => {
  return allPages.find((page) => page.path === path);
};

export const getAllPageCategories = () => {
  const categories = new Set(allPages.map((page) => page.category));
  return Array.from(categories);
};

export const getPageCount = () => allPages.length;

export const getPageCategoryCount = (category: string) => {
  return allPages.filter((page) => page.category.toLowerCase() === category.toLowerCase()).length;
};

export const getProtectedPages = () => {
  return allPages.filter((page) => page.authRequired);
};

export const getPublicPages = () => {
  return allPages.filter((page) => !page.authRequired);
};

export const getPagesByFeature = (feature: string) => {
  return allPages.filter((page) => page.features?.includes(feature));
};

export const getPagesByLayout = (layout: string) => {
  return allPages.filter((page) => page.layoutUsed === layout);
};
