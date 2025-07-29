import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Breadcrumbs } from "./Breadcrumbs.tsx";

const breadcrumbsExamples: ComponentExample[] = [
  {
    title: "Basic Breadcrumbs",
    description: "Simple navigation breadcrumb trail",
    code: `<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" },
    { label: "Laptops", active: true }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Breadcrumbs with Icons",
    description: "Navigation breadcrumbs with icon elements",
    code: `<Breadcrumbs
  items={[
    { 
      label: "Dashboard", 
      href: "/dashboard",
      icon: "home"
    },
    { 
      label: "Projects", 
      href: "/projects",
      icon: "folder"
    },
    { 
      label: "Website Redesign",
      active: true,
      icon: "document"
    }
  ]}
/>`,
    showCode: true,
  },
  {
    title: "Max Width Breadcrumbs",
    description: "Breadcrumbs with truncated long paths",
    code: `<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Very Long Category Name", href: "/category" },
    { label: "Another Long Subcategory", href: "/subcategory" },
    { label: "Product with Very Long Name", active: true }
  ]}
  maxItems={3}
  class="max-w-lg"
/>`,
    showCode: true,
  },
  {
    title: "Responsive Breadcrumbs",
    description: "Breadcrumbs that adapt to screen size",
    code: `<Breadcrumbs
  items={[
    { label: "Home", href: "/", hideOnMobile: true },
    { label: "Documentation", href: "/docs", hideOnSmall: true },
    { label: "Components", href: "/docs/components", hideOnSmall: true },
    { label: "Navigation", href: "/docs/components/navigation" },
    { label: "Breadcrumbs", active: true }
  ]}
  responsive
/>`,
    showCode: true,
  },
];

export const breadcrumbsMetadata: ComponentMetadata = {
  name: "Breadcrumbs",
  description: "Navigation path indicator",
  category: ComponentCategory.NAVIGATION,
  path: "/components/navigation/breadcrumbs",
  tags: ["breadcrumbs", "navigation", "path", "hierarchy", "trail", "location"],
  examples: breadcrumbsExamples,
  relatedComponents: ["navbar", "menu", "steps"],
  preview: (
    <Breadcrumbs
      items={[
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Laptops", href: "/products/laptops" },
        { label: "MacBook Pro", active: true },
      ]}
    />
  ),
};
