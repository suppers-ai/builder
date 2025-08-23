import { useEffect, useState } from "preact/hooks";
import { signal } from "@preact/signals";
import {
  EntitySubType,
  EntityType,
  EntityTypeAPIClient,
} from "../lib/api-client/entity-types/entity-type-api.ts";
import { showError, showSuccess } from "../lib/toast-manager.ts";
import { getAuthClient } from "../lib/auth.ts";
import { SessionExpiredModal, useSessionExpiredHandler } from "@suppers/ui-lib";

// Global state for entity type management
const entityTypes = signal<EntityType[]>([]);
const isLoading = signal<boolean>(true);
const error = signal<string | null>(null);

interface MetadataField {
  type: "text" | "number" | "boolean" | "date" | "time" | "select" | "array" | "object";
  label: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
  default?: any;
}

interface MetadataSchema {
  fields: Record<string, MetadataField>;
}

interface FilterConfig {
  [key: string]: {
    label: string;
    searchable: boolean;
  };
}

export default function EntityTypeManagementIsland() {
  const [selectedType, setSelectedType] = useState<EntityType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubTypeModal, setShowSubTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize API client
  const apiClient = new EntityTypeAPIClient(getAuthClient());

  // Session expired handler
  const sessionHandler = useSessionExpiredHandler({
    onLogin: () => {
      globalThis.location.href = "/auth/login";
    },
    onLogout: () => {
      globalThis.location.href = "/auth/logout";
    },
  });

  // Load entity types
  const loadEntityTypes = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await apiClient.getAllEntityTypes();
      // Handle the nested response structure: { data: { data: [...] } }
      let types = [];
      if (response?.data?.data) {
        types = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        types = response.data;
      } else if (Array.isArray(response)) {
        types = response;
      }
      entityTypes.value = Array.isArray(types) ? types : [];
    } catch (err) {
      console.error("Failed to load entity types:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load entity types";
      error.value = errorMessage;
      showError(errorMessage);
      sessionHandler.handleError(err);
      entityTypes.value = []; // Ensure it's always an array
    } finally {
      isLoading.value = false;
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadEntityTypes();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location_required: false,
    metadata_schema: { fields: {} } as MetadataSchema,
    filter_config: {} as FilterConfig,
  });

  const [subTypeFormData, setSubTypeFormData] = useState({
    name: "",
    description: "",
    metadata_schema: { fields: {} } as MetadataSchema,
    filter_config: {} as FilterConfig,
  });

  const refreshEntityTypes = async () => {
    try {
      setLoading(true);
      const types = await apiClient.getAllEntityTypes();
      entityTypes.value = types;
    } catch (error) {
      showError(`Failed to load entity types: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntityType = async () => {
    try {
      setLoading(true);
      await apiClient.createEntityType({
        name: formData.name,
        description: formData.description,
        location_required: formData.location_required,
        metadata_schema: formData.metadata_schema,
        filter_config: formData.filter_config,
      });

      showSuccess("Entity type created successfully!");
      setShowCreateModal(false);
      resetForm();
      await refreshEntityTypes();
    } catch (error) {
      showError(`Failed to create entity type: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEntityType = async () => {
    if (!selectedType) return;

    try {
      setLoading(true);
      await apiClient.updateEntityType(selectedType.id, {
        name: formData.name,
        description: formData.description,
        location_required: formData.location_required,
        metadata_schema: formData.metadata_schema,
        filter_config: formData.filter_config,
      });

      showSuccess("Entity type updated successfully!");
      setIsEditing(false);
      await refreshEntityTypes();
    } catch (error) {
      showError(`Failed to update entity type: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntityType = async (typeId: string) => {
    if (!confirm("Are you sure you want to delete this entity type?")) return;

    try {
      setLoading(true);
      await apiClient.deleteEntityType(typeId);
      showSuccess("Entity type deleted successfully!");
      setSelectedType(null);
      await refreshEntityTypes();
    } catch (error) {
      showError(`Failed to delete entity type: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubType = async () => {
    if (!selectedType) return;

    try {
      setLoading(true);
      await apiClient.createEntitySubType(selectedType.id, {
        name: subTypeFormData.name,
        description: subTypeFormData.description,
        metadata_schema: subTypeFormData.metadata_schema,
        filter_config: subTypeFormData.filter_config,
      });

      showSuccess("Entity sub-type created successfully!");
      setShowSubTypeModal(false);
      resetSubTypeForm();
      await refreshEntityTypes();
    } catch (error) {
      showError(`Failed to create entity sub-type: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location_required: false,
      metadata_schema: { fields: {} },
      filter_config: {},
    });
  };

  const resetSubTypeForm = () => {
    setSubTypeFormData({
      name: "",
      description: "",
      metadata_schema: { fields: {} },
      filter_config: {},
    });
  };

  const loadTypeForEditing = (type: EntityType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
      location_required: type.location_required,
      metadata_schema: type.metadata_schema || { fields: {} },
      filter_config: type.filter_config || {},
    });
    setIsEditing(true);
  };

  const addMetadataField = () => {
    const fieldName = prompt("Enter field name:");
    if (!fieldName) return;

    const newFields = {
      ...formData.metadata_schema.fields,
      [fieldName]: {
        type: "text",
        label: fieldName,
        required: false,
      } as MetadataField,
    };

    setFormData({
      ...formData,
      metadata_schema: { fields: newFields },
    });
  };

  const removeMetadataField = (fieldName: string) => {
    const { [fieldName]: removed, ...remainingFields } = formData.metadata_schema.fields;
    setFormData({
      ...formData,
      metadata_schema: { fields: remainingFields },
    });
  };

  const updateMetadataField = (fieldName: string, field: MetadataField) => {
    const newFields = {
      ...formData.metadata_schema.fields,
      [fieldName]: field,
    };

    setFormData({
      ...formData,
      metadata_schema: { fields: newFields },
    });
  };

  // Loading state
  if (isLoading.value) {
    return (
      <div class="p-6">
        <div class="flex items-center justify-center min-h-96">
          <div class="loading loading-lg"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error.value) {
    return (
      <div class="p-6">
        <div class="alert alert-error">
          <div>
            <h3 class="font-bold">Error loading entity types</h3>
            <div class="text-xs">{error.value}</div>
          </div>
          <div>
            <button class="btn btn-sm" onClick={loadEntityTypes}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SessionExpiredModal />
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Entity Type Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            class="btn btn-primary"
            disabled={loading}
          >
            Create Entity Type
          </button>
        </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity Types List */}
        <div class="lg:col-span-1">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Entity Types</h2>
              <div class="space-y-2">
                {(entityTypes.value || []).map((type) => (
                  <div
                    key={type.id}
                    class={`p-3 rounded cursor-pointer hover:bg-base-200 ${
                      selectedType?.id === type.id ? "bg-primary text-primary-content" : ""
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    <div class="font-semibold">{type.name}</div>
                    <div class="text-sm opacity-70">{type.description}</div>
                    <div class="text-xs mt-1">
                      {type.entity_sub_types?.length || 0} sub-types
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Entity Type Details */}
        <div class="lg:col-span-2">
          {selectedType
            ? (
              <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                  <div class="flex justify-between items-center">
                    <h2 class="card-title">{selectedType.name}</h2>
                    <div class="flex gap-2">
                      <button
                        onClick={() => loadTypeForEditing(selectedType)}
                        class="btn btn-sm btn-outline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowSubTypeModal(true)}
                        class="btn btn-sm btn-secondary"
                      >
                        Add Sub-type
                      </button>
                      <button
                        onClick={() => handleDeleteEntityType(selectedType.id)}
                        class="btn btn-sm btn-error"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div class="mt-4">
                    <p class="mb-4">{selectedType.description}</p>

                    <div class="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span class="font-semibold">Location Required:</span>
                        <span
                          class={selectedType.location_required
                            ? "text-success ml-2"
                            : "text-error ml-2"}
                        >
                          {selectedType.location_required ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <span class="font-semibold">Created:</span>
                        <span class="ml-2">
                          {new Date(selectedType.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Schema */}
                    <div class="mb-4">
                      <h3 class="font-semibold mb-2">Metadata Schema</h3>
                      <div class="bg-base-200 p-3 rounded">
                        <pre class="text-xs overflow-x-auto">
                        {JSON.stringify(selectedType.metadata_schema, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Filter Configuration */}
                    <div class="mb-4">
                      <h3 class="font-semibold mb-2">Filter Configuration</h3>
                      <div class="bg-base-200 p-3 rounded">
                        <pre class="text-xs overflow-x-auto">
                        {JSON.stringify(selectedType.filter_config, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Sub-types */}
                    <div>
                      <h3 class="font-semibold mb-2">Sub-types</h3>
                      {selectedType.entity_sub_types && selectedType.entity_sub_types.length > 0
                        ? (
                          <div class="space-y-2">
                            {selectedType.entity_sub_types.map((subType) => (
                              <div key={subType.id} class="border p-3 rounded">
                                <div class="font-medium">{subType.name}</div>
                                <div class="text-sm text-gray-600">{subType.description}</div>
                              </div>
                            ))}
                          </div>
                        )
                        : <p class="text-gray-500 italic">No sub-types defined</p>}
                    </div>
                  </div>
                </div>
              </div>
            )
            : (
              <div class="card bg-base-100 shadow-xl">
                <div class="card-body text-center">
                  <h2 class="card-title">Select an Entity Type</h2>
                  <p>Choose an entity type from the list to view its details</p>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || isEditing) && (
        <div class="modal modal-open">
          <div class="modal-box w-11/12 max-w-4xl">
            <h3 class="font-bold text-lg">
              {isEditing ? "Edit Entity Type" : "Create Entity Type"}
            </h3>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Entity type name"
                class="input input-bordered"
                value={formData.name}
                onInput={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                placeholder="Entity type description"
                class="textarea textarea-bordered"
                value={formData.description}
                onInput={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
              />
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Location Required</span>
                <input
                  type="checkbox"
                  class="checkbox"
                  checked={formData.location_required}
                  onChange={(e) =>
                    setFormData({ ...formData, location_required: e.currentTarget.checked })}
                />
              </label>
            </div>

            {/* Metadata Schema Builder */}
            <div class="mt-4">
              <div class="flex justify-between items-center mb-2">
                <h4 class="font-semibold">Metadata Fields</h4>
                <button onClick={addMetadataField} class="btn btn-xs btn-outline">
                  Add Field
                </button>
              </div>
              <div class="space-y-2">
                {Object.entries(formData.metadata_schema.fields).map(([fieldName, field]) => (
                  <div key={fieldName} class="border p-3 rounded bg-base-200">
                    <div class="flex justify-between items-center mb-2">
                      <span class="font-medium">{fieldName}</span>
                      <button
                        onClick={() =>
                          removeMetadataField(fieldName)}
                        class="btn btn-xs btn-error"
                      >
                        Remove
                      </button>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <select
                        class="select select-xs select-bordered"
                        value={field.type}
                        onChange={(e) =>
                          updateMetadataField(fieldName, {
                            ...field,
                            type: e.currentTarget.value as any,
                          })}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="time">Time</option>
                        <option value="select">Select</option>
                        <option value="array">Array</option>
                        <option value="object">Object</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Label"
                        class="input input-xs input-bordered"
                        value={field.label}
                        onInput={(e) =>
                          updateMetadataField(fieldName, {
                            ...field,
                            label: e.currentTarget.value,
                          })}
                      />
                    </div>
                    <div class="mt-2">
                      <label class="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          class="checkbox checkbox-xs"
                          checked={field.required || false}
                          onChange={(e) =>
                            updateMetadataField(fieldName, {
                              ...field,
                              required: e.currentTarget.checked,
                            })}
                        />
                        <span class="label-text text-xs">Required</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div class="modal-action">
              <button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    resetForm();
                  } else {
                    setShowCreateModal(false);
                    resetForm();
                  }
                }}
                class="btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={isEditing ? handleUpdateEntityType : handleCreateEntityType}
                class="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : (isEditing ? "Update" : "Create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sub-type Modal */}
      {showSubTypeModal && (
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Create Sub-type for {selectedType?.name}</h3>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Sub-type name"
                class="input input-bordered"
                value={subTypeFormData.name}
                onInput={(e) =>
                  setSubTypeFormData({ ...subTypeFormData, name: e.currentTarget.value })}
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                placeholder="Sub-type description"
                class="textarea textarea-bordered"
                value={subTypeFormData.description}
                onInput={(e) =>
                  setSubTypeFormData({ ...subTypeFormData, description: e.currentTarget.value })}
              />
            </div>

            <div class="modal-action">
              <button
                onClick={() => {
                  setShowSubTypeModal(false);
                  resetSubTypeForm();
                }}
                class="btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubType}
                class="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Sub-type"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
