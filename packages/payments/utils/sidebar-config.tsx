/**
 * Payments sidebar configuration
 */

import type { SidebarConfig } from "@suppers/ui-lib";
import { Building, DollarSign, Gauge, Package, Plus, Settings, ShoppingCart } from "lucide-preact";

export const paymentsSidebarConfig: SidebarConfig = {
  quickLinks: [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Gauge class="w-4 h-4" />,
    },
  ],
  sections: [
    {
      id: "entities",
      title: "Entities",
      defaultOpen: true,
      icon: <Building class="w-4 h-4" />,
      links: [
        {
          name: "My Entities",
          path: "/entities",
        },
      ],
    },
    {
      id: "products",
      title: "Products",
      defaultOpen: false,
      icon: <Package class="w-4 h-4" />,
      links: [
        {
          name: "My Products",
          path: "/products",
        },
      ],
    },
    {
      id: "pricing",
      title: "Pricing",
      defaultOpen: false,
      icon: <DollarSign class="w-4 h-4" />,
      links: [
        {
          name: "Pricing Management",
          path: "/pricing",
        },
      ],
    },
    {
      id: "sales",
      title: "Sales & Orders",
      defaultOpen: false,
      icon: <ShoppingCart class="w-4 h-4" />,
      links: [
        {
          name: "Orders",
          path: "/orders",
        },
        {
          name: "Purchases",
          path: "/purchases",
        },
      ],
    },
  ],
};
