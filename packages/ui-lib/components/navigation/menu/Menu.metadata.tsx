import { ComponentMetadata, ComponentExample, ComponentCategory, ComponentSchema } from "../../types.ts";
import { Menu } from "./Menu.tsx";
import {
  MenuPropsSchema,
  safeValidateMenuProps,
  validateMenuProps,
} from "./Menu.schema.ts";

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
    props: {
      items: [
        { label: "Dashboard", href: "/dashboard", active: true },
        { label: "Projects", href: "/projects" },
        { label: "Team", href: "/team" },
        { label: "Settings", href: "/settings" }
      ]
    },
    showCode: true,
  },
  {
    title: "Menu with Icons",
    description: "Menu items with icon elements",
    code: `<Menu
  items={[
    { 
      label: "🏠 Dashboard", 
      href: "/dashboard", 
      active: true 
    },
    { 
      label: "📊 Projects", 
      href: "/projects" 
    },
    { 
      label: "👥 Team", 
      href: "/team" 
    },
    { 
      label: "⚙️ Settings", 
      href: "/settings" 
    }
  ]}
/>`,
    props: {
      items: [
        { 
          label: "🏠 Dashboard", 
          href: "/dashboard", 
          active: true 
        },
        { 
          label: "📊 Projects", 
          href: "/projects" 
        },
        { 
          label: "👥 Team", 
          href: "/team" 
        },
        { 
          label: "⚙️ Settings", 
          href: "/settings" 
        }
      ]
    },
    showCode: true,
  },
  {
    title: "Collapsible Menu",
    description: "Menu with expandable sections",
    code: `<Menu
  items={[
    {
      label: "📁 Projects",
      children: [
        { label: "Website Redesign", href: "/projects/website" },
        { label: "Mobile App", href: "/projects/mobile" },
        { label: "API Integration", href: "/projects/api" }
      ]
    },
    {
      label: "👥 Team",
      children: [
        { label: "Developers", href: "/team/developers" },
        { label: "Designers", href: "/team/designers" },
        { label: "Managers", href: "/team/managers" }
      ]
    }
  ]}
/>`,
    props: {
      items: [
        {
          label: "📁 Projects",
          children: [
            { label: "Website Redesign", href: "/projects/website" },
            { label: "Mobile App", href: "/projects/mobile" },
            { label: "API Integration", href: "/projects/api" }
          ]
        },
        {
          label: "👥 Team",
          children: [
            { label: "Developers", href: "/team/developers" },
            { label: "Designers", href: "/team/designers" },
            { label: "Managers", href: "/team/managers" }
          ]
        }
      ]
    },
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
    props: {
      items: [
        { label: "Home", href: "/", active: true },
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Contact", href: "/contact" }
      ],
      class: "border border-base-300"
    },
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
/>`,
    props: {
      items: [
        { label: "Dashboard", href: "/dashboard", active: true },
        { label: "Analytics", href: "/analytics" },
        { label: "Reports", href: "/reports" },
        { label: "Settings", href: "/settings" }
      ],
      horizontal: true
    },
    showCode: true,
  },
];

const menuSchema: ComponentSchema = {
  schema: MenuPropsSchema,
  validateFn: validateMenuProps,
  safeValidateFn: safeValidateMenuProps,
};

export const menuMetadata: ComponentMetadata = {
  name: "Menu",
  description: "Vertical navigation menu",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/menu",
  tags: ["menu", "navigation", "list", "sidebar", "vertical", "options"],
  examples: menuExamples,
  schema: menuSchema,
  relatedComponents: ["navbar", "dropdown", "breadcrumbs"],
  preview: (
    <div class="w-56">
      <Menu
        items={[
          { label: "Dashboard", href: "/dashboard", active: true },
          { label: "Projects", href: "/projects" },
          { label: "Team", href: "/team" },
          { label: "Settings", href: "/settings" },
        ]}
      />
    </div>
  ),
};
