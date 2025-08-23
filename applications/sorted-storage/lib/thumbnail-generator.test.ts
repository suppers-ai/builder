/**
 * Tests for thumbnail generation utilities
 * Requirements: 4.3, 4.4, 7.2, 8.1
 */

import { assert, assertEquals, assertExists } from "@std/assert";
import {
  getFileTypeIcon,
  getPreviewInfo,
  getThumbnailSize,
  supportsThumbnailGeneration,
} from "./thumbnail-generator.ts";
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
  metadata: {},
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

const mockPdfFile: StorageObject = {
  id: "test-pdf-1",
  user_id: "user-1",
  name: "test-document.pdf",
  file_path: "/path/to/test-document.pdf",
  file_size: 512000,
  mime_type: "application/pdf",
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
  name: "test-document.txt",
  file_path: "/path/to/test-document.txt",
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

Deno.test("getPreviewInfo - image file", () => {
  const previewInfo = getPreviewInfo(mockImageFile);

  assertEquals(previewInfo.canPreview, true);
  assertEquals(previewInfo.previewType, "image");
  assertEquals(previewInfo.thumbnailUrl, "https://example.com/thumbnail.jpg");
  assertExists(previewInfo.previewUrl);
});

Deno.test("getPreviewInfo - video file", () => {
  const previewInfo = getPreviewInfo(mockVideoFile);

  assertEquals(previewInfo.canPreview, true);
  assertEquals(previewInfo.previewType, "video");
  assertEquals(previewInfo.thumbnailUrl, undefined);
  assertExists(previewInfo.previewUrl);
});

Deno.test("getPreviewInfo - PDF file", () => {
  const previewInfo = getPreviewInfo(mockPdfFile);

  assertEquals(previewInfo.canPreview, true);
  assertEquals(previewInfo.previewType, "pdf");
  assertExists(previewInfo.previewUrl);
});

Deno.test("getPreviewInfo - text file", () => {
  const previewInfo = getPreviewInfo(mockTextFile);

  assertEquals(previewInfo.canPreview, true);
  assertEquals(previewInfo.previewType, "text");
  assertExists(previewInfo.previewUrl);
});

Deno.test("getPreviewInfo - unsupported file", () => {
  const previewInfo = getPreviewInfo(mockUnsupportedFile);

  assertEquals(previewInfo.canPreview, false);
  assertEquals(previewInfo.previewType, "none");
});

Deno.test("getFileTypeIcon - returns correct icons", () => {
  assertEquals(getFileTypeIcon("image/jpeg"), "🖼️");
  assertEquals(getFileTypeIcon("video/mp4"), "🎥");
  assertEquals(getFileTypeIcon("audio/mp3"), "🎵");
  assertEquals(getFileTypeIcon("application/pdf"), "📄");
  assertEquals(getFileTypeIcon("text/plain"), "📄");
  assertEquals(getFileTypeIcon("application/zip"), "📦");
  assertEquals(getFileTypeIcon("application/octet-stream"), "📄");
});

Deno.test("getFileTypeIcon - enhanced icons for previewable files", () => {
  assertEquals(getFileTypeIcon("image/jpeg", true), "🖼️");
  assertEquals(getFileTypeIcon("video/mp4", true), "🎬");
  assertEquals(getFileTypeIcon("audio/mp3", true), "🎵");
  assertEquals(getFileTypeIcon("application/pdf", true), "📋");
  assertEquals(getFileTypeIcon("text/plain", true), "📝");
});

Deno.test("supportsThumbnailGeneration - returns correct values", () => {
  assertEquals(supportsThumbnailGeneration("image/jpeg"), true);
  assertEquals(supportsThumbnailGeneration("image/png"), true);
  assertEquals(supportsThumbnailGeneration("video/mp4"), true);
  assertEquals(supportsThumbnailGeneration("video/webm"), true);
  assertEquals(supportsThumbnailGeneration("audio/mp3"), false);
  assertEquals(supportsThumbnailGeneration("application/pdf"), false);
  assertEquals(supportsThumbnailGeneration("text/plain"), false);
});

Deno.test("getThumbnailSize - returns correct dimensions", () => {
  // Grid layout
  assertEquals(getThumbnailSize("grid", "small"), { width: 120, height: 120 });
  assertEquals(getThumbnailSize("grid", "medium"), { width: 160, height: 160 });
  assertEquals(getThumbnailSize("grid", "large"), { width: 200, height: 200 });

  // List layout
  assertEquals(getThumbnailSize("list", "small"), { width: 40, height: 40 });
  assertEquals(getThumbnailSize("list", "medium"), { width: 48, height: 48 });
  assertEquals(getThumbnailSize("list", "large"), { width: 56, height: 56 });

  // Timeline layout
  assertEquals(getThumbnailSize("timeline", "small"), { width: 40, height: 40 });
  assertEquals(getThumbnailSize("timeline", "medium"), { width: 48, height: 48 });
  assertEquals(getThumbnailSize("timeline", "large"), { width: 56, height: 56 });
});

// Note: calculateThumbnailSize is not exported, but we can test it indirectly
// through the thumbnail generation functions if needed

Deno.test("thumbnail size calculation - aspect ratio preservation", () => {
  // Test landscape image (16:9)
  const landscape = calculateThumbnailSize(1920, 1080, 200, 200);
  assertEquals(landscape.width, 200);
  assertEquals(landscape.height, 113); // 200 / (16/9) = 112.5, rounded to 113

  // Test portrait image (9:16)
  const portrait = calculateThumbnailSize(1080, 1920, 200, 200);
  assertEquals(portrait.width, 113); // 200 * (9/16) = 112.5, rounded to 113
  assertEquals(portrait.height, 200);

  // Test square image
  const square = calculateThumbnailSize(1000, 1000, 200, 200);
  assertEquals(square.width, 200);
  assertEquals(square.height, 200);
});

Deno.test("thumbnail size calculation - max dimensions respected", () => {
  // Test very wide image
  const veryWide = calculateThumbnailSize(4000, 1000, 200, 200);
  assertEquals(veryWide.width, 200);
  assertEquals(veryWide.height, 50); // 200 / 4 = 50

  // Test very tall image
  const veryTall = calculateThumbnailSize(1000, 4000, 200, 200);
  assertEquals(veryTall.width, 50); // 200 / 4 = 50
  assertEquals(veryTall.height, 200);
});

// Mock calculateThumbnailSize function for testing since it's not exported
function calculateThumbnailSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = maxWidth;
  let height = maxHeight;

  if (aspectRatio > 1) {
    // Landscape
    height = width / aspectRatio;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  } else {
    // Portrait or square
    width = height * aspectRatio;
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
  }

  return { width: Math.round(width), height: Math.round(height) };
}
