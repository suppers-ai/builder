/**
 * FileItem component with grid, list, and timeline variants
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.2, 7.3, 7.5, 8.4
 */

import type { LayoutOptions, StorageObject } from "../types/storage.ts";
import { Badge, Card, Dropdown, Tooltip } from "@suppers/ui-lib";
import { LazyThumbnail } from "./LazyThumbnail.tsx";
import { getPreviewInfo } from "../lib/thumbnail-generator.ts";
import { KEYBOARD_KEYS, ScreenReaderUtils } from "../lib/accessibility-utils.ts";

interface FileItemProps {
  file: StorageObject;
  layout: "grid" | "list" | "timeline";
  size: "small" | "medium" | "large";
  selected?: boolean;
  index?: number;
  onSelect?: (file: StorageObject) => void;
  onShare?: (file: StorageObject) => void;
  onDelete?: (file: StorageObject) => void;
  onEdit?: (file: StorageObject) => void;
  onDownload?: (file: StorageObject) => void;
  onPreview?: (file: StorageObject) => void;
  onKeyDown?: (event: KeyboardEvent, index: number) => void;
  className?: string;
}

export function FileItem({
  file,
  layout,
  size,
  selected = false,
  index = 0,
  onSelect,
  onShare,
  onDelete,
  onEdit,
  onDownload,
  onPreview,
  onKeyDown,
  className = "",
}: FileItemProps) {
  const displayName = file.metadata?.custom_name || file.name;
  const description = file.metadata?.description;
  const emoji = file.metadata?.emoji;
  const previewInfo = getPreviewInfo(file);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (previewInfo.canPreview && onPreview) {
      onPreview(file);
    } else {
      onSelect?.(file);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle item-specific keyboard interactions
    switch (e.key) {
      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        e.preventDefault();
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          onSelect?.(file);
        } else if (previewInfo.canPreview && onPreview) {
          onPreview(file);
        } else {
          onSelect?.(file);
        }
        break;
      case KEYBOARD_KEYS.DELETE:
      case KEYBOARD_KEYS.BACKSPACE:
        e.preventDefault();
        onDelete?.(file);
        break;
      default:
        // Pass through to parent for navigation
        onKeyDown?.(e, index);
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    // Context menu will be handled by dropdown
  };

  // Generate accessible description
  const ariaLabel = ScreenReaderUtils.getItemDescription(file);
  const actionDescription = previewInfo.canPreview
    ? "Press Enter to preview, Shift+Enter to select"
    : "Press Enter to select";
  const fullAriaLabel = `${ariaLabel}. ${actionDescription}`;

  // Generate role and ARIA attributes
  const itemRole = layout === "grid" ? "gridcell" : "listitem";
  const ariaSelected = selected ? "true" : "false";

  if (layout === "timeline") {
    return (
      <div
        role={itemRole}
        tabIndex={0}
        aria-label={fullAriaLabel}
        aria-selected={ariaSelected}
        data-item-index={index}
        class={`flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:bg-primary/10 ${
          selected ? "bg-primary/10 ring-2 ring-primary" : ""
        } ${className}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
      >
        <div class="flex-shrink-0">
          <LazyThumbnail
            file={file}
            size="small"
            onClick={handleClick}
            showPreviewIndicator
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            {emoji && <span class="text-lg">{emoji}</span>}
            <span class="font-medium text-base-content truncate">
              {displayName}
            </span>
            <Badge variant="outline" size="sm">
              {getFileTypeLabel(file.mime_type)}
            </Badge>
            {previewInfo.canPreview && (
              <Badge variant="primary" size="xs">
                👁 Preview
              </Badge>
            )}
          </div>

          {description && (
            <p class="text-sm text-base-content/70 truncate mt-1">
              {description}
            </p>
          )}

          <div class="flex items-center gap-4 text-xs text-base-content/50 mt-1">
            <span>{formatFileSize(file.file_size)}</span>
            <span>{formatDate(file.updated_at)}</span>
          </div>
        </div>

        <div class="flex-shrink-0">
          {renderActionMenu(file, onShare, onDelete, onEdit, onDownload, onPreview)}
        </div>
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div
        role={itemRole}
        tabIndex={0}
        aria-label={fullAriaLabel}
        aria-selected={ariaSelected}
        data-item-index={index}
        class={`flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:bg-primary/10 ${
          selected ? "bg-primary/10 ring-2 ring-primary" : ""
        } ${className}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
      >
        <div class="flex-shrink-0">
          <LazyThumbnail
            file={file}
            size="small"
            onClick={handleClick}
            showPreviewIndicator
          />
        </div>

        <div class="flex-1 min-w-0 grid grid-cols-4 gap-4 items-center">
          <div class="flex items-center gap-2 min-w-0">
            {emoji && <span class="text-sm">{emoji}</span>}
            <span class="font-medium text-base-content truncate">
              {displayName}
            </span>
          </div>

          <div class="text-sm text-base-content/70 truncate">
            {description || "—"}
          </div>

          <div class="text-sm text-base-content/50">
            {formatFileSize(file.file_size)}
          </div>

          <div class="text-sm text-base-content/50">
            {formatDate(file.updated_at)}
          </div>
        </div>

        <div class="flex-shrink-0">
          {renderActionMenu(file, onShare, onDelete, onEdit, onDownload, onPreview)}
        </div>
      </div>
    );
  }

  // Grid layout
  const cardSize = getCardSize(size);

  return (
    <div
      role={itemRole}
      tabIndex={0}
      aria-label={fullAriaLabel}
      aria-selected={ariaSelected}
      data-item-index={index}
      class={`${cardSize} cursor-pointer transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-lg ${
        selected ? "ring-2 ring-primary bg-primary/5" : ""
      } ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
    >
      <Card>
        <div class="p-4 h-full flex flex-col">
          <div class="flex-1 flex flex-col items-center text-center">
            <div class="mb-3">
              <LazyThumbnail
                file={file}
                size={size}
                onClick={handleClick}
                showPreviewIndicator
              />
            </div>

            <div class="flex items-center gap-1 mb-2">
              {emoji && <span class="text-lg">{emoji}</span>}
              <h3 class="font-medium text-base-content truncate max-w-full">
                {displayName}
              </h3>
            </div>

            {description && (
              <p class="text-sm text-base-content/70 line-clamp-2 mb-2">
                {description}
              </p>
            )}

            <div class="flex items-center gap-2 text-xs text-base-content/50">
              <Badge variant="outline" size="xs">
                {getFileTypeLabel(file.mime_type)}
              </Badge>
              <span>{formatFileSize(file.file_size)}</span>
            </div>
          </div>

          <div class="flex justify-between items-center mt-3 pt-3 border-t border-base-300">
            <span class="text-xs text-base-content/50">
              {formatDate(file.updated_at)}
            </span>

            {renderActionMenu(file, onShare, onDelete, onEdit, onDownload, onPreview)}
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Render action menu dropdown
 */
function renderActionMenu(
  file: StorageObject,
  onShare?: (file: StorageObject) => void,
  onDelete?: (file: StorageObject) => void,
  onEdit?: (file: StorageObject) => void,
  onDownload?: (file: StorageObject) => void,
  onPreview?: (file: StorageObject) => void,
) {
  const previewInfo = getPreviewInfo(file);
  const fileName = file.metadata?.custom_name || file.name;

  const actions = [
    previewInfo.canPreview && onPreview && {
      label: "Preview",
      icon: "👁️",
      action: () => onPreview(file),
      ariaLabel: ScreenReaderUtils.getActionLabel("Preview", fileName, "file"),
    },
    onDownload && {
      label: "Download",
      icon: "⬇️",
      action: () => onDownload(file),
      ariaLabel: ScreenReaderUtils.getActionLabel("Download", fileName, "file"),
    },
    onEdit && {
      label: "Edit",
      icon: "✏️",
      action: () => onEdit(file),
      ariaLabel: ScreenReaderUtils.getActionLabel("Edit", fileName, "file"),
    },
    onShare && {
      label: "Share",
      icon: "🔗",
      action: () => onShare(file),
      ariaLabel: ScreenReaderUtils.getActionLabel("Share", fileName, "file"),
    },
    onDelete && {
      label: "Delete",
      icon: "🗑️",
      action: () => onDelete(file),
      danger: true,
      ariaLabel: ScreenReaderUtils.getActionLabel("Delete", fileName, "file"),
    },
  ].filter(Boolean);

  if (actions.length === 0) return null;

  return (
    <Dropdown
      trigger={
        <button
          class="btn btn-ghost btn-sm btn-square"
          aria-label={`Actions for file ${fileName}`}
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <span aria-hidden="true">⋯</span>
          <span class="sr-only">More actions</span>
        </button>
      }
      content={
        <ul role="menu" aria-label={`Actions for ${fileName}`}>
          {actions.map((action, index) => (
            action && (
              <li key={index} role="none">
                <button
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.action();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
                      e.preventDefault();
                      e.stopPropagation();
                      action.action();
                    }
                  }}
                  class={`w-full text-left px-4 py-2 hover:bg-base-200 focus:bg-base-200 focus:outline-none ${
                    action.danger ? "text-error hover:bg-error/10 focus:bg-error/10" : ""
                  }`}
                  aria-label={action.ariaLabel}
                >
                  <span class="mr-2" aria-hidden="true">{action.icon}</span>
                  {action.label}
                </button>
              </li>
            )
          ))}
        </ul>
      }
    />
  );
}

/**
 * Get card size classes based on size prop
 */
function getCardSize(size: "small" | "medium" | "large"): string {
  switch (size) {
    case "small":
      return "w-32 h-40";
    case "medium":
      return "w-40 h-48";
    case "large":
      return "w-48 h-56";
    default:
      return "w-40 h-48";
  }
}

/**
 * Get file type icon based on MIME type
 */
function getFileTypeIcon(mimeType: string): string {
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
 * Get human-readable file type label
 */
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

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format date in human-readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString();
}
