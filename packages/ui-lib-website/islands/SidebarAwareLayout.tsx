import { ComponentChildren } from "preact";
import { globalSidebarOpen } from "@suppers/ui-lib";

export interface SidebarAwareLayoutProps {
  children: ComponentChildren;
}

export default function SidebarAwareLayout({ children }: SidebarAwareLayoutProps) {
  const sidebarOpen = globalSidebarOpen.value;

  return (
    <div class={`transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:ml-80" : "lg:ml-0"}`}>
      {children}
    </div>
  );
}
