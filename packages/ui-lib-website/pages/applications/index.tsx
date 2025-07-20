import { useEffect, useState } from "preact/hooks";
import {
  useAsyncOperation,
  useModalState,
  usePageAuth,
  useSearchFilter,
} from "../../shared/hooks/mod.ts";
import { ApiHelpers } from "../../shared/lib/api-helpers.ts";
import { ApplicationsPage as ApplicationsPageDisplay } from "./components/ApplicationsPage.tsx";
import type {
  Application,
  CreateApplicationData,
  UpdateApplicationData,
} from "../../shared/lib/api-helpers.ts";

interface MyApplicationsPageProps {
  className?: string;
  // Optional auth prop for testing/mocking
  auth?: {
    user: any;
    loading?: boolean;
  };
}

export function MyApplicationsPage({ className = "", auth }: MyApplicationsPageProps) {
  // Use page auth hook for authentication handling
  const { user, loading: authLoading } = usePageAuth({
    auth,
    redirectIfNotAuthenticated: false, // Show auth required message instead
  });

  // Application data state
  const [applications, setApplications] = useState<Application[]>([]);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);

  // Modal state management
  const createFormModal = useModalState();

  // Search and filter functionality
  const searchFilter = useSearchFilter({
    data: applications,
    searchFields: ["name", "description"],
    filterFunctions: {
      status: (item, value) => item.status === value,
      template: (item, value) => item.template_id === value,
    },
  });

  // Async operations
  const loadApplicationsOperation = useAsyncOperation();
  const createApplicationOperation = useAsyncOperation({
    onSuccess: (newApp) => {
      setApplications((prev) => [newApp, ...prev]);
      createFormModal.closeModal();
    },
  });
  const updateApplicationOperation = useAsyncOperation({
    onSuccess: (updatedApp) => {
      setApplications((prev) => prev.map((app) => app.id === updatedApp.id ? updatedApp : app));
      setEditingApplication(null);
    },
  });
  const deleteApplicationOperation = useAsyncOperation({
    onSuccess: (deletedApp) => {
      setApplications((prev) => prev.filter((app) => app.id !== deletedApp.id));
    },
  });
  const submitForReviewOperation = useAsyncOperation({
    onSuccess: (updatedApp) => {
      setApplications((prev) => prev.map((app) => app.id === updatedApp.id ? updatedApp : app));
    },
  });

  // Load user's applications
  useEffect(() => {
    if (!user) return;

    loadApplicationsOperation.execute(async () => {
      const userApps = await ApiHelpers.getUserApplications(user.id);
      setApplications(userApps);
      return userApps;
    });
  }, [user]);

  // Handlers
  const handleShowCreateForm = () => {
    createFormModal.openModal();
  };

  const handleHideForm = () => {
    createFormModal.closeModal();
    setEditingApplication(null);
  };

  const handleFormSubmit = async (data: CreateApplicationData | UpdateApplicationData) => {
    if (editingApplication) {
      await updateApplicationOperation.execute(async () => {
        const updatedApp = await ApiHelpers.updateApplication(
          editingApplication.id,
          data as UpdateApplicationData,
        );
        return updatedApp;
      });
    } else {
      await createApplicationOperation.execute(async () => {
        const newApp = await ApiHelpers.createApplication(user.id, data as CreateApplicationData);
        return newApp;
      });
    }
  };

  const handleEditApplication = (app: Application) => {
    if (app.status === "draft") {
      setEditingApplication(app);
    } else {
      alert(
        "Only draft applications can be edited. Published or pending applications cannot be modified.",
      );
    }
  };

  const handleDeleteApplication = async (application: Application) => {
    if (!confirm(`Are you sure you want to delete "${application.name}"?`)) {
      return;
    }

    await deleteApplicationOperation.execute(async () => {
      await ApiHelpers.deleteApplication(application.id);
      return application;
    });
  };

  const handleSubmitForReview = async (application: Application) => {
    if (
      !confirm(
        `Submit "${application.name}" for review? Once submitted, you won't be able to edit it until it's reviewed.`,
      )
    ) {
      return;
    }

    await submitForReviewOperation.execute(async () => {
      const updatedApp = await ApiHelpers.submitForReview(application.id);
      return updatedApp;
    });
  };

  const handleViewApplication = (app: Application) => {
    console.log("View application:", app);
  };

  const searchFilters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "draft", label: "Draft" },
        { value: "pending", label: "Pending Review" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "template",
      label: "Template",
      options: [
        { value: "fresh-basic", label: "Fresh Basic" },
      ],
    },
  ];

  // Determine if any operation is loading
  const isAnyOperationLoading = createApplicationOperation.loading ||
    updateApplicationOperation.loading ||
    deleteApplicationOperation.loading ||
    submitForReviewOperation.loading;

  return (
    <ApplicationsPageDisplay
      className={className}
      user={user}
      authLoading={authLoading}
      applications={applications}
      filteredApplications={searchFilter.filteredData}
      isLoading={loadApplicationsOperation.loading}
      showCreateForm={createFormModal.isOpen}
      editingApplication={editingApplication}
      isSubmitting={isAnyOperationLoading}
      searchFilters={searchFilters}
      onShowCreateForm={handleShowCreateForm}
      onHideForm={handleHideForm}
      onFormSubmit={handleFormSubmit}
      onSearch={searchFilter.handleSearch}
      onEditApplication={handleEditApplication}
      onDeleteApplication={handleDeleteApplication}
      onSubmitForReview={handleSubmitForReview}
      onViewApplication={handleViewApplication}
    />
  );
}

export default MyApplicationsPage;
