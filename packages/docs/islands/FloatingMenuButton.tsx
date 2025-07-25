import { useEffect } from "preact/hooks";
import { Menu, X } from "lucide-preact";
import { globalSidebarOpen, toggleGlobalSidebar } from "@suppers/ui-lib";

export interface FloatingMenuButtonProps {
  className?: string;
}

export default function FloatingMenuButton({ className = "" }: FloatingMenuButtonProps) {
  const sidebarOpen = globalSidebarOpen.value;

  const handleToggle = () => {
    toggleGlobalSidebar();
  };

  // Add keyboard shortcut support
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleGlobalSidebar();
      }
    };

    globalThis.addEventListener("keydown", handleKeydown);
    return () => globalThis.removeEventListener("keydown", handleKeydown);
  }, []);

  return (
    <button
      type="button"
      onClick={handleToggle}
      class={`fixed top-4 z-[60] btn btn-primary btn-circle shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out ${
        sidebarOpen ? "left-[264px] lg:left-[264px]" : "left-4"
      } ${className}`}
      aria-label={sidebarOpen ? "Close menu (Ctrl+B)" : "Open menu (Ctrl+B)"}
      title={sidebarOpen ? "Close menu (Ctrl+B)" : "Open menu (Ctrl+B)"}
    >
      <div class="relative w-5 h-5">
        <Menu
          size={20}
          class={`absolute inset-0 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
          }`}
        />
        <X
          size={20}
          class={`absolute inset-0 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
          }`}
        />
      </div>
    </button>
  );
}
