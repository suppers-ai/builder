import { useCallback, useMemo, useState } from "preact/hooks";

export interface SearchFilterOptions<T> {
  data: T[];
  searchFields?: (keyof T)[];
  filterFunctions?: Record<string, (item: T, filterValue: string) => boolean>;
  debounceMs?: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilter {
  key: string;
  label: string;
  options: FilterOption[];
}

/**
 * Hook for handling search and filtering of data
 */
export function useSearchFilter<T extends Record<string, any>>(
  options: SearchFilterOptions<T>,
) {
  const { data, searchFields, filterFunctions, debounceMs = 300 } = options;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Default search function that searches specified fields
  const defaultSearchFunction = useCallback((item: T, query: string): boolean => {
    if (!query.trim()) return true;

    const searchLower = query.toLowerCase();
    const fieldsToSearch = searchFields || Object.keys(item);

    return fieldsToSearch.some((field) => {
      const value = item[field];
      return value &&
        String(value).toLowerCase().includes(searchLower);
    });
  }, [searchFields]);

  // Filter data based on search query and active filters
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) => defaultSearchFunction(item, searchQuery));
    }

    // Apply active filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue) {
        if (filterFunctions && filterFunctions[filterKey]) {
          // Use custom filter function
          filtered = filtered.filter((item) => filterFunctions[filterKey](item, filterValue));
        } else {
          // Default filter: exact match on field
          filtered = filtered.filter((item) => item[filterKey] === filterValue);
        }
      }
    });

    return filtered;
  }, [data, searchQuery, activeFilters, defaultSearchFunction, filterFunctions]);

  const handleSearch = useCallback((query: string, filters: Record<string, string> = {}) => {
    setSearchQuery(query);
    setActiveFilters(filters);
  }, []);

  const updateFilter = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchQuery("");
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() !== "" || Object.keys(activeFilters).length > 0;
  }, [searchQuery, activeFilters]);

  return {
    searchQuery,
    activeFilters,
    filteredData,
    hasActiveFilters,
    handleSearch,
    updateFilter,
    removeFilter,
    clearFilters,
    setSearchQuery,
  };
}
