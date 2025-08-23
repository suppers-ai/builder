/**
 * ApplicationManagementIsland Component
 * Application management interface with search, filtering, creation, editing, and status management
 */

import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { showError, showSuccess } from "../lib/toast-manager.ts";
import { handleSessionExpiredError } from "@suppers/ui-lib";
import type {
  AdminApplication,
  ApplicationFilters,
  ApplicationFormErrors,
  ApplicationStatus,
  CreateApplicationData,
  UpdateApplicationData,
} from "../types/admin.ts";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Dropdown,
  EmptyState,
  Input,
  LoadingButton,
  Modal,
  Select,
  Skeleton,
  Table,
  type TableColumn,
  Textarea,
} from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";
import { ApplicationApiClient } from "../lib/api-client/applications/application-api.ts";

// Global state for application management
const applications = signal<AdminApplication[]>([]);
const isLoading = signal<boolean>(true);
const error = signal<string | null>(null);
const selectedApplications = signal<Set<string>>(new Set());

// Debug: Log initial state
console.log("Initial applications signal:", applications.value, "Type:", typeof applications.value);

interface ApplicationListProps {
  applications: AdminApplication[];
  loading: boolean;
  onEdit: (app: AdminApplication) => void;
  onStatusChange: (appId: string, status: ApplicationStatus) => void;
  onDelete: (appId: string) => void;
  selectedIds: Set<string>;
  onSelectionChange: (appId: string, selected: boolean) => void;
  onCreateApplication: () => void;
}

