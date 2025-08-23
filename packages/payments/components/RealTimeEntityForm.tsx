import { useEffect, useMemo, useState } from "preact/hooks";
import { EntityType, EntityTypesAPIClient } from "../lib/api-client/types/entity-types-api.ts";
import { useRealTimeValidation } from "../hooks/useRealTimeValidation.ts";
import { type MetadataSchema } from "../../api/supabase/functions/api/lib/metadata-validation.ts";
import TypeSelector from "./TypeSelector.tsx";
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

interface RealTimeEntityFormProps {
  entity?: Entity | null;
  onSubmit: (entity: Partial<Entity>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  applications?: Array<{ id: string; name: string }>;
}

export default function RealTimeEntityForm({
  entity,
  onSubmit,
  onCancel,
  loading = false,
  applications = [],
}: RealTimeEntityFormProps) {
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [selectedTypeSchema, setSelectedTypeSchema] = useState<MetadataSchema | null>(null);
  const [typesLoading, setTypesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Basic form state
  const [basicData, setBasicData] = useState({
    name: entity?.name || "",
    description: entity?.description || "",
    type: entity?.type || "",
    sub_type: entity?.sub_type || "",
    status: entity?.status || "draft",
    photos: entity?.photos || [],
    connected_application_ids: entity?.connected_application_ids || [],
  });

  const [location, setLocation] = useState(entity?.location || null);

  // Real-time validation for metadata
  const {
    data: metadataData,
    updateField: updateMetadataField,
    validationState,
    isValid: isMetadataValid,
    getFieldError,
    getFieldWarning,
    getFieldStatus,
    getValidationSummary,
    validateNow,
  } = useRealTimeValidation(
    selectedTypeSchema,
    entity?.metadata || {},
    {
      debounceMs: 300,
      validateOnChange: true,
      validateOnBlur: true,
      showWarnings: true,
    },
  );

  const apiClient = new EntityTypesAPIClient();

  // Load entity types on mount
  useEffect(() => {
    loadEntityTypes();
  }, []);

  // Update schema when type/sub-type changes
  useEffect(() => {
    if (basicData.type) {
      updateTypeSchema(basicData.type, basicData.sub_type);
    } else {
      setSelectedTypeSchema(null);
    }
  }, [basicData.type, basicData.sub_type, entityTypes]);

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

  const updateTypeSchema = (typeName: string, subTypeName?: string) => {
    const type = entityTypes.find((t) => t.name === typeName);
    if (!type) {
      setSelectedTypeSchema(null);
      return;
    }

    let schema = type.metadata_schema;

    // Merge with sub-type schema if applicable
    if (subTypeName && type.entity_sub_types) {
      const subType = type.entity_sub_types.find((st) => st.name === subTypeName);
      if (subType && subType.metadata_schema) {
        schema = {
          fields: {
            ...schema.fields,
            ...subType.metadata_schema.fields,
          },
        };
      }
    }

    setSelectedTypeSchema(schema);
  };

  // Validation checks
  const isBasicDataValid = useMemo(() => {
    return basicData.name.trim().length > 0 &&
      basicData.type.length > 0;
  }, [basicData.name, basicData.type]);

  const isFormValid = useMemo(() => {
    return isBasicDataValid && isMetadataValid;
  }, [isBasicDataValid, isMetadataValid]);

  // Handle form submission
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!isFormValid) {
      validateNow(); // Force validation to show errors
      return;
    }

    setSubmitting(true);

    try {
      const submissionData: Partial<Entity> = {
        ...basicData,
        metadata: metadataData,
        location,
      };

      // Convert location to PostGIS format if provided
      if (location) {
        submissionData.location = location;
      }

      await onSubmit(submissionData);
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Render field with validation status
  const renderFieldWithValidation = (
    fieldName: string,
    fieldConfig: any,
    value: any,
    onChange: (value: any) => void,
  ) => {
    const error = getFieldError(fieldName);
    const warning = getFieldWarning(fieldName);
    const status = getFieldStatus(fieldName);

    const inputClasses = `input input-bordered ${
      status === "valid"
        ? "input-success"
        : status === "invalid"
        ? "input-error"
        : status === "warning"
        ? "input-warning"
        : ""
    }`;

    const selectClasses = `select select-bordered ${
      status === "valid"
        ? "select-success"
        : status === "invalid"
        ? "select-error"
        : status === "warning"
        ? "select-warning"
        : ""
    }`;

    return (
      <div class="form-control">
        <label class="label">
          <span class="label-text">
            {fieldConfig.label}
            {fieldConfig.required && <span class="text-error">*</span>}
          </span>
          {status === "valid" && <span class="label-text-alt text-success">✓</span>}
          {status === "invalid" && <span class="label-text-alt text-error">✗</span>}
          {status === "warning" && <span class="label-text-alt text-warning">⚠</span>}
        </label>

        {fieldConfig.type === "text" && (
          <input
            type="text"
            class={inputClasses}
            value={value || ""}
            onInput={(e) => onChange(e.currentTarget.value)}
            placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
          />
        )}

        {fieldConfig.type === "number" && (
          <input
            type="number"
            class={inputClasses}
            value={value || ""}
            onInput={(e) => onChange(parseFloat(e.currentTarget.value) || 0)}
            min={fieldConfig.min}
            max={fieldConfig.max}
            step={fieldConfig.step || 1}
          />
        )}

        {fieldConfig.type === "boolean" && (
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              class="checkbox checkbox-primary"
              checked={value || false}
              onChange={(e) => onChange(e.currentTarget.checked)}
            />
            <span class="label-text">{fieldConfig.label}</span>
          </div>
        )}

        {fieldConfig.type === "select" && (
          <select
            class={selectClasses}
            value={value || ""}
            onChange={(e) => onChange(e.currentTarget.value)}
          >
            <option value="">Select {fieldConfig.label}</option>
            {fieldConfig.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )}

        {fieldConfig.type === "date" && (
          <input
            type="date"
            class={inputClasses}
            value={value || ""}
            onInput={(e) => onChange(e.currentTarget.value)}
          />
        )}

        {fieldConfig.type === "time" && (
          <input
            type="time"
            class={inputClasses}
            value={value || ""}
            onInput={(e) => onChange(e.currentTarget.value)}
          />
        )}

        {fieldConfig.type === "array" && (
          <div class="space-y-2">
            <div class="flex flex-wrap gap-1">
              {(value || []).map((item: string, index: number) => (
                <span key={index} class="badge badge-primary gap-1">
                  {item}
                  <button
                    type="button"
                    class="btn btn-xs btn-ghost"
                    onClick={() => {
                      const newValue = [...(value || [])];
                      newValue.splice(index, 1);
                      onChange(newValue);
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            {fieldConfig.options && (
              <select
                class="select select-bordered select-sm"
                onChange={(e) => {
                  const selectedValue = e.currentTarget.value;
                  if (selectedValue && !(value || []).includes(selectedValue)) {
                    onChange([...(value || []), selectedValue]);
                  }
                  e.currentTarget.value = "";
                }}
              >
                <option value="">Add {fieldConfig.label}</option>
                {fieldConfig.options
                  .filter((option: string) => !(value || []).includes(option))
                  .map((option: string) => <option key={option} value={option}>{option}</option>)}
              </select>
            )}
          </div>
        )}

        {error && (
          <label class="label">
            <span class="label-text-alt text-error">{error}</span>
          </label>
        )}

        {!error && warning && (
          <label class="label">
            <span class="label-text-alt text-warning">{warning}</span>
          </label>
        )}
      </div>
    );
  };

  if (typesLoading) {
    return (
      <div class="flex justify-center items-center p-8">
        <span class="loading loading-spinner loading-lg"></span>
        <span class="ml-2">Loading form...</span>
      </div>
    );
  }

  const validationSummary = getValidationSummary();

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      {/* Validation Summary */}
      {selectedTypeSchema && (
        <div class="alert alert-info">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            >
            </path>
          </svg>
          <div>
            <div class="font-medium">Form Completeness: {validationSummary.completeness}%</div>
            <div class="text-sm">
              {validationSummary.validFields} valid, {validationSummary.invalidFields} invalid,{" "}
              {validationSummary.warningFields} warnings
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} class="space-y-6">
        {/* Basic Information */}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Basic Information</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Name *</span>
                </label>
                <input
                  type="text"
                  class={`input input-bordered ${basicData.name.trim() ? "input-success" : ""}`}
                  value={basicData.name}
                  onInput={(e) =>
                    setBasicData((prev) => ({ ...prev, name: e.currentTarget.value }))}
                  placeholder="Enter entity name"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Status</span>
                </label>
                <select
                  class="select select-bordered"
                  value={basicData.status}
                  onChange={(e) =>
                    setBasicData((prev) => ({ ...prev, status: e.currentTarget.value }))}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                class="textarea textarea-bordered"
                value={basicData.description}
                onInput={(e) =>
                  setBasicData((prev) => ({ ...prev, description: e.currentTarget.value }))}
                placeholder="Describe this entity"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Type Selection */}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Type & Category</h2>
            <TypeSelector
              entityTypes={entityTypes}
              selectedType={basicData.type}
              selectedSubType={basicData.sub_type}
              onTypeChange={(type) => setBasicData((prev) => ({ ...prev, type, sub_type: "" }))}
              onSubTypeChange={(subType) =>
                setBasicData((prev) => ({ ...prev, sub_type: subType }))}
            />
          </div>
        </div>

        {/* Location */}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Location</h2>
            <LocationPicker
              location={location}
              onChange={setLocation}
              required={false}
            />
          </div>
        </div>

        {/* Dynamic Metadata */}
        {selectedTypeSchema && selectedTypeSchema.fields &&
          Object.keys(selectedTypeSchema.fields).length > 0 && (
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Additional Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedTypeSchema.fields).map(([fieldName, fieldConfig]) => (
                  <div key={fieldName}>
                    {renderFieldWithValidation(
                      fieldName,
                      fieldConfig,
                      metadataData[fieldName],
                      (value) =>
                        updateMetadataField(fieldName, value),
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Applications */}
        {applications.length > 0 && (
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Connected Applications</h2>
              <div class="space-y-2">
                {applications.map((app) => (
                  <label key={app.id} class="label cursor-pointer">
                    <span class="label-text">{app.name}</span>
                    <input
                      type="checkbox"
                      class="checkbox"
                      checked={basicData.connected_application_ids?.includes(app.id)}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked;
                        setBasicData((prev) => ({
                          ...prev,
                          connected_application_ids: checked
                            ? [...(prev.connected_application_ids || []), app.id]
                            : (prev.connected_application_ids || []).filter((id) => id !== app.id),
                        }));
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="btn btn-ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            class={`btn btn-primary ${!isFormValid ? "btn-disabled" : ""}`}
            disabled={!isFormValid || submitting}
          >
            {submitting
              ? (
                <>
                  <span class="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              )
              : (
                entity ? "Update Entity" : "Create Entity"
              )}
          </button>
        </div>
      </form>
    </div>
  );
}
