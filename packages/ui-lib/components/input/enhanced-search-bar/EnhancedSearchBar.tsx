import { useEffect, useRef, useState } from "preact/hooks";
import type { JSX } from "preact";

interface SearchFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface EnhancedSearchBarProps {
  placeholder?: string;
  onSearch: (query: string, filters: Record<string, string>) => void;
  filters?: SearchFilter[];
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
}

export function EnhancedSearchBar({
  placeholder = "Search...",
  onSearch,
  filters = [],
  debounceMs = 300,
  className = "",
  showClearButton = true,
}: EnhancedSearchBarProps) {
  // SSR safety check - return simplified version during server-side rendering
  if (typeof document === "undefined") {
    return (
      <div class={`relative ${className}`}>
        <div class="relative flex items-center border rounded-lg bg-white border-gray-300">
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          <input
            type="text"
            placeholder={placeholder}
            class="w-full pl-10 pr-20 py-3 rounded-lg focus:outline-none"
            disabled
          />
        </div>
      </div>
    );
  }

  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<number>();
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(query, activeFilters);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, activeFilters, onSearch, debounceMs]);

  const handleQueryChange = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    setQuery((e.target as HTMLInputElement).value);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters((prev) => {
      if (value === "") {
        const { [filterKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [filterKey]: value };
    });
  };

  const handleClear = () => {
    setQuery("");
    setActiveFilters({});
    setShowFilters(false);
    searchRef.current?.focus();
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const hasContent = query.trim() !== "" || hasActiveFilters;

  return (
    <div class={`relative ${className}`}>
      {/* Main Search Input */}
      <div
        class={`
        relative flex items-center border rounded-lg bg-white transition-all duration-200
        ${isFocused ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"}
        ${hasActiveFilters ? "border-blue-400" : ""}
      `}
      >
        {/* Search Icon */}
        <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>

        {/* Input */}
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          class="w-full pl-10 pr-20 py-3 rounded-lg focus:outline-none"
        />

        {/* Right Side Controls */}
        <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {/* Active Filters Count */}
          {hasActiveFilters && (
            <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {Object.keys(activeFilters).length}
            </span>
          )}

          {/* Filter Toggle Button */}
          {filters.length > 0 && (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              class={`
                p-2 rounded-md transition-colors
                ${
                showFilters
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }
              `}
              title="Filters"
            >
              ⚙️
            </button>
          )}

          {/* Clear Button */}
          {showClearButton && hasContent && (
            <button
              type="button"
              onClick={handleClear}
              class="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div class="p-4">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Filters</h3>

            <div class="space-y-3">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    {filter.label}
                  </label>
                  <select
                    value={activeFilters[filter.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, (e.target as HTMLSelectElement).value)}
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Filter Actions */}
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveFilters({})}
                class="text-sm text-gray-600 hover:text-gray-800"
                disabled={!hasActiveFilters}
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                class="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div class="mt-2 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterKey, value]) => {
            const filter = filters.find((f) => f.key === filterKey);
            const option = filter?.options.find((o) => o.value === value);

            if (!filter || !option) return null;

            return (
              <span
                key={filterKey}
                class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
              >
                <span class="text-xs">{filter.label}:</span>
                <span>{option.label}</span>
                <button
                  type="button"
                  onClick={() => handleFilterChange(filterKey, "")}
                  class="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EnhancedSearchBar;
