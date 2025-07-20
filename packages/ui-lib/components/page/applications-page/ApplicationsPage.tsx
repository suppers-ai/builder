// No hooks needed - this is a controlled component
import { LoaderSpinner } from "../../../shared/components/LoaderSpinner.tsx";
import { ApplicationCard } from "../../../shared/components/ApplicationCard.tsx";
import { ApplicationForm } from "../../../shared/components/ApplicationForm.tsx";
import { EnhancedSearchBar } from "../../../shared/components/EnhancedSearchBar.tsx";
import type {
  Application,
  CreateApplicationData,
  UpdateApplicationData,
} from "../../../shared/lib/api-helpers.ts";

export interface ApplicationsPageProps {
  className?: string;
  user: any;
  authLoading: boolean;
  applications: Application[];
  filteredApplications: Application[];
  isLoading: boolean;
  showCreateForm: boolean;
  editingApplication: Application | null;
  isSubmitting: boolean;
  searchFilters: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  onShowCreateForm: () => void;
  onHideForm: () => void;
  onFormSubmit: (data: CreateApplicationData | UpdateApplicationData) => Promise<void>;
  onSearch: (query: string, filters: Record<string, string>) => void;
  onEditApplication: (app: Application) => void;
  onDeleteApplication: (app: Application) => Promise<void>;
  onSubmitForReview: (app: Application) => Promise<void>;
  onViewApplication: (app: Application) => void;
}

export function ApplicationsPage({
  className = "",
  user,
  authLoading,
  applications,
  filteredApplications,
  isLoading,
  showCreateForm,
  editingApplication,
  isSubmitting,
  searchFilters,
  onShowCreateForm,
  onHideForm,
  onFormSubmit,
  onSearch,
  onEditApplication,
  onDeleteApplication,
  onSubmitForReview,
  onViewApplication,
}: ApplicationsPageProps) {
  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  // Require authentication
  if (!user) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <h1 class="text-2xl font-bold mb-4">Authentication Required</h1>
          <p class="text-gray-600 mb-4">Please log in to manage your applications.</p>
          <a
            href="/login"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  // Show form if creating or editing
  if (showCreateForm || editingApplication) {
    return (
      <div class={`container mx-auto px-4 py-8 ${className}`}>
        {/* Breadcrumb */}
        <nav class="mb-6">
          <button
            onClick={onHideForm}
            class="text-blue-600 hover:text-blue-800"
          >
            ← Back to My Applications
          </button>
        </nav>

        <ApplicationForm
          application={editingApplication || undefined}
          onSubmit={onFormSubmit}
          onCancel={onHideForm}
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
            Create, edit, and manage your web applications
          </p>
        </div>
        <div class="flex gap-3">
          <a
            href="/"
            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🌟 Browse Published
          </a>
          <button
            onClick={onShowCreateForm}
            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ➕ Create Application
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div class="mb-6">
        <EnhancedSearchBar
          placeholder="Search your applications..."
          onSearch={onSearch}
          filters={searchFilters}
          className="max-w-2xl"
        />
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
                    Create your first application to get started building something amazing!
                  </p>
                  <button
                    onClick={onShowCreateForm}
                    class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Your First App
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
                showOwnerActions={true}
                onEdit={onEditApplication}
                onDelete={onDeleteApplication}
                onSubmitForReview={onSubmitForReview}
                onView={onViewApplication}
              />
            ))}
          </div>
        )}
    </div>
  );
}

export default ApplicationsPage;
