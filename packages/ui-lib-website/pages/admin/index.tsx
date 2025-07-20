import { useEffect, useState } from "preact/hooks";
import {
  useAsyncOperation,
  useModalState,
  usePageAuth,
  useSearchFilter,
} from "../../shared/hooks/mod.ts";
import { ApiHelpers } from "../../shared/lib/api-helpers.ts";
import { AdminPage as AdminPageDisplay } from "./components/AdminPage.tsx";
import type { Application, ApplicationReview } from "../../shared/lib/api-helpers.ts";

type TabType = "pending" | "all-apps" | "users";

interface AdminPageProps {
  className?: string;
  // Optional auth prop for testing/mocking
  auth?: {
    user: any;
    loading?: boolean;
  };
}

export function AdminPage({ className = "", auth }: AdminPageProps) {
  // Use page auth hook for authentication handling
  const { user, loading: authLoading } = usePageAuth({
    auth,
    redirectIfNotAuthenticated: false, // Show access denied message instead
  });

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());

  // Application data
  const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);

  // Review modal state
  const reviewModal = useModalState();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [reviews, setReviews] = useState<ApplicationReview[]>([]);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected" | null>(null);

  // Search and filter for all applications
  const searchFilter = useSearchFilter({
    data: allApplications,
    searchFields: ["name", "description"],
    filterFunctions: {
      status: (item, value) => item.status === value,
      template: (item, value) => item.template_id === value,
    },
  });

  // Async operations
  const adminCheckOperation = useAsyncOperation({
    onSuccess: (isAdminResult) => {
      setIsAdmin(isAdminResult);
    },
  });

  const loadPendingOperation = useAsyncOperation({
    onSuccess: (pending) => {
      setPendingApplications(pending);
    },
  });

  const loadAllApplicationsOperation = useAsyncOperation({
    onSuccess: (all) => {
      setAllApplications(all);
    },
  });

  const loadReviewsOperation = useAsyncOperation({
    onSuccess: (appReviews) => {
      setReviews(appReviews);
    },
  });

  const submitReviewOperation = useAsyncOperation({
    onSuccess: () => {
      reviewModal.closeModal();
      setReviewFeedback("");
      setReviewAction(null);
      // Reload data after review
      loadPendingOperation.execute(() => ApiHelpers.getPendingApplications());
      if (activeTab === "all-apps") {
        loadAllApplicationsOperation.execute(() => ApiHelpers.getAllApplicationsAdmin());
      }
    },
  });

  const bulkApproveOperation = useAsyncOperation({
    onSuccess: () => {
      setSelectedApplications(new Set());
      loadPendingOperation.execute(() => ApiHelpers.getPendingApplications());
    },
  });

  // Initialize admin data
  useEffect(() => {
    if (!user) return;

    adminCheckOperation.execute(async () => {
      const adminStatus = await ApiHelpers.isAdmin(user.id);
      if (adminStatus) {
        await loadPendingOperation.execute(() => ApiHelpers.getPendingApplications());
      }
      return adminStatus;
    });
  }, [user]);

  // Load all applications when tab changes
  useEffect(() => {
    if (!isAdmin || activeTab !== "all-apps") return;

    loadAllApplicationsOperation.execute(() => ApiHelpers.getAllApplicationsAdmin());
  }, [isAdmin, activeTab]);

  // Handler functions
  const handleSetActiveTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleSetError = (error: string | null) => {
    // Could use a global error state or toast system here
    if (error) {
      console.error("Admin error:", error);
    }
  };

  const handleApplicationSelect = (appId: string, selected: boolean) => {
    setSelectedApplications((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(appId);
      } else {
        newSet.delete(appId);
      }
      return newSet;
    });
  };

  const handleBulkApprove = async () => {
    if (selectedApplications.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to approve ${selectedApplications.size} application(s)?`,
    );
    if (!confirmed) return;

    await bulkApproveOperation.execute(async () => {
      const promises = Array.from(selectedApplications).map((appId) =>
        ApiHelpers.approveApplication(appId, user.id, "Bulk approved")
      );
      await Promise.all(promises);
    });
  };

  const handleClearSelection = () => {
    setSelectedApplications(new Set());
  };

  const handleReviewApplicationModal = async (app: Application) => {
    setSelectedApp(app);
    setReviewFeedback("");
    setReviewAction(null);
    reviewModal.openModal();

    // Load reviews for this application
    await loadReviewsOperation.execute(() => ApiHelpers.getApplicationReviews(app.id));
  };

  const handleCloseModal = () => {
    reviewModal.closeModal();
    setSelectedApp(null);
    setReviews([]);
    setReviewFeedback("");
    setReviewAction(null);
  };

  const handleSetReviewFeedback = (feedback: string) => {
    setReviewFeedback(feedback);
  };

  const handleSubmitReview = async () => {
    if (!selectedApp || !reviewAction) return;

    await submitReviewOperation.execute(async () => {
      if (reviewAction === "approved") {
        await ApiHelpers.approveApplication(selectedApp.id, user.id, reviewFeedback);
      } else {
        await ApiHelpers.rejectApplication(selectedApp.id, user.id, reviewFeedback);
      }
    });
  };

  const handleLoadAllApplications = async () => {
    await loadAllApplicationsOperation.execute(() => ApiHelpers.getAllApplicationsAdmin());
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

  // Determine loading state
  const isLoading = adminCheckOperation.loading ||
    loadPendingOperation.loading ||
    loadAllApplicationsOperation.loading;

  // Determine if any operation has an error
  const error = adminCheckOperation.error ||
    loadPendingOperation.error ||
    loadAllApplicationsOperation.error ||
    submitReviewOperation.error ||
    bulkApproveOperation.error;

  return (
    <AdminPageDisplay
      className={className}
      user={user}
      authLoading={authLoading}
      isLoading={isLoading}
      isAdmin={isAdmin}
      error={error}
      activeTab={activeTab}
      pendingApplications={pendingApplications}
      allApplications={allApplications}
      filteredApplications={searchFilter.filteredData}
      selectedApplications={selectedApplications}
      selectedApp={selectedApp}
      reviews={reviews}
      reviewFeedback={reviewFeedback}
      reviewAction={reviewAction}
      isSubmittingReview={submitReviewOperation.loading}
      searchFilters={searchFilters}
      onSetActiveTab={handleSetActiveTab}
      onSetError={handleSetError}
      onApplicationSelect={handleApplicationSelect}
      onBulkApprove={handleBulkApprove}
      onClearSelection={handleClearSelection}
      onReviewApplication={handleReviewApplicationModal}
      onSearch={searchFilter.handleSearch}
      onCloseModal={handleCloseModal}
      onSetReviewFeedback={handleSetReviewFeedback}
      onSubmitReview={handleSubmitReview}
      onLoadAllApplications={handleLoadAllApplications}
    />
  );
}

export default AdminPage;
