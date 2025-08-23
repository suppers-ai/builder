import { useEffect, useState } from "preact/hooks";
import { ProductType, ProductTypesAPIClient } from "../lib/api-client/types/product-types-api.ts";

interface SearchFilters {
  query: string;
  type: string;
  subType: string;
  status: string;
  sellerId: string;
  entityId: string;
  // Price filters
  minPrice: string;
  maxPrice: string;
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
    sellerId?: string;
    entityId?: string;
    priceRange?: {
      min?: number;
      max?: number;
    };
  };
}

interface AdvancedProductSearchProps {
  onResults?: (results: SearchResult) => void;
  className?: string;
  sellerId?: string;
  entityId?: string;
}

export default function AdvancedProductSearch({
  onResults,
  className = "",
  sellerId = "",
  entityId = "",
}: AdvancedProductSearchProps) {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedTypeConfig, setSelectedTypeConfig] = useState<any>(null);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(true);

  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "",
    subType: "",
    status: "active",
    sellerId: sellerId,
    entityId: entityId,
    minPrice: "",
    maxPrice: "",
    filterNumeric1: "",
    filterNumeric2: "",
    filterText1: "",
    filterText2: "",
    filterBoolean1: "",
    filterBoolean2: "",
    filterDate1: "",
    filterDate2: "",
  });

  const apiClient = new ProductTypesAPIClient();

  useEffect(() => {
    loadProductTypes();
  }, []);

  useEffect(() => {
    if (filters.type) {
      updateTypeConfig(filters.type, filters.subType);
    }
  }, [filters.type, filters.subType, productTypes]);

  const loadProductTypes = async () => {
    try {
      setTypesLoading(true);
      const types = await apiClient.getAllProductTypes();
      setProductTypes(types);
    } catch (error) {
      console.error("Failed to load product types:", error);
    } finally {
      setTypesLoading(false);
    }
  };

  const updateTypeConfig = (typeName: string, subTypeName?: string) => {
    const type = productTypes.find((t) => t.name === typeName);
    if (!type) {
      setSelectedTypeConfig(null);
      return;
    }

    let filterConfig = type.filter_config;

    if (subTypeName && type.product_sub_types) {
      const subType = type.product_sub_types.find((st) => st.name === subTypeName);
      if (subType && subType.filter_config) {
        filterConfig = { ...filterConfig, ...subType.filter_config };
      }
    }

    setSelectedTypeConfig(filterConfig);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      const searchParams = new URLSearchParams();

      if (filters.query) searchParams.set("q", filters.query);
      if (filters.type) searchParams.set("type", filters.type);
      if (filters.subType) searchParams.set("sub_type", filters.subType);
      if (filters.status) searchParams.set("status", filters.status);
      if (filters.sellerId) searchParams.set("seller_id", filters.sellerId);
      if (filters.entityId) searchParams.set("entity_id", filters.entityId);

      // Price filters
      if (filters.minPrice) searchParams.set("min_price", filters.minPrice);
      if (filters.maxPrice) searchParams.set("max_price", filters.maxPrice);

      // Dynamic filters
      if (filters.filterNumeric1) searchParams.set("filter_numeric_1", filters.filterNumeric1);
      if (filters.filterNumeric2) searchParams.set("filter_numeric_2", filters.filterNumeric2);
      if (filters.filterText1) searchParams.set("filter_text_1", filters.filterText1);
      if (filters.filterText2) searchParams.set("filter_text_2", filters.filterText2);
      if (filters.filterBoolean1) searchParams.set("filter_boolean_1", filters.filterBoolean1);
      if (filters.filterBoolean2) searchParams.set("filter_boolean_2", filters.filterBoolean2);
      if (filters.filterDate1) searchParams.set("filter_date_1", filters.filterDate1);
      if (filters.filterDate2) searchParams.set("filter_date_2", filters.filterDate2);

      const response = await fetch(`/api/v1/product/search?${searchParams.toString()}`, {
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
      sellerId: sellerId,
      entityId: entityId,
      minPrice: "",
      maxPrice: "",
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
          <h2 class="card-title">Advanced Product Search</h2>

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
                <span class="label-text">Product Type</span>
              </label>
              <select
                class="select select-bordered"
                value={filters.type}
                onChange={(e) => updateFilter("type", e.currentTarget.value)}
              >
                <option value="">All Types</option>
                {productTypes.map((type) => (
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
                  {productTypes
                    .find((t) => t.name === filters.type)
                    ?.product_sub_types?.map((subType) => (
                      <option key={subType.id} value={subType.name}>
                        {subType.name} - {subType.description}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Association Filters */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!sellerId && (
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Seller ID</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered"
                  placeholder="Filter by seller"
                  value={filters.sellerId}
                  onInput={(e) => updateFilter("sellerId", e.currentTarget.value)}
                />
              </div>
            )}

            {!entityId && (
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Entity ID</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered"
                  placeholder="Filter by entity"
                  value={filters.entityId}
                  onInput={(e) => updateFilter("entityId", e.currentTarget.value)}
                />
              </div>
            )}
          </div>

          {/* Price Range */}
          <div class="divider">Price Range</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Minimum Price (USD)</span>
              </label>
              <input
                type="number"
                step="0.01"
                class="input input-bordered"
                placeholder="0.00"
                value={filters.minPrice}
                onInput={(e) => updateFilter("minPrice", e.currentTarget.value)}
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Maximum Price (USD)</span>
              </label>
              <input
                type="number"
                step="0.01"
                class="input input-bordered"
                placeholder="1000.00"
                value={filters.maxPrice}
                onInput={(e) => updateFilter("maxPrice", e.currentTarget.value)}
              />
            </div>
          </div>

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
                  "🔍 Search Products"
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
                  {results.data.map((product) => (
                    <div key={product.id} class="border p-4 rounded">
                      <div class="flex justify-between items-start">
                        <div>
                          <h4 class="font-semibold text-lg">{product.name}</h4>
                          <p class="text-sm text-gray-600">{product.description}</p>
                          <div class="flex gap-2 mt-2">
                            <span class="badge badge-outline">{product.type}</span>
                            {product.sub_type && (
                              <span class="badge badge-outline">{product.sub_type}</span>
                            )}
                            {product.product_pricing?.[0]?.pricing_products?.pricing_prices?.[0] &&
                              (
                                <span class="badge badge-success">
                                  ${product.product_pricing[0].pricing_products.pricing_prices[0]
                                    .amount?.USD || "N/A"}
                                </span>
                              )}
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-xs text-gray-500">
                            {new Date(product.created_at).toLocaleDateString()}
                          </div>
                          <div
                            class={`badge ${
                              product.status === "active" ? "badge-success" : "badge-warning"
                            }`}
                          >
                            {product.status}
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
                  No products found matching your search criteria.
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
