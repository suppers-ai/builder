/**
 * LazyThumbnail component with lazy loading and fallback support
 * Requirements: 4.3, 4.4, 7.2, 8.1
 */

import { useEffect, useRef, useState } from "preact/hooks";
import type { StorageObject } from "../types/storage.ts";
import { getFileTypeIcon, supportsThumbnailGeneration } from "../lib/thumbnail-generator.ts";

interface LazyThumbnailProps {
  file: StorageObject;
  size: "small" | "medium" | "large";
  className?: string;
  onClick?: () => void;
  showPreviewIndicator?: boolean;
}

export function LazyThumbnail({
  file,
  size,
  className = "",
  onClick,
  showPreviewIndicator = true,
}: LazyThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const iconSizes = {
    small: "text-2xl",
    medium: "text-3xl",
    large: "text-4xl",
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before the element comes into view
        threshold: 0.1,
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const hasThumbnail = file.thumbnail_url && isInView;
  const canPreview = file.mime_type.startsWith("image/") ||
    file.mime_type.startsWith("video/") ||
    file.mime_type.startsWith("audio/") ||
    file.mime_type === "application/pdf" ||
    file.mime_type.startsWith("text/");

  return (
    <div
      ref={containerRef}
      class={`${
        sizeClasses[size]
      } relative flex items-center justify-center bg-base-200 rounded cursor-pointer transition-all hover:bg-base-300 ${className}`}
      onClick={onClick}
    >
      {hasThumbnail && !hasError
        ? (
          <>
            {/* Loading placeholder */}
            {!isLoaded && (
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="loading loading-spinner loading-sm opacity-50"></div>
              </div>
            )}

            {/* Thumbnail image */}
            <img
              ref={imgRef}
              src={file.thumbnail_url}
              alt={file.name}
              class={`${sizeClasses[size]} object-cover rounded transition-opacity duration-200 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          </>
        )
        : (
          /* Fallback icon */
          <div class="flex items-center justify-center">
            <span class={iconSizes[size]}>
              {getFileTypeIcon(file.mime_type, canPreview)}
            </span>
          </div>
        )}

      {/* Preview indicator */}
      {showPreviewIndicator && canPreview && (
        <div class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-base-100 flex items-center justify-center">
          <span class="text-xs text-primary-content">👁</span>
        </div>
      )}

      {/* File type badge for non-image files */}
      {!file.mime_type.startsWith("image/") && size === "large" && (
        <div class="absolute bottom-0 right-0 bg-base-content/80 text-base-100 text-xs px-1 rounded-tl rounded-br">
          {getFileExtension(file.name)}
        </div>
      )}
    </div>
  );
}

/**
 * Enhanced thumbnail component with hover effects and additional info
 */
interface ThumbnailCardProps extends LazyThumbnailProps {
  showFileInfo?: boolean;
  showHoverEffects?: boolean;
}

export function ThumbnailCard({
  file,
  size,
  className = "",
  onClick,
  showPreviewIndicator = true,
  showFileInfo = false,
  showHoverEffects = true,
}: ThumbnailCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const displayName = file.metadata?.custom_name || file.name;
  const emoji = file.metadata?.emoji;

  return (
    <div
      class={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LazyThumbnail
        file={file}
        size={size}
        onClick={onClick}
        showPreviewIndicator={showPreviewIndicator}
        className={showHoverEffects
          ? "group-hover:scale-105 transition-transform duration-200"
          : ""}
      />

      {/* Hover overlay with file info */}
      {showHoverEffects && isHovered && (
        <div class="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div class="text-white text-center p-2">
            <div class="flex items-center justify-center gap-1 mb-1">
              {emoji && <span class="text-sm">{emoji}</span>}
              <span class="text-xs font-medium truncate max-w-20">
                {displayName}
              </span>
            </div>
            <div class="text-xs opacity-80">
              {formatFileSize(file.file_size)}
            </div>
          </div>
        </div>
      )}

      {/* File info below thumbnail */}
      {showFileInfo && (
        <div class="mt-2 text-center">
          <div class="flex items-center justify-center gap-1 mb-1">
            {emoji && <span class="text-sm">{emoji}</span>}
            <span class="text-xs font-medium truncate max-w-full">
              {displayName}
            </span>
          </div>
          <div class="text-xs text-base-content/70">
            {formatFileSize(file.file_size)}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "" : "";
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
