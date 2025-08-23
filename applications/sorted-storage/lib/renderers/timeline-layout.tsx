/**
 * Timeline layout renderer with date grouping
 * Requirements: 2.2, 2.3, 2.4
 */

import { ComponentChildren } from "preact";
import type { LayoutOptions, LayoutRenderer, StorageObject } from "../../types/storage.ts";
import {
  formatDate,
  formatFileSize,
  getFileTypeIcon,
  groupItemsByDate,
} from "../layout-manager.ts";

/**
 * Timeline layout renderer implementation
 */
export const timelineLayoutRenderer: LayoutRenderer = {
  name: "timeline",
  displayName: "Timeline View",
  render: (items: StorageObject[], options: LayoutOptions): ComponentChildren => {
    const groupedItems = groupItemsByDate(items);
    const sortedGroups = Array.from(groupedItems.entries()).sort(([a], [b]) => {
      return getGroupSortOrder(a) - getGroupSortOrder(b);
    });

    return (
      <div class="space-y-6">
        {sortedGroups.map(([dateGroup, groupItems]) => (
          <TimelineGroup
            key={dateGroup}
            dateGroup={dateGroup}
            items={groupItems}
            options={options}
          />
        ))}
      </div>
    );
  },
};

/**
 * Get sort order for date groups (lower number = more recent)
 */
function getGroupSortOrder(dateGroup: string): number {
  switch (dateGroup) {
    case "Today":
      return 0;
    case "Yesterday":
      return 1;
    case "This Week":
      return 2;
    case "This Month":
      return 3;
    default:
      // For month/year groups, parse and sort by date
      if (dateGroup.includes(" ")) {
        const [month, year] = dateGroup.split(" ");
        const monthIndex = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].indexOf(month);
        return (parseInt(year) * 12) + monthIndex + 1000;
      }
      // Year only
      return parseInt(dateGroup) + 10000;
  }
}

/**
 * Timeline group component
 */
interface TimelineGroupProps {
  dateGroup: string;
  items: StorageObject[];
  options: LayoutOptions;
}

function TimelineGroup({ dateGroup, items, options }: TimelineGroupProps) {
  return (
    <div class="timeline-group">
      {/* Group Header */}
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 bg-primary rounded-full"></div>
        <h2 class="text-lg font-semibold text-base-content">
          {dateGroup}
        </h2>
        <div class="flex-1 h-px bg-base-300"></div>
        <span class="text-sm text-base-content/60">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Group Items */}
      <div class="ml-6 space-y-2">
        {items.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            options={options}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual timeline item component
 */
interface TimelineItemProps {
  item: StorageObject;
  options: LayoutOptions;
}

function TimelineItem({ item, options }: TimelineItemProps) {
  const displayName = item.metadata.custom_name || item.name;
  const emoji = item.metadata.emoji;
  const description = item.metadata.description;
  const fileIcon = getFileTypeIcon(item.mime_type, item.object_type);

  return (
    <div
      class="
        flex items-center gap-3 p-3 rounded-lg bg-base-100 hover:bg-base-200
        border border-base-300 hover:border-primary/20 transition-colors cursor-pointer
      "
      data-item-id={item.id}
      data-item-type={item.object_type}
    >
      {/* Timeline Indicator */}
      <div class="flex-shrink-0">
        <div class="w-2 h-2 bg-primary/60 rounded-full"></div>
      </div>

      {/* Thumbnail or Icon */}
      <div class="flex-shrink-0">
        {options.showThumbnails && item.thumbnail_url
          ? (
            <img
              src={item.thumbnail_url}
              alt={displayName}
              class="w-10 h-10 object-cover rounded"
              loading="lazy"
            />
          )
          : (
            <div class="w-10 h-10 flex items-center justify-center text-2xl">
              {emoji || fileIcon}
            </div>
          )}
      </div>

      {/* Item Info */}
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-sm truncate" title={displayName}>
              {displayName}
            </h3>
            {description && (
              <p class="text-xs text-base-content/70 mt-1 line-clamp-1" title={description}>
                {description}
              </p>
            )}
          </div>

          <div class="flex-shrink-0 ml-3 text-right">
            <div class="text-xs text-base-content/60">
              {formatDate(item.updated_at)}
            </div>
            <div class="text-xs text-base-content/60 mt-1">
              {formatFileSize(item.file_size)}
            </div>
          </div>
        </div>

        {/* Additional metadata for larger items */}
        {options.itemSize === "large" && (
          <div class="flex items-center gap-4 mt-2 text-xs text-base-content/60">
            <span>Type: {item.object_type === "folder" ? "Folder" : item.mime_type}</span>
            {item.metadata.tags && item.metadata.tags.length > 0 && (
              <div class="flex gap-1">
                {item.metadata.tags.slice(0, 3).map((tag) => (
                  <span key={tag} class="badge badge-xs badge-outline">
                    {tag}
                  </span>
                ))}
                {item.metadata.tags.length > 3 && (
                  <span class="text-xs">+{item.metadata.tags.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div class="flex-shrink-0 flex gap-1">
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
    </div>
  );
}
