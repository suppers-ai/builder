/**
 * Admin sidebar configuration
 */

import type { SidebarConfig } from "@suppers/ui-lib";
import { Gauge, LayoutDashboard } from "lucide-preact";

export const adminSidebarConfig: SidebarConfig = {
  quickLinks: [
    {
      name: "Dashboard",
      path: "/",
      icon: (
        <Gauge class="w-4 h-4" />
      ),
    },
  ],
  sections: [
    {
      id: "management",
      title: "Management",
      defaultOpen: true,
      icon: (
        <LayoutDashboard class="w-4 h-4" />
      ),
      links: [
        {
          name: "Applications",
          path: "/applications",
        },
        {
          name: "Users",
          path: "/users",
        },
        {
          name: "Subscriptions",
          path: "/subscriptions",
        },
      ],
    },

  ],
};