function ApplicationList({
  applications,
  loading,
  onEdit,
  onStatusChange,
  onDelete,
  selectedIds,
  onSelectionChange,
  onCreateApplication,
}: ApplicationListProps) {
  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case "published":
        return "success";
      case "pending":
        return "warning";
      case "draft":
        return "info";
      case "archived":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <Skeleton class="w-full h-64" />;
  }

  // Safety check: ensure applications is an array
  if (!Array.isArray(applications)) {
    console.error("Applications is not an array:", applications);
    return (
      <EmptyState
        title="Error loading applications"
        description="Please try refreshing the page."
        actionText="Create Application"
        onAction={onCreateApplication}
      />
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No applications found"
        description="Create your first application to get started."
        actionText="Create Application"
        onAction={onCreateApplication}
      />
    );
  }

  const columns: TableColumn[] = [
    {
      key: "select",
      title: "",
      width: "50px",
      render: (value, row) => {
        const app = row as AdminApplication;
        if (!app || !app.id) return null;
        return (
          <Checkbox
            checked={selectedIds.has(app.id)}
            onChange={(checked) => onSelectionChange(app.id, checked)}
            size="sm"
            disabled={false}
            indeterminate={false}
            aria-label={`Select ${app.name}`}
          />
        );
      },
    },
    {
      key: "name",
      title: "Name",
      render: (value, row) => {
        const app = row as AdminApplication;
        if (!app) return null;
        return (
          <div>
            <div class="font-semibold text-base-content">{app.name || "Untitled"}</div>
            {app.description && (
              <div class="text-sm text-base-content/70 mt-1 line-clamp-2">
                {app.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      width: "120px",
      render: (value, row) => {
        const app = row as AdminApplication;
        if (!app || !app.id) return null;
        return (
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" class="gap-2">
                <Badge color={getStatusBadgeColor(app.status)} size="sm">
                  {app.status}
                </Badge>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            }
            content={
              <div>
                {(["draft", "pending", "published", "archived"] as ApplicationStatus[]).map((
                  status,
                ) => (
                  <button
                    key={status}
                    type="button"
                    class={`flex items-center gap-2 px-3 py-2 text-left hover:bg-base-200 w-full ${
                      app.status === status ? "bg-primary/10 text-primary" : ""
                    }`}
                    onClick={() => onStatusChange(app.id, status)}
                  >
                    <Badge color={getStatusBadgeColor(status)} size="sm">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </button>
                ))}
              </div>
            }
          />
        );
      },
    },
    {
      key: "dates",
      title: "Dates",
      width: "180px",
      render: (value, row) => {
        const app = row as AdminApplication;
        if (!app) return null;
        return (
          <div class="text-sm">
            <div>Created: {app.created_at ? formatDate(app.created_at) : "N/A"}</div>
            <div class="text-base-content/60">
              Updated: {app.updated_at ? formatDate(app.updated_at) : "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      key: "metrics",
      title: "Views",
      width: "80px",
      render: (value, row) => {
        const app = row as AdminApplication;
        if (!app) return null;
        return (
          <div class="text-sm">
            {app.metrics ? app.metrics.views.toLocaleString() : "0"}
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      width: "120px",
      render: (value, row) => {
        const app = row as AdminApplication;
        if (!app || !app.id) return null;
        return (
          <div class="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onEdit(app)}
              aria-label={`Edit ${app.name || "application"}`}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              color="error"
              size="sm"
              onClick={() => onDelete(app.id)}
              aria-label={`Delete ${app.name || "application"}`}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      data={applications as unknown as Record<string, unknown>[]}
      columns={columns}
      class="w-full"
    />
  );
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateApplicationData | UpdateApplicationData) => void;
  application?: AdminApplication;
  loading: boolean;
}

function ApplicationModal(
  { isOpen, onClose, onSubmit, application, loading }: ApplicationModalProps,
) {
  const [formData, setFormData] = useState<CreateApplicationData | UpdateApplicationData>({
    name: "",
    slug: "",
    description: "",
    website_url: "",
    thumbnail_url: "",
    status: "draft" as ApplicationStatus,
  });
  const [errors, setErrors] = useState<ApplicationFormErrors>({});

  useEffect(() => {
    if (application) {
      setFormData({
        name: application.name,
        slug: application.slug,
        description: application.description || "",
        website_url: application.website_url || "",
        thumbnail_url: application.thumbnail_url || "",
        status: application.status,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        website_url: "",
        thumbnail_url: "",
        status: "draft",
      });
    }
    setErrors({});
  }, [application, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: ApplicationFormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const generateSlug = (name: string) => {
    if (!name || typeof name !== "string") {
      return "";
    }
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (e: Event) => {
    const name = (e.target as HTMLInputElement).value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !application ? generateSlug(name) : prev.slug,
    }));
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={application ? "Edit Application" : "Create New Application"}
    >
      <div class="space-y-6">
        {/* Name and Slug Row */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Name *</span>
            </label>
            <Input
              value={formData.name || ""}
              onChange={handleNameChange}
              placeholder="Enter application name"
              disabled={loading}
              required
            />
            {errors.name && <span class="text-error text-sm mt-1">{errors.name}</span>}
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Slug *</span>
            </label>
            <Input
              value={formData.slug || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: (e.target as HTMLInputElement).value }))}
              placeholder="application-slug"
              disabled={loading}
              class="font-mono"
              required
            />
            {errors.slug && <span class="text-error text-sm mt-1">{errors.slug}</span>}
          </div>
        </div>

        {/* Description */}
        <div class="form-control">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <Textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: (e.target as HTMLTextAreaElement).value,
              }))}
            placeholder="Enter application description (optional)"
            rows={3}
            disabled={loading}
          />
        </div>

        {/* URL Fields */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Website URL</span>
            </label>
            <Input
              type="url"
              value={formData.website_url || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  website_url: (e.target as HTMLInputElement).value,
                }))}
              placeholder="https://example.com"
              disabled={loading}
            />
            {errors.website_url && <span class="text-error text-sm mt-1">{errors.website_url}
            </span>}
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Thumbnail URL</span>
            </label>
            <Input
              type="url"
              value={formData.thumbnail_url || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  thumbnail_url: (e.target as HTMLInputElement).value,
                }))}
              placeholder="https://example.com/thumbnail.jpg"
              disabled={loading}
            />
            {errors.thumbnail_url && (
              <span class="text-error text-sm mt-1">{errors.thumbnail_url}</span>
            )}
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Status</span>
          </label>
          <Select
            value={formData.status || "draft"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                status: (e.target as HTMLSelectElement).value as unknown as ApplicationStatus,
              }))}
            disabled={loading}
            options={[
              { value: "draft", label: "Draft" },
              { value: "pending", label: "Pending" },
              { value: "published", label: "Published" },
              { value: "archived", label: "Archived" },
            ]}
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={loading}
          variant="primary"
          onClick={handleSubmit}
        >
          {application ? "Update Application" : "Create Application"}
        </LoadingButton>
      </div>
    </Modal>
  );
}

