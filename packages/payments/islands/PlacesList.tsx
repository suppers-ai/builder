import { useState } from "preact/hooks";
import { Entity } from "@suppers/shared";
import { EntityManagementForm } from "@suppers/ui-lib";
import { useEntities } from "../hooks/useEntities.ts";
import { useApplications } from "../hooks/useApplications.ts";
import EntityDetail from "./EntityDetail.tsx";

interface EntitiesListProps {
  isAdmin?: boolean;
}

export default function EntitiesList({ isAdmin = false }: EntitiesListProps) {
  const { entities, loading, error, deleteEntity, createEntity, updateEntity } = useEntities();
  const { applications } = useApplications();
  const [showForm, setShowForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter entities based on search and status
  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = entity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || entity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity);
    setShowForm(true);
  };

  const handleView = (entity: Entity) => {
    setSelectedEntity(entity);
  };

  const handleDelete = async (entity: Entity) => {
    if (confirm(`Are you sure you want to delete "${entity.name}"?`)) {
      await deleteEntity(entity.id);
    }
  };

  const handleFormSave = async (data: any) => {
    if (editingEntity) {
      const result = await updateEntity(editingEntity.id, data);
      if (result) {
        setShowForm(false);
        setEditingEntity(null);
        return result;
      }
    } else {
      const result = await createEntity(data);
      if (result) {
        setShowForm(false);
        setEditingEntity(null);
        return result;
      }
    }
    return null;
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntity(null);
  };

  const handleDetailClose = () => {
    setSelectedEntity(null);
  };

  const handleDetailUpdate = (updatedEntity: Entity) => {
    // Refresh the entities list
    setSelectedEntity(updatedEntity);
  };

  if (showForm) {
    return (
      <EntityManagementForm
        isOpen={showForm}
        onClose={handleFormCancel}
        entity={editingEntity || undefined}
        applications={applications}
        onSave={handleFormSave}
      />
    );
  }

  if (selectedEntity) {
    return (
      <EntityDetail
        entity={selectedEntity}
        onUpdate={handleDetailUpdate}
        onClose={handleDetailClose}
        isAdmin={isAdmin}
      />
    );
  }

  if (loading) {
    return (
      <div class="flex justify-center items-center min-h-64">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="alert alert-error m-4">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-base-200">
      {/* Header */}
      <div class="bg-base-100 shadow-sm">
        <div class="container mx-auto px-4 py-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-semibold text-base-content">
                {isAdmin ? "All Entities" : "My Entities"}
              </h1>
              <p class="text-base-content/60 text-sm mt-1">
                {filteredEntities.length} of {entities.length} entities
              </p>
            </div>
            <button
              class="btn btn-primary btn-sm"
              onClick={() => setShowForm(true)}
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Entity
            </button>
          </div>

          {/* Filters */}
          <div class="flex flex-col sm:flex-row gap-4 mt-6">
            <div class="form-control flex-1">
              <input
                type="text"
                placeholder="Search entities..."
                class="input input-bordered input-sm"
                value={searchTerm}
                onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              />
            </div>
            <div class="form-control">
              <select
                class="select select-bordered select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div class="container mx-auto px-4 py-6">
        {filteredEntities.length === 0
          ? (
            <div class="text-center py-16">
              <div class="mx-auto w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mb-4">
                <svg
                  class="w-8 h-8 text-base-content/40"
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
              </div>
              <h3 class="text-lg font-medium text-base-content mb-2">
                {searchTerm || statusFilter !== "all" ? "No entities found" : "No entities yet"}
              </h3>
              <p class="text-base-content/60 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first place"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  class="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Create Your First Entity
                </button>
              )}
            </div>
          )
          : (
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEntities.map((entity) => (
                <div
                  key={entity.id}
                  class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div class="card-body p-4">
                    <div class="flex items-start justify-between mb-3">
                      <h2 class="card-title text-base">{entity.name}</h2>
                      <div class="flex items-center gap-1">
                        {entity.verified && (
                          <div class="badge badge-primary badge-xs">
                            Verified
                          </div>
                        )}
                        <div
                          class={`badge badge-xs ${
                            entity.status === "active"
                              ? "badge-success"
                              : entity.status === "pending"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {entity.status}
                        </div>
                      </div>
                    </div>

                    {entity.description && (
                      <p class="text-sm text-base-content/70 line-clamp-2 mb-3">
                        {entity.description}
                      </p>
                    )}

                    <div class="flex flex-wrap gap-1 mb-3">
                      {entity.type && (
                        <span class="badge badge-primary badge-xs">
                          {entity.type}
                        </span>
                      )}
                      {entity.sub_type && (
                        <span class="badge badge-outline badge-xs">
                          {entity.sub_type}
                        </span>
                      )}
                    </div>

                    <div class="flex justify-between items-center mt-auto">
                      <div class="text-xs text-base-content/50">
                        {/* TODO: Get product count from API */}
                        0 products
                      </div>
                      <div class="flex gap-1">
                        <button
                          class="btn btn-ghost btn-xs"
                          onClick={() => handleView(entity)}
                        >
                          View
                        </button>
                        <button
                          class="btn btn-ghost btn-xs"
                          onClick={() => handleEdit(entity)}
                        >
                          Edit
                        </button>
                        <button
                          class="btn btn-ghost btn-xs text-error"
                          onClick={() => handleDelete(entity)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
