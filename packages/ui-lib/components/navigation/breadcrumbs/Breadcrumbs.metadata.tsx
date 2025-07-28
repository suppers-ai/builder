import { ComponentMetadata, ComponentExample, ComponentCategory } from "../../types.ts";
import { Breadcrumbs } from "./Breadcrumbs.tsx";

const breadcrumbsExamples: ComponentExample[] = [
  {
    title: "Basic Breadcrumbs",
    description: "Simple navigation breadcrumb trail",
    props: {
      items: [
        {
          label: "Home",
      href: "/"
        },
        {
          label: "Products",
      href: "/products"
        },
        {
          label: "Category",
      href: "/products/category"
        },
        {
          label: "Item"
        }
      ]
    }
  },  {
    title: "Breadcrumbs with Icons",
    description: "Navigation breadcrumbs with icon elements",
    props: {
      items: [
        {
          label: "Home",
      href: "/"
        },
        {
          label: "Products",
      href: "/products"
        },
        {
          label: "Category",
      href: "/products/category"
        },
        {
          label: "Item"
        }
      ]
    }
  },  {
    title: "Max Width Breadcrumbs",
    description: "Breadcrumbs with truncated long paths",
    props: {
      items: [
        {
          label: "Home",
      href: "/"
        },
        {
          label: "Products",
      href: "/products"
        },
        {
          label: "Category",
      href: "/products/category"
        },
        {
          label: "Item"
        }
      ]
    }
  },  {
    title: "Responsive Breadcrumbs",
    description: "Breadcrumbs that adapt to screen size",
    props: {
      items: [
        {
          label: "Home",
      href: "/"
        },
        {
          label: "Products",
      href: "/products"
        },
        {
          label: "Category",
      href: "/products/category"
        },
        {
          label: "Item"
        }
      ]
    }
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
  )};
