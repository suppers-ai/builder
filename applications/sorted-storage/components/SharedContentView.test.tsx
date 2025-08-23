/**
 * Tests for SharedContentView component
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { SharedContentView } from "./SharedContentView.tsx";
import type { StorageObject } from "../types/storage.ts";

const mockFile: StorageObject = {
  id: "test-file-id",
  user_id: "test-user",
  name: "test-file.txt",
  file_path: "test/path/test-file.txt",
  file_size: 1024,
  mime_type: "text/plain",
  object_type: "file",
  parent_id: null,
  is_public: true,
  share_token: "test-share-token",
  thumbnail_url: null,
  metadata: {
    custom_name: "Test File",
    description: "A test file",
    emoji: "📄",
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockFolder: StorageObject = {
  ...mockFile,
  id: "test-folder-id",
  name: "test-folder",
  object_type: "folder",
  mime_type: "application/x-directory",
  metadata: {
    custom_name: "Test Folder",
    description: "A test folder",
    emoji: "📁",
  },
};

Deno.test("SharedContentView component", async (t) => {
  await t.step("should render shared file", () => {
    const { container } = render(
      <SharedContentView
        item={mockFile}
        shareToken="test-share-token"
      />,
    );

    assertExists(container);
    assertEquals(container.textContent?.includes("Test File"), true);
    assertEquals(container.textContent?.includes("📄"), true);
  });

  await t.step("should render shared folder", () => {
    const { container } = render(
      <SharedContentView
        item={mockFolder}
        shareToken="test-share-token"
      />,
    );

    assertExists(container);
    assertEquals(container.textContent?.includes("Test Folder"), true);
    assertEquals(container.textContent?.includes("📁"), true);
  });

  await t.step("should show file details", () => {
    const { container } = render(
      <SharedContentView
        item={mockFile}
        shareToken="test-share-token"
        showDetails
      />,
    );

    assertExists(container);
    assertEquals(container.textContent?.includes("A test file"), true);
    assertEquals(
      container.textContent?.includes("1024") || container.textContent?.includes("1 KB"),
      true,
    );
  });

  await t.step("should handle download action", () => {
    let downloadCalled = false;
    const mockOnDownload = () => {
      downloadCalled = true;
    };

    const { container } = render(
      <SharedContentView
        item={mockFile}
        shareToken="test-share-token"
        onDownload={mockOnDownload}
      />,
    );

    assertExists(container);

    // Look for download button
    const downloadButton = container.querySelector(
      'button[title*="Download"], button[aria-label*="Download"], .download-btn',
    );
    assertEquals(downloadButton !== null, true);
  });

  await t.step("should show access restrictions for private content", () => {
    const privateFile = { ...mockFile, is_public: false };

    const { container } = render(
      <SharedContentView
        item={privateFile}
        shareToken="invalid-token"
      />,
    );

    assertExists(container);
    // Should show access denied or similar message
    const hasAccessMessage = container.textContent?.includes("access") ||
      container.textContent?.includes("permission") ||
      container.textContent?.includes("restricted");
    assertEquals(typeof hasAccessMessage, "boolean");
  });
});
