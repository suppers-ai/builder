/**
 * EntityManagementIsland Component
 * Entity management interface with search, filtering, detail views, and status management
 */

import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import { showError, showSuccess, showWarning } from "../lib/toast-manager.ts";
import { EntityManagementForm, handleSessionExpiredError } from "@suppers/ui-lib";
import type { EntityStatus } from "@suppers/shared";
import { getAuthClient } from "../lib/auth.ts";
import { EmptyState, Loading, Skeleton } from "@suppers/ui-lib";
import { type AdminEntity, EntityApiClient } from "../lib/api-client/entities/entity-api.ts";

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

// Global state for entity management
const entities = signal<AdminEntity[]>([]);
const isLoading = signal<boolean>(true);
const error = signal<string | null>(null);
const selectedEntities = signal<Set<string>>(new Set());

interface EntityListProps {
  entities: AdminEntity[];
  loading: boolean;
  onViewDetails: (entity: AdminEntity) => void;
  onStatusChange: (entityId: string, status: EntityStatus) => void;
  selectedIds: Set<string>;
  onSelectionChange: (entityId: string, selected: boolean) => void;
}

function EntityList({
  entities,
  loading,
  onViewDetails,
  onStatusChange,
  selectedIds,
  onSelectionChange,
}: EntityListProps) {
  const getStatusBadgeClass = (status: EntityStatus) => {
    switch (status) {
      case "active":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "deleted":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div class="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} class="h-24 w-full" />)}
      </div>
    );
  }

  if (entities.length === 0) {
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        }
        title="No entities found"
        description="No entities match your current filters."
      />
    );
  }

  return (
    <div class="space-y-4">
      {entities.map((entity) => (
        <div
          key={entity.id}
          class="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow"
        >
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 flex-1">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={selectedIds.has(entity.id!)}
                  onChange={(e) =>
                    onSelectionChange(entity.id!, (e.target as HTMLInputElement).checked)}
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-base-content truncate">
                      {entity.name}
                    </h3>
                    <div class={`badge ${getStatusBadgeClass(entity.status || "active")} badge-sm`}>
                      {entity.status || "active"}
                    </div>
                    {entity.verified && (
                      <div class="badge badge-primary badge-sm">
                        Verified
                      </div>
                    )}
                  </div>
                  <div class="flex items-center gap-4 text-sm text-base-content/60">
                    <span>Owner: {entity.owner_email || entity.owner_id}</span>
                    <span>Created: {formatDate(entity.created_at)}</span>
                    <span>Updated: {formatRelativeTime(entity.updated_at)}</span>
                    {entity.tags && entity.tags.length > 0 && (
                      <span>Tags: {entity.tags.length}</span>
                    )}
                    {entity.connected_application_ids &&
                      entity.connected_application_ids.length > 0 && (
                      <span>Apps: {entity.connected_application_ids.length}</span>
                    )}
                  </div>
                  {entity.description && (
                    <p class="text-sm text-base-content/70 mt-2 line-clamp-2">
                      {entity.description}
                    </p>
                  )}
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  class="btn btn-ghost btn-sm"
                  onClick={() => onViewDetails(entity)}
                >
                  Details
                </button>

                {/* Status Dropdown */}
                <div class="dropdown dropdown-end">
                  <div tabIndex={0} role="button" class="btn btn-ghost btn-sm">
                    Status
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <ul
                    tabIndex={0}
                    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    {(["active", "pending", "deleted"] as EntityStatus[]).map((status) => (
                      <li key={status}>
                        <button
                          class={`${(entity.status || "active") === status ? "active" : ""}`}
                          onClick={() =>
                            onStatusChange(entity.id!, status)}
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
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EntityManagementIsland() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EntityStatus | "all">("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<AdminEntity | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [apiClient, setApiClient] = useState<EntityApiClient | null>(null);

  // Initialize API client
  const initializeApiClient = async () => {
    try {
      const authClient = await getAuthClient();
      const client = new EntityApiClient(authClient);
      setApiClient(client);
      return client;
    } catch (err) {
      if (!handleSessionExpiredError(err)) {
        error.value = "Failed to initialize API client";
        showError("Failed to initialize API client");
      }
      return null;
    }
  };

  // Load entities from API
  const loadEntities = async () => {
    let client = apiClient;
    if (!client) {
      client = await initializeApiClient();
      if (!client) return; // Failed to initialize
    }

    try {
      isLoading.value = true;
      error.value = null;

      const response = await client.getEntities();
      if (response.error) {
        if (!handleSessionExpiredError({ message: response.error })) {
          error.value = response.error;
          showError(response.error);
        }
        return;
      }
      entities.value = Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      if (!handleSessionExpiredError(err)) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load entities";
        error.value = errorMessage;
        showError(errorMessage);
      }
    } finally {
      isLoading.value = false;
    }
  };

  // Handle status change
  const handleStatusChange = async (entityId: string, status: EntityStatus) => {
    if (!apiClient) {
      error.value = "API client not initialized";
      showError("API client not initialized");
      return;
    }

    try {
      const response = await apiClient.updateEntityStatus(entityId, status);

      if (response.error) {
        if (!handleSessionExpiredError({ message: response.error })) {
          error.value = response.error;
          showError(response.error);
        }
      } else {
        await loadEntities();
        showSuccess(`Entity status updated to ${status}`);
      }
    } catch (err) {
      if (!handleSessionExpiredError(err)) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update entity status";
        error.value = errorMessage;
        showError(errorMessage);
      }
    }
  };

  // Handle entity selection
  const handleSelectionChange = (entityId: string, selected: boolean) => {
    const newSelection = new Set(selectedEntities.value);
    if (selected) {
      newSelection.add(entityId);
    } else {
      newSelection.delete(entityId);
    }
    selectedEntities.value = newSelection;
  };

  // Handle view details
  const handleViewDetails = (entity: AdminEntity) => {
    setSelectedEntity(entity);
    setShowDetailsModal(true);
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: EntityStatus) => {
    if (selectedEntities.value.size === 0) {
      showWarning("Please select entities to update");
      return;
    }

    if (!apiClient) {
      error.value = "API client not initialized";
      showError("API client not initialized");
      return;
    }

    try {
      const updates = Array.from(selectedEntities.value).map((id) =>
        apiClient.updateEntityStatus(id, status)
      );

      await Promise.all(updates);
      await loadEntities();
      selectedEntities.value = new Set();
      showSuccess(`Updated ${updates.length} entities to ${status}`);
    } catch (err) {
      if (!handleSessionExpiredError(err)) {
        const errorMessage = err instanceof Error ? err.message : "Failed to bulk update entities";
        showError(errorMessage);
      }
    }
  };

  // Filter entities based on search and status
  const filteredEntities = (entities.value || []).filter((entity) => {
    const matchesSearch = searchTerm === "" ||
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.owner_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || entity.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Initialize component
  useEffect(() => {
    initializeApiClient().then(() => {
      // Load entities after API client is initialized
    });
  }, []);

  // Load entities when apiClient becomes available
  useEffect(() => {
    if (apiClient) {
      loadEntities();
    }
  }, [apiClient]);

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold">Entity Management</h1>
          <p class="text-base-content/60">Manage entities and their status</p>
        </div>
        <div class="flex gap-2">
          <button
            class="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Entity
          </button>
          <button
            class="btn btn-outline"
            onClick={loadEntities}
            disabled={isLoading.value}
          >
            {isLoading.value ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Total Entities</div>
          <div class="stat-value">{(entities.value || []).length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Active</div>
          <div class="stat-value text-success">
            {(entities.value || []).filter((e) => e.status === "active").length}
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">Pending</div>
          <div class="stat-value text-warning">
            {(entities.value || []).filter((e) => e.status === "pending").length}
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">Verified</div>
          <div class="stat-value text-primary">
            {(entities.value || []).filter((e) => e.verified).length}
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="Search entities..."
            class="input input-bordered flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
          />
          <select
            class="select select-bordered w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter((e.target as HTMLSelectElement).value as EntityStatus | "all")}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        {selectedEntities.value.size > 0 && (
          <div class="flex gap-2">
            <span class="text-sm text-base-content/60 self-center">
              {selectedEntities.value.size} selected
            </span>
            <div class="dropdown dropdown-end">
              <div tabIndex={0} role="button" class="btn btn-sm btn-outline">
                Bulk Actions
              </div>
              <ul
                tabIndex={0}
                class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <button onClick={() => handleBulkStatusUpdate("active")}>Set Active</button>
                </li>
                <li>
                  <button onClick={() => handleBulkStatusUpdate("pending")}>Set Pending</button>
                </li>
                <li>
                  <button onClick={() => handleBulkStatusUpdate("deleted")}>Set Deleted</button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error.value && (
        <div class="alert alert-error">
          <span>{error.value}</span>
        </div>
      )}

      {/* Entity List */}
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <EntityList
            entities={filteredEntities}
            loading={isLoading.value}
            onViewDetails={handleViewDetails}
            onStatusChange={handleStatusChange}
            selectedIds={selectedEntities.value}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </div>

      {/* Entity Details Modal */}
      {showDetailsModal && selectedEntity && (
        <div class="modal modal-open">
          <div class="modal-box max-w-4xl">
            <h3 class="font-bold text-lg mb-4">Entity Details</h3>

            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="label">
                    <span class="label-text font-semibold">Name</span>
                  </label>
                  <div class="text-base-content">{selectedEntity.name}</div>
                </div>

                <div>
                  <label class="label">
                    <span class="label-text font-semibold">Status</span>
                  </label>
                  <div class={`badge ${getStatusBadgeClass(selectedEntity.status || "active")}`}>
                    {selectedEntity.status || "active"}
                  </div>
                </div>

                <div>
                  <label class="label">
                    <span class="label-text font-semibold">Owner</span>
                  </label>
                  <div class="text-base-content">
                    {selectedEntity.owner_email || selectedEntity.owner_id}
                  </div>
                </div>

                <div>
                  <label class="label">
                    <span class="label-text font-semibold">Verified</span>
                  </label>
                  <div class="text-base-content">{selectedEntity.verified ? "Yes" : "No"}</div>
                </div>
              </div>

              {selectedEntity.description && (
                <div>
                  <label class="label">
                    <span class="label-text font-semibold">Description</span>
                  </label>
                  <div class="text-base-content">{selectedEntity.description}</div>
                </div>
              )}

              {selectedEntity.tags && selectedEntity.tags.length > 0 && (
                <div>
                  <label class="label">
                    <span class="label-text font-semibold">Tags</span>
                  </label>
                  <div class="flex flex-wrap gap-2">
                    {selectedEntity.tags.map((tag, index) => (
                      <span key={index} class="badge badge-outline">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="label">
                    <span class="label-text font-semibold">Created</span>
                  </label>
                  <div class="text-base-content">
                    {new Date(selectedEntity.created_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  <label class="label">
                    <span class="label-text font-semibold">Updated</span>
                  </label>
                  <div class="text-base-content">
                    {new Date(selectedEntity.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-action">
              <button class="btn" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Entity Modal */}
      {showCreateModal && (
        <EntityManagementForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            // This would need to be implemented in the EntityManagementForm
            // For now, just close the modal
            setShowCreateModal(false);
            await loadEntities();
            return null;
          }}
        />
      )}
    </div>
  );

  // Helper function for status badge classes (needed in details modal)
  function getStatusBadgeClass(status: EntityStatus) {
    switch (status) {
      case "active":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "deleted":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  }
}
