import { useEffect, useState } from "preact/hooks";
import { Button, Card, Badge, Input, Textarea } from "@suppers/ui-lib";
import { showError, showSuccess } from "../lib/toast-manager.ts";
import { getAuthClient } from "../lib/auth.ts";
import { ProductTypeAPIClient } from "../lib/api-client/product-types/product-type-api.ts";

interface ProductType {
  id: string;
  name: string;
  description: string | null;
  metadata_schema: any;
  filter_config: any;
  created_at: string;
  updated_at: string;
  product_sub_types?: ProductSubType[];
}

interface ProductSubType {
  id: string;
  product_type_id: string;
  name: string;
  description: string | null;
  metadata_schema: any;
  filter_config: any;
  created_at: string;
  updated_at: string;
}

interface MetadataField {
  type: "text" | "number" | "boolean" | "date" | "select";
  label: string;
  required?: boolean;
  options?: string[];
}

export default function ProductTypeManagementIsland() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    metadata_fields: [] as { name: string; field: MetadataField }[],
  });

  const apiClient = new ProductTypeAPIClient(getAuthClient());

  useEffect(() => {
    loadProductTypes();
  }, []);

  const loadProductTypes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllProductTypes();
      console.log("ProductTypes API Response:", response);
      
      // Check for authentication errors
      if (response?.error) {
        const errorStr = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
        console.log("Error string:", errorStr);
        if (errorStr.includes("authenticated") || errorStr.includes("Unauthorized") || 
            errorStr.includes("401") || errorStr.includes("Admin access required") || 
            errorStr.includes("403")) {
          showError("Please sign in with admin privileges to access this panel");
          return;
        }
        throw new Error(errorStr);
      }
      
      // Handle the nested response structure: { data: { data: [...] } }
      let types = [];
      if (response?.data?.data) {
        types = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        types = response.data;
      } else if (Array.isArray(response)) {
        types = response;
      }
      console.log("Product types to display:", types);
      setProductTypes(Array.isArray(types) ? types : []);
    } catch (error) {
      console.error("Failed to load product types:", error);
      
      // Check if it's an authentication error
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("Not authenticated")) {
        showError("Please sign in to access the admin panel");
        return;
      }
      
      showError("Failed to load product types");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProductType = async () => {
    if (!formData.name.trim()) {
      showError("Product type name is required");
      return;
    }

    try {
      setSaving(true);
      
      // Convert metadata fields array to schema object
      const metadata_schema = {
        fields: formData.metadata_fields.reduce((acc, { name, field }) => ({
          ...acc,
          [name]: field
        }), {})
      };

      await apiClient.createProductType({
        name: formData.name,
        description: formData.description || null,
        metadata_schema,
        filter_config: {}
      });

      showSuccess("Product type created successfully");
      setShowCreateModal(false);
      resetForm();
      await loadProductTypes();
    } catch (error) {
      console.error("Failed to create product type:", error);
      showError("Failed to create product type");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProductType = async () => {
    if (!selectedType || !formData.name.trim()) {
      showError("Product type name is required");
      return;
    }

    try {
      setSaving(true);
      
      const metadata_schema = {
        fields: formData.metadata_fields.reduce((acc, { name, field }) => ({
          ...acc,
          [name]: field
        }), {})
      };

      await apiClient.updateProductType(selectedType.id, {
        name: formData.name,
        description: formData.description || null,
        metadata_schema,
        filter_config: selectedType.filter_config || {}
      });

      showSuccess("Product type updated successfully");
      setShowEditModal(false);
      resetForm();
      await loadProductTypes();
    } catch (error) {
      console.error("Failed to update product type:", error);
      showError("Failed to update product type");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProductType = async (type: ProductType) => {
    if (!confirm(`Are you sure you want to delete "${type.name}"?`)) {
      return;
    }

    try {
      await apiClient.deleteProductType(type.id);
      showSuccess("Product type deleted successfully");
      if (selectedType?.id === type.id) {
        setSelectedType(null);
      }
      await loadProductTypes();
    } catch (error) {
      console.error("Failed to delete product type:", error);
      showError("Failed to delete product type");
    }
  };

  const openEditModal = (type: ProductType) => {
    setSelectedType(type);
    
    // Convert metadata schema to fields array
    const fields = type.metadata_schema?.fields 
      ? Object.entries(type.metadata_schema.fields).map(([name, field]) => ({
          name,
          field: field as MetadataField
        }))
      : [];

    setFormData({
      name: type.name,
      description: type.description || "",
      metadata_fields: fields
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      metadata_fields: []
    });
    setSelectedType(null);
  };

  const addMetadataField = () => {
    const name = prompt("Enter field name (e.g., 'price', 'color', 'size'):");
    if (!name || !name.trim()) return;

    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '_');
    
    // Check if field already exists
    if (formData.metadata_fields.some(f => f.name === cleanName)) {
      showError("Field already exists");
      return;
    }

    setFormData({
      ...formData,
      metadata_fields: [
        ...formData.metadata_fields,
        {
          name: cleanName,
          field: {
            type: "text",
            label: name.trim(),
            required: false
          }
        }
      ]
    });
  };

  const removeMetadataField = (fieldName: string) => {
    setFormData({
      ...formData,
      metadata_fields: formData.metadata_fields.filter(f => f.name !== fieldName)
    });
  };

  const updateMetadataField = (index: number, updates: Partial<MetadataField>) => {
    const newFields = [...formData.metadata_fields];
    newFields[index] = {
      ...newFields[index],
      field: { ...newFields[index].field, ...updates }
    };
    setFormData({ ...formData, metadata_fields: newFields });
  };

  if (loading) {
    return (
      <div class="flex items-center justify-center min-h-screen">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div class="container mx-auto px-4 py-8">
      {/* Header */}
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold">Product Type Management</h1>
          <p class="text-base-content/70 mt-2">
            Define product types and their metadata schemas for your applications
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Product Type
        </Button>
      </div>

      {/* Main Content */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Types List */}
        <div class="lg:col-span-1">
          <Card>
            <div class="card-body">
              <h2 class="card-title text-lg mb-4">Product Types</h2>
              
              {productTypes.length === 0 ? (
                <div class="text-center py-8">
                  <p class="text-base-content/60 mb-4">No product types yet</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create First Type
                  </Button>
                </div>
              ) : (
                <div class="space-y-2">
                  {productTypes.map((type) => (
                    <div
                      key={type.id}
                      class={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedType?.id === type.id
                          ? "bg-primary text-primary-content"
                          : "bg-base-200 hover:bg-base-300"
                      }`}
                      onClick={() => setSelectedType(type)}
                    >
                      <div class="font-semibold">{type.name}</div>
                      {type.description && (
                        <div class="text-sm opacity-80 mt-1 line-clamp-2">
                          {type.description}
                        </div>
                      )}
                      <div class="flex items-center gap-2 mt-2">
                        <Badge size="sm" variant="ghost">
                          {type.product_sub_types?.length || 0} sub-types
                        </Badge>
                        {type.metadata_schema?.fields && (
                          <Badge size="sm" variant="ghost">
                            {Object.keys(type.metadata_schema.fields).length} fields
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Details Panel */}
        <div class="lg:col-span-2">
          {selectedType ? (
            <Card>
              <div class="card-body">
                <div class="flex justify-between items-start mb-6">
                  <div>
                    <h2 class="card-title text-2xl">{selectedType.name}</h2>
                    {selectedType.description && (
                      <p class="text-base-content/70 mt-2">{selectedType.description}</p>
                    )}
                  </div>
                  <div class="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(selectedType)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="text-error"
                      onClick={() => handleDeleteProductType(selectedType)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Metadata Schema */}
                <div class="space-y-6">
                  <div>
                    <h3 class="font-semibold mb-3">Metadata Schema</h3>
                    {selectedType.metadata_schema?.fields && 
                     Object.keys(selectedType.metadata_schema.fields).length > 0 ? (
                      <div class="bg-base-200 rounded-lg p-4">
                        <div class="space-y-3">
                          {Object.entries(selectedType.metadata_schema.fields).map(([name, field]: [string, any]) => (
                            <div key={name} class="flex items-center justify-between">
                              <div>
                                <span class="font-medium">{field.label || name}</span>
                                <span class="text-sm text-base-content/60 ml-2">({name})</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <Badge size="sm">{field.type}</Badge>
                                {field.required && (
                                  <Badge size="sm" variant="warning">Required</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div class="bg-base-200 rounded-lg p-4 text-center text-base-content/60">
                        No metadata fields defined
                      </div>
                    )}
                  </div>

                  {/* Sub-types */}
                  {selectedType.product_sub_types && selectedType.product_sub_types.length > 0 && (
                    <div>
                      <h3 class="font-semibold mb-3">Sub-types</h3>
                      <div class="space-y-2">
                        {selectedType.product_sub_types.map((subType) => (
                          <div key={subType.id} class="bg-base-200 rounded-lg p-4">
                            <div class="font-medium">{subType.name}</div>
                            {subType.description && (
                              <div class="text-sm text-base-content/60 mt-1">
                                {subType.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div class="text-sm text-base-content/60">
                    <div>Created: {new Date(selectedType.created_at).toLocaleDateString()}</div>
                    <div>Updated: {new Date(selectedType.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div class="card-body">
                <div class="text-center py-12">
                  <h2 class="text-xl font-semibold mb-2">Select a Product Type</h2>
                  <p class="text-base-content/60">
                    Choose a product type from the list to view its details
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div class="modal modal-open">
          <div class="modal-box max-w-3xl">
            <h3 class="font-bold text-lg mb-4">
              {showEditModal ? "Edit Product Type" : "Create Product Type"}
            </h3>

            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Name</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                  placeholder="e.g., Physical Product, Digital Service"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Description</span>
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                  placeholder="Describe this product type"
                  rows={3}
                />
              </div>

              <div>
                <div class="flex justify-between items-center mb-3">
                  <label class="label">
                    <span class="label-text">Metadata Fields</span>
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addMetadataField}
                  >
                    Add Field
                  </Button>
                </div>

                {formData.metadata_fields.length > 0 ? (
                  <div class="space-y-2">
                    {formData.metadata_fields.map((item, index) => (
                      <div key={item.name} class="bg-base-200 rounded-lg p-3">
                        <div class="flex items-start justify-between">
                          <div class="flex-1 space-y-2">
                            <div class="flex items-center gap-2">
                              <span class="font-medium">{item.name}</span>
                              <input
                                type="text"
                                class="input input-sm input-bordered flex-1"
                                value={item.field.label}
                                onChange={(e) => updateMetadataField(index, { label: e.currentTarget.value })}
                                placeholder="Display label"
                              />
                            </div>
                            <div class="flex items-center gap-2">
                              <select
                                class="select select-sm select-bordered"
                                value={item.field.type}
                                onChange={(e) => updateMetadataField(index, { type: e.currentTarget.value as any })}
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="date">Date</option>
                                <option value="select">Select</option>
                              </select>
                              <label class="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  class="checkbox checkbox-sm"
                                  checked={item.field.required}
                                  onChange={(e) => updateMetadataField(index, { required: e.currentTarget.checked })}
                                />
                                <span class="text-sm">Required</span>
                              </label>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMetadataField(item.name)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div class="bg-base-200 rounded-lg p-4 text-center text-base-content/60">
                    No fields added yet. Click "Add Field" to define metadata fields.
                  </div>
                )}
              </div>
            </div>

            <div class="modal-action">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={showEditModal ? handleUpdateProductType : handleCreateProductType}
                disabled={saving || !formData.name.trim()}
              >
                {saving ? "Saving..." : (showEditModal ? "Update" : "Create")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}