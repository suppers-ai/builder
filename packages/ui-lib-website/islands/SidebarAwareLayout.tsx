import { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";
import { globalSidebarOpen, initializeSidebar } from "@suppers/ui-lib";

export interface SidebarAwareLayoutProps {
  children: ComponentChildren;
}

export default function SidebarAwareLayout({ children }: SidebarAwareLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(globalSidebarOpen.value);

  useEffect(() => {
    setMounted(true);
    // Initialize sidebar state based on screen size
    initializeSidebar();
    
    // Subscribe to sidebar state changes
    const unsubscribe = globalSidebarOpen.subscribe((isOpen) => {
      setSidebarOpen(isOpen);
    });

    return unsubscribe;
  }, []);

  // Don't apply layout shifts until mounted to prevent hydration issues
  if (!mounted) {
    return <div>{children}</div>;
  }

  return (
    <div 
      class={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? "lg:ml-80" : "lg:ml-0"
      }`}
    >
      {children}
    </div>
  );
}