export default function ApplicationManagementIsland() {
  const [filters, setFilters] = useState<ApplicationFilters>({
    search: "",
    status: undefined,
    sortBy: "updated_at",
    sortOrder: "desc",
    limit: 20,
    offset: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<AdminApplication | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [bulkAction, setBulkAction] = useState<ApplicationStatus | "">("");

  // Initialize API client
  const apiClient = new ApplicationApiClient(getAuthClient());

  // Load applications
  const loadApplications = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      console.log("Loading applications with filters:", filters);
      const response = await apiClient.getApplicationsFiltered(filters);
      console.log("API response:", response);

      if (response.error) {
        console.error("API error:", response.error);
        if (!handleSessionExpiredError({ message: response.error })) {
          error.value = response.error;
          applications.value = [];
          showError(response.error);
        }
      } else if (response.data?.data) {
        applications.value = response.data.data;
        console.log(
          "Successfully loaded applications:",
          applications.value.length,
          applications.value,
        );
      } else {
        console.warn("No data in response, defaulting to empty array", response);
        applications.value = [];
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
      if (!handleSessionExpiredError(err)) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load applications";
        error.value = errorMessage;
        applications.value = [];
        showError(errorMessage);
      }
    } finally {
      isLoading.value = false;
    }
  };

  // Load applications on component mount and filter changes
  useEffect(() => {
    loadApplications();
  }, [filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, offset: 0 }));
  };

  const handleStatusFilter = (status: ApplicationStatus | "") => {
    setFilters((prev) => ({ ...prev, status: status || undefined, offset: 0 }));
  };

  const handleSort = (sortBy: ApplicationFilters["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
      offset: 0,
    }));
  };

  const handleCreateApplication = () => {
    console.log("Create application button clicked");
    setEditingApplication(undefined);
    setShowModal(true);
    console.log("Modal should now be visible, showModal:", showModal);
  };

  const handleEditApplication = (app: AdminApplication) => {
    setEditingApplication(app);
    setShowModal(true);
  };

  const handleSubmitApplication = async (data: CreateApplicationData | UpdateApplicationData) => {
    console.log("handleSubmitApplication called with:", data);
    try {
      setSubmitting(true);

      let response;
      if (editingApplication) {
        console.log("Updating existing application:", editingApplication.id);
        // Update data for existing application
        response = await apiClient.updateApplication(
          editingApplication.id,
          data as UpdateApplicationData,
        );
      } else {
        console.log("Creating new application with data:", data);
        response = await apiClient.createApplication(data as CreateApplicationData);
      }

      if (response.error) {
        if (!handleSessionExpiredError({ message: response.error })) {
          error.value = response.error;
          showError(response.error);
        }
      } else {
        setShowModal(false);
        await loadApplications();
        showSuccess(
          editingApplication
            ? "Application updated successfully"
            : "Application created successfully",
        );
      }
    } catch (err) {
      console.error("Failed to submit application:", err);
      if (!handleSessionExpiredError(err)) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save application";
        error.value = errorMessage;
        showError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    try {
      const response = await apiClient.updateApplicationStatus(appId, status);

      if (response.error) {
        if (!handleSessionExpiredError({ message: response.error })) {
          error.value = response.error;
          showError(response.error);
        }
      } else {
        await loadApplications();
        showSuccess(`Application status updated to ${status}`);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      if (!handleSessionExpiredError(err)) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update status";
        error.value = errorMessage;
        showError(errorMessage);
      }
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (
      !confirm("Are you sure you want to delete this application? This action cannot be undone.")
    ) {
      return;
    }

    try {
      const response = await apiClient.deleteApplication(appId);

      if (response.error) {
        if (!handleSessionExpiredError({ message: response.error })) {
          error.value = response.error;
          showError(response.error);
        }
      } else {
        await loadApplications();
        showSuccess("Application deleted successfully");
      }
    } catch (err) {
      console.error("Failed to delete application:", err);
      if (!handleSessionExpiredError(err)) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete application";
        error.value = errorMessage;
        showError(errorMessage);
      }
    }
  };

  const handleSelectionChange = (appId: string, selected: boolean) => {
    const newSelection = new Set(selectedApplications.value);
    if (selected) {
      newSelection.add(appId);
    } else {
      newSelection.delete(appId);
    }
    selectedApplications.value = newSelection;
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      selectedApplications.value = new Set(applications.value.map((app) => app.id));
    } else {
      selectedApplications.value = new Set();
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedApplications.value.size === 0) return;

    try {
      const response = await apiClient.bulkUpdateApplicationStatus(
        Array.from(selectedApplications.value),
        bulkAction,
      );

      if (response.error) {
        if (!handleSessionExpiredError({ message: response.error })) {
          error.value = response.error;
        }
      } else {
        selectedApplications.value = new Set();
        setBulkAction("");
        await loadApplications();
      }
    } catch (err) {
      console.error("Failed to perform bulk action:", err);
      error.value = err instanceof Error ? err.message : "Failed to perform bulk action";
    }
  };

  return (
    <div class="container mx-auto space-y-6">
      {/* Error Alert */}
      {error.value && (
        <Alert color="error">
          {error.value}
        </Alert>
      )}

      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-base-content">Applications</h1>
          <p class="text-base-content/70 mt-1">Manage platform applications</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateApplication}
          aria-label="Create new application"
          class="gap-2"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Application
        </Button>
      </div>

      {/* Filters and Search */}
      <Card class="p-4">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <Input
              placeholder="Search applications..."
              value={filters.search || ""}
              onChange={(e) => handleSearch((e.target as HTMLInputElement).value)}
              aria-label="Search applications"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            <Select
              value={filters.status || ""}
              onChange={(e) =>
                handleStatusFilter(
                  (e.target as HTMLSelectElement).value as unknown as ApplicationStatus,
                )}
              placeholder="All Status"
              options={[
                { value: "", label: "All Status" },
                { value: "draft", label: "Draft" },
                { value: "pending", label: "Pending" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              aria-label="Filter by status"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("name")}
              aria-label="Sort by name"
              class="gap-2"
            >
              Name
              {filters.sortBy === "name" && (
                <svg
                  class={`w-4 h-4 ${filters.sortOrder === "desc" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("updated_at")}
              aria-label="Sort by updated date"
              class="gap-2"
            >
              Updated
              {filters.sortBy === "updated_at" && (
                <svg
                  class={`w-4 h-4 ${filters.sortOrder === "desc" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedApplications.value.size > 0 && (
        <Card class="p-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span class="text-sm text-base-content/70">
              {selectedApplications.value.size} application(s) selected
            </span>
            <div class="flex flex-col sm:flex-row gap-2">
              <Select
                value={bulkAction}
                onChange={(e) =>
                  setBulkAction(
                    (e.target as HTMLSelectElement).value as unknown as ApplicationStatus,
                  )}
                placeholder="Select action..."
                size="sm"
                options={[
                  { value: "", label: "Select action..." },
                  { value: "draft", label: "Set to Draft" },
                  { value: "pending", label: "Set to Pending" },
                  { value: "published", label: "Set to Published" },
                  { value: "archived", label: "Set to Archived" },
                ]}
                aria-label="Select bulk action"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                Apply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedApplications.value = new Set()}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Applications List */}
      <Card class="p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 class="text-lg font-semibold">
            Applications ({applications.value.length})
          </h3>
          {applications.value.length > 0 && (
            <div class="flex items-center gap-2">
              <span class="text-sm">Select all</span>
              <Checkbox
                checked={selectedApplications.value.size === applications.value.length}
                onChange={handleSelectAll}
                size="sm"
                disabled={false}
                indeterminate={false}
                aria-label="Select all applications"
              />
            </div>
          )}
        </div>

        <ApplicationList
          applications={applications.value}
          loading={isLoading.value}
          onEdit={handleEditApplication}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteApplication}
          selectedIds={selectedApplications.value}
          onSelectionChange={handleSelectionChange}
          onCreateApplication={handleCreateApplication}
        />
      </Card>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitApplication}
        application={editingApplication}
        loading={submitting}
      />
    </div>
  );
}

// Export utility functions and state
export { applications, error, isLoading, selectedApplications };
