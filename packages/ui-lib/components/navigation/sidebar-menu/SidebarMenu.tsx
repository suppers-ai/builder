import {
  BarChart3,
  BookOpen,
  Building2,
  Edit3,
  FileText,
  Home,
  Layers,
  Layout,
  MessageCircle,
  Navigation,
  Palmtree,
  Puzzle,
  Search,
  Smartphone,
  X,
  Zap,
} from "lucide-preact";
import {
  allComponentsMetadata,
  type ComponentMetadata,
  getAllCategories,
  getComponentsByCategory,
  searchComponents,
} from "../../../utils/component-metadata.ts";
import {
  allComponents,
  allIslands,
  allPages,
  getAllIslandCategories,
  getAllPageCategories,
  getIslandsByCategory,
  getPagesByCategory,
} from "../../../data/components.ts";
import { Accordion } from "../../display/accordion/Accordion.tsx";
import { Badge } from "../../display/badge/Badge.tsx";

export interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
  onSearchChange?: (e: Event) => void;
  onLinkClick?: () => void;
}

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  "Actions": <Zap size={18} />,
  "Data Display": <BarChart3 size={18} />,
  "Navigation": <Navigation size={18} />,
  "Data Input": <Edit3 size={18} />,
  "Layout": <Building2 size={18} />,
  "Feedback": <MessageCircle size={18} />,
  "Mockup": <Smartphone size={18} />,
};

interface MenuSection {
  title: string;
  icon: any;
  count: number;
  items: ComponentMetadata[];
}

// Generate menu sections from metadata
const getMenuSections = (): MenuSection[] => {
  return getAllCategories().map((category) => {
    const components = getComponentsByCategory(category);
    return {
      title: category,
      icon: categoryIcons[category] || <Puzzle size={18} />,
      count: components.length,
      items: components,
    };
  });
};

const quickLinks = [
  { name: "Home", path: "/", icon: <Home size={16} /> },
  { name: "Components", path: "/components", icon: <Puzzle size={16} /> },
  { name: "Islands", path: "/islands", icon: <Palmtree size={16} /> },
  { name: "Pages", path: "/pages", icon: <Layout size={16} /> },
  { name: "Getting Started", path: "/docs/getting-started", icon: <BookOpen size={16} /> },
];

