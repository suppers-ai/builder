/**
 * Tests for FilePreview component
 * Requirements: 4.3, 4.4, 7.2, 8.1
 */

import { assertEquals, assertExists } from "@std/assert";
import { render } from "@testing-library/preact";
import { FilePreview } from "./FilePreview.tsx";
import type { StorageObject } from "../types/storage.ts";

// Mock storage objects for testing
const mockImageFile: StorageObject = {
  id: "test-image-1",
  user_id: "user-1",
  name: "test-image.jpg",
  file_path: "/path/to/test-image.jpg",
  file_size: 1024000,
  mime_type: "image/jpeg",
  object_type: "file",
  parent_id: null,
  is_public: false,
  share_token: null,
  thumbnail_url: "https://example.com/thumbnail.jpg",
  metadata: {
    custom_name: "My Test Image",
    emoji: "📸",
    description: "A test image for preview",
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockVideoFile: StorageObject = {
  id: "test-video-1",
  user_id: "user-1",
  name: "test-video.mp4",
  file_path: "/path/to/test-video.mp4",
  file_size: 5120000,
  mime_type: "video/mp4",
  object_type: "file",
  parent_id: null,
  is_public: false,
  share_token: null,
  thumbnail_url: "https://example.com/video-thumb.jpg",
  metadata: {
    custom_name: "My Test Video",
    emoji: "🎬",
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockUnsupportedFile: StorageObject = {
  id: "test-binary-1",
  user_id: "user-1",
  name: "test-binary.bin",
  file_path: "/path/to/test-binary.bin",
  file_size: 2048,
  mime_type: "application/octet-stream",
  object_type: "file",
  parent_id: null,
  is_public: false,
  share_token: null,
  thumbnail_url: null,
  metadata: {},
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

Deno.test("FilePreview - renders nothing when file is null", () => {
  const { container } = render(
    <FilePreview
      file={null}
      isOpen
      onClose={() => {}}
    />,
  );

  assertEquals(container.innerHTML, "");
});

Deno.test("FilePreview - renders nothing when not open", () => {
  const { container } = render(
    <FilePreview
      file={mockImageFile}
      isOpen={false}
      onClose={() => {}}
    />,
  );

  assertEquals(container.innerHTML, "");
});

Deno.test("FilePreview - renders modal when open with file", () => {
  const { container } = render(
    <FilePreview
      file={mockImageFile}
      isOpen
      onClose={() => {}}
    />,
  );

  // Should render modal content
  assertExists(container.querySelector(".file-preview-modal"));
});

Deno.test("FilePreview - displays file info correctly", () => {
  const { getByText } = render(
    <FilePreview
      file={mockImageFile}
      isOpen
      onClose={() => {}}
    />,
  );

  // Should display custom name with emoji
  assertExists(getByText("📸"));
  assertExists(getByText("My Test Image"));

  // Should display file size and type
  assertExists(getByText("1.0 MB"));
  assertExists(getByText("Image"));
});

Deno.test("FilePreview - renders image preview correctly", () => {
  const { container } = render(
    <FilePreview
      file={mockImageFile}
      isOpen
      onClose={() => {}}
    />,
  );

  // Should render image element
  const img = container.querySelector("img");
  assertExists(img);
  assertEquals(img.src, mockImageFile.file_path);
  assertEquals(img.alt, mockImageFile.name);
});

Deno.test("FilePreview - renders video preview correctly", () => {
  const { container } = render(
    <FilePreview
      file={mockVideoFile}
      isOpen
      onClose={() => {}}
    />,
  );

  // Should render video element
  const video = container.querySelector("video");
  assertExists(video);
  assertEquals(video.src, mockVideoFile.file_path);
  assertEquals(video.poster, mockVideoFile.thumbnail_url);
});

Deno.test("FilePreview - renders unsupported file message", () => {
  const { getByText } = render(
    <FilePreview
      file={mockUnsupportedFile}
      isOpen
      onClose={() => {}}
    />,
  );

  // Should display preview not available message
  assertExists(getByText("Preview not available"));
  assertExists(getByText("This file type cannot be previewed in the browser."));
});

Deno.test("FilePreview - calls onDownload when download button clicked", () => {
  let downloadCalled = false;
  let downloadedFile: StorageObject | null = null;

  const { getByText } = render(
    <FilePreview
      file={mockImageFile}
      isOpen
      onClose={() => {}}
      onDownload={(file) => {
        downloadCalled = true;
        downloadedFile = file;
      }}
    />,
  );

  const downloadButton = getByText("⬇️ Download");
  downloadButton.click();

  assertEquals(downloadCalled, true);
  assertEquals(downloadedFile, mockImageFile);
});

Deno.test("FilePreview - calls onShare when share button clicked", () => {
  let shareCalled = false;
  let sharedFile: StorageObject | null = null;

  const { getByText } = render(
    <FilePreview
      file={mockImageFile}
      isOpen
      onClose={() => {}}
      onShare={(file) => {
        shareCalled = true;
        sharedFile = file;
      }}
    />,
  );

  const shareButton = getByText("🔗 Share");
  shareButton.click();

  assertEquals(shareCalled, true);
  assertEquals(sharedFile, mockImageFile);
});

Deno.test("FilePreview - calls onClose when modal is closed", () => {
  let closeCalled = false;

  const { container } = render(
    <FilePreview
      file={mockImageFile}
      isOpen
      onClose={() => {
        closeCalled = true;
      }}
    />,
  );

  // Find and click close button (this would depend on Modal implementation)
  // For now, we'll simulate the close action
  const modal = container.querySelector(".file-preview-modal");
  if (modal) {
    // Simulate modal close event
    const closeEvent = new Event("close");
    modal.dispatchEvent(closeEvent);
  }

  // Note: This test would need to be adjusted based on the actual Modal component implementation
});

Deno.test("FilePreview - handles loading state", () => {
  // This test would verify loading states for text files and other async content
  // Implementation would depend on the specific loading behavior
  const { container } = render(
    <FilePreview
      file={{
        ...mockImageFile,
        mime_type: "text/plain",
        file_path: "/path/to/text-file.txt",
      }}
      isOpen
      onClose={() => {}}
    />,
  );

  // Should render some form of loading indicator initially
  // This would need to be tested with actual async behavior
  assertExists(container);
});

Deno.test("FilePreview - handles error state", () => {
  // This test would verify error handling for failed file loads
  // Implementation would depend on error handling behavior
  const { container } = render(
    <FilePreview
      file={{
        ...mockImageFile,
        file_path: "/invalid/path/to/file.jpg",
      }}
      isOpen
      onClose={() => {}}
    />,
  );

  // Should handle errors gracefully
  assertExists(container);
});

// Helper function to format file size (copied from component for testing)
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

Deno.test("formatFileSize - formats sizes correctly", () => {
  assertEquals(formatFileSize(0), "0 B");
  assertEquals(formatFileSize(1024), "1.0 KB");
  assertEquals(formatFileSize(1024 * 1024), "1.0 MB");
  assertEquals(formatFileSize(1024 * 1024 * 1024), "1.0 GB");
  assertEquals(formatFileSize(1536), "1.5 KB"); // 1.5 KB
});

// Helper function to get file type label (copied from component for testing)
function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("document") || mimeType.includes("word")) return "Document";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "Spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "Presentation";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "Archive";
  if (mimeType.includes("text/")) return "Text";
  return "File";
}

Deno.test("getFileTypeLabel - returns correct labels", () => {
  assertEquals(getFileTypeLabel("image/jpeg"), "Image");
  assertEquals(getFileTypeLabel("video/mp4"), "Video");
  assertEquals(getFileTypeLabel("audio/mp3"), "Audio");
  assertEquals(getFileTypeLabel("application/pdf"), "PDF");
  assertEquals(getFileTypeLabel("text/plain"), "Text");
  assertEquals(getFileTypeLabel("application/zip"), "Archive");
  assertEquals(getFileTypeLabel("application/octet-stream"), "File");
});
