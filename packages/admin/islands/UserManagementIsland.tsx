/**
 * UserManagementIsland Component
 * User management interface with search, filtering, detail views, status management, and activity tracking
 */

import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { showError, showSuccess, showWarning } from "../lib/toast-manager.ts";
import { SessionExpiredModal, useSessionExpiredHandler } from "@suppers/ui-lib";

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};
import type {
  AdminApplication,
  AdminUser,
  UserActivity,
  UserFilters,
  UserRole,
  UserStatus,
  UserStorageDetails,
} from "../types/admin.ts";
import { getAuthClient } from "../lib/auth.ts";
import { formatBytes } from "../lib/format-utils.ts";
import { EmptyState, Loading, Skeleton } from "@suppers/ui-lib";
import { UserApiClient } from "../lib/api-client/users/user-api.ts";

// Global state for user management
const users = signal<AdminUser[]>([]);
const isLoading = signal<boolean>(true);
const error = signal<string | null>(null);
const selectedUsers = signal<Set<string>>(new Set());

interface UserListProps {
  users: AdminUser[];
  loading: boolean;
  onViewDetails: (user: AdminUser) => void;
  onStatusChange: (userId: string, status: UserStatus) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
  selectedIds: Set<string>;
  onSelectionChange: (userId: string, selected: boolean) => void;
}

