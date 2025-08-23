import { useState } from "preact/hooks";
import { Entity } from "@suppers/shared";
import { EntityManagementForm } from "@suppers/ui-lib";
import { useEntities } from "../hooks/useEntities.ts";
import { useApplications } from "../hooks/useApplications.ts";
import EntityDetail from "./EntityDetail.tsx";
import VariableManager from "./VariableManager.tsx";

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
  const [typeFilter, setTypeFilter] = useState("all");
  const [showVariableManager, setShowVariableManager] = useState(false);
  const [variableManagerEntityId, setVariableManagerEntityId] = useState<string | undefined>();

  // Filter entities based on search, status, and type
  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || entity.status === statusFilter;
    const matchesType = typeFilter === "all" || entity.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateEntity = () => {
    setEditingEntity(null);
    setShowForm(true);
  };

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity);
    setShowForm(true);
  };

  const handleDeleteEntity = async (entity: Entity) => {
    if (confirm(`Are you sure you want to delete "${entity.name}"?`)) {
      await deleteEntity(entity.id);
    }
  };

  const handleViewEntity = (entity: Entity) => {
    setSelectedEntity(entity);
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

  const handleVariableManagerOpen = (entityId?: string) => {
    setVariableManagerEntityId(entityId);
    setShowVariableManager(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntity(null);
  };

  const handleDetailClose = () => {
    setSelectedEntity(null);
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center h-64">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div class="alert alert-error">
        <span>Error loading entities: {error}</span>
      </div>
    );
  }

  return (
    <>
      <div class="space-y-6">
        {/* Header */}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-3xl font-bold">Entities</h1>
            <p class="text-gray-600">Manage your business entities</p>
          </div>
          <button
            class="btn btn-primary"
            onClick={handleCreateEntity}
          >
            Create Entity
          </button>
        </div>

        {/* Filters */}
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="form-control flex-1">
            <input
              type="text"
              placeholder="Search entities..."
              class="input input-bordered"
              value={searchTerm}
              onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-control">
            <select
              class="select select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          <div class="form-control">
            <select
              class="select select-bordered"
              value={typeFilter}
              onChange={(e) => setTypeFilter((e.target as HTMLSelectElement).value)}
            >
              <option value="all">All Types</option>
              {[...new Set(entities.map((e) => e.type).filter(Boolean))].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-title">Total Entities</div>
            <div class="stat-value">{entities.length}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Active</div>
            <div class="stat-value text-primary">
              {entities.filter((e) => e.status === "active").length}
            </div>
          </div>
          <div class="stat">
            <div class="stat-title">Verified</div>
            <div class="stat-value text-success">{entities.filter((e) => e.verified).length}</div>
          </div>
        </div>

        {/* Entities List */}
        {filteredEntities.length === 0
          ? (
            <div class="text-center py-12">
              <p class="text-gray-500 text-lg">
                {searchTerm || statusFilter !== "all"
                  ? "No entities match your filters"
                  : "No entities found. Create your first entity!"}
              </p>
            </div>
          )
          : (
            <div class="grid gap-4">
              {filteredEntities.map((entity) => (
                <div key={entity.id} class="card bg-base-100 shadow-xl">
                  <div class="card-body">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <h2 class="card-title">
                          {entity.name}
                          <div class="badge badge-secondary">{entity.status}</div>
                          {entity.verified && <div class="badge badge-primary">Verified</div>}
                        </h2>
                        <p class="text-gray-600">{entity.description}</p>

                        {/* Type Information */}
                        <div class="flex flex-wrap gap-1 mt-2">
                          {entity.type && <span class="badge badge-info">{entity.type}</span>}
                          {entity.sub_type && (
                            <span class="badge badge-outline">{entity.sub_type}</span>
                          )}
                          {entity.location && (
                            <span class="badge badge-ghost">📍 Location Available</span>
                          )}
                        </div>

                        <div class="text-sm text-gray-500 mt-2">
                          Created: {new Date(entity.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div class="card-actions">
                        <button
                          class="btn btn-sm btn-ghost"
                          onClick={() =>
                            handleViewEntity(entity)}
                        >
                          View
                        </button>
                        <button
                          class="btn btn-sm btn-primary"
                          onClick={() =>
                            handleEditEntity(entity)}
                        >
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            class="btn btn-sm btn-error"
                            onClick={() => handleDeleteEntity(entity)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Modals */}
      <EntityManagementForm
        isOpen={showForm}
        onClose={handleFormCancel}
        entity={editingEntity || undefined}
        applications={applications}
        onSave={handleFormSave}
        onVariableManagerOpen={handleVariableManagerOpen}
        loading={loading}
      />

      {/* Variable Manager Modal */}
      <VariableManager
        isOpen={showVariableManager}
        onClose={() => setShowVariableManager(false)}
        entityId={variableManagerEntityId}
      />

      {selectedEntity && (
        <EntityDetail
          entity={selectedEntity}
          onClose={handleDetailClose}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}
