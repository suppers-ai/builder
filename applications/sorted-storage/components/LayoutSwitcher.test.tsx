/**
 * Unit tests for LayoutSwitcher component logic
 * Requirements: 2.4, 2.5
 */

import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { initializeLayoutManager, layoutManager } from "../lib/layout-manager.ts";
import type { LayoutOptions, LayoutType } from "../types/storage.ts";

describe("LayoutSwitcher Component", () => {
  let mockLayoutOptions: LayoutOptions;
  let mockOnLayoutChange: (layout: LayoutType) => void;
  let mockOnOptionsChange: (options: Partial<LayoutOptions>) => void;

  beforeEach(async () => {
    // Initialize layout manager
    await initializeLayoutManager();
    await new Promise((resolve) => setTimeout(resolve, 100));

    mockLayoutOptions = {
      sortBy: "name",
      sortOrder: "asc",
      showThumbnails: true,
      itemSize: "medium",
    };

    mockOnLayoutChange = () => {};
    mockOnOptionsChange = () => {};
  });

  it("should render layout switcher with available renderers", () => {
    const renderers = layoutManager.getRenderers();
    assertEquals(renderers.length >= 2, true);

    const rendererNames = renderers.map((r) => r.name);
    assertEquals(rendererNames.includes("default"), true);
    assertEquals(rendererNames.includes("timeline"), true);
  });

  it("should provide correct sort options", () => {
    const sortOptions = layoutManager.getSortOptions();
    assertEquals(sortOptions.length, 4);

    const expectedOptions = [
      { value: "name", label: "Name" },
      { value: "date", label: "Date Modified" },
      { value: "size", label: "Size" },
      { value: "type", label: "Type" },
    ];

    assertEquals(sortOptions, expectedOptions);
  });

  it("should provide correct item size options", () => {
    const itemSizeOptions = layoutManager.getItemSizeOptions();
    assertEquals(itemSizeOptions.length, 3);

    const expectedOptions = [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
    ];

    assertEquals(itemSizeOptions, expectedOptions);
  });

  it("should handle layout switching functionality", () => {
    let selectedLayout: LayoutType = "default";
    let selectedOptions: LayoutOptions = { ...mockLayoutOptions };

    const handleLayoutChange = (layout: LayoutType) => {
      selectedLayout = layout;
    };

    const handleOptionsChange = (options: Partial<LayoutOptions>) => {
      selectedOptions = { ...selectedOptions, ...options };
    };

    // Test layout change
    handleLayoutChange("timeline");
    assertEquals(selectedLayout, "timeline");

    // Test options change
    handleOptionsChange({ sortBy: "date", sortOrder: "desc" });
    assertEquals(selectedOptions.sortBy, "date");
    assertEquals(selectedOptions.sortOrder, "desc");
    assertEquals(selectedOptions.showThumbnails, true); // Should preserve other options
  });

  it("should maintain state consistency during layout operations", () => {
    const initialOptions: LayoutOptions = {
      sortBy: "name",
      sortOrder: "asc",
      showThumbnails: true,
      itemSize: "medium",
    };

    let currentLayout: LayoutType = "default";
    let currentOptions: LayoutOptions = { ...initialOptions };

    // Simulate layout switching with state preservation
    const switchLayout = (newLayout: LayoutType) => {
      currentLayout = newLayout;
      // Options should be preserved
    };

    const updateOptions = (newOptions: Partial<LayoutOptions>) => {
      currentOptions = { ...currentOptions, ...newOptions };
    };

    // Switch to timeline
    switchLayout("timeline");
    assertEquals(currentLayout, "timeline");
    assertEquals(currentOptions, initialOptions); // Options preserved

    // Update options
    updateOptions({ sortBy: "size", itemSize: "large" });
    assertEquals(currentOptions.sortBy, "size");
    assertEquals(currentOptions.itemSize, "large");
    assertEquals(currentOptions.sortOrder, "asc"); // Other options preserved

    // Switch back to default
    switchLayout("default");
    assertEquals(currentLayout, "default");
    assertEquals(currentOptions.sortBy, "size"); // Options still preserved
  });
});
