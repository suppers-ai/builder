/**
 * Paginated list component with lazy loading
 * Implements pagination and infinite scroll for better performance
 * Requirements: 8.1, 8.3, 8.5
 */

import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import { Button, Loading } from "@suppers/ui-lib";

interface PaginatedListProps<T> {
  items: T[];
  pageSize: number;
  renderItem: (item: T, index: number) => ComponentChildren;
  loadMore?: () => Promise<void>;
  hasMore?: boolean;
  isLoading?: boolean;
  infiniteScroll?: boolean;
  className?: string;
  emptyState?: ComponentChildren;
}

interface PaginationState {
  currentPage: number;
  visibleItems: any[];
  isLoadingMore: boolean;
}

export function PaginatedList<T>({
  items,
  pageSize,
  renderItem,
  loadMore,
  hasMore = false,
  isLoading = false,
  infiniteScroll = true,
  className = "",
  emptyState,
}: PaginatedListProps<T>) {
  const [state, setState] = useState<PaginationState>({
    currentPage: 1,
    visibleItems: items.slice(0, pageSize),
    isLoadingMore: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Update visible items when items or page changes
  useEffect(() => {
    const endIndex = state.currentPage * pageSize;
    setState((prev) => ({
      ...prev,
      visibleItems: items.slice(0, endIndex),
    }));
  }, [items, state.currentPage, pageSize]);

  // Load more items
  const handleLoadMore = useCallback(async () => {
    if (state.isLoadingMore || isLoading) return;

    // Check if we have more items in current data
    const nextPageEndIndex = (state.currentPage + 1) * pageSize;
    if (nextPageEndIndex <= items.length) {
      setState((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
      return;
    }

    // Load more data from API if available
    if (loadMore && hasMore) {
      setState((prev) => ({ ...prev, isLoadingMore: true }));
      try {
        await loadMore();
      } catch (error) {
        console.error("Failed to load more items:", error);
      } finally {
        setState((prev) => ({ ...prev, isLoadingMore: false }));
      }
    }
  }, [
    state.isLoadingMore,
    state.currentPage,
    pageSize,
    items.length,
    loadMore,
    hasMore,
    isLoading,
  ]);

  // Infinite scroll observer
  useEffect(() => {
    if (!infiniteScroll || !loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !state.isLoadingMore && !isLoading) {
          handleLoadMore();
        }
      },
      {
        root: containerRef.current,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observer.observe(loadingRef.current);

    return () => observer.disconnect();
  }, [infiniteScroll, state.isLoadingMore, isLoading, handleLoadMore]);

  // Show empty state
  if (items.length === 0 && !isLoading) {
    return emptyState || (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-semibold mb-2">No items found</h3>
        <p className="text-base-content/70">
          There are no items to display.
        </p>
      </div>
    );
  }

  const showLoadMoreButton = !infiniteScroll && (
    state.currentPage * pageSize < items.length || hasMore
  );

  const showInfiniteLoader = infiniteScroll && (
    state.currentPage * pageSize < items.length || hasMore
  );

  return (
    <div ref={containerRef} className={className}>
      {/* Render visible items */}
      <div className="space-y-2">
        {state.visibleItems.map((item, index) => (
          <div key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading state for initial load */}
      {isLoading && state.visibleItems.length === 0 && (
        <div className="flex justify-center py-8">
          <Loading size="lg" />
        </div>
      )}

      {/* Load more button */}
      {showLoadMoreButton && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            disabled={state.isLoadingMore || isLoading}
            className="btn-outline"
          >
            {state.isLoadingMore
              ? (
                <>
                  <Loading size="sm" />
                  Loading...
                </>
              )
              : (
                "Load More"
              )}
          </Button>
        </div>
      )}

      {/* Infinite scroll loader */}
      {showInfiniteLoader && (
        <div
          ref={loadingRef}
          className="flex justify-center py-4"
        >
          {(state.isLoadingMore || isLoading) && <Loading size="md" />}
        </div>
      )}
    </div>
  );
}

/**
 * Grid paginated list component
 */
interface PaginatedGridProps<T> extends Omit<PaginatedListProps<T>, "renderItem"> {
  renderItem: (item: T, index: number) => ComponentChildren;
  columns: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function PaginatedGrid<T>({
  columns,
  className = "",
  ...props
}: PaginatedGridProps<T>) {
  const gridClasses = [
    "grid gap-4",
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean).join(" ");

  return (
    <PaginatedList
      {...props}
      className={className}
      renderItem={(item, index) => (
        <div className={gridClasses}>
          {props.renderItem(item, index)}
        </div>
      )}
    />
  );
}

/**
 * Hook for managing paginated data
 */
export function usePagination<T>(
  allItems: T[],
  pageSize: number = 20,
  loadMoreFn?: () => Promise<T[]>,
) {
  const [state, setState] = useState({
    items: allItems,
    hasMore: false,
    isLoading: false,
    error: null as Error | null,
  });

  const loadMore = useCallback(async () => {
    if (!loadMoreFn || state.isLoading) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const newItems = await loadMoreFn();
      setState((prev) => ({
        ...prev,
        items: [...prev.items, ...newItems],
        hasMore: newItems.length === pageSize,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
    }
  }, [loadMoreFn, pageSize, state.isLoading]);

  const reset = useCallback(() => {
    setState({
      items: allItems,
      hasMore: false,
      isLoading: false,
      error: null,
    });
  }, [allItems]);

  return {
    ...state,
    loadMore,
    reset,
  };
}
