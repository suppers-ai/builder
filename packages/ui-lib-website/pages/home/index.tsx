import { useEffect, useState } from "preact/hooks";
import { useAsyncOperation, usePageAuth, useSearchFilter } from "../../shared/hooks/mod.ts";
import { ApiHelpers } from "../../shared/lib/api-helpers.ts";
import { ApplicationCard } from "../../shared/components/ApplicationCard.tsx";
import { EnhancedSearchBar } from "../../shared/components/EnhancedSearchBar.tsx";
import { LoaderSpinner } from "../../shared/components/LoaderSpinner.tsx";
import type { Application } from "../../shared/lib/api-helpers.ts";

interface HomePageProps {
  className?: string;
  // Optional auth prop for testing/mocking
  auth?: {
    user: any;
    loading?: boolean;
  };
}

export function HomePage({ className = "", auth }: HomePageProps) {
  // Use page auth hook for authentication handling
  const { user, loading: authLoading } = usePageAuth({
    auth,
    redirectIfNotAuthenticated: false, // No auth required for home page
  });

  // Application data state
  const [applications, setApplications] = useState<Application[]>([]);

  // Search and filter functionality
  const searchFilter = useSearchFilter({
    data: applications,
    searchFields: ["name", "description"],
    filterFunctions: {
      template: (item, value) => item.template_id === value,
    },
  });

  // Async operations
  const loadApplicationsOperation = useAsyncOperation({
    onSuccess: (publishedApps) => {
      setApplications(publishedApps);
    },
  });

  // Load published applications (no authentication required)
  useEffect(() => {
    loadApplicationsOperation.execute(async () => {
      const publishedApps = await ApiHelpers.getPublishedApplications();
      return publishedApps;
    });
  }, []);

  // View application details (public view)
  const handleViewApplication = (application: Application) => {
    // TODO: Navigate to application detail page or open modal
    console.log("View application details:", application);
  };

  const searchFilters = [
    {
      key: "template",
      label: "Template",
      options: [
        { value: "fresh-basic", label: "Fresh Basic" },
      ],
    },
  ];

  // Show loading while fetching applications
  if (loadApplicationsOperation.loading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  return (
    <div class={`container mx-auto px-4 py-8 ${className}`}>
      {/* Header */}
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Published Applications</h1>
          <p class="text-gray-600 mt-2">
            Discover web applications built by the community
          </p>
        </div>
        {!user
          ? (
            <div class="text-center">
              <a
                href="/login"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                🚀 Start Building
              </a>
              <p class="text-sm text-gray-500 mt-1">Login to create your own apps</p>
            </div>
          )
          : (
            <a
              href="/my-applications"
              class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📱 My Applications
            </a>
          )}
      </div>

      {/* Search and Filters */}
      <div class="mb-6">
        <EnhancedSearchBar
          placeholder="Search published applications..."
          onSearch={searchFilter.handleSearch}
          filters={searchFilters}
          className="max-w-2xl"
        />
      </div>

      {/* Applications Grid */}
      {searchFilter.filteredData.length === 0
        ? (
          <div class="text-center py-12">
            {applications.length === 0
              ? (
                <div>
                  <div class="text-gray-400 text-6xl mb-4">📱</div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    No published applications yet
                  </h3>
                  <p class="text-gray-600 mb-6">
                    Be the first to create and publish an application!
                  </p>
                  {!user && (
                    <a
                      href="/login"
                      class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Get Started
                    </a>
                  )}
                </div>
              )
              : (
                <div>
                  <div class="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    No matching applications
                  </h3>
                  <p class="text-gray-600">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
          </div>
        )
        : (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchFilter.filteredData.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onView={handleViewApplication}
                // Public view - no edit/delete actions
              />
            ))}
          </div>
        )}
    </div>
  );
}

export default HomePage;
