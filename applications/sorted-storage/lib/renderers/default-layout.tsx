/**
 * Default grid layout renderer
 * Requirements: 2.1, 2.3, 2.4
 */

import { ComponentChildren } from "preact";
import type { LayoutOptions, LayoutRenderer, StorageObject } from "../../types/storage.ts";
import { formatDate, formatFileSize, getFileTypeIcon } from "../layout-manager.ts";

/**
 * Default grid layout renderer implementation
 */
export const defaultLayoutRenderer: LayoutRenderer = {
  name: "default",
  displayName: "Grid View",
  render: (items: StorageObject[], options: LayoutOptions): ComponentChildren => {
    return (
      <div class={`grid gap-4 ${getGridClasses(options.itemSize)}`}>
        {items.map((item) => (
          <DefaultItemCard
            key={item.id}
            item={item}
            options={options}
          />
        ))}
      </div>
    );
  },
};

/**
 * Get CSS grid classes based on item size
 */
function getGridClasses(itemSize: LayoutOptions["itemSize"]): string {
  switch (itemSize) {
    case "small":
      return "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8";
    case "medium":
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
    case "large":
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    default:
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
  }
}

/**
 * Individual item card component for default layout
 */
interface DefaultItemCardProps {
  item: StorageObject;
  options: LayoutOptions;
}

function DefaultItemCard({ item, options }: DefaultItemCardProps) {
  const displayName = item.metadata.custom_name || item.name;
  const emoji = item.metadata.emoji;
  const description = item.metadata.description;
  const fileIcon = getFileTypeIcon(item.mime_type, item.object_type);

  return (
    <div
      class={`
        card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer
        border border-base-300 hover:border-primary/20
        ${getCardSizeClasses(options.itemSize)}
      `}
      data-item-id={item.id}
      data-item-type={item.object_type}
    >
      <div class="card-body p-3">
        {/* Thumbnail or Icon */}
        <div
          class={`flex items-center justify-center ${getThumbnailSizeClasses(options.itemSize)}`}
        >
          {options.showThumbnails && item.thumbnail_url
            ? (
              <img
                src={item.thumbnail_url}
                alt={displayName}
                class="w-full h-full object-cover rounded"
                loading="lazy"
              />
            )
            : (
              <div class="text-4xl">
                {emoji || fileIcon}
              </div>
            )}
        </div>

        {/* Item Info */}
        <div class="flex-1 min-h-0">
          <h3 class="font-medium text-sm truncate" title={displayName}>
            {displayName}
          </h3>

          {description && options.itemSize !== "small" && (
            <p class="text-xs text-base-content/70 mt-1 line-clamp-2" title={description}>
              {description}
            </p>
          )}

          {options.itemSize === "large" && (
            <div class="mt-2 space-y-1">
              <div class="flex justify-between text-xs text-base-content/60">
                <span>Size:</span>
                <span>{formatFileSize(item.file_size)}</span>
              </div>
              <div class="flex justify-between text-xs text-base-content/60">
                <span>Modified:</span>
                <span>{formatDate(item.updated_at)}</span>
              </div>
              {item.object_type === "folder" && (
                <div class="flex justify-between text-xs text-base-content/60">
                  <span>Type:</span>
                  <span>Folder</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {options.itemSize !== "small" && (
          <div class="flex justify-end gap-1 mt-2">
            <button
              class="btn btn-ghost btn-xs"
              title="Share"
              data-action="share"
              data-item-id={item.id}
            >
              🔗
            </button>
            <button
              class="btn btn-ghost btn-xs"
              title="More options"
              data-action="menu"
              data-item-id={item.id}
            >
              ⋯
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get card size classes based on item size option
 */
function getCardSizeClasses(itemSize: LayoutOptions["itemSize"]): string {
  switch (itemSize) {
    case "small":
      return "h-24";
    case "medium":
      return "h-32";
    case "large":
      return "h-48";
    default:
      return "h-32";
  }
}

/**
 * Get thumbnail container size classes
 */
function getThumbnailSizeClasses(itemSize: LayoutOptions["itemSize"]): string {
  switch (itemSize) {
    case "small":
      return "h-12 w-12 mb-1";
    case "medium":
      return "h-16 w-16 mb-2";
    case "large":
      return "h-20 w-20 mb-3";
    default:
      return "h-16 w-16 mb-2";
  }
}
