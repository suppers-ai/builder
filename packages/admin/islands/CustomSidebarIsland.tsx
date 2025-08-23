/**
 * CustomSidebarIsland Component
 * Admin sidebar using the UI library's CustomSidebar component
 */

import { CustomSidebar } from "@suppers/ui-lib";
import { adminSidebarConfig } from "../utils/sidebar-config.tsx";
import SimpleAuthButton from "./SimpleAuthButton.tsx";

interface CustomSidebarIslandProps {
  currentPath?: string;
}

export default function CustomSidebarIsland({ currentPath }: CustomSidebarIslandProps) {
  return (
    <CustomSidebar
      config={adminSidebarConfig}
      currentPath={currentPath}
      authComponent={<SimpleAuthButton />}
      logoProps={{
        href: "/admin",
        alt: "Suppers Admin",
        variant: "long",
        size: "lg",
      }}
    />
  );
}
