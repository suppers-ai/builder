// ✅ Fresh 2.0 Global Signals - Shared state across islands
import { signal } from "@preact/signals";

// Global theme signal - shared across all islands
export const globalTheme = signal("light");

// Global sidebar state signal - shared between header and sidebar islands
// Default to true for desktop experience
export const globalSidebarOpen = signal(true);

// Global scroll state signal
export const globalShowScrollTop = signal(false);

// Sidebar management functions
export const toggleGlobalSidebar = () => {
  globalSidebarOpen.value = !globalSidebarOpen.value;
};

export const closeGlobalSidebar = () => {
  globalSidebarOpen.value = false;
};
