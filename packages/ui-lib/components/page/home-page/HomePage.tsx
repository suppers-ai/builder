import { ApplicationCard } from "../../../shared/components/ApplicationCard.tsx";
import { LoaderSpinner } from "../../../shared/components/LoaderSpinner.tsx";
import type {
  Application,
  CreateApplicationData,
  UpdateApplicationData,
} from "../../../shared/lib/api-helpers.ts";

// Lazy wrapper to avoid importing ApplicationForm during SSR when not needed
function LazyApplicationForm(props: {
  application?: Application;
  onSubmit: (data: CreateApplicationData | UpdateApplicationData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  // For demo purposes, form is disabled during SSR
  // In a real app with islands, you'd dynamically import the actual form here
  return (
    <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 class="text-xl font-semibold mb-4">
        {props.application ? "Edit Application" : "Create New Application"}
      </h2>
      <p class="text-gray-600 mb-4">
        Form would load here in client context (island component)
      </p>
      <button
        onClick={props.onCancel}
        class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
      >
        Back to Applications
      </button>
    </div>
  );
}

export interface HomePageProps {
  className?: string;
  user: any;
  applications: Application[];
  filteredApplications: Application[];
  isLoading: boolean;
  showCreateForm: boolean;
  editingApplication: Application | null;
  isSubmitting: boolean;
  searchQuery: string;
  searchFilters: Record<string, string>;
  onShowCreateForm: () => void;
  onHideCreateForm: () => void;
  onEditApplication: (app: Application) => void;
  onFormSubmit: (data: CreateApplicationData | UpdateApplicationData) => Promise<void>;
  onDeleteApplication: (app: Application) => Promise<void>;
  onSearch: (query: string, filters: Record<string, string>) => void;
  onViewApplication: (app: Application) => void;
}

export function HomePage({
  className = "",
  user,
  applications,
  filteredApplications,
  isLoading,
  showCreateForm,
  editingApplication,
  isSubmitting,
  searchQuery,
  searchFilters,
  onShowCreateForm,
  onHideCreateForm,
  onEditApplication,
  onFormSubmit,
  onDeleteApplication,
  onSearch,
  onViewApplication,
}: HomePageProps) {
  // Simple search bar without hooks
  const SimpleSearchBar = () => (
    <div class="max-w-2xl">
      <div class="relative">
        <input
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onInput={(e) => onSearch((e.target as HTMLInputElement).value, searchFilters)}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div class="absolute right-3 top-2.5 text-gray-400">
          🔍
        </div>
      </div>

      {/* Simple filter buttons */}
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() =>
            onSearch(searchQuery, {
              ...searchFilters,
              status: searchFilters.status === "draft" ? "" : "draft",
            })}
          class={`px-3 py-1 rounded-full text-sm ${
            searchFilters.status === "draft"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Draft
        </button>
        <button
          onClick={() =>
            onSearch(searchQuery, {
              ...searchFilters,
              status: searchFilters.status === "published" ? "" : "published",
            })}
          class={`px-3 py-1 rounded-full text-sm ${
            searchFilters.status === "published"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Published
        </button>
        <button
          onClick={() =>
            onSearch(searchQuery, {
              ...searchFilters,
              status: searchFilters.status === "archived" ? "" : "archived",
            })}
          class={`px-3 py-1 rounded-full text-sm ${
            searchFilters.status === "archived"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Archived
        </button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <h1 class="text-2xl font-bold mb-4">Welcome to the App Builder</h1>
          <p class="text-gray-600 mb-4">Please log in to manage your applications.</p>
          <a
            href="/auth/login"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (showCreateForm || editingApplication) {
    return (
      <div class={`container mx-auto px-4 py-8 ${className}`}>
        <LazyApplicationForm
          application={editingApplication || undefined}
          onSubmit={onFormSubmit}
          onCancel={onHideCreateForm}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div class={`container mx-auto px-4 py-8 ${className}`}>
      {/* Header */}
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">My Applications</h1>
          <p class="text-gray-600 mt-2">
            Build and manage your web applications
          </p>
        </div>
        <button
          onClick={onShowCreateForm}
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          ➕ Create Application
        </button>
      </div>

      {/* Search and Filters */}
      <div class="mb-6">
        <SimpleSearchBar />
      </div>

      {/* Applications Grid */}
      {isLoading
        ? (
          <div class="flex items-center justify-center py-12">
            <LoaderSpinner size="lg" />
          </div>
        )
        : filteredApplications.length === 0
        ? (
          <div class="text-center py-12">
            {applications.length === 0
              ? (
                <div>
                  <div class="text-gray-400 text-6xl mb-4">📱</div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    No applications yet
                  </h3>
                  <p class="text-gray-600 mb-6">
                    Create your first application to get started
                  </p>
                  <button
                    onClick={onShowCreateForm}
                    class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Application
                  </button>
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
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onEdit={onEditApplication}
                onDelete={onDeleteApplication}
                onView={onViewApplication}
              />
            ))}
          </div>
        )}
    </div>
  );
}
