import { useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import {
  Accordion,
  closeGlobalSidebar,
  globalSidebarOpen,
  Logo,
} from "../mod.ts";
import type { AccordionItemProps } from "../mod.ts";
import type { SidebarConfig } from "./CustomSidebar.schema.ts";

export interface CustomSidebarProps {
  config: SidebarConfig;
  currentPath?: string;
  authComponent?: ComponentChildren;
  onLinkClick?: (path: string) => void;
  logoProps?: {
    href?: string;
    alt?: string;
    variant?: "short" | "long";
    size?: "sm" | "md" | "lg";
  };
}

export default function CustomSidebar({
  config,
  currentPath = "",
  authComponent,
  onLinkClick,
  logoProps = {
    href: "/",
    alt: "Logo",
    variant: "long",
    size: "lg",
  },
}: CustomSidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(() =>
    config.sections.filter(s => s.defaultOpen !== false).map((s) => s.id)
  );

  const sidebarOpen = globalSidebarOpen.value;

  useEffect(() => {
    // Subscribe to sidebar state changes and update body class
    const sidebarUnsubscribe = globalSidebarOpen.subscribe((isOpen) => {
      if (typeof document !== "undefined") {
        if (isOpen) {
          document.body.classList.remove("sidebar-closed");
        } else {
          document.body.classList.add("sidebar-closed");
        }
      }
    });

    // Set initial body class based on current sidebar state
    if (typeof document !== "undefined") {
      if (globalSidebarOpen.value) {
        document.body.classList.remove("sidebar-closed");
      } else {
        document.body.classList.add("sidebar-closed");
      }
    }

    return () => {
      sidebarUnsubscribe();
    };
  }, []);

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeGlobalSidebar();
    }
  };

  const handleAccordionToggle = (sectionId: string, isOpen: boolean) => {
    const newOpenSections = [...openSections];
    if (isOpen && !newOpenSections.includes(sectionId)) {
      newOpenSections.push(sectionId);
    } else if (!isOpen && newOpenSections.includes(sectionId)) {
      const index = newOpenSections.indexOf(sectionId);
      newOpenSections.splice(index, 1);
    }
    setOpenSections(newOpenSections);
  };

  const handleLinkClick = (path: string) => {
    if (onLinkClick) {
      onLinkClick(path);
    }
    // Close sidebar on mobile after link click
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      closeGlobalSidebar();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <aside
        class={`fixed top-0 left-0 h-full w-80 bg-base-100 border-r border-base-300 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } z-50 lg:z-30 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div class="p-4 pr-16 border-b border-base-300 bg-base-100">
          <Logo {...logoProps} />
        </div>

        {/* Scrollable Navigation Content */}
        <div class="flex-1 overflow-y-auto">
          <div class="p-4">
            {/* Quick Links */}
            {config.quickLinks && config.quickLinks.length > 0 && (
              <div class="mb-6">
                <div class="space-y-1">
                  {config.quickLinks.map((link) => (
                    <a
                      key={link.path}
                      href={link.path}
                      class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPath === link.path
                        ? "bg-primary text-primary-content"
                        : "text-base-content hover:bg-base-200"
                        }`}
                      onClick={() => handleLinkClick(link.path)}
                    >
                      {link.icon}
                      {link.name}
                      {link.badge && (
                        <span class="badge badge-primary badge-xs ml-auto">{link.badge}</span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Component Categories - Accordion */}
            <Accordion
              items={config.sections.map((section): AccordionItemProps => ({
                id: section.id,
                title: (
                  <div class="flex items-center gap-2">
                    {section.icon}
                    <span class="text-sm font-medium text-base-content">{section.title}</span>
                    {section.badge && (
                      <span class="badge badge-primary badge-xs">{section.badge}</span>
                    )}
                  </div>
                ),
                content: (
                  <div class="space-y-1">
                    {section.links.map((link) => (
                      <a
                        key={link.path || link.name}
                        href={link.path}
                        class={`block px-3 py-2 rounded text-sm transition-colors ${currentPath === link.path
                          ? "bg-primary text-primary-content font-medium"
                          : "text-base-content/80 hover:text-base-content hover:bg-base-200"
                          }`}
                        onClick={() => handleLinkClick(link.path)}
                      >
                        <div class="flex items-center justify-between">
                          <span>{link.name}</span>
                          {link.badge && (
                            <span class="badge badge-neutral badge-xs">{link.badge}</span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                ),
              }))}
              multiple={true}
              openItems={openSections}
              onToggle={handleAccordionToggle}
              class="space-y-1"
            />
          </div>
        </div>

        {/* Sticky Bottom Section */}
        {authComponent && (
          <div class="border-t border-base-300 bg-base-100">
            {/* Authentication Section */}
            <div class="p-4">
              {authComponent}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}