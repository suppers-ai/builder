import { useEffect, useState } from "preact/hooks";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  LoadingButton,
  Modal,
  Select,
  Tabs,
  Textarea,
} from "@suppers/ui-lib";
import { OAuthAuthClient } from "@suppers/auth-client";
import { AdminPricingApiClient } from "../lib/api-client/pricing/pricing-api.ts";
import { AdminPricingProduct, GlobalVariableDefinition } from "@suppers/shared";
import { getAuthClient } from "../lib/auth.ts";

interface PricingProductsIslandProps {
  baseUrl: string;
}

export default function PricingProductsIsland({ baseUrl }: PricingProductsIslandProps) {
  const [apiClient, setApiClient] = useState<AdminPricingApiClient | null>(null);
  const [pricingProducts, setPricingProducts] = useState<AdminPricingProduct[]>([]);
  const [variableDefinitions, setVariableDefinitions] = useState<GlobalVariableDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminPricingProduct | null>(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloningProduct, setCloningProduct] = useState<AdminPricingProduct | null>(null);
  const [activeTab, setActiveTab] = useState("templates");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_category: "",
    variable_ids: [] as string[],
  });

  const [cloneName, setCloneName] = useState("");

  // Initialize API client
  useEffect(() => {
    const authClient = getAuthClient();
    const client = new AdminPricingApiClient(authClient, baseUrl);
    setApiClient(client);
  }, [baseUrl]);

  // Load data
  useEffect(() => {
    if (apiClient) {
      loadPricingProducts();
      loadVariableDefinitions();
    }
  }, [apiClient, activeTab]);

  const loadPricingProducts = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      const isTemplate = activeTab === "templates";
      const response = await apiClient.getPricingProducts({ is_template: isTemplate });

      console.log("Pricing products response:", response);

      if (response.data) {
        setPricingProducts(response.data.pricing_products || []);
        setError(null);
      } else {
        setError(response.error || "Failed to load pricing products");
        setPricingProducts([]);
      }
    } catch (error) {
      setError("Error loading pricing products");
      console.error("Error loading pricing products:", error);
      setPricingProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVariableDefinitions = async () => {
    if (!apiClient) return;

    try {
      const response = await apiClient.getVariableDefinitions();
      if (response.data) {
        setVariableDefinitions(response.data.variables || []);
      }
    } catch (error) {
      console.error("Error loading variable definitions:", error);
    }
  };

  const handleCreateProduct = async () => {
    if (!apiClient) return;

    try {
      const response = await apiClient.createPricingProduct(formData);
      if (response.data) {
        setShowCreateModal(false);
        resetForm();
        loadPricingProducts();
      } else {
        setError(response.error || "Failed to create pricing product");
      }
    } catch (error) {
      setError("Error creating pricing product");
      console.error("Error creating pricing product:", error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!apiClient || !editingProduct) return;

    try {
      const response = await apiClient.updatePricingProduct(editingProduct.id, formData);
      if (response.data) {
        setShowEditModal(false);
        setEditingProduct(null);
        resetForm();
        loadPricingProducts();
      } else {
        setError(response.error || "Failed to update pricing product");
      }
    } catch (error) {
      setError("Error updating pricing product");
      console.error("Error updating pricing product:", error);
    }
  };

  const handleDeleteProduct = async (product: AdminPricingProduct) => {
    if (!apiClient) return;

    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      const response = await apiClient.deletePricingProduct(product.id);
      if (response.data) {
        loadPricingProducts();
      } else {
        setError(response.error || "Failed to delete pricing product");
      }
    } catch (error) {
      setError("Error deleting pricing product");
      console.error("Error deleting pricing product:", error);
    }
  };

  const handleCloneProduct = async () => {
    if (!apiClient || !cloningProduct) return;

    try {
      const response = await apiClient.clonePricingProduct(cloningProduct.id, { name: cloneName });
      if (response.data) {
        setShowCloneModal(false);
        setCloningProduct(null);
        setCloneName("");
        loadPricingProducts();
      } else {
        setError(response.error || "Failed to clone pricing product");
      }
    } catch (error) {
      setError("Error cloning pricing product");
      console.error("Error cloning pricing product:", error);
    }
  };

  const startEdit = (product: AdminPricingProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      template_category: product.template_category || "",
      variable_ids: product.variable_ids || [],
    });
    setShowEditModal(true);
  };

  const startClone = (product: AdminPricingProduct) => {
    setCloningProduct(product);
    setCloneName(`Copy of ${product.name}`);
    setShowCloneModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      template_category: "",
      variable_ids: [],
    });
  };

  const toggleVariable = (variableId: string) => {
    setFormData((prev) => ({
      ...prev,
      variable_ids: prev.variable_ids.includes(variableId)
        ? prev.variable_ids.filter((id) => id !== variableId)
        : [...prev.variable_ids, variableId],
    }));
  };

  const getVariablesByCategory = () => {
    const categories = ["pricing", "capacity", "features", "time", "restrictions"];
    return categories.reduce((acc, category) => {
      acc[category] = variableDefinitions.filter((v) => v.category === category);
      return acc;
    }, {} as Record<string, GlobalVariableDefinition[]>);
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center h-64">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Pricing Products</h1>
          <p class="text-gray-600">Manage pricing product templates and configurations</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Pricing Product
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: "templates",
            label: "System Templates",
            count: activeTab === "templates" ? pricingProducts.length : undefined,
          },
          {
            id: "custom",
            label: "Custom Products",
            count: activeTab === "custom" ? pricingProducts.length : undefined,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Products List */}
      {pricingProducts.length === 0
        ? (
          <EmptyState
            title={activeTab === "templates" ? "No system templates" : "No custom pricing products"}
            description={activeTab === "templates"
              ? "System templates are created by administrators"
              : "Create your first custom pricing product to get started"}
            action={activeTab === "custom"
              ? {
                label: "Create Pricing Product",
                onClick: () => setShowCreateModal(true),
              }
              : undefined}
          />
        )
        : (
          <div class="grid gap-4">
            {pricingProducts.map((product) => (
              <Card key={product.id} class="p-6">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold">{product.name}</h3>
                      {product.template_category && (
                        <Badge variant="outline">
                          {product.template_category}
                        </Badge>
                      )}
                      {activeTab === "templates" && <Badge variant="primary">Template</Badge>}
                    </div>
                    <p class="text-gray-600 mb-3">{product.description}</p>

                    {product.variable_ids && product.variable_ids.length > 0 && (
                      <div class="flex flex-wrap gap-1">
                        {product.variable_ids.map((variableId) => {
                          const variable = variableDefinitions.find((v) =>
                            v.variable_id === variableId
                          );
                          return variable
                            ? (
                              <Badge key={variableId} variant="outline" size="sm">
                                {variable.name}
                              </Badge>
                            )
                            : null;
                        })}
                      </div>
                    )}
                  </div>

                  <div class="flex gap-2">
                    {activeTab === "templates" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startClone(product)}
                      >
                        Clone
                      </Button>
                    )}
                    {activeTab === "custom" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Pricing Product"
      >
        <div class="space-y-4">
          <div>
            <label class="label">
              <span class="label-text">Name *</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: (e.target as HTMLInputElement).value,
                }))}
              placeholder="e.g., Restaurant Booking Template"
              required
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text">Description *</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: (e.target as HTMLTextAreaElement).value,
                }))}
              placeholder="Describe what this pricing product is used for"
              rows={3}
              required
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text">Category</span>
            </label>
            <Select
              value={formData.template_category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  template_category: (e.target as HTMLSelectElement).value,
                }))}
            >
              <option value="">Select category</option>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="event">Event</option>
              <option value="service">Service</option>
              <option value="venue">Venue</option>
              <option value="experience">Experience</option>
              <option value="general">General</option>
            </Select>
          </div>

          {/* Variable Selection */}
          <div>
            <label class="label">
              <span class="label-text">Variables</span>
            </label>
            <div class="border rounded-lg p-4 max-h-64 overflow-y-auto">
              {Object.entries(getVariablesByCategory()).map(([category, variables]) => (
                variables.length > 0 && (
                  <div key={category} class="mb-4 last:mb-0">
                    <h4 class="font-medium text-sm text-gray-700 mb-2 capitalize">{category}</h4>
                    <div class="space-y-2">
                      {variables.map((variable) => (
                        <label key={variable.id} class="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.variable_ids.includes(variable.variable_id)}
                            onChange={() =>
                              toggleVariable(variable.variable_id)}
                            class="checkbox checkbox-sm"
                          />
                          <span class="text-sm">{variable.name}</span>
                          <span class="text-xs text-gray-500">({variable.value_type})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="primary"
            onClick={handleCreateProduct}
            disabled={!formData.name.trim() || !formData.description.trim()}
          >
            Create Product
          </LoadingButton>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
          resetForm();
        }}
        title="Edit Pricing Product"
      >
        <div class="space-y-4">
          <div>
            <label class="label">
              <span class="label-text">Name *</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: (e.target as HTMLInputElement).value,
                }))}
              placeholder="e.g., Restaurant Booking Template"
              required
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text">Description *</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: (e.target as HTMLTextAreaElement).value,
                }))}
              placeholder="Describe what this pricing product is used for"
              rows={3}
              required
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text">Category</span>
            </label>
            <Select
              value={formData.template_category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  template_category: (e.target as HTMLSelectElement).value,
                }))}
            >
              <option value="">Select category</option>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="event">Event</option>
              <option value="service">Service</option>
              <option value="venue">Venue</option>
              <option value="experience">Experience</option>
              <option value="general">General</option>
            </Select>
          </div>

          {/* Variable Selection */}
          <div>
            <label class="label">
              <span class="label-text">Variables</span>
            </label>
            <div class="border rounded-lg p-4 max-h-64 overflow-y-auto">
              {Object.entries(getVariablesByCategory()).map(([category, variables]) => (
                variables.length > 0 && (
                  <div key={category} class="mb-4 last:mb-0">
                    <h4 class="font-medium text-sm text-gray-700 mb-2 capitalize">{category}</h4>
                    <div class="space-y-2">
                      {variables.map((variable) => (
                        <label key={variable.id} class="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.variable_ids.includes(variable.variable_id)}
                            onChange={() =>
                              toggleVariable(variable.variable_id)}
                            class="checkbox checkbox-sm"
                          />
                          <span class="text-sm">{variable.name}</span>
                          <span class="text-xs text-gray-500">({variable.value_type})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowEditModal(false);
              setEditingProduct(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="primary"
            onClick={handleUpdateProduct}
            disabled={!formData.name.trim() || !formData.description.trim()}
          >
            Update Product
          </LoadingButton>
        </div>
      </Modal>

      {/* Clone Modal */}
      <Modal
        open={showCloneModal}
        onClose={() => {
          setShowCloneModal(false);
          setCloningProduct(null);
          setCloneName("");
        }}
        title="Clone Pricing Product"
      >
        <div class="space-y-4">
          <p class="text-gray-600">
            Create a copy of "{cloningProduct?.name}" that you can customize.
          </p>

          <div>
            <label class="label">
              <span class="label-text">New Name *</span>
            </label>
            <Input
              type="text"
              value={cloneName}
              onChange={(e) => setCloneName((e.target as HTMLInputElement).value)}
              placeholder="Enter name for the cloned product"
              required
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowCloneModal(false);
              setCloningProduct(null);
              setCloneName("");
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="primary"
            onClick={handleCloneProduct}
            disabled={!cloneName.trim()}
          >
            Clone Product
          </LoadingButton>
        </div>
      </Modal>
    </div>
  );
}
