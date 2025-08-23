/**
 * Thumbnail generation utilities for file preview support
 * Requirements: 4.3, 4.4, 7.2, 8.1
 */

import type { StorageObject } from "../types/storage.ts";

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

export interface PreviewInfo {
  canPreview: boolean;
  previewType: "image" | "video" | "audio" | "pdf" | "text" | "none";
  thumbnailUrl?: string;
  previewUrl?: string;
}

/**
 * Generate thumbnail for supported file types
 */
export async function generateThumbnail(
  file: File,
  options: ThumbnailOptions = {},
): Promise<string | null> {
  const { width = 200, height = 200, quality = 0.8, format = "webp" } = options;

  // Only generate thumbnails for images and videos
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    return null;
  }

  try {
    if (file.type.startsWith("image/")) {
      return await generateImageThumbnail(file, { width, height, quality, format });
    } else if (file.type.startsWith("video/")) {
      return await generateVideoThumbnail(file, { width, height, quality, format });
    }
  } catch (error) {
    console.warn("Failed to generate thumbnail:", error);
    return null;
  }

  return null;
}

/**
 * Generate thumbnail from image file
 */
async function generateImageThumbnail(
  file: File,
  options: ThumbnailOptions,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      const { width: targetWidth, height: targetHeight } = calculateThumbnailSize(
        img.width,
        img.height,
        options.width!,
        options.height!,
      );

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Convert to data URL
      const dataUrl = canvas.toDataURL(`image/${options.format}`, options.quality);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate thumbnail from video file
 */
async function generateVideoThumbnail(
  file: File,
  options: ThumbnailOptions,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    video.onloadedmetadata = () => {
      // Seek to 10% of video duration for thumbnail
      video.currentTime = video.duration * 0.1;
    };

    video.onseeked = () => {
      // Calculate dimensions maintaining aspect ratio
      const { width: targetWidth, height: targetHeight } = calculateThumbnailSize(
        video.videoWidth,
        video.videoHeight,
        options.width!,
        options.height!,
      );

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

      // Convert to data URL
      const dataUrl = canvas.toDataURL(`image/${options.format}`, options.quality);
      resolve(dataUrl);

      // Clean up
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = URL.createObjectURL(file);
    video.load();
  });
}

/**
 * Calculate thumbnail dimensions maintaining aspect ratio
 */
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

/**
 * Get preview information for a storage object
 */
export function getPreviewInfo(storageObject: StorageObject): PreviewInfo {
  const mimeType = storageObject.mime_type;

  // Image files
  if (mimeType.startsWith("image/")) {
    return {
      canPreview: true,
      previewType: "image",
      thumbnailUrl: storageObject.thumbnail_url || undefined,
      previewUrl: storageObject.file_path,
    };
  }

  // Video files
  if (mimeType.startsWith("video/")) {
    return {
      canPreview: true,
      previewType: "video",
      thumbnailUrl: storageObject.thumbnail_url || undefined,
      previewUrl: storageObject.file_path,
    };
  }

  // Audio files
  if (mimeType.startsWith("audio/")) {
    return {
      canPreview: true,
      previewType: "audio",
      previewUrl: storageObject.file_path,
    };
  }

  // PDF files
  if (mimeType === "application/pdf") {
    return {
      canPreview: true,
      previewType: "pdf",
      previewUrl: storageObject.file_path,
    };
  }

  // Text files
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/javascript" ||
    mimeType === "application/typescript"
  ) {
    return {
      canPreview: true,
      previewType: "text",
      previewUrl: storageObject.file_path,
    };
  }

  return {
    canPreview: false,
    previewType: "none",
  };
}

/**
 * Get file type icon with enhanced support for preview types
 */
export function getFileTypeIcon(mimeType: string, hasPreview: boolean = false): string {
  // Enhanced icons for previewable files
  if (hasPreview) {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎬";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType === "application/pdf") return "📋";
    if (mimeType.startsWith("text/")) return "📝";
  }

  // Standard file type icons
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎥";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("document") || mimeType.includes("word")) return "📝";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📽️";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "📦";
  if (mimeType.includes("text/")) return "📄";

  return "📄";
}

/**
 * Check if file type supports thumbnail generation
 */
export function supportsThumbnailGeneration(mimeType: string): boolean {
  return mimeType.startsWith("image/") || mimeType.startsWith("video/");
}

/**
 * Get optimal thumbnail size based on layout and item size
 */
export function getThumbnailSize(
  layout: "grid" | "list" | "timeline",
  itemSize: "small" | "medium" | "large",
): { width: number; height: number } {
  const sizes = {
    grid: {
      small: { width: 120, height: 120 },
      medium: { width: 160, height: 160 },
      large: { width: 200, height: 200 },
    },
    list: {
      small: { width: 40, height: 40 },
      medium: { width: 48, height: 48 },
      large: { width: 56, height: 56 },
    },
    timeline: {
      small: { width: 40, height: 40 },
      medium: { width: 48, height: 48 },
      large: { width: 56, height: 56 },
    },
  };

  return sizes[layout][itemSize];
}
