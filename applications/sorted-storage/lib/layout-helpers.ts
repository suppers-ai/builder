import type { LayoutType, LayoutOptions } from "../types/storage.ts";

/**
 * Get layout container CSS classes based on layout type
 */
export function getLayoutContainerClass(layout: LayoutType, options: LayoutOptions): string {
  switch (layout) {
    case "timeline":
      return "space-y-2";
    case "default":
    default: {
      const gridCols = {
        small: "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
        medium: "grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
        large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      }[options.itemSize];

      return `grid ${gridCols} gap-4`;
    }
  }
}

/**
 * Convert layout type to component layout mode
 */
export function getLayoutMode(layout: LayoutType): "grid" | "list" | "timeline" {
  switch (layout) {
    case "timeline":
      return "timeline";
    case "default":
    default:
      return "grid";
  }
}