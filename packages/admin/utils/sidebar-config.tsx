/**
 * Admin sidebar configuration
 */

import type { SidebarConfig } from "@suppers/ui-lib";
import { DollarSign, Gauge, LayoutDashboard, Plus, Settings2 } from "lucide-preact";

export const adminSidebarConfig: SidebarConfig = {
  quickLinks: [
    {
      name: "Dashboard",
      path: "/",
      icon: <Gauge class="w-4 h-4" />,
    },
    {
      name: "AI Create App",
      path: "/create",
      icon: <Plus class="w-4 h-4" />,
    },
  ],
  sections: [
    {
      id: "management",
      title: "Management",
      defaultOpen: true,
      icon: <LayoutDashboard class="w-4 h-4" />,
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
          name: "Entities",
          path: "/entities",
        },
        {
          name: "Subscriptions",
          path: "/subscriptions",
        },
      ],
    },
    {
      id: "pricing",
      title: "Pricing System",
      defaultOpen: false,
      icon: <DollarSign class="w-4 h-4" />,
      links: [
        {
          name: "Pricing Templates",
          path: "/pricing-templates",
        },
        {
          name: "Pricing Products",
          path: "/pricing-products",
        },
        {
          name: "Variable Definitions",
          path: "/variable-definitions",
        },
      ],
    },
    {
      id: "configuration",
      title: "Configuration",
      defaultOpen: false,
      icon: <Settings2 class="w-4 h-4" />,
      links: [
        {
          name: "Entity Types",
          path: "/entity-types",
        },
        {
          name: "Product Types",
          path: "/product-types",
        },
      ],
    },
  ],
};
