import { ComponentMetadata } from "../../types.ts";
import { Breadcrumbs } from "./Breadcrumbs.tsx";

export const breadcrumbsMetadata: ComponentMetadata = {
  name: "Breadcrumbs",
  description: "Navigation path indicator",
  category: "Navigation",
  path: "/components/navigation/breadcrumbs",
  tags: ["breadcrumbs", "navigation", "path", "hierarchy", "trail", "location"],
  examples: ["basic", "with-icons", "max-width", "responsive"],
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
