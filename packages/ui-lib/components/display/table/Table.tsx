import { BaseComponentProps } from "../../types.ts";
import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { Pagination } from "../../navigation/pagination/Pagination.tsx";

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: unknown, row: unknown) => ComponentChildren;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps extends BaseComponentProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  zebra?: boolean;
  compact?: boolean;
  hover?: boolean;
  pinRows?: boolean;
  pinCols?: boolean;
  emptyMessage?: string;
  // Controlled mode props
  sortable?: boolean;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  loading?: boolean;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  // Pagination props
  paginated?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  // Interactive features
  showControls?: boolean;
  allowItemsPerPageChange?: boolean;
  showStats?: boolean;
  itemsPerPageOptions?: number[];
}

export interface PaginatedTableProps extends BaseComponentProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  // All table props
  zebra?: boolean;
  compact?: boolean;
  hover?: boolean;
  pinRows?: boolean;
  pinCols?: boolean;
  emptyMessage?: string;
  // Pagination configuration
  initialItemsPerPage?: number;
  itemsPerPageOptions?: number[];
  showStats?: boolean;
  showControls?: boolean;
  allowSorting?: boolean;
  allowItemsPerPageChange?: boolean;
}

export function Table({
  class: className = "",
  columns = [],
  data = [],
  zebra = false,
  compact = false,
  hover = false,
  pinRows = false,
  pinCols = false,
  emptyMessage = "No data available",
  sortable = false,
  sortColumn = "",
  sortDirection = "asc",
  loading = false,
  onSort,
  paginated = false,
  currentPage = 1,
  itemsPerPage = 10,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  showControls = false,
  allowItemsPerPageChange = false,
  showStats = false,
  itemsPerPageOptions = [5, 10, 20, 50],
  id,
  ...props
}: TableProps) {
  // Ensure columns and data are arrays
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  // Calculate pagination values
  const totalPages = paginated ? Math.ceil((totalItems || safeData.length) / itemsPerPage) : 1;
  const startIndex = paginated ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = paginated ? startIndex + itemsPerPage : safeData.length;
  const displayData = paginated ? safeData.slice(startIndex, endIndex) : safeData;

  const tableClasses = [
    "table",
    zebra ? "table-zebra" : "",
    compact ? "table-xs" : "",
    hover ? "table-hover" : "",
    pinRows ? "table-pin-rows" : "",
    pinCols ? "table-pin-cols" : "",
    className,
  ].filter(Boolean).join(" ");

  // Controls component
  const renderControls = () => {
    if (!showControls) return null;

    return (
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        {showStats && (
          <div class="stats stats-horizontal shadow">
            <div class="stat">
              <div class="stat-title">Total Items</div>
              <div class="stat-value text-primary">{totalItems || safeData.length}</div>
            </div>
            {paginated && (
              <>
                <div class="stat">
                  <div class="stat-title">Current Page</div>
                  <div class="stat-value text-secondary">{currentPage}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Total Pages</div>
                  <div class="stat-value text-accent">{totalPages}</div>
                </div>
              </>
            )}
          </div>
        )}

        {allowItemsPerPageChange && paginated && (
          <div class="form-control">
            <label class="label">
              <span class="label-text">Items per page</span>
            </label>
            <select
              class="select select-bordered select-sm"
              value={itemsPerPage}
              onChange={(e) =>
                onItemsPerPageChange?.(parseInt((e.target as HTMLSelectElement).value))}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  // Pagination info
  const renderPaginationInfo = () => {
    if (!paginated) return null;

    return (
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div class="text-sm text-base-content/70">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems || safeData.length)} of{" "}
          {totalItems || safeData.length} items
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          size="sm"
        />
      </div>
    );
  };

  const handleSort = (columnKey: string) => {
    if (!sortable || !onSort) return;

    const column = safeColumns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    let newDirection: "asc" | "desc" = "asc";
    if (sortColumn === columnKey && sortDirection === "asc") {
      newDirection = "desc";
    }

    onSort(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortable || sortColumn !== columnKey) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortDirection === "asc"
      ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      )
      : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      );
  };

  if (loading) {
    return (
      <div class="space-y-4">
        {renderControls()}
        <div class="overflow-x-auto">
          <table class={tableClasses} id={id} {...props}>
            <thead>
              <tr>
                {safeColumns.map((column) => (
                  <th
                    key={column.key}
                    style={column.width ? { width: column.width } : {}}
                    class={column.align ? `text-${column.align}` : ""}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }, (_, index) => (
                <tr key={index}>
                  {safeColumns.map((column) => (
                    <td key={column.key}>
                      <div class="skeleton h-4 w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPaginationInfo()}
      </div>
    );
  }

  return (
    <div class="space-y-4">
      {renderControls()}
      <div class="overflow-x-auto">
        <table class={tableClasses} id={id} {...props}>
          <thead>
            <tr>
              {safeColumns.map((column) => (
                <th
                  key={column.key}
                  style={column.width ? { width: column.width } : {}}
                  class={[
                    column.align ? `text-${column.align}` : "",
                    sortable && column.sortable ? "cursor-pointer hover:bg-base-200" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleSort(column.key)}
                >
                  <div class="flex items-center gap-2">
                    <span>{column.title}</span>
                    {sortable && column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeData.length === 0
              ? (
                <tr>
                  <td colSpan={safeColumns.length} class="text-center py-8 text-base-content/70">
                    {emptyMessage}
                  </td>
                </tr>
              )
              : (
                displayData.map((row, index) => (
                  <tr key={index}>
                    {safeColumns.map((column) => (
                      <td
                        key={column.key}
                        class={column.align ? `text-${column.align}` : ""}
                      >
                        {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>
      {renderPaginationInfo()}
    </div>
  );
}

export function PaginatedTable({
  class: className = "",
  columns = [],
  data = [],
  zebra = false,
  compact = false,
  hover = false,
  pinRows = false,
  pinCols = false,
  emptyMessage = "No data available",
  initialItemsPerPage = 10,
  itemsPerPageOptions = [5, 10, 20, 50],
  showStats = true,
  showControls = true,
  allowSorting = true,
  allowItemsPerPageChange = true,
  id,
  ...props
}: PaginatedTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  // Ensure columns and data are arrays
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];
  
  const [sortColumn, setSortColumn] = useState(safeColumns[0]?.key || "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Sort data
  const sortedData = allowSorting
    ? [...safeData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      // Convert to strings for comparison
      const aStr = String(aValue ?? "");
      const bStr = String(bValue ?? "");
      
      const comparison = aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      return sortDirection === "asc" ? comparison : -comparison;
    })
    : safeData;

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <Table
      class={className}
      columns={safeColumns}
      data={sortedData}
      zebra={zebra}
      compact={compact}
      hover={hover}
      pinRows={pinRows}
      pinCols={pinCols}
      emptyMessage={emptyMessage}
      paginated
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      totalItems={safeData.length}
      onPageChange={handlePageChange}
      onItemsPerPageChange={handleItemsPerPageChange}
      showControls={showControls}
      allowItemsPerPageChange={allowItemsPerPageChange}
      showStats={showStats}
      itemsPerPageOptions={itemsPerPageOptions}
      sortable={allowSorting}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={handleSort}
      id={id}
      {...props}
    />
  );
}
