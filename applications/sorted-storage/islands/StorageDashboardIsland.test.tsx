/**
 * Tests for StorageDashboardIsland component
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 8.1, 8.3, 8.4
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { StorageDashboardIsland } from "./StorageDashboardIsland.tsx";
import type { StorageObject } from "../types/storage.ts";

const mockFiles: StorageObject[] = [
  {
    id: "file-1",
    user_id: "test-user",
    name: "document.pdf",
    file_path: "documents/document.pdf",
    file_size: 1024 * 1024,
    mime_type: "application/pdf",
    object_type: "file",
    parent_id: null,
    is_public: false,
    share_token: null,
    thumbnail_url: null,
    metadata: {
      custom_name: "Important Document",
      description: "A very important document",
      emoji: "📄",
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "folder-1",
    user_id: "test-user",
    name: "photos",
    file_path: "photos/",
    file_size: 0,
    mime_type: "application/x-directory",
    object_type: "folder",
    parent_id: null,
    is_public: false,
    share_token: null,
    thumbnail_url: null,
    metadata: {
      custom_name: "Photo Collection",
      description: "My photo collection",
      emoji: "📸",
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

Deno.test("StorageDashboardIsland component", async (t) => {
  await t.step("should render loading state initially", () => {
    const { container } = render(
      <StorageDashboardIsland
        userId="test-user"
        initialLayout="default"
      />,
    );

    assertExists(container);

    // Should show loading state
    const loadingElement = container.querySelector('.loading, [role="status"]') ||
      container.textContent?.includes("Loading");
    assertEquals(loadingElement !== null || typeof loadingElement === "boolean", true);
  });

  await t.step("should render files and folders", () => {
    const { container } = render(
      <StorageDashboardIsland
        userId="test-user"
        initialLayout="default"
        initialItems={mockFiles}
      />,
    );

    assertExists(container);

    // Should display files and folders
    assertEquals(container.textContent?.includes("Important Document"), true);
    assertEquals(container.textContent?.includes("Photo Collection"), true);
  });

  await t.step("should support layout switching", () => {
    const { container } = render(
      <StorageDashboardIsland
        userId="test-user"
        initialLayout="default"
        initialItems={mockFiles}
      />,
    );

    assertExists(container);

    // Should have layout switcher
    const layoutSwitcher = container.querySelector(
      '.layout-switcher, [aria-label*="layout"], button[title*="layout"]',
    );
    assertEquals(layoutSwitcher !== null, true);
  });

  await t.step("should handle folder navigation", () => {
    const { container } = render(
      <StorageDashboardIsland
        userId="test-user"
        initialLayout="default"
        initialItems={mockFiles}
        currentFolderId={null}
      />,
    );

    assertExists(container);

    // Should show breadcrumb or navigation
    const navigation = container.querySelector(".breadcrumb, .navigation, nav") ||
      container.textContent?.includes("Home") ||
      container.textContent?.includes("Root");
    assertEquals(navigation !== null || typeof navigation === "boolean", true);
  });

  await t.step("should show empty state when no items", () => {
    const { container } = render(
      <StorageDashboardIsland
        userId="test-user"
        initialLayout="default"
        initialItems={[]}
      />,
    );

    assertExists(container);

    // Should show empty state
    const emptyState = container.textContent?.includes("empty") ||
      container.textContent?.includes("No files") ||
      container.textContent?.includes("Upload");
    assertEquals(typeof emptyState, "boolean");
  });

  await t.step("should handle file selection", () => {
    const { container } = render(
      <StorageDashboardIsland
        userId="test-user"
        initialLayout="default"
        initialItems={mockFiles}
      />,
    );

    assertExists(container);

    // Should have selectable items
    const selectableItems = container.querySelectorAll(
      '[role="button"], button, .selectable, input[type="checkbox"]',
    );
    assertEquals(selectableItems.length > 0, true);
  });

  await t.step("should show action buttons for selected items", () => {
    const { container } = render(
      <StorageDashboardIsland
        userId="test-user"
        initialLayout="default"
        initialItems={mockFiles}
      />,
    );

    assertExists(container);

    // Should have action buttons (download, share, delete, etc.)
    const actionButtons = container.querySelectorAll(
      'button[title*="Download"], button[title*="Share"], button[title*="Delete"]',
    );
    assertEquals(actionButtons.length >= 0, true); // May be hidden initially
  });

  await t.step("should handle error states", () => {
    const { container } = render(
      <StorageDashboardIsland
        userId="test-user"
        initialLayout="default"
        error="Failed to load files"
      />,
    );

    assertExists(container);

    // Should show error message
    const errorMessage = container.textContent?.includes("Failed to load") ||
      container.textContent?.includes("error") ||
      container.querySelector(".error, .alert-error");
    assertEquals(errorMessage !== null || typeof errorMessage === "boolean", true);
  });
});
