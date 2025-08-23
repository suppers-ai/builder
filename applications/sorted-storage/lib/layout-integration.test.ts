/**
 * Integration tests for layout system
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { assertEquals, assertExists } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { initializeLayoutManager, layoutManager } from "./layout-manager.ts";
import type { StorageObject } from "../types/storage.ts";

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
];

describe("Layout System Integration", () => {
  beforeEach(async () => {
    // Initialize layout manager with renderers
    await initializeLayoutManager();

    // Wait a bit for dynamic imports to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("should have default and timeline renderers registered", () => {
    const renderers = layoutManager.getRenderers();
    assertEquals(renderers.length, 2);

    const rendererNames = renderers.map((r) => r.name);
    assertEquals(rendererNames.includes("default"), true);
    assertEquals(rendererNames.includes("timeline"), true);
  });

  it("should render items with default layout", () => {
    const result = layoutManager.render("default", mockStorageObjects);
    assertExists(result);
  });

  it("should render items with timeline layout", () => {
    const result = layoutManager.render("timeline", mockStorageObjects);
    assertExists(result);
  });

  it("should handle layout switching", () => {
    // Test switching between layouts
    const defaultResult = layoutManager.render("default", mockStorageObjects);
    const timelineResult = layoutManager.render("timeline", mockStorageObjects);

    assertExists(defaultResult);
    assertExists(timelineResult);

    // Results should be different (different layout structures)
    assertEquals(defaultResult !== timelineResult, true);
  });

  it("should handle different layout options", () => {
    const options1 = {
      sortBy: "name" as const,
      sortOrder: "asc" as const,
      showThumbnails: true,
      itemSize: "medium" as const,
    };

    const options2 = {
      sortBy: "date" as const,
      sortOrder: "desc" as const,
      showThumbnails: false,
      itemSize: "large" as const,
    };

    const result1 = layoutManager.render("default", mockStorageObjects, options1);
    const result2 = layoutManager.render("default", mockStorageObjects, options2);

    assertExists(result1);
    assertExists(result2);
  });

  it("should preserve layout state during switching", () => {
    const options = {
      sortBy: "size" as const,
      sortOrder: "desc" as const,
      showThumbnails: true,
      itemSize: "small" as const,
    };

    // Render with default layout
    const defaultResult = layoutManager.render("default", mockStorageObjects, options);
    assertExists(defaultResult);

    // Switch to timeline layout with same options
    const timelineResult = layoutManager.render("timeline", mockStorageObjects, options);
    assertExists(timelineResult);

    // Switch back to default layout
    const defaultResult2 = layoutManager.render("default", mockStorageObjects, options);
    assertExists(defaultResult2);
  });
});
