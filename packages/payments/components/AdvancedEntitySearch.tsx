import { useEffect, useState } from "preact/hooks";
import { EntityType, EntityTypesAPIClient } from "../lib/api-client/types/entity-types-api.ts";

interface SearchFilters {
  query: string;
  type: string;
  subType: string;
  status: string;
  // Geographic filters
  useLocation: boolean;
  latitude: string;
  longitude: string;
  radius: string;
  unit: string;
  // Dynamic filters
  filterNumeric1: string;
  filterNumeric2: string;
  filterText1: string;
  filterText2: string;
  filterBoolean1: string;
  filterBoolean2: string;
  filterDate1: string;
  filterDate2: string;
}

interface SearchResult {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  search: {
    query: string;
    type: string;
    subType: string;
    geographic?: {
      center: { lat: number; lng: number };
      radius: number;
      unit: string;
    };
  };
}

interface AdvancedEntitySearchProps {
  onResults?: (results: SearchResult) => void;
  className?: string;
}

export default function AdvancedEntitySearch(
  { onResults, className = "" }: AdvancedEntitySearchProps,
) {
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [selectedTypeConfig, setSelectedTypeConfig] = useState<any>(null);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(true);

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "",
    subType: "",
    status: "active",
    useLocation: false,
    latitude: "",
    longitude: "",
    radius: "10",
    unit: "km",
    filterNumeric1: "",
    filterNumeric2: "",
    filterText1: "",
    filterText2: "",
    filterBoolean1: "",
    filterBoolean2: "",
    filterDate1: "",
    filterDate2: "",
  });

  const apiClient = new EntityTypesAPIClient();

  useEffect(() => {
    loadEntityTypes();
  }, []);

  useEffect(() => {
    if (filters.type) {
      updateTypeConfig(filters.type, filters.subType);
    }
  }, [filters.type, filters.subType, entityTypes]);

  const loadEntityTypes = async () => {
    try {
      setTypesLoading(true);
      const types = await apiClient.getAllEntityTypes();
      setEntityTypes(types);
    } catch (error) {
      console.error("Failed to load entity types:", error);
    } finally {
      setTypesLoading(false);
    }
  };

  const updateTypeConfig = (typeName: string, subTypeName?: string) => {
    const type = entityTypes.find((t) => t.name === typeName);
    if (!type) {
      setSelectedTypeConfig(null);
      return;
    }

    let filterConfig = type.filter_config;

    if (subTypeName && type.entity_sub_types) {
      const subType = type.entity_sub_types.find((st) => st.name === subTypeName);
      if (subType && subType.filter_config) {
        filterConfig = { ...filterConfig, ...subType.filter_config };
      }
    }

    setSelectedTypeConfig(filterConfig);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilters((prev) => ({
          ...prev,
          useLocation: true,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location.");
      },
    );
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      const searchParams = new URLSearchParams();

      if (filters.query) searchParams.set("q", filters.query);
      if (filters.type) searchParams.set("type", filters.type);
      if (filters.subType) searchParams.set("sub_type", filters.subType);
      if (filters.status) searchParams.set("status", filters.status);

      // Geographic search
      if (filters.useLocation && filters.latitude && filters.longitude) {
        searchParams.set("lat", filters.latitude);
        searchParams.set("lng", filters.longitude);
        searchParams.set("radius", filters.radius);
        searchParams.set("unit", filters.unit);
      }

      // Dynamic filters
      if (filters.filterNumeric1) searchParams.set("filter_numeric_1", filters.filterNumeric1);
      if (filters.filterNumeric2) searchParams.set("filter_numeric_2", filters.filterNumeric2);
      if (filters.filterText1) searchParams.set("filter_text_1", filters.filterText1);
      if (filters.filterText2) searchParams.set("filter_text_2", filters.filterText2);
      if (filters.filterBoolean1) searchParams.set("filter_boolean_1", filters.filterBoolean1);
      if (filters.filterBoolean2) searchParams.set("filter_boolean_2", filters.filterBoolean2);
      if (filters.filterDate1) searchParams.set("filter_date_1", filters.filterDate1);
      if (filters.filterDate2) searchParams.set("filter_date_2", filters.filterDate2);

      const response = await fetch(`/api/v1/entity/search?${searchParams.toString()}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const searchResults = await response.json();
      setResults(searchResults);
      onResults?.(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      type: "",
      subType: "",
      status: "active",
      useLocation: false,
      latitude: "",
      longitude: "",
      radius: "10",
      unit: "km",
      filterNumeric1: "",
      filterNumeric2: "",
      filterText1: "",
      filterText2: "",
      filterBoolean1: "",
      filterBoolean2: "",
      filterDate1: "",
      filterDate2: "",
    });
    setResults(null);
  };

  if (typesLoading) {
    return (
      <div class="flex justify-center items-center p-8">
        <span class="loading loading-spinner loading-lg"></span>
        <span class="ml-2">Loading search options...</span>
      </div>
    );
  }

  return (
    <div class={`space-y-6 ${className}`}>
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Advanced Entity Search</h2>

          {/* Basic Search */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Search Terms</span>
              </label>
              <input
                type="text"
                class="input input-bordered"
                placeholder="Search by name or description"
                value={filters.query}
                onInput={(e) => updateFilter("query", e.currentTarget.value)}
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Status</span>
              </label>
              <select
                class="select select-bordered"
                value={filters.status}
                onChange={(e) => updateFilter("status", e.currentTarget.value)}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          {/* Type Selection */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Entity Type</span>
              </label>
              <select
                class="select select-bordered"
                value={filters.type}
                onChange={(e) => updateFilter("type", e.currentTarget.value)}
              >
                <option value="">All Types</option>
                {entityTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {filters.type && (
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Sub-type</span>
                </label>
                <select
                  class="select select-bordered"
                  value={filters.subType}
                  onChange={(e) => updateFilter("subType", e.currentTarget.value)}
                >
                  <option value="">All Sub-types</option>
                  {entityTypes
                    .find((t) => t.name === filters.type)
                    ?.entity_sub_types?.map((subType) => (
                      <option key={subType.id} value={subType.name}>
                        {subType.name} - {subType.description}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Geographic Search */}
          <div class="divider">Geographic Search</div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Enable location-based search</span>
              <input
                type="checkbox"
                class="toggle"
                checked={filters.useLocation}
                onChange={(e) => updateFilter("useLocation", e.currentTarget.checked.toString())}
              />
            </label>
          </div>

          {filters.useLocation && (
            <div class="space-y-4 p-4 bg-base-200 rounded">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Latitude</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    class="input input-bordered"
                    placeholder="40.7128"
                    value={filters.latitude}
                    onInput={(e) => updateFilter("latitude", e.currentTarget.value)}
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Longitude</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    class="input input-bordered"
                    placeholder="-74.0060"
                    value={filters.longitude}
                    onInput={(e) => updateFilter("longitude", e.currentTarget.value)}
                  />
                </div>

                <div class="form-control">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    class="btn btn-outline mt-8"
                  >
                    📍 Use Current Location
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Search Radius</span>
                  </label>
                  <input
                    type="number"
                    class="input input-bordered"
                    placeholder="10"
                    value={filters.radius}
                    onInput={(e) => updateFilter("radius", e.currentTarget.value)}
                  />
                </div>

                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Unit</span>
                  </label>
                  <select
                    class="select select-bordered"
                    value={filters.unit}
                    onChange={(e) => updateFilter("unit", e.currentTarget.value)}
                  >
                    <option value="km">Kilometers</option>
                    <option value="miles">Miles</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Filters */}
          {selectedTypeConfig && Object.keys(selectedTypeConfig).length > 0 && (
            <>
              <div class="divider">Type-Specific Filters</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedTypeConfig).map(([filterKey, config]: [string, any]) => (
                  <div key={filterKey} class="form-control">
                    <label class="label">
                      <span class="label-text">{config.label}</span>
                    </label>
                    {filterKey.includes("boolean")
                      ? (
                        <select
                          class="select select-bordered"
                          value={filters[filterKey as keyof SearchFilters] as string}
                          onChange={(e) =>
                            updateFilter(filterKey as keyof SearchFilters, e.currentTarget.value)}
                        >
                          <option value="">Any</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      )
                      : filterKey.includes("date")
                      ? (
                        <input
                          type="date"
                          class="input input-bordered"
                          value={filters[filterKey as keyof SearchFilters] as string}
                          onInput={(e) =>
                            updateFilter(filterKey as keyof SearchFilters, e.currentTarget.value)}
                        />
                      )
                      : filterKey.includes("numeric")
                      ? (
                        <input
                          type="number"
                          class="input input-bordered"
                          placeholder={`Enter ${config.label.toLowerCase()}`}
                          value={filters[filterKey as keyof SearchFilters] as string}
                          onInput={(e) =>
                            updateFilter(filterKey as keyof SearchFilters, e.currentTarget.value)}
                        />
                      )
                      : (
                        <input
                          type="text"
                          class="input input-bordered"
                          placeholder={`Search by ${config.label.toLowerCase()}`}
                          value={filters[filterKey as keyof SearchFilters] as string}
                          onInput={(e) =>
                            updateFilter(filterKey as keyof SearchFilters, e.currentTarget.value)}
                        />
                      )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Search Actions */}
          <div class="card-actions justify-end">
            <button
              type="button"
              onClick={clearFilters}
              class="btn btn-ghost"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={handleSearch}
              class="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? (
                  <>
                    <span class="loading loading-spinner loading-sm"></span>
                    Searching...
                  </>
                )
                : (
                  "🔍 Search Entities"
                )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {results && (
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h3 class="card-title">
              Search Results
              <div class="badge badge-primary">{results.pagination.total} found</div>
            </h3>

            {results.data.length > 0
              ? (
                <div class="space-y-4">
                  {results.data.map((entity) => (
                    <div key={entity.id} class="border p-4 rounded">
                      <div class="flex justify-between items-start">
                        <div>
                          <h4 class="font-semibold text-lg">{entity.name}</h4>
                          <p class="text-sm text-gray-600">{entity.description}</p>
                          <div class="flex gap-2 mt-2">
                            <span class="badge badge-outline">{entity.type}</span>
                            {entity.sub_type && (
                              <span class="badge badge-outline">{entity.sub_type}</span>
                            )}
                            {entity.distance && (
                              <span class="badge badge-info">
                                {entity.distance.toFixed(2)} {filters.unit}
                              </span>
                            )}
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-xs text-gray-500">
                            {new Date(entity.created_at).toLocaleDateString()}
                          </div>
                          <div
                            class={`badge ${
                              entity.status === "active" ? "badge-success" : "badge-warning"
                            }`}
                          >
                            {entity.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {results.pagination.totalPages > 1 && (
                    <div class="flex justify-center">
                      <div class="join">
                        <button class="join-item btn" disabled={!results.pagination.hasPrev}>
                          «
                        </button>
                        <button class="join-item btn">
                          Page {results.pagination.page} of {results.pagination.totalPages}
                        </button>
                        <button class="join-item btn" disabled={!results.pagination.hasNext}>
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
              : (
                <div class="text-center text-gray-500 py-8">
                  No entities found matching your search criteria.
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
