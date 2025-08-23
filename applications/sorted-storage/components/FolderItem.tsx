/**
 * FolderItem component with item count and navigation
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.2, 7.3, 7.5, 8.4
 */

import type { StorageObject } from "../types/storage.ts";
import { Badge, Card, Dropdown, Tooltip } from "@suppers/ui-lib";
import { KEYBOARD_KEYS, ScreenReaderUtils } from "../lib/accessibility-utils.ts";

interface FolderItemProps {
  folder: StorageObject;
  layout: "grid" | "list" | "timeline";
  size: "small" | "medium" | "large";
  itemCount: number;
  selected?: boolean;
  index?: number;
  onOpen?: (folder: StorageObject) => void;
  onShare?: (folder: StorageObject) => void;
  onDelete?: (folder: StorageObject) => void;
  onEdit?: (folder: StorageObject) => void;
  onKeyDown?: (event: KeyboardEvent, index: number) => void;
  className?: string;
}

export function FolderItem({
  folder,
  layout,
  size,
  itemCount,
  selected = false,
  index = 0,
  onOpen,
  onShare,
  onDelete,
  onEdit,
  onKeyDown,
  className = "",
}: FolderItemProps) {
  const displayName = folder.metadata?.custom_name || folder.name;
  const description = folder.metadata?.description;
  const emoji = folder.metadata?.emoji;
  const folderColor = folder.metadata?.folder_color || "primary";

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    onOpen?.(folder);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle folder-specific keyboard interactions
    switch (e.key) {
      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        e.preventDefault();
        onOpen?.(folder);
        break;
      case KEYBOARD_KEYS.DELETE:
      case KEYBOARD_KEYS.BACKSPACE:
        e.preventDefault();
        onDelete?.(folder);
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
  const folderDescription = `${
    folder.metadata?.emoji || "📁"
  } ${displayName}, folder with ${itemCount} ${itemCount === 1 ? "item" : "items"}${
    description ? `, ${description}` : ""
  }, modified ${formatDateForScreenReader(folder.updated_at)}`;
  const ariaLabel = `${folderDescription}. Press Enter to open folder`;

  // Generate role and ARIA attributes
  const itemRole = layout === "grid" ? "gridcell" : "listitem";
  const ariaSelected = selected ? "true" : "false";

  if (layout === "timeline") {
    return (
      <div
        role={itemRole}
        tabIndex={0}
        aria-label={ariaLabel}
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
          {renderFolderIcon(folderColor, emoji, "small")}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-medium text-base-content truncate">
              {displayName}
            </span>
            <Badge variant="outline" size="sm">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Badge>
          </div>

          {description && (
            <p class="text-sm text-base-content/70 truncate mt-1">
              {description}
            </p>
          )}

          <div class="flex items-center gap-4 text-xs text-base-content/50 mt-1">
            <span>Folder</span>
            <span>{formatDate(folder.updated_at)}</span>
          </div>
        </div>

        <div class="flex-shrink-0">
          {renderActionMenu(folder, onShare, onDelete, onEdit)}
        </div>
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div
        role={itemRole}
        tabIndex={0}
        aria-label={ariaLabel}
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
          {renderFolderIcon(folderColor, emoji, "small")}
        </div>

        <div class="flex-1 min-w-0 grid grid-cols-4 gap-4 items-center">
          <div class="flex items-center gap-2 min-w-0">
            <span class="font-medium text-base-content truncate">
              {displayName}
            </span>
          </div>

          <div class="text-sm text-base-content/70 truncate">
            {description || "—"}
          </div>

          <div class="text-sm text-base-content/50">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </div>

          <div class="text-sm text-base-content/50">
            {formatDate(folder.updated_at)}
          </div>
        </div>

        <div class="flex-shrink-0">
          {renderActionMenu(folder, onShare, onDelete, onEdit)}
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
      aria-label={ariaLabel}
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
              {renderFolderIcon(folderColor, emoji, size)}
            </div>

            <h3 class="font-medium text-base-content truncate max-w-full mb-2">
              {displayName}
            </h3>

            {description && (
              <p class="text-sm text-base-content/70 line-clamp-2 mb-2">
                {description}
              </p>
            )}

            <Badge variant="outline" size="sm">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Badge>
          </div>

          <div class="flex justify-between items-center mt-3 pt-3 border-t border-base-300">
            <span class="text-xs text-base-content/50">
              {formatDate(folder.updated_at)}
            </span>

            {renderActionMenu(folder, onShare, onDelete, onEdit)}
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Render folder icon with color and emoji
 */
function renderFolderIcon(
  color: string,
  emoji: string | undefined,
  size: "small" | "medium" | "large",
) {
  const sizeClass = {
    small: "w-8 h-8 text-2xl",
    medium: "w-12 h-12 text-3xl",
    large: "w-16 h-16 text-4xl",
  }[size];

  const colorClass = getFolderColorClass(color);

  if (emoji) {
    return (
      <div class={`${sizeClass} flex items-center justify-center ${colorClass} rounded-lg`}>
        <span class="text-lg">{emoji}</span>
      </div>
    );
  }

  return (
    <div class={`${sizeClass} flex items-center justify-center ${colorClass} rounded-lg`}>
      <span>📁</span>
    </div>
  );
}

/**
 * Render action menu dropdown
 */
function renderActionMenu(
  folder: StorageObject,
  onShare?: (folder: StorageObject) => void,
  onDelete?: (folder: StorageObject) => void,
  onEdit?: (folder: StorageObject) => void,
) {
  const folderName = folder.metadata?.custom_name || folder.name;

  const actions = [
    onEdit && {
      label: "Edit",
      icon: "✏️",
      action: () => onEdit(folder),
      ariaLabel: ScreenReaderUtils.getActionLabel("Edit", folderName, "folder"),
    },
    onShare && {
      label: "Share",
      icon: "🔗",
      action: () => onShare(folder),
      ariaLabel: ScreenReaderUtils.getActionLabel("Share", folderName, "folder"),
    },
    onDelete && {
      label: "Delete",
      icon: "🗑️",
      action: () => onDelete(folder),
      danger: true,
      ariaLabel: ScreenReaderUtils.getActionLabel("Delete", folderName, "folder"),
    },
  ].filter(Boolean);

  if (actions.length === 0) return null;

  return (
    <Dropdown
      trigger={
        <button
          class="btn btn-ghost btn-sm btn-square"
          aria-label={`Actions for folder ${folderName}`}
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <span aria-hidden="true">⋯</span>
          <span class="sr-only">More actions</span>
        </button>
      }
      content={
        <ul role="menu" aria-label={`Actions for ${folderName}`}>
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
 * Get folder color class
 */
function getFolderColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/20 text-primary",
    secondary: "bg-secondary/20 text-secondary",
    accent: "bg-accent/20 text-accent",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    error: "bg-error/20 text-error",
    info: "bg-info/20 text-info",
    neutral: "bg-neutral/20 text-neutral",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    pink: "bg-pink-100 text-pink-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return colorMap[color] || colorMap.primary;
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

/**
 * Format date for screen readers
 */
function formatDateForScreenReader(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString();
}
