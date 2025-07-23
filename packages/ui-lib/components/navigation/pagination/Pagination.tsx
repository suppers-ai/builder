import { BaseComponentProps } from "../../types.ts";

// Pagination interfaces
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  size?: "xs" | "sm" | "md" | "lg";
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  // Controlled mode props
  onPageChange?: (page: number) => void;
  onFirstPage?: () => void;
  onLastPage?: () => void;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export function Pagination({
  class: className = "",
  currentPage,
  totalPages,
  size = "md",
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  onPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPrevPage,
  id,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const btnClasses = [
    "btn",
    size === "xs" ? "btn-xs" : size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "",
  ].filter(Boolean).join(" ");

  const btnActiveClasses = [
    btnClasses,
    "btn-active",
  ].join(" ");

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
  };

  const handleFirstPage = () => {
    onFirstPage?.();
    onPageChange?.(1);
  };

  const handleLastPage = () => {
    onLastPage?.();
    onPageChange?.(totalPages);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPrevPage?.();
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onNextPage?.();
      onPageChange?.(currentPage + 1);
    }
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div class={`join ${className}`} id={id} {...props}>
      {showFirstLast && (
        <button
          type="button"
          class={btnClasses}
          disabled={currentPage === 1}
          onClick={handleFirstPage}
          aria-label="Go to first page"
        >
          «
        </button>
      )}

      {showPrevNext && (
        <button
          type="button"
          class={btnClasses}
          disabled={currentPage === 1}
          onClick={handlePrevPage}
          aria-label="Go to previous page"
        >
          ‹
        </button>
      )}

      {visiblePages.map((page, index) => (
        typeof page === "number"
          ? (
            <button
              type="button"
              key={page}
              class={page === currentPage ? btnActiveClasses : btnClasses}
              onClick={() => handlePageClick(page)}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          )
          : (
            <span key={`ellipsis-${index}`} class="btn btn-disabled">
              {page}
            </span>
          )
      ))}

      {showPrevNext && (
        <button
          type="button"
          class={btnClasses}
          disabled={currentPage === totalPages}
          onClick={handleNextPage}
          aria-label="Go to next page"
        >
          ›
        </button>
      )}

      {showFirstLast && (
        <button
          type="button"
          class={btnClasses}
          disabled={currentPage === totalPages}
          onClick={handleLastPage}
          aria-label="Go to last page"
        >
          »
        </button>
      )}
    </div>
  );
}
