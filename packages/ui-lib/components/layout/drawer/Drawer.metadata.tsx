import { ComponentMetadata } from "../../types.ts";
import { Drawer } from "./Drawer.tsx";

export const drawerMetadata: ComponentMetadata = {
  name: "Drawer",
  description: "Slide-out navigation",
  category: "Layout",
  path: "/components/layout/drawer",
  tags: ["drawer", "sidebar", "navigation", "slide", "mobile", "menu"],
  examples: ["basic", "with-overlay", "responsive", "with-navbar", "end-drawer"],
  relatedComponents: ["navbar", "menu", "modal"],
  preview: (
    <div class="w-64 h-48">
      <Drawer
        sidebarContent={
          <ul class="menu p-4 w-48 bg-base-200">
            <li><a>Home</a></li>
            <li><a>About</a></li>
            <li><a>Contact</a></li>
          </ul>
        }
        open
      >
        <div class="p-4">Main content area</div>
      </Drawer>
    </div>
  ),
};
