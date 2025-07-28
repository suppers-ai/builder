import { ComponentMetadata, ComponentExample, ComponentCategory, ComponentSchema } from "../../types.ts";
import { Menu } from "./Menu.tsx";
import {
  MenuPropsSchema,
  safeValidateMenuProps,
  validateMenuProps} from "./Menu.schema.ts";

const menuExamples: ComponentExample[] = [
  {
    title: "Basic Menu",
    description: "Simple vertical menu with navigation items",
    props: {
      items: [
        { label: "Dashboard", href: "/dashboard", active: true },
        { label: "Projects", href: "/projects" },
        { label: "Team", href: "/team" },
        { label: "Settings", href: "/settings"
        }
      ]
    }
  },
  {
    title: "Menu with Icons",
    description: "Menu items with icon elements",
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
    }
  },
  {
    title: "Collapsible Menu",
    description: "Menu with expandable sections",
    props: {
      items: [
        {
          label: "📁 Projects",
          children: [
            { label: "Website Redesign", href: "/projects/website" },
            { label: "Mobile App", href: "/projects/mobile" },
            { label: "API Integration", href: "/projects/api"
        }
      ]
        },
        {
          label: "👥 Team",
          children: [
            { label: "Developers", href: "/team/developers" },
            { label: "Designers", href: "/team/designers" },
            { label: "Managers", href: "/team/managers"
        }
      ]
        }
      ]
    }
  },
  {
    title: "Bordered Menu",
    description: "Menu with border styling",
    props: {
      items: [
        { label: "Home", href: "/", active: true },
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Contact", href: "/contact"
        }
      ],
      class: "border border-base-300"
    }
  },
  {
    title: "Responsive Horizontal Menu",
    description: "Menu that adapts to horizontal layout on larger screens",
    props: {
      items: [
        { label: "Dashboard", href: "/dashboard", active: true },
        { label: "Analytics", href: "/analytics" },
        { label: "Reports", href: "/reports" },
        { label: "Settings", href: "/settings"
        }
      ],
      horizontal: true
    }
        }
      ];;

const menuSchema: ComponentSchema = {
  schema: MenuPropsSchema,
  validateFn: validateMenuProps,
  safeValidateFn: safeValidateMenuProps};

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
  )};
