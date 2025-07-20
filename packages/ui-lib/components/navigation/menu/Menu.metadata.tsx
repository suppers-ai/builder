import { ComponentMetadata } from "../../types.ts";
import { Menu } from "./Menu.tsx";

export const menuMetadata: ComponentMetadata = {
  name: "Menu",
  description: "Vertical navigation menu",
  category: "Navigation",
  path: "/components/navigation/menu",
  tags: ["menu", "navigation", "list", "sidebar", "vertical", "options"],
  examples: ["basic", "with-icons", "collapsible", "bordered", "responsive"],
  relatedComponents: ["navbar", "dropdown", "breadcrumbs"],
  preview: (
    <div class="w-56">
      <Menu
        items={[
          { id: "dashboard", label: "Dashboard", active: true },
          { id: "projects", label: "Projects" },
          { id: "team", label: "Team" },
          { id: "settings", label: "Settings" }
        ]}
        variant="bordered"
      />
    </div>
  ),
};
