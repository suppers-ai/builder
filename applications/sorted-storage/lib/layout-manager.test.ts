/**
 * Unit tests for layout manager
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import {
  DEFAULT_LAYOUT_OPTIONS,
  formatDate,
  formatFileSize,
  getFileTypeIcon,
  groupItemsByDate,
  LayoutManager,
} from "./layout-manager.ts";
import type { LayoutOptions, LayoutRenderer, StorageObject } from "../types/storage.ts";

// Mock storage objects for testing
const mockStorageObjects: StorageObject[] = [
  {
    id: "1",
    user_id: "user1",
    name: "document.pdf",
    file_path: "/files/document.pdf",
    file_size: 1024000,
    mime_type: "application/pdf",
    object_type: "file",
    parent_id: null,
    is_public: false,
    share_token: null,
    thumbnail_url: null,
    metadata: { description: "Important document" },
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    user_id: "user1",
    name: "My Folder",
    file_path: "/folders/my-folder",
    file_size: 0,
    mime_type: "application/x-folder",
    object_type: "folder",
    parent_id: null,
    is_public: false,
    share_token: null,
    thumbnail_url: null,
    metadata: { emoji: "📁", description: "Project files" },
    created_at: "2024-01-14T09:00:00Z",
    updated_at: "2024-01-16T11:00:00Z",
  },
  {
    id: "3",
    user_id: "user1",
    name: "image.jpg",
    file_path: "/files/image.jpg",
    file_size: 2048000,
    mime_type: "image/jpeg",
    object_type: "file",
    parent_id: null,
    is_public: false,
    share_token: null,
    thumbnail_url: "/thumbnails/image.jpg",
    metadata: { custom_name: "Beautiful Sunset" },
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-10T08:00:00Z",
  },
];

// Mock layout renderer for testing
const mockRenderer: LayoutRenderer = {
  name: "test",
  displayName: "Test Layout",
  render: (items: StorageObject[], options: LayoutOptions) => {
    return `Rendered ${items.length} items with ${options.sortBy} sort`;
  },
};

describe("LayoutManager", () => {
  let layoutManager: LayoutManager;

  beforeEach(() => {
    layoutManager = new LayoutManager();
  });

  describe("renderer registration", () => {
    it("should register a layout renderer", () => {
      layoutManager.registerRenderer(mockRenderer);
      assertEquals(layoutManager.hasRenderer("test"), true);
    });

    it("should get registered renderer", () => {
      layoutManager.registerRenderer(mockRenderer);
      const renderer = layoutManager.getRenderer("test");
      assertEquals(renderer, mockRenderer);
    });

    it("should return undefined for unregistered renderer", () => {
      const renderer = layoutManager.getRenderer("nonexistent");
      assertEquals(renderer, undefined);
    });

    it("should get all registered renderers", () => {
      layoutManager.registerRenderer(mockRenderer);
      const renderers = layoutManager.getRenderers();
      assertEquals(renderers.length, 1);
      assertEquals(renderers[0], mockRenderer);
    });
  });

  describe("rendering", () => {
    beforeEach(() => {
      layoutManager.registerRenderer(mockRenderer);
    });

    it("should render items with registered renderer", () => {
      const result = layoutManager.render("test", mockStorageObjects);
      assertEquals(result, "Rendered 3 items with name sort");
    });

    it("should throw error for unregistered renderer", () => {
      assertThrows(
        () => layoutManager.render("nonexistent", mockStorageObjects),
        Error,
        "Layout renderer 'nonexistent' not found",
      );
    });

    it("should use default options when none provided", () => {
      const result = layoutManager.render("test", mockStorageObjects);
      assertEquals(result, "Rendered 3 items with name sort");
    });

    it("should use custom options when provided", () => {
      const options: LayoutOptions = {
        ...DEFAULT_LAYOUT_OPTIONS,
        sortBy: "date",
      };
      const result = layoutManager.render("test", mockStorageObjects, options);
      assertEquals(result, "Rendered 3 items with date sort");
    });
  });

  describe("sorting", () => {
    beforeEach(() => {
      layoutManager.registerRenderer(mockRenderer);
    });

    it("should sort by name ascending", () => {
      const options: LayoutOptions = {
        ...DEFAULT_LAYOUT_OPTIONS,
        sortBy: "name",
        sortOrder: "asc",
      };

      // Create a custom renderer that returns the sorted items for testing
      const testRenderer: LayoutRenderer = {
        name: "sort-test",
        displayName: "Sort Test",
        render: (items: StorageObject[]) => items.map((item) => item.name),
      };

      layoutManager.registerRenderer(testRenderer);
      const result = layoutManager.render("sort-test", mockStorageObjects, options) as string[];

      assertEquals(result, ["document.pdf", "image.jpg", "My Folder"]);
    });

    it("should sort by name descending", () => {
      const options: LayoutOptions = {
        ...DEFAULT_LAYOUT_OPTIONS,
        sortBy: "name",
        sortOrder: "desc",
      };

      const testRenderer: LayoutRenderer = {
        name: "sort-test-desc",
        displayName: "Sort Test Desc",
        render: (items: StorageObject[]) => items.map((item) => item.name),
      };

      layoutManager.registerRenderer(testRenderer);
      const result = layoutManager.render(
        "sort-test-desc",
        mockStorageObjects,
        options,
      ) as string[];

      assertEquals(result, ["My Folder", "image.jpg", "document.pdf"]);
    });

    it("should sort by date", () => {
      const options: LayoutOptions = {
        ...DEFAULT_LAYOUT_OPTIONS,
        sortBy: "date",
        sortOrder: "asc",
      };

      const testRenderer: LayoutRenderer = {
        name: "date-sort-test",
        displayName: "Date Sort Test",
        render: (items: StorageObject[]) => items.map((item) => item.id),
      };

      layoutManager.registerRenderer(testRenderer);
      const result = layoutManager.render(
        "date-sort-test",
        mockStorageObjects,
        options,
      ) as string[];

      // Should be sorted by updated_at: image (Jan 10), document (Jan 15), folder (Jan 16)
      assertEquals(result, ["3", "1", "2"]);
    });

    it("should sort by size", () => {
      const options: LayoutOptions = {
        ...DEFAULT_LAYOUT_OPTIONS,
        sortBy: "size",
        sortOrder: "asc",
      };

      const testRenderer: LayoutRenderer = {
        name: "size-sort-test",
        displayName: "Size Sort Test",
        render: (items: StorageObject[]) => items.map((item) => item.file_size),
      };

      layoutManager.registerRenderer(testRenderer);
      const result = layoutManager.render(
        "size-sort-test",
        mockStorageObjects,
        options,
      ) as number[];

      assertEquals(result, [0, 1024000, 2048000]);
    });

    it("should sort by type with folders first", () => {
      const options: LayoutOptions = {
        ...DEFAULT_LAYOUT_OPTIONS,
        sortBy: "type",
        sortOrder: "asc",
      };

      const testRenderer: LayoutRenderer = {
        name: "type-sort-test",
        displayName: "Type Sort Test",
        render: (items: StorageObject[]) => items.map((item) => item.object_type),
      };

      layoutManager.registerRenderer(testRenderer);
      const result = layoutManager.render(
        "type-sort-test",
        mockStorageObjects,
        options,
      ) as string[];

      // Folders should come first
      assertEquals(result[0], "folder");
    });
  });

  describe("utility methods", () => {
    it("should get sort options", () => {
      const options = layoutManager.getSortOptions();
      assertEquals(options.length, 4);
      assertEquals(options[0], { value: "name", label: "Name" });
      assertEquals(options[1], { value: "date", label: "Date Modified" });
      assertEquals(options[2], { value: "size", label: "Size" });
      assertEquals(options[3], { value: "type", label: "Type" });
    });

    it("should get item size options", () => {
      const options = layoutManager.getItemSizeOptions();
      assertEquals(options.length, 3);
      assertEquals(options[0], { value: "small", label: "Small" });
      assertEquals(options[1], { value: "medium", label: "Medium" });
      assertEquals(options[2], { value: "large", label: "Large" });
    });
  });
});

describe("Utility Functions", () => {
  describe("formatFileSize", () => {
    it("should format zero bytes", () => {
      assertEquals(formatFileSize(0), "0 B");
    });

    it("should format bytes", () => {
      assertEquals(formatFileSize(512), "512 B");
    });

    it("should format kilobytes", () => {
      assertEquals(formatFileSize(1024), "1 KB");
      assertEquals(formatFileSize(1536), "1.5 KB");
    });

    it("should format megabytes", () => {
      assertEquals(formatFileSize(1048576), "1 MB");
      assertEquals(formatFileSize(2097152), "2 MB");
    });

    it("should format gigabytes", () => {
      assertEquals(formatFileSize(1073741824), "1 GB");
    });
  });

  describe("formatDate", () => {
    it("should format today's date", () => {
      const today = new Date().toISOString();
      assertEquals(formatDate(today), "Today");
    });

    it("should format yesterday's date", () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      assertEquals(formatDate(yesterday), "Yesterday");
    });

    it("should format dates within a week", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      assertEquals(formatDate(threeDaysAgo), "3 days ago");
    });

    it("should format dates within a month", () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      assertEquals(formatDate(twoWeeksAgo), "2 weeks ago");
    });

    it("should format dates within a year", () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      assertEquals(formatDate(twoMonthsAgo), "2 months ago");
    });

    it("should format dates over a year", () => {
      const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
      assertEquals(formatDate(twoYearsAgo), "2 years ago");
    });
  });

  describe("getFileTypeIcon", () => {
    it("should return folder icon for folders", () => {
      assertEquals(getFileTypeIcon("application/x-folder", "folder"), "📁");
    });

    it("should return image icon for images", () => {
      assertEquals(getFileTypeIcon("image/jpeg", "file"), "🖼️");
      assertEquals(getFileTypeIcon("image/png", "file"), "🖼️");
    });

    it("should return video icon for videos", () => {
      assertEquals(getFileTypeIcon("video/mp4", "file"), "🎥");
    });

    it("should return audio icon for audio files", () => {
      assertEquals(getFileTypeIcon("audio/mp3", "file"), "🎵");
    });

    it("should return PDF icon for PDF files", () => {
      assertEquals(getFileTypeIcon("application/pdf", "file"), "📄");
    });

    it("should return text icon for text files", () => {
      assertEquals(getFileTypeIcon("text/plain", "file"), "📝");
    });

    it("should return archive icon for zip files", () => {
      assertEquals(getFileTypeIcon("application/zip", "file"), "📦");
    });

    it("should return default icon for unknown types", () => {
      assertEquals(getFileTypeIcon("application/unknown", "file"), "📄");
    });
  });

  describe("groupItemsByDate", () => {
    it("should group items by date correctly", () => {
      const groups = groupItemsByDate(mockStorageObjects);

      // Should have groups based on the mock data dates
      assertEquals(groups.size >= 1, true);

      // Check that all items are grouped
      let totalItems = 0;
      for (const items of groups.values()) {
        totalItems += items.length;
      }
      assertEquals(totalItems, mockStorageObjects.length);
    });

    it("should handle empty array", () => {
      const groups = groupItemsByDate([]);
      assertEquals(groups.size, 0);
    });

    it("should group items with same date together", () => {
      const sameDate = "2024-01-15T10:00:00Z";
      const itemsWithSameDate: StorageObject[] = [
        { ...mockStorageObjects[0], updated_at: sameDate },
        { ...mockStorageObjects[1], updated_at: sameDate },
      ];

      const groups = groupItemsByDate(itemsWithSameDate);
      assertEquals(groups.size, 1);

      const groupItems = Array.from(groups.values())[0];
      assertEquals(groupItems.length, 2);
    });
  });
});

describe("DEFAULT_LAYOUT_OPTIONS", () => {
  it("should have correct default values", () => {
    assertEquals(DEFAULT_LAYOUT_OPTIONS.sortBy, "name");
    assertEquals(DEFAULT_LAYOUT_OPTIONS.sortOrder, "asc");
    assertEquals(DEFAULT_LAYOUT_OPTIONS.showThumbnails, true);
    assertEquals(DEFAULT_LAYOUT_OPTIONS.itemSize, "medium");
  });
});
