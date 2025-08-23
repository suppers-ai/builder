/**
 * Tests for LazyThumbnail component
 * Requirements: 4.3, 4.4, 7.2, 8.1
 */

import { assert, assertEquals, assertExists } from "@std/assert";
import { fireEvent, render } from "@testing-library/preact";
import { LazyThumbnail, ThumbnailCard } from "./LazyThumbnail.tsx";
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
  thumbnail_url: null,
  metadata: {},
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockTextFile: StorageObject = {
  id: "test-text-1",
  user_id: "user-1",
  name: "document.txt",
  file_path: "/path/to/document.txt",
  file_size: 1024,
  mime_type: "text/plain",
  object_type: "file",
  parent_id: null,
  is_public: false,
  share_token: null,
  thumbnail_url: null,
  metadata: {},
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// Mock IntersectionObserver for lazy loading tests
class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  callback: IntersectionObserverCallback;

  observe() {
    // Simulate immediate intersection for testing
    setTimeout(() => {
      this.callback([{
        isIntersecting: true,
        target: document.createElement("div"),
      } as IntersectionObserverEntry], this);
    }, 0);
  }

  unobserve() {}
  disconnect() {}
}

// Setup mock before tests
(globalThis as any).IntersectionObserver = MockIntersectionObserver;

Deno.test("LazyThumbnail - renders with correct size classes", () => {
  const { container } = render(
    <LazyThumbnail
      file={mockImageFile}
      size="medium"
    />,
  );

  const thumbnail = container.querySelector("div");
  assertExists(thumbnail);
  assert(thumbnail.className.includes("w-12 h-12"));
});

Deno.test("LazyThumbnail - renders thumbnail image when available", async () => {
  const { container } = render(
    <LazyThumbnail
      file={mockImageFile}
      size="medium"
    />,
  );

  // Wait for intersection observer to trigger
  await new Promise((resolve) => setTimeout(resolve, 10));

  const img = container.querySelector("img");
  assertExists(img);
  assertEquals(img.src, mockImageFile.thumbnail_url);
  assertEquals(img.alt, mockImageFile.name);
});

Deno.test("LazyThumbnail - renders fallback icon when no thumbnail", () => {
  const { container } = render(
    <LazyThumbnail
      file={mockVideoFile}
      size="medium"
    />,
  );

  // Should render video icon
  const iconContainer = container.querySelector("div > div");
  assertExists(iconContainer);
  const icon = iconContainer.querySelector("span");
  assertExists(icon);
  assertEquals(icon.textContent, "🎥");
});

Deno.test("LazyThumbnail - shows preview indicator for previewable files", () => {
  const { container } = render(
    <LazyThumbnail
      file={mockImageFile}
      size="medium"
      showPreviewIndicator
    />,
  );

  const previewIndicator = container.querySelector(".absolute.-top-1.-right-1");
  assertExists(previewIndicator);
  const eyeIcon = previewIndicator.querySelector("span");
  assertExists(eyeIcon);
  assertEquals(eyeIcon.textContent, "👁");
});

Deno.test("LazyThumbnail - hides preview indicator when disabled", () => {
  const { container } = render(
    <LazyThumbnail
      file={mockImageFile}
      size="medium"
      showPreviewIndicator={false}
    />,
  );

  const previewIndicator = container.querySelector(".absolute.-top-1.-right-1");
  assertEquals(previewIndicator, null);
});

Deno.test("LazyThumbnail - shows file extension badge for large non-images", () => {
  const { container } = render(
    <LazyThumbnail
      file={mockTextFile}
      size="large"
    />,
  );

  const badge = container.querySelector(".absolute.bottom-0.right-0");
  assertExists(badge);
  assertEquals(badge.textContent, "TXT");
});

Deno.test("LazyThumbnail - calls onClick when clicked", () => {
  let clickCalled = false;

  const { container } = render(
    <LazyThumbnail
      file={mockImageFile}
      size="medium"
      onClick={() => {
        clickCalled = true;
      }}
    />,
  );

  const thumbnail = container.querySelector("div");
  assertExists(thumbnail);
  fireEvent.click(thumbnail);

  assertEquals(clickCalled, true);
});

Deno.test("LazyThumbnail - applies custom className", () => {
  const { container } = render(
    <LazyThumbnail
      file={mockImageFile}
      size="medium"
      className="custom-class"
    />,
  );

  const thumbnail = container.querySelector("div");
  assertExists(thumbnail);
  assert(thumbnail.className.includes("custom-class"));
});

Deno.test("ThumbnailCard - renders with file info when enabled", () => {
  const { container, getByText } = render(
    <ThumbnailCard
      file={mockImageFile}
      size="medium"
      showFileInfo
    />,
  );

  // Should show custom name and emoji
  assertExists(getByText("📸"));
  assertExists(getByText("My Test Image"));

  // Should show file size
  assertExists(getByText("1.0 MB"));
});

Deno.test("ThumbnailCard - shows hover overlay when hover effects enabled", () => {
  const { container } = render(
    <ThumbnailCard
      file={mockImageFile}
      size="medium"
      showHoverEffects
    />,
  );

  const card = container.querySelector(".relative.group");
  assertExists(card);

  // Should have hover overlay (though testing actual hover behavior would require more complex setup)
  const overlay = container.querySelector(".absolute.inset-0.bg-black\\/50");
  assertExists(overlay);
});

Deno.test("ThumbnailCard - applies hover transform when enabled", () => {
  const { container } = render(
    <ThumbnailCard
      file={mockImageFile}
      size="medium"
      showHoverEffects
    />,
  );

  const thumbnail = container.querySelector(".group-hover\\:scale-105");
  assertExists(thumbnail);
});

Deno.test("ThumbnailCard - disables hover effects when disabled", () => {
  const { container } = render(
    <ThumbnailCard
      file={mockImageFile}
      size="medium"
      showHoverEffects={false}
    />,
  );

  const thumbnail = container.querySelector(".group-hover\\:scale-105");
  assertEquals(thumbnail, null);
});

// Test helper functions
Deno.test("getFileExtension - extracts extension correctly", () => {
  assertEquals(getFileExtension("document.txt"), "TXT");
  assertEquals(getFileExtension("image.jpeg"), "JPEG");
  assertEquals(getFileExtension("archive.tar.gz"), "GZ");
  assertEquals(getFileExtension("noextension"), "");
  assertEquals(getFileExtension(""), "");
});

Deno.test("formatFileSize - formats sizes correctly", () => {
  assertEquals(formatFileSize(0), "0 B");
  assertEquals(formatFileSize(1024), "1.0 KB");
  assertEquals(formatFileSize(1024 * 1024), "1.0 MB");
  assertEquals(formatFileSize(1024 * 1024 * 1024), "1.0 GB");
  assertEquals(formatFileSize(1536), "1.5 KB");
});

// Helper functions (copied from component for testing)
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "" : "";
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
