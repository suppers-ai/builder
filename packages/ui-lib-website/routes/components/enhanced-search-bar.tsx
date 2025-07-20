import { EnhancedSearchBar } from "../../shared/components/EnhancedSearchBar.tsx";

export default function EnhancedSearchBarDemo() {
  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: [
        { value: "tech", label: "Technology" },
        { value: "business", label: "Business" },
        { value: "personal", label: "Personal" },
      ],
    },
  ];

  const handleSearch = (query: string, activeFilters: Record<string, string>) => {
    console.log("Search query:", query);
    console.log("Active filters:", activeFilters);
  };

  return (
    <div class="px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">EnhancedSearchBar Component</h1>

        <div class="space-y-8">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">With Filters</h2>
              <p class="text-base-content/70 mb-4">
                Search with multiple filter options for advanced filtering.
              </p>
              <EnhancedSearchBar
                placeholder="Search with filters..."
                onSearch={handleSearch}
                filters={filters}
              />
            </div>
          </div>

          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Simple Search</h2>
              <p class="text-base-content/70 mb-4">
                Basic search functionality without filters.
              </p>
              <EnhancedSearchBar
                placeholder="Simple search..."
                onSearch={handleSearch}
              />
            </div>
          </div>

          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Code Example</h2>
              <div class="mockup-code">
                <pre><code>{`<EnhancedSearchBar
  placeholder="Search..."
  onSearch={handleSearch}
  filters={filters}
  debounceMs={300}
/>`}</code></pre>
              </div>
            </div>
          </div>

          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Props</h2>
              <div class="overflow-x-auto">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Prop</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <code class="badge badge-neutral">placeholder</code>
                      </td>
                      <td>
                        <code>string</code>
                      </td>
                      <td>
                        <code>"Search..."</code>
                      </td>
                      <td>Search input placeholder text</td>
                    </tr>
                    <tr>
                      <td>
                        <code class="badge badge-neutral">onSearch</code>
                      </td>
                      <td>
                        <code>
                          (query: string, filters: Record&lt;string, string&gt;) =&gt; void
                        </code>
                      </td>
                      <td>
                        <code>required</code>
                      </td>
                      <td>Callback when search is performed</td>
                    </tr>
                    <tr>
                      <td>
                        <code class="badge badge-neutral">filters</code>
                      </td>
                      <td>
                        <code>FilterOption[]</code>
                      </td>
                      <td>
                        <code>[]</code>
                      </td>
                      <td>Available filter options</td>
                    </tr>
                    <tr>
                      <td>
                        <code class="badge badge-neutral">debounceMs</code>
                      </td>
                      <td>
                        <code>number</code>
                      </td>
                      <td>
                        <code>300</code>
                      </td>
                      <td>Debounce delay in milliseconds</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
