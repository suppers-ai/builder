/**
 * Layout manager with pluggable layout renderers
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { ComponentChildren } from "preact";
import type { LayoutOptions, LayoutRenderer, LayoutType, StorageObject } from "../types/storage.ts";

/**
 * Default layout options
 */
export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
  sortBy: "name",
  sortOrder: "asc",
  showThumbnails: true,
  itemSize: "medium",
};

/**
 * Layout manager class that handles pluggable layout renderers
 */
export class LayoutManager {
  private renderers = new Map<string, LayoutRenderer>();

  /**
   * Register a layout renderer
   */
  registerRenderer(renderer: LayoutRenderer): void {
    this.renderers.set(renderer.name, renderer);
  }

  /**
   * Get all registered layout renderers
   */
  getRenderers(): LayoutRenderer[] {
    return Array.from(this.renderers.values());
  }

  /**
   * Get a specific layout renderer by name
   */
  getRenderer(name: string): LayoutRenderer | undefined {
    return this.renderers.get(name);
  }

  /**
   * Check if a layout renderer is registered
   */
  hasRenderer(name: string): boolean {
    return this.renderers.has(name);
  }

  /**
   * Render items using the specified layout
   */
  render(
    layoutType: string,
    items: StorageObject[],
    options: LayoutOptions = DEFAULT_LAYOUT_OPTIONS,
  ): ComponentChildren {
    const renderer = this.getRenderer(layoutType);
    if (!renderer) {
      throw new Error(`Layout renderer '${layoutType}' not found`);
    }

    // Sort items according to options
    const sortedItems = this.sortItems(items, options);

    return renderer.render(sortedItems, options);
  }

  /**
   * Sort items according to layout options
   */
  private sortItems(items: StorageObject[], options: LayoutOptions): StorageObject[] {
    const sorted = [...items].sort((a, b) => {
      let comparison = 0;

      switch (options.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "size":
          comparison = a.file_size - b.file_size;
          break;
        case "type":
          // Sort folders first, then by mime type
          if (a.object_type !== b.object_type) {
            comparison = a.object_type === "folder" ? -1 : 1;
          } else {
            comparison = a.mime_type.localeCompare(b.mime_type);
          }
          break;
      }

      return options.sortOrder === "desc" ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * Get available sort options
   */
  getSortOptions(): Array<{ value: LayoutOptions["sortBy"]; label: string }> {
    return [
      { value: "name", label: "Name" },
      { value: "date", label: "Date Modified" },
      { value: "size", label: "Size" },
      { value: "type", label: "Type" },
    ];
  }

  /**
   * Get available item size options
   */
  getItemSizeOptions(): Array<{ value: LayoutOptions["itemSize"]; label: string }> {
    return [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
    ];
  }
}

/**
 * Singleton layout manager instance
 */
export const layoutManager = new LayoutManager();

/**
 * Initialize layout manager with default renderers
 */
export function initializeLayoutManager(): void {
  // Import and register renderers
  import("./renderers/default-layout.tsx").then(({ defaultLayoutRenderer }) => {
    layoutManager.registerRenderer(defaultLayoutRenderer);
  });

  import("./renderers/timeline-layout.tsx").then(({ timelineLayoutRenderer }) => {
    layoutManager.registerRenderer(timelineLayoutRenderer);
  });
}

/**
 * Utility functions for layout management
 */

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
}

/**
 * Get file type icon class
 */
export function getFileTypeIcon(mimeType: string, objectType: string): string {
  if (objectType === "folder") {
    return "📁";
  }

  if (mimeType.startsWith("image/")) {
    return "🖼️";
  } else if (mimeType.startsWith("video/")) {
    return "🎥";
  } else if (mimeType.startsWith("audio/")) {
    return "🎵";
  } else if (mimeType.includes("pdf")) {
    return "📄";
  } else if (mimeType.includes("text/")) {
    return "📝";
  } else if (mimeType.includes("zip") || mimeType.includes("archive")) {
    return "📦";
  } else {
    return "📄";
  }
}

/**
 * Group items by date for timeline layout
 */
export function groupItemsByDate(items: StorageObject[]): Map<string, StorageObject[]> {
  const groups = new Map<string, StorageObject[]>();

  for (const item of items) {
    const dateKey = getDateGroupKey(item.updated_at);
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(item);
  }

  return groups;
}

/**
 * Get date group key for timeline grouping
 */
function getDateGroupKey(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return "This Week";
  } else if (diffDays < 30) {
    return "This Month";
  } else if (diffDays < 365) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  } else {
    return date.getFullYear().toString();
  }
}