export function SidebarMenu({
  isOpen,
  onClose,
  searchQuery = "",
  onSearchChange,
  onLinkClick,
}: SidebarMenuProps) {
  const menuSections = getMenuSections();

  // Filter sections based on search query using metadata system
  const getFilteredSections = () => {
    if (!searchQuery.trim()) {
      return menuSections;
    }

    const searchResults = searchComponents(searchQuery);

    // Group search results by category
    const resultsByCategory: Record<string, ComponentMetadata[]> = {};
    searchResults.forEach((component) => {
      if (!resultsByCategory[component.category]) {
        resultsByCategory[component.category] = [];
      }
      resultsByCategory[component.category].push(component);
    });

    // Convert back to menu sections format
    return Object.entries(resultsByCategory).map(([category, components]) => ({
      title: category,
      icon: categoryIcons[category] || <Puzzle size={18} />,
      count: components.length,
      items: components,
    }));
  };

  const displaySections = getFilteredSections();

  // Handle link click with optional callback
  const handleLinkClick = (e: Event) => {
    onLinkClick?.();
  };

  return (
    <div class="h-full flex flex-col">
      {/* Search */}
      <div class="p-4 border-b border-t border-base-300">
        <div class="flex">
          <input
            type="text"
            placeholder="Search components..."
            class="input input-bordered input-sm flex-1 text-sm rounded-r-none"
            value={searchQuery}
            onInput={onSearchChange}
            aria-label="Search components"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div class="p-4 border-b border-base-300">
        <h3 class="text-sm font-medium text-base-content/70 mb-3">Quick Links</h3>
        <ul class="space-y-1" role="list">
          {quickLinks.map((link) => (
            <li key={link.path}>
              <a
                href={link.path}
                class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={handleLinkClick}
              >
                {link.icon}
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content - All Sections with Scroll */}
      <div class="flex-1 overflow-y-scroll sidebar-scroll-container">
        <div class="p-4 pr-2">
          <Accordion
            multiple={true}
            defaultOpen={[]}
            items={[
              // Islands Section
              {
                id: "islands",
                title: (
                  <div class="flex items-center justify-between w-full pr-0">
                    <div class="flex items-center gap-3">
                      <Palmtree size={18} />
                      <span class="font-medium text-sm">Islands</span>
                    </div>
                    <Badge color="neutral" size="sm">{allIslands.length}</Badge>
                  </div>
                ),
                content: (
                  <div class="mt-3 p-2 border border-base-300 rounded-lg bg-base-50">
                    <Accordion
                      multiple={true}
                      defaultOpen={[]}
                      items={getAllIslandCategories().map((category) => {
                        const islands = getIslandsByCategory(category);
                        const categoryIcon = categoryIcons[category] || <Palmtree size={16} />;
                        return {
                          id: `island-${category}`,
                          title: (
                            <div class="flex items-center justify-between w-full pr-0">
                              <div class="flex items-center gap-3">
                                {categoryIcon}
                                <span class="font-medium text-sm">{category}</span>
                              </div>
                              <Badge color="neutral" size="sm">{islands.length}</Badge>
                            </div>
                          ),
                          content: (
                            <ul class="space-y-1 mt-2" role="list">
                              {islands.map((island) => (
                                <li key={island.path}>
                                  <a
                                    href={island.path}
                                    class="block px-3 py-2 rounded-md hover:bg-base-200 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                    onClick={handleLinkClick}
                                  >
                                    <div class="font-medium text-base-content">{island.name}</div>
                                    <div class="text-xs text-base-content/60 mt-0.5">
                                      {island.description}
                                    </div>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ),
                        };
                      })}
                      class="space-y-2"
                    />
                  </div>
                ),
              },
              // Pages Section
              {
                id: "pages",
                title: (
                  <div class="flex items-center justify-between w-full pr-0">
                    <div class="flex items-center gap-3">
                      <Layout size={18} />
                      <span class="font-medium text-sm">Pages</span>
                    </div>
                    <Badge color="neutral" size="sm">{allPages.length}</Badge>
                  </div>
                ),
                content: (
                  <div class="mt-3 p-2 border border-base-300 rounded-lg bg-base-50">
                    <Accordion
                      multiple={true}
                      defaultOpen={[]}
                      items={getAllPageCategories().map((category) => {
                        const pages = getPagesByCategory(category);
                        return {
                          id: `page-${category}`,
                          title: (
                            <div class="flex items-center justify-between w-full pr-0">
                              <div class="flex items-center gap-3">
                                <FileText size={16} />
                                <span class="font-medium text-sm">{category}</span>
                              </div>
                              <Badge color="neutral" size="sm">{pages.length}</Badge>
                            </div>
                          ),
                          content: (
                            <ul class="space-y-1 mt-2" role="list">
                              {pages.map((page) => (
                                <li key={page.path}>
                                  <a
                                    href={page.path}
                                    class="block px-3 py-2 rounded-md hover:bg-base-200 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                    onClick={handleLinkClick}
                                  >
                                    <div class="font-medium text-base-content">{page.name}</div>
                                    <div class="text-xs text-base-content/60 mt-0.5">
                                      {page.description}
                                    </div>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ),
                        };
                      })}
                      class="space-y-2"
                    />
                  </div>
                ),
              },
              // Components Section
              {
                id: "components",
                title: (
                  <div class="flex items-center justify-between w-full pr-0">
                    <div class="flex items-center gap-3">
                      <Puzzle size={18} />
                      <span class="font-medium text-sm">Components</span>
                      {searchQuery && (
                        <span class="text-xs opacity-60 ml-2">
                          ({displaySections.reduce((acc, section) => acc + section.items.length, 0)}
                          {" "}
                          results)
                        </span>
                      )}
                    </div>
                    <Badge color="neutral" size="sm">
                      {displaySections.reduce((acc, section) => acc + section.items.length, 0)}
                    </Badge>
                  </div>
                ),
                content: (
                  <div class="mt-3 p-2 border border-base-300 rounded-lg bg-base-50">
                    {displaySections.length === 0 && searchQuery
                      ? (
                        <div class="text-center py-8 text-base-content/60">
                          <Search size={32} class="mx-auto mb-2 opacity-50" />
                          <p class="text-sm">No components found for "{searchQuery}"</p>
                        </div>
                      )
                      : (
                        <Accordion
                          multiple={true}
                          defaultOpen={searchQuery ? displaySections.map((s) => s.title) : []}
                          items={displaySections.map((section) => ({
                            id: `component-${section.title}`,
                            title: (
                              <div class="flex items-center justify-between w-full pr-0">
                                <div class="flex items-center gap-3">
                                  {section.icon}
                                  <span class="font-medium text-sm">{section.title}</span>
                                </div>
                                <Badge color="neutral" size="sm">{section.items.length}</Badge>
                              </div>
                            ),
                            content: (
                              <ul class="space-y-1 mt-2" role="list">
                                {section.items.map((item) => (
                                  <li key={item.path}>
                                    <a
                                      href={item.path}
                                      class="block px-3 py-2 rounded-md hover:bg-base-200 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                      onClick={handleLinkClick}
                                    >
                                      <div class="font-medium text-base-content">{item.name}</div>
                                      <div class="text-xs text-base-content/60 mt-0.5">
                                        {item.description}
                                      </div>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ),
                          }))}
                          class="space-y-2"
                        />
                      )}
                  </div>
                ),
              },
            ]}
            class="space-y-4"
          />
        </div>
      </div>
    </div>
  );
}
