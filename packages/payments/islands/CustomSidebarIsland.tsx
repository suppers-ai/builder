/**
 * CustomSidebarIsland Component
 * Payments sidebar using the UI library's CustomSidebar component
 */

import { CustomSidebar } from "@suppers/ui-lib";
import { paymentsSidebarConfig } from "../utils/sidebar-config.tsx";
import SimpleAuthButton from "./SimpleAuthButton.tsx";

interface CustomSidebarIslandProps {
  currentPath?: string;
}

export default function CustomSidebarIsland({ currentPath }: CustomSidebarIslandProps) {
  return (
    <CustomSidebar
      config={paymentsSidebarConfig}
      currentPath={currentPath}
      authComponent={<SimpleAuthButton />}
      logoProps={{
        href: "/dashboard",
        alt: "Suppers Payments",
        variant: "long",
        size: "lg",
      }}
    />
  );
}
