import { ComponentChildren } from "preact";

export interface SidebarAwareLayoutProps {
  children: ComponentChildren;
}

export default function SidebarAwareLayout({ children }: SidebarAwareLayoutProps) {
  return (
    <div class="sidebar-aware-layout">
      {children}
    </div>
  );
}
