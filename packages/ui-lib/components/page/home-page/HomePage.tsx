import { ApplicationCard } from "../../display/card/ApplicationCard.tsx";
import { Loading } from "../../feedback/loading/Loading.tsx";
import { Button } from "../../action/button/Button.tsx";
import { Input } from "../../input/input/Input.tsx";
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
    <div class="bg-base-100 rounded-lg shadow-xl border border-base-300 p-6">
      <h2 class="text-xl font-semibold mb-4">
        {props.application ? "Edit Application" : "Create New Application"}
      </h2>
      <p class="text-slate-600 mb-4">
        Form would load here in client context (island component)
      </p>
      <Button
        onClick={props.onCancel}
        color="neutral"
      >
        Back to Applications
      </Button>
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
        <Input
          type="text"
          placeholder="Search applications..."
          value={searchQuery}
          onInput={(e) => onSearch((e.target as HTMLInputElement).value, searchFilters)}
          bordered
          class="w-full"
        />
        <div class="absolute right-3 top-2.5 text-base-content/50">
          🔍
        </div>
      </div>

      {/* Simple filter buttons */}
      <div class="mt-3 flex flex-wrap gap-2">
        <Button
          onClick={() =>
            onSearch(searchQuery, {
              ...searchFilters,
              status: searchFilters.status === "draft" ? "" : "draft",
            })}
          color={searchFilters.status === "draft" ? "primary" : "neutral"}
          variant={searchFilters.status === "draft" ? undefined : "outline"}
          size="sm"
        >
          Draft
        </Button>
        <Button
          onClick={() =>
            onSearch(searchQuery, {
              ...searchFilters,
              status: searchFilters.status === "published" ? "" : "published",
            })}
          color={searchFilters.status === "published" ? "primary" : "neutral"}
          variant={searchFilters.status === "published" ? undefined : "outline"}
          size="sm"
        >
          Published
        </Button>
        <Button
          onClick={() =>
            onSearch(searchQuery, {
              ...searchFilters,
              status: searchFilters.status === "archived" ? "" : "archived",
            })}
          color={searchFilters.status === "archived" ? "primary" : "neutral"}
          variant={searchFilters.status === "archived" ? undefined : "outline"}
          size="sm"
        >
          Archived
        </Button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <h1 class="text-2xl font-bold mb-4">Welcome to the App Builder</h1>
          <p class="text-slate-600 mb-4">Please log in to manage your applications.</p>
          <Button
            as="a"
            href="/auth/login"
            color="primary"
          >
            Log In
          </Button>
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
          <h1 class="text-3xl font-bold text-slate-900">My Applications</h1>
          <p class="text-slate-600 mt-2">
            Build and manage your web applications
          </p>
        </div>
        <Button
          onClick={onShowCreateForm}
          color="primary"
          size="lg"
        >
          ➕ Create Application
        </Button>
      </div>

      {/* Search and Filters */}
      <div class="mb-6">
        <SimpleSearchBar />
      </div>

      {/* Applications Grid */}
      {isLoading
        ? (
          <div class="flex items-center justify-center py-12">
            <Loading size="lg" variant="spinner" />
          </div>
        )
        : filteredApplications.length === 0
        ? (
          <div class="text-center py-12">
            {applications.length === 0
              ? (
                <div>
                  <div class="text-base-content/50 text-6xl mb-4">📱</div>
                  <h3 class="text-xl font-semibold text-slate-900 mb-2">
                    No applications yet
                  </h3>
                  <p class="text-slate-600 mb-6">
                    Create your first application to get started
                  </p>
                  <Button
                    onClick={onShowCreateForm}
                    color="primary"
                    size="lg"
                  >
                    Create Application
                  </Button>
                </div>
              )
              : (
                <div>
                  <div class="text-base-content/50 text-6xl mb-4">🔍</div>
                  <h3 class="text-xl font-semibold text-slate-900 mb-2">
                    No matching applications
                  </h3>
                  <p class="text-slate-600">
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
