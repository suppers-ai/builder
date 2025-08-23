/**
 * Layout switcher component for switching between different layout views
 * Requirements: 2.4, 2.5, 7.5, 8.4
 */

import type { LayoutOptions, LayoutType } from "../types/storage.ts";
import { layoutManager } from "../lib/layout-manager.ts";
import { ScreenReaderUtils } from "../lib/accessibility-utils.ts";

interface LayoutSwitcherProps {
  currentLayout: LayoutType;
  layoutOptions: LayoutOptions;
  onLayoutChange: (layout: LayoutType) => void;
  onOptionsChange: (options: Partial<LayoutOptions>) => void;
  className?: string;
}

export function LayoutSwitcher({
  currentLayout,
  layoutOptions,
  onLayoutChange,
  onOptionsChange,
  className = "",
}: LayoutSwitcherProps) {
  const renderers = layoutManager.getRenderers();
  const sortOptions = layoutManager.getSortOptions();
  const itemSizeOptions = layoutManager.getItemSizeOptions();

  return (
    <div class={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Layout Type Selector */}
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-base-content/70" id="layout-selector-label">
          View:
        </span>
        <div class="btn-group" role="radiogroup" aria-labelledby="layout-selector-label">
          {renderers.map((renderer) => (
            <button
              key={renderer.name}
              role="radio"
              aria-checked={currentLayout === renderer.name ? "true" : "false"}
              class={`btn btn-sm ${currentLayout === renderer.name ? "btn-active" : "btn-outline"}`}
              onClick={() => {
                onLayoutChange(renderer.name as LayoutType);
                ScreenReaderUtils.announce(`Switched to ${renderer.displayName} view`);
              }}
              aria-label={`Switch to ${renderer.displayName} view`}
              title={renderer.displayName}
            >
              <span aria-hidden="true">{getLayoutIcon(renderer.name)}</span>
              <span class="hidden sm:inline ml-1">{renderer.displayName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-base-content/70" for="sort-select">Sort:</label>
        <select
          id="sort-select"
          class="select select-sm select-bordered"
          value={layoutOptions.sortBy}
          onChange={(e) => {
            const newSortBy = e.currentTarget.value as LayoutOptions["sortBy"];
            onOptionsChange({ sortBy: newSortBy });
            ScreenReaderUtils.announce(
              `Sorting by ${e.currentTarget.selectedOptions[0].textContent}`,
            );
          }}
          aria-label="Sort files and folders by"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          class={`btn btn-sm btn-square ${
            layoutOptions.sortOrder === "desc" ? "btn-active" : "btn-outline"
          }`}
          onClick={() => {
            const newOrder = layoutOptions.sortOrder === "asc" ? "desc" : "asc";
            onOptionsChange({ sortOrder: newOrder });
            ScreenReaderUtils.announce(
              `Sort order changed to ${newOrder === "asc" ? "ascending" : "descending"}`,
            );
          }}
          aria-label={`Sort ${layoutOptions.sortOrder === "asc" ? "descending" : "ascending"}`}
          title={`Sort ${layoutOptions.sortOrder === "asc" ? "Descending" : "Ascending"}`}
        >
          <span aria-hidden="true">{layoutOptions.sortOrder === "asc" ? "↑" : "↓"}</span>
          <span class="sr-only">
            {layoutOptions.sortOrder === "asc" ? "Ascending" : "Descending"}
          </span>
        </button>
      </div>

      {/* Item Size Options (for grid layout) */}
      {currentLayout === "default" && (
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-base-content/70" id="size-selector-label">
            Size:
          </span>
          <div class="btn-group" role="radiogroup" aria-labelledby="size-selector-label">
            {itemSizeOptions.map((option) => (
              <button
                key={option.value}
                role="radio"
                aria-checked={layoutOptions.itemSize === option.value ? "true" : "false"}
                class={`btn btn-sm ${
                  layoutOptions.itemSize === option.value ? "btn-active" : "btn-outline"
                }`}
                onClick={() => {
                  onOptionsChange({ itemSize: option.value });
                  ScreenReaderUtils.announce(`Item size changed to ${option.label}`);
                }}
                aria-label={`Set item size to ${option.label}`}
                title={option.label}
              >
                <span aria-hidden="true">{getSizeIcon(option.value)}</span>
                <span class="sr-only">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Additional Options */}
      <div class="flex items-center gap-2">
        <label class="label cursor-pointer gap-2">
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            checked={layoutOptions.showThumbnails}
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              onOptionsChange({ showThumbnails: checked });
              ScreenReaderUtils.announce(`Thumbnails ${checked ? "enabled" : "disabled"}`);
            }}
            aria-describedby="thumbnails-description"
          />
          <span class="label-text text-sm">Thumbnails</span>
        </label>
        <span id="thumbnails-description" class="sr-only">
          Toggle thumbnail previews for images and files
        </span>
      </div>

      {/* View Options Dropdown */}
      <div class="dropdown dropdown-end">
        <button
          tabIndex={0}
          class="btn btn-sm btn-ghost"
          aria-label="View options menu"
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <span aria-hidden="true">⚙️</span>
          <span class="hidden sm:inline ml-1">Options</span>
        </button>
        <ul
          tabIndex={0}
          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          role="menu"
          aria-label="View options"
        >
          <li role="none">
            <label
              class="label cursor-pointer justify-start"
              role="menuitemcheckbox"
              aria-checked={layoutOptions.showThumbnails ? "true" : "false"}
            >
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={layoutOptions.showThumbnails}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  onOptionsChange({ showThumbnails: checked });
                  ScreenReaderUtils.announce(`Thumbnails ${checked ? "enabled" : "disabled"}`);
                }}
                aria-label="Show thumbnails"
              />
              <span class="label-text">Show Thumbnails</span>
            </label>
          </li>
          <li class="menu-title" role="none">
            <span>Display Options</span>
          </li>
          <li role="none">
            <button
              role="menuitemradio"
              aria-checked={layoutOptions.itemSize === "small" ? "true" : "false"}
              onClick={() => {
                onOptionsChange({ itemSize: "small" });
                ScreenReaderUtils.announce("Item size changed to small");
              }}
              class="w-full text-left"
            >
              <span class={layoutOptions.itemSize === "small" ? "font-bold" : ""}>
                Small Items
              </span>
            </button>
          </li>
          <li role="none">
            <button
              role="menuitemradio"
              aria-checked={layoutOptions.itemSize === "medium" ? "true" : "false"}
              onClick={() => {
                onOptionsChange({ itemSize: "medium" });
                ScreenReaderUtils.announce("Item size changed to medium");
              }}
              class="w-full text-left"
            >
              <span class={layoutOptions.itemSize === "medium" ? "font-bold" : ""}>
                Medium Items
              </span>
            </button>
          </li>
          <li role="none">
            <button
              role="menuitemradio"
              aria-checked={layoutOptions.itemSize === "large" ? "true" : "false"}
              onClick={() => {
                onOptionsChange({ itemSize: "large" });
                ScreenReaderUtils.announce("Item size changed to large");
              }}
              class="w-full text-left"
            >
              <span class={layoutOptions.itemSize === "large" ? "font-bold" : ""}>
                Large Items
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Get icon for layout type
 */
function getLayoutIcon(layoutName: string): string {
  switch (layoutName) {
    case "default":
      return "⊞";
    case "timeline":
      return "📅";
    default:
      return "⊞";
  }
}

/**
 * Get icon for item size
 */
function getSizeIcon(size: LayoutOptions["itemSize"]): string {
  switch (size) {
    case "small":
      return "▪";
    case "medium":
      return "◼";
    case "large":
      return "⬛";
    default:
      return "◼";
  }
}