function UserList({
  users,
  loading,
  onViewDetails,
  onStatusChange,
  onRoleChange,
  selectedIds,
  onSelectionChange,
}: UserListProps) {
  const getStatusBadgeClass = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "badge-success";
      case "suspended":
        return "badge-warning";
      case "deleted":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "badge-primary";
      case "user":
        return "badge-neutral";
      default:
        return "badge-ghost";
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
    return <Skeleton class="h-10 w-full" />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            class="w-16 h-16 mx-auto mb-4 text-base-content/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        }
        title="No users found"
        description="No users match your current filters."
      />
    );
  }

  return (
    <div class="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow"
        >
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 flex-1">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={selectedIds.has(user.id)}
                  onChange={(e) =>
                    onSelectionChange(user.id, (e.target as HTMLInputElement).checked)}
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-base-content truncate">
                      {user.display_name || user.email}
                    </h3>
                    <div class={`badge ${getStatusBadgeClass(user.status || "active")} badge-sm`}>
                      {user.status || "active"}
                    </div>
                    <div class={`badge ${getRoleBadgeClass(user.role)} badge-sm`}>
                      {user.role}
                    </div>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-base-content/60">
                    <span>Email: {user.email}</span>
                    <span>Joined: {formatDate(user.created_at)}</span>
                    {user.lastLoginAt && (
                      <span>Last login: {formatRelativeTime(user.lastLoginAt)}</span>
                    )}
                    <span>Apps: {user.applicationCount || 0}</span>
                    <span>Storage: {formatBytes(user.storage_used)}</span>
                  </div>
                  {(user.first_name || user.last_name) && (
                    <p class="text-sm text-base-content/70 mt-2">
                      {[user.first_name, user.last_name].filter(Boolean).join(" ")}
                    </p>
                  )}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="dropdown dropdown-end">
                  <label tabIndex={0} class="btn btn-sm btn-ghost">
                    Status
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </label>
                  <ul
                    tabIndex={0}
                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    {(["active", "suspended", "deleted"] as UserStatus[]).map((status) => (
                      <li key={status}>
                        <button
                          class={`${(user.status || "active") === status ? "active" : ""}`}
                          onClick={() =>
                            onStatusChange(user.id, status)}
                        >
                          <div class={`badge ${getStatusBadgeClass(status)} badge-sm`}>
                            {status}
                          </div>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div class="dropdown dropdown-end">
                  <label tabIndex={0} class="btn btn-sm btn-ghost">
                    Role
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </label>
                  <ul
                    tabIndex={0}
                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    {(["user", "admin"] as UserRole[]).map((role) => (
                      <li key={role}>
                        <button
                          class={`${user.role === role ? "active" : ""}`}
                          onClick={() => onRoleChange(user.id, role)}
                        >
                          <div class={`badge ${getRoleBadgeClass(role)} badge-sm`}>
                            {role}
                          </div>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  class="btn btn-sm btn-primary"
                  onClick={() => onViewDetails(user)}
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUser;
  loading: boolean;
}

function UserDetailsModal({ isOpen, onClose, user, loading }: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "applications" | "activity" | "storage">(
    "overview",
  );
  const [userApplications, setUserApplications] = useState<AdminApplication[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [storageDetails, setStorageDetails] = useState<UserStorageDetails | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Initialize API client
  const apiClient = new UserApiClient(getAuthClient());

  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user, activeTab]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoadingData(true);

      if (activeTab === "applications") {
        const response = await apiClient.getUserApplications(user.id);
        if (response.data) {
          setUserApplications(response.data);
        }
      } else if (activeTab === "activity") {
        const response = await apiClient.getUserActivity(user.id);
        if (response.data) {
          setUserActivity(response.data);
        }
      } else if (activeTab === "storage") {
        const response = await apiClient.getUserStorageDetails(user.id);
        if (response.data) {
          setStorageDetails(response.data);
        }
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div class="modal modal-open">
      <div class="modal-box w-11/12 max-w-4xl max-h-[90vh]">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-bold text-xl">User Details</h3>
            <p class="text-base-content/70">{user.display_name || user.email}</p>
          </div>
          <button
            class="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div class="tabs tabs-bordered mb-6">
          <button
            class={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            class={`tab ${activeTab === "applications" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            Applications
          </button>
          <button
            class={`tab ${activeTab === "activity" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>
          <button
            class={`tab ${activeTab === "storage" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("storage")}
          >
            Storage
          </button>
        </div>

        {/* Tab Content */}
        <div class="min-h-[400px]">
          {activeTab === "overview" && (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="font-semibold text-lg">Profile Information</h4>
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Email</label>
                    <p class="text-base-content">{user.email}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Display Name</label>
                    <p class="text-base-content">{user.display_name || "Not set"}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">First Name</label>
                    <p class="text-base-content">{user.first_name || "Not set"}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Last Name</label>
                    <p class="text-base-content">{user.last_name || "Not set"}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Role</label>
                    <div class={`badge ${getRoleBadgeClass(user.role)} mt-1`}>
                      {user.role}
                    </div>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Status</label>
                    <div class={`badge ${getStatusBadgeClass(user.status || "active")} mt-1`}>
                      {user.status || "active"}
                    </div>
                  </div>
                </div>
              </div>
              <div class="space-y-4">
                <h4 class="font-semibold text-lg">Account Statistics</h4>
                <div class="space-y-3">
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Member Since</label>
                    <p class="text-base-content">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Last Login</label>
                    <p class="text-base-content">
                      {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "Never"}
                    </p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Applications</label>
                    <p class="text-base-content">{user.applicationCount || 0}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Storage Used</label>
                    <p class="text-base-content">{formatBytes(user.storage_used)}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Storage Limit</label>
                    <p class="text-base-content">{formatBytes(user.storage_limit)}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-base-content/70">Bandwidth Used</label>
                    <p class="text-base-content">{formatBytes(user.bandwidth_used)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div>
              <h4 class="font-semibold text-lg mb-4">User Applications</h4>
              {loadingData
                ? (
                  <div class="flex justify-center py-8">
                    <Loading size="lg" />
                  </div>
                )
                : userApplications.length === 0
                ? <EmptyState title="No applications found" />
                : (
                  <div class="space-y-3">
                    {userApplications.map((app) => (
                      <div key={app.id} class="card bg-base-200 shadow-sm">
                        <div class="card-body p-4">
                          <div class="flex items-center justify-between">
                            <div>
                              <h5 class="font-semibold">{app.name}</h5>
                              <p class="text-sm text-base-content/60">{app.description}</p>
                            </div>
                            <div class="flex items-center gap-2">
                              <div
                                class={`badge ${
                                  getStatusBadgeClass(app.status as UserStatus)
                                } badge-sm`}
                              >
                                {app.status}
                              </div>
                              <span class="text-sm text-base-content/60">
                                {new Date(app.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <h4 class="font-semibold text-lg mb-4">Recent Activity</h4>
              {loadingData
                ? (
                  <div class="flex justify-center py-8">
                    <span class="loading loading-spinner loading-lg"></span>
                  </div>
                )
                : userActivity.length === 0
                ? <p class="text-center text-base-content/60 py-8">No activity found</p>
                : (
                  <div class="space-y-3">
                    {userActivity.map((activity) => (
                      <div key={activity.id} class="card bg-base-200 shadow-sm">
                        <div class="card-body p-4">
                          <div class="flex items-start justify-between">
                            <div class="flex-1">
                              <p class="font-medium">{activity.description}</p>
                              <p class="text-sm text-base-content/60 mt-1">
                                {activity.type} • {formatRelativeTime(activity.timestamp)}
                              </p>
                            </div>
                            {activity.ipAddress && (
                              <span class="text-xs text-base-content/50">
                                {activity.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {activeTab === "storage" && (
            <div>
              <h4 class="font-semibold text-lg mb-4">Storage Details</h4>
              {loadingData
                ? (
                  <div class="flex justify-center py-8">
                    <span class="loading loading-spinner loading-lg"></span>
                  </div>
                )
                : !storageDetails
                ? <p class="text-center text-base-content/60 py-8">No storage details available</p>
                : (
                  <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="stat bg-base-200 rounded-lg">
                        <div class="stat-title">Storage Used</div>
                        <div class="stat-value text-2xl">
                          {formatBytes(storageDetails.storageUsed)}
                        </div>
                        <div class="stat-desc">of {formatBytes(storageDetails.storageLimit)}</div>
                      </div>
                      <div class="stat bg-base-200 rounded-lg">
                        <div class="stat-title">Bandwidth Used</div>
                        <div class="stat-value text-2xl">
                          {formatBytes(storageDetails.bandwidthUsed)}
                        </div>
                        <div class="stat-desc">of {formatBytes(storageDetails.bandwidthLimit)}</div>
                      </div>
                    </div>

                    {storageDetails.applicationBreakdown.length > 0 && (
                      <div>
                        <h5 class="font-semibold mb-3">Storage by Application</h5>
                        <div class="space-y-2">
                          {storageDetails.applicationBreakdown.map((app) => (
                            <div
                              key={app.applicationId}
                              class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                            >
                              <span class="font-medium">{app.applicationName}</span>
                              <div class="text-right">
                                <div class="text-sm">{formatBytes(app.storageUsed)}</div>
                                <div class="text-xs text-base-content/60">
                                  Bandwidth: {formatBytes(app.bandwidthUsed)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function getStatusBadgeClass(status: UserStatus): string {
    switch (status) {
      case "active":
        return "badge-success";
      case "suspended":
        return "badge-warning";
      case "deleted":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  }

  function getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case "admin":
        return "badge-primary";
      case "user":
        return "badge-neutral";
      default:
        return "badge-ghost";
    }
  }
}

export default function UserManagementIsland() {
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: undefined,
    status: undefined,
    sortBy: "created_at",
    sortOrder: "desc",
    limit: 20,
    offset: 0,
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | undefined>();
  const [bulkAction, setBulkAction] = useState<
    { type: "status" | "role"; value: UserStatus | UserRole } | null
  >(null);

  // Session expired handler
  const sessionHandler = useSessionExpiredHandler({
    onLogin: () => {
      globalThis.location.href = "/auth/login";
    },
    onSignOut: () => {
      getAuthClient().signOut().then(() => {
        globalThis.location.href = "/";
      });
    },
  });

  // Initialize API client
  const apiClient = new UserApiClient(getAuthClient());

  // Load users
  const loadUsers = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await apiClient.getUsersFiltered(filters);

      if (response.error) {
        // Check if this is a session expired error first
        if (sessionHandler.handleSessionExpiredError({ message: response.error })) {
          // Session expired - clear error state and user data, modal will handle the rest
          error.value = null;
          users.value = [];
        } else {
          // Not a session error, show normal error handling
          error.value = response.error;
          users.value = [];
          showError(response.error);
        }
      } else {
        users.value = response.data || [];
      }
    } catch (err) {
      console.error("Failed to load users:", err);

      // Check if this is a session expired error
      if (sessionHandler.handleSessionExpiredError(err)) {
        // Session expired - clear error state and user data, modal will handle the rest
        error.value = null;
        users.value = [];
      } else {
        // Not a session error, handle normally
        const errorMessage = err instanceof Error ? err.message : "Failed to load users";
        error.value = errorMessage;
        users.value = [];
        showError(errorMessage);
      }
    } finally {
      isLoading.value = false;
    }
  };

  // Load users on component mount and filter changes
  useEffect(() => {
    loadUsers();
  }, [filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, offset: 0 }));
  };

  const handleRoleFilter = (role: UserRole | "") => {
    setFilters((prev) => ({ ...prev, role: role || undefined, offset: 0 }));
  };

  const handleStatusFilter = (status: UserStatus | "") => {
    setFilters((prev) => ({ ...prev, status: status || undefined, offset: 0 }));
  };

  const handleSort = (sortBy: UserFilters["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
      offset: 0,
    }));
  };

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    try {
      const response = await apiClient.updateUserStatus(userId, status);

      if (response.error) {
        // Check if this is a session expired error first
        if (sessionHandler.handleSessionExpiredError({ message: response.error })) {
          // Session expired - clear error state, modal will handle the rest
          error.value = null;
        } else {
          // Not a session error, show normal error handling
          error.value = response.error;
          showError(response.error);
        }
      } else {
        await loadUsers();
        showSuccess(`User status updated to ${status}`);
      }
    } catch (err) {
      console.error("Failed to update user status:", err);

      // Check if this is a session expired error
      if (sessionHandler.handleSessionExpiredError(err)) {
        // Session expired - clear error state, modal will handle the rest
        error.value = null;
      } else {
        // Not a session error, handle normally
        const errorMessage = err instanceof Error ? err.message : "Failed to update user status";
        error.value = errorMessage;
        showError(errorMessage);
      }
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const response = await apiClient.updateUserRole(userId, role);

      if (response.error) {
        // Check if this is a session expired error first
        if (sessionHandler.handleSessionExpiredError({ message: response.error })) {
          // Session expired - clear error state, modal will handle the rest
          error.value = null;
        } else {
          // Not a session error, show normal error handling
          error.value = response.error;
          showError(response.error);
        }
      } else {
        await loadUsers();
        showSuccess(`User role updated to ${role}`);
      }
    } catch (err) {
      console.error("Failed to update user role:", err);

      // Check if this is a session expired error
      if (sessionHandler.handleSessionExpiredError(err)) {
        // Session expired - clear error state, modal will handle the rest
        error.value = null;
      } else {
        // Not a session error, handle normally
        const errorMessage = err instanceof Error ? err.message : "Failed to update user role";
        error.value = errorMessage;
        showError(errorMessage);
      }
    }
  };

  const handleSelectionChange = (userId: string, selected: boolean) => {
    const newSelection = new Set(selectedUsers.value);
    if (selected) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    selectedUsers.value = newSelection;
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      selectedUsers.value = new Set(users.value.map((user) => user.id));
    } else {
      selectedUsers.value = new Set();
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.value.size === 0) return;

    try {
      if (bulkAction.type === "status") {
        const response = await apiClient.bulkUpdateUserStatus(
          Array.from(selectedUsers.value),
          bulkAction.value as UserStatus,
        );

        if (response.error) {
          error.value = response.error;
        } else {
          selectedUsers.value = new Set();
          setBulkAction(null);
          await loadUsers();
        }
      }
    } catch (err) {
      console.error("Failed to perform bulk action:", err);

      // Check if this is a session expired error
      if (sessionHandler.handleSessionExpiredError(err)) {
        // Session expired - clear error state, modal will handle the rest
        error.value = null;
      } else {
        // Not a session error, handle normally
        error.value = err instanceof Error ? err.message : "Failed to perform bulk action";
      }
    }
  };

  return (
    <div class="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-base-content">Users</h1>
          <p class="text-base-content/70 mt-1">Manage platform users</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div class="card bg-base-100 shadow-sm border border-base-200">
        <div class="card-body p-4">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1">
              <input
                type="text"
                class="input input-bordered w-full"
                placeholder="Search users by email or name..."
                value={filters.search || ""}
                onChange={(e) => handleSearch((e.target as HTMLInputElement).value)}
              />
            </div>
            <div class="flex gap-2">
              <select
                class="select select-bordered"
                value={filters.role || ""}
                onChange={(e) =>
                  handleRoleFilter((e.target as HTMLSelectElement).value as UserRole)}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <select
                class="select select-bordered"
                value={filters.status || ""}
                onChange={(e) =>
                  handleStatusFilter((e.target as HTMLSelectElement).value as UserStatus)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
              <button
                class="btn btn-outline"
                onClick={() => handleSort("email")}
              >
                Email
                {filters.sortBy === "email" && (
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
              </button>
              <button
                class="btn btn-outline"
                onClick={() => handleSort("created_at")}
              >
                Joined
                {filters.sortBy === "created_at" && (
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
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.value.size > 0 && (
        <div class="card bg-base-100 shadow-sm border border-base-200">
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-base-content/70">
                {selectedUsers.value.size} user(s) selected
              </span>
              <div class="flex items-center gap-2">
                <select
                  class="select select-bordered select-sm"
                  value={bulkAction ? `${bulkAction.type}:${bulkAction.value}` : ""}
                  onChange={(e) => {
                    const value = (e.target as HTMLSelectElement).value;
                    if (value) {
                      const [type, actionValue] = value.split(":");
                      setBulkAction({
                        type: type as "status" | "role",
                        value: actionValue as UserStatus | UserRole,
                      });
                    } else {
                      setBulkAction(null);
                    }
                  }}
                >
                  <option value="">Select action...</option>
                  <option value="status:active">Set to Active</option>
                  <option value="status:suspended">Set to Suspended</option>
                  <option value="status:deleted">Set to Deleted</option>
                </select>
                <button
                  class="btn btn-sm btn-primary"
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                >
                  Apply
                </button>
                <button
                  class="btn btn-sm btn-ghost"
                  onClick={() => selectedUsers.value = new Set()}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div class="card bg-base-100 shadow-sm border border-base-200">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">
              Users ({users.value.length})
            </h3>
            {users.value.length > 0 && (
              <label class="label cursor-pointer gap-2">
                <span class="label-text text-sm">Select all</span>
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={selectedUsers.value.size === users.value.length}
                  onChange={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
                />
              </label>
            )}
          </div>

          <UserList
            users={users.value}
            loading={isLoading.value}
            onViewDetails={handleViewDetails}
            onStatusChange={handleStatusChange}
            onRoleChange={handleRoleChange}
            selectedIds={selectedUsers.value}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        user={selectedUser}
        loading={false}
      />

      {/* Error Toast */}
      {error.value && (
        <div class="toast toast-end">
          <div class="alert alert-error">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm">{error.value}</span>
            <button
              class="btn btn-sm btn-ghost"
              onClick={() => error.value = null}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Session Expired Modal */}
      <SessionExpiredModal
        open={sessionHandler.isSessionExpiredModalOpen}
        onLogin={sessionHandler.handleLogin}
        onSignOut={sessionHandler.handleSignOut}
        onClose={sessionHandler.hideSessionExpiredModal}
      />
    </div>
  );
}

// Export utility functions and state
export { error, isLoading, selectedUsers, users };
