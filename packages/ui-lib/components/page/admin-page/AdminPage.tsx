import { BaseComponentProps } from "../../types.ts";
import { Loading } from "../../feedback/loading/Loading.tsx";
import { Button } from "../../action/button/Button.tsx";
import { Card } from "../../display/card/Card.tsx";
import { Badge } from "../../display/badge/Badge.tsx";
import { Alert } from "../../feedback/alert/Alert.tsx";
import { Input } from "../../input/input/Input.tsx";
import { Textarea } from "../../input/textarea/Textarea.tsx";
import { Modal } from "../../action/modal/Modal.tsx";
import { Tabs } from "../../navigation/tabs/Tabs.tsx";
import { Checkbox } from "../../input/checkbox/Checkbox.tsx";
import { Table } from "../../display/table/Table.tsx";
import { Pagination } from "../../navigation/pagination/Pagination.tsx";

// These would need to be moved to ui-lib components eventually
import { ApplicationCard } from "../../display/card/ApplicationCard.tsx";
import { EnhancedSearchBar } from "../../input/enhanced-search-bar/EnhancedSearchBar.tsx";
import type { Application, ApplicationReview } from "../../../shared/lib/api-helpers.ts";

type TabType = "pending" | "all-apps" | "users";

export interface AdminPageProps extends BaseComponentProps {
  user: any;
  authLoading: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
  activeTab: TabType;
  pendingApplications: Application[];
  allApplications: Application[];
  filteredApplications: Application[];
  selectedApplications: Set<string>;
  selectedApp: Application | null;
  reviews: ApplicationReview[];
  reviewFeedback: string;
  reviewAction: "approved" | "rejected" | null;
  isSubmittingReview: boolean;
  searchFilters: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  onSetActiveTab: (tab: TabType) => void;
  onSetError: (error: string | null) => void;
  onApplicationSelect: (applicationId: string, selected: boolean) => void;
  onBulkApprove: () => void;
  onClearSelection: () => void;
  onReviewApplication: (app: Application, action: "approved" | "rejected" | null) => void;
  onSearch: (query: string, filters: Record<string, string>) => void;
  onCloseModal: () => void;
  onSetReviewFeedback: (feedback: string) => void;
  onSubmitReview: () => void;
  onLoadAllApplications: () => void;
  // Additional customization props
  loginUrl?: string;
  pageTitle?: string;
  showUserManagement?: boolean;
}

