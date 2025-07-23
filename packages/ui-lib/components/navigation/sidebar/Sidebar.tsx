import {
  type SidebarConfig,
  type SidebarLink,
  type SidebarSection,
} from "../../../utils/sidebar-config.tsx";
import { Badge } from "../../display/badge/Badge.tsx";
import { ChevronRight } from "lucide-preact";
import { useState } from "preact/hooks";

export interface SidebarProps {
  config: SidebarConfig;
  currentPath?: string;
  onLinkClick?: (link: SidebarLink) => void;
  class?: string;
}

export function Sidebar({
  config,
  currentPath = "",
  onLinkClick,
  class: className = "",
}: SidebarProps) {
  const isLinkActive = (link: SidebarLink) => {
    console.log(link.path);
    if (link.path === "/" && currentPath === "/") return true;
    if (link.path !== "/" && currentPath.startsWith(link.path)) return true;
    return false;
  };

  const handleLinkClick = (link: SidebarLink) => {
    onLinkClick?.(link);
  };

  return (
    <div class={`sidebar-container ${className}`}>
      {/* Header */}
      {(config.title || config.logo) && (
        <div class="p-4 border-b border-base-300">
          <div class="flex items-center gap-3">
            {config.logo}
            {config.title && (
              <h2 class="text-lg font-semibold text-base-content">{config.title}</h2>
            )}
          </div>
        </div>
      )}

      {/* Quick Links */}
      {config.showQuickLinks && config.quickLinks && config.quickLinks.length > 0 && (
        <div class="p-4">
          <h3 class="text-sm font-medium text-base-content/70 mb-3">Quick Links</h3>
          <ul class="space-y-1">
            {config.quickLinks.map((link) => (
              <li key={link.path}>
                <a
                  href={link.path}
                  class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-base-200 focus:outline-none 
                    ${
                    isLinkActive(link)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-base-content"
                  }
                  `}
                  onClick={() => handleLinkClick(link)}
                >
                  {link.icon}
                  <span class="flex-1">{link.name}</span>
                  {link.badge && <Badge color="neutral" size="xs">{link.badge}</Badge>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Search */}
      {config.showSearch && (
        <div class="p-4 border-b border-base-300">
          <input
            type="text"
            placeholder="Search..."
            class="input input-bordered input-sm w-full"
            aria-label="Search"
          />
        </div>
      )}

      {/* Sections */}
      <div class="flex-1 overflow-y-auto">
        {config.sections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            currentPath={currentPath}
            onLinkClick={handleLinkClick}
          />
        ))}
      </div>
    </div>
  );
}

interface SidebarSectionProps {
  section: SidebarSection;
  currentPath: string;
  onLinkClick: (link: SidebarLink) => void;
}

function SidebarSection({ section, currentPath, onLinkClick }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false);

  const isLinkActive = (link: SidebarLink) => {
    if (link.path === "/" && currentPath === "/") return true;
    if (link.path !== "/" && currentPath.startsWith(link.path)) return true;
    return false;
  };

  const hasActiveLink = section.links.some((link) => isLinkActive(link));

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div class="py-1">
      {/* Section Header - Clickable */}
      <button
        onClick={toggleSection}
        class={`w-full px-4 py-2 flex items-center justify-between transition-colors hover:bg-base-200/50 focus:outline-none ${
          hasActiveLink ? "bg-primary/5" : ""
        }`}
      >
        <div class="flex items-center gap-3">
          {section.icon}
          <h3
            class={`font-medium text-sm ${hasActiveLink ? "text-primary" : "text-base-content/90"}`}
          >
            {section.title}
          </h3>
        </div>
        <div class="flex items-center gap-2">
          {section.badge && <Badge color="neutral" size="xs">{section.badge}</Badge>}
          <ChevronRight
            size={14}
            class={`transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            } text-base-content/40`}
          />
        </div>
      </button>

      {/* Section Links - Collapsible transparent accordion */}
      <div class={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96" : "max-h-0"}`}>
        <div class="px-4 pb-2 bg-transparent">
          <ul class="space-y-0.5">
            {section.links.map((link) => {
              const isActive = isLinkActive(link);
              return (
                <li key={link.path}>
                  <a
                    href={link.path}
                    class={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-base-200 focus:outline-none ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-base-content/80 hover:text-base-content"
                    }`}
                    onClick={() => onLinkClick(link)}
                  >
                    <span class="flex-1">{link.name}</span>
                    {link.badge && <Badge color="neutral" size="xs">{link.badge}</Badge>}
                    {link.external && (
                      <svg
                        class="w-3 h-3 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        >
                        </path>
                      </svg>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
