import { useEffect, useState } from "preact/hooks";
import {
  EntitySubType,
  EntityType,
  EntityTypesAPIClient,
} from "../lib/api-client/types/entity-types-api.ts";
import TypeSelector from "./TypeSelector.tsx";
import DynamicMetadataForm from "./DynamicMetadataForm.tsx";
import LocationPicker from "./LocationPicker.tsx";

interface Entity {
  id?: string;
  name: string;
  description?: string;
  photos?: string[];
  type: string;
  sub_type?: string;
  metadata?: Record<string, any>;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status?: string;
  verified?: boolean;
  owner_id?: string;
  connected_application_ids?: string[];
}

interface EnhancedEntityFormProps {
  entity?: Entity | null;
  onSubmit: (entity: Partial<Entity>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  applications?: Array<{ id: string; name: string }>;
}

export default function EnhancedEntityForm({
  entity,
  onSubmit,
  onCancel,
  loading = false,
  applications = [],
}: EnhancedEntityFormProps) {
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [selectedTypeSchema, setSelectedTypeSchema] = useState<any>(null);
  const [locationRequired, setLocationRequired] = useState(false);
  const [typesLoading, setTypesLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<Partial<Entity>>({
    name: entity?.name || "",
    description: entity?.description || "",
    photos: entity?.photos || [],
    type: entity?.type || "",
    sub_type: entity?.sub_type || "",
    metadata: entity?.metadata || {},
    location: entity?.location || null,
    connected_application_ids: entity?.connected_application_ids || [],
  });

  const apiClient = new EntityTypesAPIClient();

  // Load entity types on component mount
  useEffect(() => {
    loadEntityTypes();
  }, []);

  // Update schema when type or sub-type changes
  useEffect(() => {
    if (formData.type) {
      updateSchemaForType(formData.type, formData.sub_type);
    }
  }, [formData.type, formData.sub_type, entityTypes]);

  const loadEntityTypes = async () => {
    try {
      setTypesLoading(true);
      const types = await apiClient.getAllEntityTypes();
      setEntityTypes(types);
    } catch (error) {
      console.error("Failed to load entity types:", error);
    } finally {
      setTypesLoading(false);
    }
  };

  const updateSchemaForType = (typeName: string, subTypeName?: string) => {
    const type = entityTypes.find((t) => t.name === typeName);
    if (!type) return;

    setLocationRequired(type.location_required);

    let schema = type.metadata_schema;
    let filterConfig = type.filter_config;

    // If sub-type is selected, merge schemas
    if (subTypeName && type.entity_sub_types) {
      const subType = type.entity_sub_types.find((st) => st.name === subTypeName);
      if (subType) {
        // Merge parent and child schemas (child overrides parent)
        schema = mergeSchemas(schema, subType.metadata_schema);
        filterConfig = mergeConfigs(filterConfig, subType.filter_config);
      }
    }

    setSelectedTypeSchema(schema);
  };

  const mergeSchemas = (parent: any, child: any) => {
    if (!parent || !child) return parent || child;
    return {
      fields: {
        ...parent.fields || {},
        ...child.fields || {},
      },
    };
  };

  const mergeConfigs = (parent: any, child: any) => {
    if (!parent || !child) return parent || child;
    return {
      ...parent,
      ...child,
    };
  };

  const getTypeOptions = () => {
    return entityTypes.map((type) => ({
      value: type.name,
      label: `${type.name} - ${type.description}`,
      subTypes: type.entity_sub_types?.map((subType) => ({
        value: subType.name,
        label: `${subType.name} - ${subType.description}`,
      })) || [],
    }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name?.trim()) {
      alert("Name is required");
      return;
    }

    if (!formData.type) {
      alert("Type is required");
      return;
    }

    if (locationRequired && !formData.location) {
      alert("Location is required for this entity type");
      return;
    }

    await onSubmit(formData);
  };

  const updateFormData = (updates: Partial<Entity>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  if (typesLoading) {
    return (
      <div class="flex justify-center items-center p-8">
        <span class="loading loading-spinner loading-lg"></span>
        <span class="ml-2">Loading entity types...</span>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto p-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6">
            {entity ? "Edit Entity" : "Create New Entity"}
          </h2>

          <form onSubmit={handleSubmit} class="space-y-6">
            {/* Basic Information */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Name *</span>
                </label>
                <input
                  type="text"
                  class="input input-bordered"
                  placeholder="Entity name"
                  value={formData.name || ""}
                  onInput={(e) => updateFormData({ name: e.currentTarget.value })}
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Description</span>
                </label>
                <textarea
                  class="textarea textarea-bordered"
                  placeholder="Entity description"
                  value={formData.description || ""}
                  onInput={(e) => updateFormData({ description: e.currentTarget.value })}
                />
              </div>
            </div>

            {/* Type Selection */}
            <div class="divider">Type Configuration</div>
            <TypeSelector
              types={getTypeOptions()}
              selectedType={formData.type || ""}
              selectedSubType={formData.sub_type}
              onTypeChange={(type) => updateFormData({ type, sub_type: "" })}
              onSubTypeChange={(subType) => updateFormData({ sub_type: subType })}
              typeLabel="Entity Type"
              subTypeLabel="Entity Sub-type"
            />

            {/* Location Picker */}
            {(locationRequired || formData.location) && (
              <>
                <div class="divider">Location</div>
                <LocationPicker
                  location={formData.location}
                  onChange={(location) => updateFormData({ location })}
                  required={locationRequired}
                />
              </>
            )}

            {/* Dynamic Metadata Form */}
            {selectedTypeSchema && (
              <>
                <div class="divider">Additional Information</div>
                <DynamicMetadataForm
                  schema={selectedTypeSchema}
                  data={formData.metadata || {}}
                  onChange={(metadata) => updateFormData({ metadata })}
                />
              </>
            )}

            {/* Connected Applications */}
            {applications.length > 0 && (
              <>
                <div class="divider">Connected Applications</div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text">Connected Applications</span>
                  </label>
                  <div class="space-y-2">
                    {applications.map((app) => (
                      <label key={app.id} class="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          class="checkbox"
                          checked={(formData.connected_application_ids || []).includes(app.id)}
                          onChange={(e) => {
                            const currentIds = formData.connected_application_ids || [];
                            const newIds = e.currentTarget.checked
                              ? [...currentIds, app.id]
                              : currentIds.filter((id) =>
                                id !== app.id
                              );
                            updateFormData({ connected_application_ids: newIds });
                          }}
                        />
                        <span class="label-text">{app.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div class="card-actions justify-end pt-6">
              <button
                type="button"
                onClick={onCancel}
                class="btn btn-ghost"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                disabled={loading}
              >
                {loading
                  ? (
                    <>
                      <span class="loading loading-spinner loading-sm"></span>
                      {entity ? "Updating..." : "Creating..."}
                    </>
                  )
                  : (
                    entity ? "Update Entity" : "Create Entity"
                  )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
