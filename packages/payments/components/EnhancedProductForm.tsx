import { useEffect, useState } from "preact/hooks";
import {
  ProductSubType,
  ProductType,
  ProductTypesAPIClient,
} from "../lib/api-client/types/product-types-api.ts";
import TypeSelector from "./TypeSelector.tsx";
import DynamicMetadataForm from "./DynamicMetadataForm.tsx";

interface Product {
  id?: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  photos?: string[];
  type: string;
  sub_type?: string;
  metadata?: Record<string, any>;
  status?: string;
  seller_id?: string;
  entity_id?: string;
}

interface Entity {
  id: string;
  name: string;
  description?: string;
}

interface EnhancedProductFormProps {
  product?: Product | null;
  onSubmit: (product: Partial<Product>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  entities?: Entity[];
}

export default function EnhancedProductForm({
  product,
  onSubmit,
  onCancel,
  loading = false,
  entities = [],
}: EnhancedProductFormProps) {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedTypeSchema, setSelectedTypeSchema] = useState<any>(null);
  const [typesLoading, setTypesLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || "",
    description: product?.description || "",
    thumbnail_url: product?.thumbnail_url || "",
    photos: product?.photos || [],
    type: product?.type || "",
    sub_type: product?.sub_type || "",
    metadata: product?.metadata || {},
    entity_id: product?.entity_id || "",
  });

  const apiClient = new ProductTypesAPIClient();

  // Load product types on component mount
  useEffect(() => {
    loadProductTypes();
  }, []);

  // Update schema when type or sub-type changes
  useEffect(() => {
    if (formData.type) {
      updateSchemaForType(formData.type, formData.sub_type);
    }
  }, [formData.type, formData.sub_type, productTypes]);

  const loadProductTypes = async () => {
    try {
      setTypesLoading(true);
      const types = await apiClient.getAllProductTypes();
      setProductTypes(types);
    } catch (error) {
      console.error("Failed to load product types:", error);
    } finally {
      setTypesLoading(false);
    }
  };

  const updateSchemaForType = (typeName: string, subTypeName?: string) => {
    const type = productTypes.find((t) => t.name === typeName);
    if (!type) return;

    let schema = type.metadata_schema;
    let filterConfig = type.filter_config;

    // If sub-type is selected, merge schemas
    if (subTypeName && type.product_sub_types) {
      const subType = type.product_sub_types.find((st) => st.name === subTypeName);
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
    return productTypes.map((type) => ({
      value: type.name,
      label: `${type.name} - ${type.description}`,
      subTypes: type.product_sub_types?.map((subType) => ({
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

    await onSubmit(formData);
  };

  const updateFormData = (updates: Partial<Product>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const addPhoto = () => {
    const url = prompt("Enter photo URL:");
    if (url) {
      const currentPhotos = formData.photos || [];
      updateFormData({ photos: [...currentPhotos, url] });
    }
  };

  const removePhoto = (index: number) => {
    const currentPhotos = formData.photos || [];
    updateFormData({ photos: currentPhotos.filter((_, i) => i !== index) });
  };

  if (typesLoading) {
    return (
      <div class="flex justify-center items-center p-8">
        <span class="loading loading-spinner loading-lg"></span>
        <span class="ml-2">Loading product types...</span>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto p-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-6">
            {product ? "Edit Product" : "Create New Product"}
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
                  placeholder="Product name"
                  value={formData.name || ""}
                  onInput={(e) => updateFormData({ name: e.currentTarget.value })}
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Thumbnail URL</span>
                </label>
                <input
                  type="url"
                  class="input input-bordered"
                  placeholder="https://example.com/image.jpg"
                  value={formData.thumbnail_url || ""}
                  onInput={(e) => updateFormData({ thumbnail_url: e.currentTarget.value })}
                />
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                class="textarea textarea-bordered"
                placeholder="Product description"
                rows={3}
                value={formData.description || ""}
                onInput={(e) => updateFormData({ description: e.currentTarget.value })}
              />
            </div>

            {/* Entity Association */}
            {entities.length > 0 && (
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Associated Entity</span>
                </label>
                <select
                  class="select select-bordered"
                  value={formData.entity_id || ""}
                  onChange={(e) => updateFormData({ entity_id: e.currentTarget.value })}
                >
                  <option value="">No associated entity</option>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name} {entity.description && `- ${entity.description}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Type Selection */}
            <div class="divider">Type Configuration</div>
            <TypeSelector
              types={getTypeOptions()}
              selectedType={formData.type || ""}
              selectedSubType={formData.sub_type}
              onTypeChange={(type) => updateFormData({ type, sub_type: "" })}
              onSubTypeChange={(subType) => updateFormData({ sub_type: subType })}
              typeLabel="Product Type"
              subTypeLabel="Product Sub-type"
            />

            {/* Photos */}
            <div class="divider">Photos</div>
            <div class="form-control">
              <div class="flex justify-between items-center">
                <label class="label">
                  <span class="label-text">Product Photos</span>
                </label>
                <button
                  type="button"
                  onClick={addPhoto}
                  class="btn btn-sm btn-outline"
                >
                  Add Photo
                </button>
              </div>
              {formData.photos && formData.photos.length > 0
                ? (
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.photos.map((url, index) => (
                      <div key={index} class="relative">
                        <img
                          src={url}
                          alt={`Product photo ${index + 1}`}
                          class="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiNhYWEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          class="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )
                : (
                  <div class="text-center text-gray-500 italic py-4">
                    No photos added yet
                  </div>
                )}
            </div>

            {/* Dynamic Metadata Form */}
            {selectedTypeSchema && (
              <>
                <div class="divider">Product Details</div>
                <DynamicMetadataForm
                  schema={selectedTypeSchema}
                  data={formData.metadata || {}}
                  onChange={(metadata) => updateFormData({ metadata })}
                />
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
                      {product ? "Updating..." : "Creating..."}
                    </>
                  )
                  : (
                    product ? "Update Product" : "Create Product"
                  )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
