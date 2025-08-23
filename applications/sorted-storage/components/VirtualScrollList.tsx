/**
 * Virtual scrolling component for large file lists
 * Optimizes performance by only rendering visible items
 * Requirements: 8.1, 8.5
 */

import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { ComponentChildren } from "preact";

interface VirtualScrollListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => ComponentChildren;
  overscan?: number;
  className?: string;
}

interface ScrollState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
  visibleItems: any[];
}

export function VirtualScrollList({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = "",
}: VirtualScrollListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollTop: 0,
    startIndex: 0,
    endIndex: 0,
    visibleItems: [],
  });

  // Calculate visible range
  const calculateVisibleRange = useCallback((scrollTop: number) => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1,
    );

    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex + 1),
    };
  }, [items, itemHeight, containerHeight, overscan]);

  // Handle scroll events
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;

    const range = calculateVisibleRange(scrollTop);
    setScrollState({
      scrollTop,
      ...range,
    });
  }, [calculateVisibleRange]);

  // Initialize visible range
  useEffect(() => {
    const range = calculateVisibleRange(0);
    setScrollState({
      scrollTop: 0,
      ...range,
    });
  }, [calculateVisibleRange]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const totalHeight = items.length * itemHeight;
  const offsetY = scrollState.startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {scrollState.visibleItems.map((item, index) => (
            <div
              key={scrollState.startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, scrollState.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Grid virtual scrolling component for grid layouts
 */
interface VirtualGridProps {
  items: any[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => ComponentChildren;
  gap?: number;
  overscan?: number;
  className?: string;
}

export function VirtualGrid({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 16,
  overscan = 5,
  className = "",
}: VirtualGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    scrollTop: 0,
    visibleItems: [] as any[],
    visibleIndices: [] as number[],
  });

  // Calculate grid dimensions
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const rowHeight = itemHeight + gap;

  // Calculate visible range
  const calculateVisibleRange = useCallback((scrollTop: number) => {
    const visibleStartRow = Math.floor(scrollTop / rowHeight);
    const visibleEndRow = Math.min(
      visibleStartRow + Math.ceil(containerHeight / rowHeight),
      totalRows - 1,
    );

    const startRow = Math.max(0, visibleStartRow - overscan);
    const endRow = Math.min(totalRows - 1, visibleEndRow + overscan);

    const startIndex = startRow * columnsPerRow;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * columnsPerRow - 1);

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const visibleIndices = Array.from(
      { length: endIndex - startIndex + 1 },
      (_, i) => startIndex + i,
    );

    return {
      visibleItems,
      visibleIndices,
      startRow,
      endRow,
    };
  }, [items, rowHeight, containerHeight, totalRows, columnsPerRow, overscan]);

  // Handle scroll events
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;

    const range = calculateVisibleRange(scrollTop);
    setScrollState({
      scrollTop,
      visibleItems: range.visibleItems,
      visibleIndices: range.visibleIndices,
    });
  }, [calculateVisibleRange]);

  // Initialize visible range
  useEffect(() => {
    const range = calculateVisibleRange(0);
    setScrollState({
      scrollTop: 0,
      visibleItems: range.visibleItems,
      visibleIndices: range.visibleIndices,
    });
  }, [calculateVisibleRange]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const totalHeight = totalRows * rowHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {scrollState.visibleItems.map((item, index) => {
          const actualIndex = scrollState.visibleIndices[index];
          const row = Math.floor(actualIndex / columnsPerRow);
          const col = actualIndex % columnsPerRow;

          return (
            <div
              key={actualIndex}
              style={{
                position: "absolute",
                left: col * (itemWidth + gap),
                top: row * rowHeight,
                width: itemWidth,
                height: itemHeight,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
