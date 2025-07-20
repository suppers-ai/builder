import { ComponentMetadata } from "../../types.ts";
import { Navbar } from "./Navbar.tsx";

export const navbarMetadata: ComponentMetadata = {
  name: "Navbar",
  description: "Top navigation",
  category: "Navigation",
  path: "/components/navigation/navbar",
  tags: ["navigation", "header", "menu", "top"],
  examples: ["basic", "with-dropdown", "with-search", "responsive"],
  relatedComponents: ["menu", "breadcrumbs", "link"],
  preview: (
    <div class="w-full max-w-md">
      <Navbar
        brand={"My App"}
        items={[
          { label: "Home", href: "/", active: true },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" }
        ]}
      />
    </div>
  ),
};