export function AdminPage({
  class: className = "",
  user,
  authLoading,
  isLoading,
  isAdmin,
  error,
  activeTab,
  pendingApplications,
  allApplications,
  filteredApplications,
  selectedApplications,
  selectedApp,
  reviews,
  reviewFeedback,
  reviewAction,
  isSubmittingReview,
  searchFilters,
  onSetActiveTab,
  onSetError,
  onApplicationSelect,
  onBulkApprove,
  onClearSelection,
  onReviewApplication,
  onSearch,
  onCloseModal,
  onSetReviewFeedback,
  onSubmitReview,
  onLoadAllApplications,
  loginUrl = "/login",
  pageTitle = "Admin Dashboard",
  showUserManagement = true,
  id,
  ...props
}: AdminPageProps) {
  // Show loading while checking auth and admin status
  if (authLoading || isLoading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <Loading size="lg" variant="spinner" />
      </div>
    );
  }

  // Require authentication
  if (!user) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <Card class="text-center p-8">
          <h1 class="text-2xl font-bold mb-4">Authentication Required</h1>
          <p class="text-base-content/70 mb-4">Please log in to access the admin panel.</p>
          <Button
            as="a"
            href={loginUrl}
            color="primary"
          >
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  // Check admin access
  if (!isAdmin) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <Card class="text-center p-8">
          <div class="text-error text-6xl mb-4">🚫</div>
          <h1 class="text-2xl font-bold mb-4">Access Denied</h1>
          <p class="text-base-content/70 mb-4">
            {error || "You do not have admin privileges to access this page."}
          </p>
          <div class="flex gap-4 justify-center">
            <Button
              as="a"
              href="/"
              variant="outline"
            >
              Go Home
            </Button>
            <Button
              as="a"
              href="/my-applications"
              color="primary"
            >
              My Applications
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div class={`min-h-screen bg-base-200 ${className}`} id={id} {...props}>
      <div class="container mx-auto px-4 py-8">
        {/* Header */}
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold">{pageTitle}</h1>
            <p class="text-base-content/70 mt-2">
              Manage applications and review submissions
            </p>
          </div>
          <div class="flex gap-3">
            <Button
              as="a"
              href="/"
              variant="outline"
            >
              🌟 Public View
            </Button>
            <Button
              as="a"
              href="/my-applications"
              color="primary"
            >
              📱 My Apps
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert type="error" class="mb-6">
            {error}
            <Button
              onClick={() => onSetError(null)}
              variant="ghost"
              size="sm"
              class="ml-4"
            >
              ✕
            </Button>
          </Alert>
        )}

        {/* Tab Navigation */}
        <div class="mb-8">
          <nav class="flex space-x-8">
            <button
              onClick={() => onSetActiveTab("pending")}
              class={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🔍 Pending Review ({pendingApplications.length})
            </button>
            <button
              onClick={() => {
                onSetActiveTab("all-apps");
                if (allApplications.length === 0) {
                  onLoadAllApplications();
                }
              }}
              class={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all-apps"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📊 All Applications ({allApplications.length})
            </button>
            <button
              onClick={() => onSetActiveTab("users")}
              class={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              👥 Users (Coming Soon)
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "pending" && (
          <div>
            {/* Bulk Actions */}
            {selectedApplications.size > 0 && (
              <div class="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <span class="text-orange-800">
                    {selectedApplications.size} application(s) selected
                  </span>
                  <div class="space-x-3">
                    <button
                      onClick={onBulkApprove}
                      disabled={isSubmittingReview}
                      class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      ✅ Bulk Approve
                    </button>
                    <button
                      onClick={onClearSelection}
                      class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Applications Grid */}
            {pendingApplications.length === 0
              ? (
                <div class="text-center py-12">
                  <div class="text-gray-400 text-6xl mb-4">✅</div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    No pending applications
                  </h3>
                  <p class="text-gray-600">
                    All applications have been reviewed! Check back later for new submissions.
                  </p>
                </div>
              )
              : (
                <div class="space-y-4">
                  {pendingApplications.map((application) => (
                    <div
                      key={application.id}
                      class="bg-white rounded-lg shadow-md border border-gray-200 p-6"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedApplications.has(application.id)}
                            onChange={(e) =>
                              onApplicationSelect(
                                application.id,
                                (e.target as HTMLInputElement).checked,
                              )}
                            class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">
                              {application.name}
                            </h3>
                            {application.description && (
                              <p class="text-gray-600 mb-3">{application.description}</p>
                            )}
                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                📅 Submitted:{" "}
                                {new Date(application.updated_at).toLocaleDateString()}
                              </span>
                              <span>🏗️ Template: {application.template_id}</span>
                              {(application as any).users && (
                                <span>
                                  👤 By: {(application as any).users.display_name ||
                                    (application as any).users.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div class="flex space-x-2">
                          <button
                            onClick={() => onReviewApplication(application, "approved")}
                            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => onReviewApplication(application, "rejected")}
                            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            ❌ Reject
                          </button>
                          <button
                            onClick={() => onReviewApplication(application, null)}
                            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            👁️ Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {activeTab === "all-apps" && (
          <div>
            {/* Search and Filters */}
            <div class="mb-6">
              <EnhancedSearchBar
                placeholder="Search all applications..."
                onSearch={onSearch}
                filters={searchFilters}
                className="max-w-2xl"
              />
            </div>

            {/* Applications Grid */}
            {filteredApplications.length === 0
              ? (
                <div class="text-center py-12">
                  <div class="text-gray-400 text-6xl mb-4">📱</div>
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    No applications found
                  </h3>
                  <p class="text-gray-600">
                    Try adjusting your search or filters
                  </p>
                </div>
              )
              : (
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onView={(app) => onReviewApplication(app, null)}
                      // Admins can view but not edit/delete from this view
                    />
                  ))}
                </div>
              )}
          </div>
        )}

        {activeTab === "users" && (
          <div class="text-center py-12">
            <div class="text-gray-400 text-6xl mb-4">👥</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              User Management
            </h3>
            <p class="text-gray-600">
              User management features are coming soon! This will include user roles, activity
              monitoring, and account management tools.
            </p>
          </div>
        )}

        {/* Application Review Modal */}
        {selectedApp && (
          <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div class="mt-3">
                {/* Modal Header */}
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-2xl font-bold text-gray-900">
                    {reviewAction === "approved"
                      ? "✅ Approve Application"
                      : reviewAction === "rejected"
                      ? "❌ Reject Application"
                      : "👁️ Application Details"}
                  </h3>
                  <button
                    onClick={onCloseModal}
                    class="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Application Details */}
                <div class="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 class="text-lg font-semibold mb-3">{selectedApp.name}</h4>
                  {selectedApp.description && (
                    <p class="text-gray-600 mb-4">{selectedApp.description}</p>
                  )}
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="font-medium text-gray-700">Status:</span>
                      <span
                        class={`ml-2 px-2 py-1 rounded-full text-xs ${
                          selectedApp.status === "pending"
                            ? "bg-orange-100 text-orange-800"
                            : selectedApp.status === "published"
                            ? "bg-green-100 text-green-800"
                            : selectedApp.status === "draft"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedApp.status}
                      </span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700">Template:</span>
                      <span class="ml-2">{selectedApp.template_id}</span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700">Created:</span>
                      <span class="ml-2">
                        {new Date(selectedApp.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700">Updated:</span>
                      <span class="ml-2">
                        {new Date(selectedApp.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Previous Reviews */}
                {reviews.length > 0 && (
                  <div class="mb-6">
                    <h4 class="text-lg font-semibold mb-3">Review History</h4>
                    <div class="space-y-3">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          class={`p-4 rounded-lg border ${
                            review.action === "approved"
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div class="flex items-center justify-between mb-2">
                            <span
                              class={`font-medium ${
                                review.action === "approved" ? "text-green-800" : "text-red-800"
                              }`}
                            >
                              {review.action === "approved" ? "✅ Approved" : "❌ Rejected"}
                            </span>
                            <span class="text-sm text-gray-500">
                              {new Date(review.reviewed_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.feedback && (
                            <p class="text-gray-700 text-sm">{review.feedback}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Actions */}
                {reviewAction && (
                  <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {reviewAction === "approved"
                        ? "Approval Message (Optional)"
                        : "Rejection Reason (Required)"}
                    </label>
                    <textarea
                      value={reviewFeedback}
                      onChange={(e) => onSetReviewFeedback((e.target as HTMLTextAreaElement).value)}
                      rows={4}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={reviewAction === "approved"
                        ? "Optional feedback for the applicant..."
                        : "Please explain why this application is being rejected..."}
                    />
                  </div>
                )}

                {/* Modal Actions */}
                <div class="flex justify-end space-x-3">
                  <button
                    onClick={onCloseModal}
                    class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  {reviewAction && (
                    <button
                      onClick={onSubmitReview}
                      disabled={isSubmittingReview ||
                        (reviewAction === "rejected" && !reviewFeedback.trim())}
                      class={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        reviewAction === "approved"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      {isSubmittingReview
                        ? <Loading size="sm" variant="spinner" />
                        : reviewAction === "approved"
                        ? (
                          "✅ Approve Application"
                        )
                        : (
                          "❌ Reject Application"
                        )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
