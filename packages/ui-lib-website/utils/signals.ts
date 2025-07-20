// ✅ Fresh 2.0 Global Signals - Shared state across islands
import { signal } from "@preact/signals";

// Global theme signal - shared across all islands
export const globalTheme = signal("light");

// Global sidebar state signal - shared between header and sidebar islands
// Default to true for desktop experience
export const globalSidebarOpen = signal(true);

// Global scroll state signal
export const globalShowScrollTop = signal(false);

// Theme management functions
export const setGlobalTheme = (theme: string) => {
  globalTheme.value = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

export const loadSavedTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme") || "light";
    const currentTheme = document.documentElement.getAttribute("data-theme") || savedTheme;

    // Sync signal with the theme that was already set by the blocking script
    globalTheme.value = currentTheme;

    // Ensure the DOM is set (in case the script didn't run)
    if (!document.documentElement.getAttribute("data-theme")) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }
};

// Sidebar management functions
export const toggleGlobalSidebar = () => {
  globalSidebarOpen.value = !globalSidebarOpen.value;
};

export const closeGlobalSidebar = () => {
  globalSidebarOpen.value = false;
};

// Initialize sidebar state based on screen size
export const initializeSidebar = () => {
  if (typeof window !== "undefined") {
    // On desktop (lg+), sidebar should be open by default
    // On mobile, sidebar should be closed by default
    const isDesktop = window.innerWidth >= 1024;
    globalSidebarOpen.value = isDesktop;

    // Listen for resize events to handle responsive behavior
    window.addEventListener("resize", () => {
      const isNowDesktop = window.innerWidth >= 1024;
      if (isNowDesktop && !globalSidebarOpen.value) {
        // Switching to desktop - open sidebar
        globalSidebarOpen.value = true;
      } else if (!isNowDesktop && globalSidebarOpen.value) {
        // Switching to mobile - optionally close sidebar
        // Comment this out if you want sidebar to stay open when switching to mobile
        // globalSidebarOpen.value = false;
      }
    });
  }
};

// Scroll management functions
export const updateScrollTop = () => {
  globalShowScrollTop.value = window.scrollY > 400;
};

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
