import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Menu } from "./Menu.tsx";

const menuExamples: ComponentExample[] = [
  {
    title: "Basic Menu",
    description: "Simple vertical menu with navigation items",
    code: `<Menu
  items={[
    { label: "Dashboard", href: "/dashboard", active: true },
    { label: "Projects", href: "/projects" },
    { label: "Team", href: "/team" },
    { label: "Settings", href: "/settings" }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Menu with Icons",
    description: "Menu items with icon elements",
    code: `<ul class="menu bg-base-200 rounded-box w-56">
  <li>
    <a class="active">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
      </svg>
      Dashboard
    </a>
  </li>
  <li>
    <a>
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      Projects
    </a>
  </li>
  <li>
    <a>
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 19a1 1 0 100-2v-3a1 1 0 00-1-1H4a1 1 0 00-1 1v3a1 1 0 100 2h10a1 1 0 100-2H9z"></path>
      </svg>
      Team
    </a>
  </li>
</ul>`,
    showCode: true,
  },
  {
    title: "Collapsible Menu",
    description: "Menu with expandable sections",
    code: `<ul class="menu bg-base-200 rounded-box w-56">
  <li>
    <details open>
      <summary>
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
        </svg>
        Projects
      </summary>
      <ul>
        <li><a>Website Redesign</a></li>
        <li><a>Mobile App</a></li>
        <li><a>API Integration</a></li>
      </ul>
    </details>
  </li>
  <li>
    <details>
      <summary>
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 19a1 1 0 100-2v-3a1 1 0 00-1-1H4a1 1 0 00-1 1v3a1 1 0 100 2h10a1 1 0 100-2H9z"></path>
        </svg>
        Team
      </summary>
      <ul>
        <li><a>Developers</a></li>
        <li><a>Designers</a></li>
        <li><a>Managers</a></li>
      </ul>
    </details>
  </li>
</ul>`,
    showCode: true,
  },
  {
    title: "Bordered Menu",
    description: "Menu with border styling",
    code: `<Menu
  items={[
    { label: "Home", href: "/", active: true },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" }
  ]}
  class="border border-base-300"
/>`,
    showCode: true,
  },
  {
    title: "Responsive Horizontal Menu",
    description: "Menu that adapts to horizontal layout on larger screens",
    code: `<Menu
  items={[
    { label: "Dashboard", href: "/dashboard", active: true },
    { label: "Analytics", href: "/analytics" },
    { label: "Reports", href: "/reports" },
    { label: "Settings", href: "/settings" }
  ]}
  horizontal
  class="lg:menu-horizontal"
/>`,
    showCode: true,
  },
];

export const menuMetadata: ComponentMetadata = {
  name: "Menu",
  description: "Vertical navigation menu",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/menu",
  tags: ["menu", "navigation", "list", "sidebar", "vertical", "options"],
  examples: menuExamples,
  relatedComponents: ["navbar", "dropdown", "breadcrumbs"],
  preview: (
    <div class="w-56">
      <Menu
        items={[
          { id: "dashboard", label: "Dashboard", active: true },
          { id: "projects", label: "Projects" },
          { id: "team", label: "Team" },
          { id: "settings", label: "Settings" },
        ]}
        variant="bordered"
      />
    </div>
  ),
};
