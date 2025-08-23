import { useState } from "preact/hooks";
import { CreateProductRequest, Product, UpdateProductRequest } from "@suppers/shared";
import { useProducts } from "../hooks/useProducts.ts";
import { useEntities } from "../hooks/useEntities.ts";
import { Button, Input, Modal, Select, Tabs, Textarea } from "@suppers/ui-lib";
import SimpleVariableInputs from "./SimpleVariableInputs.tsx";
import PricingTemplateSelector from "./PricingTemplateSelector.tsx";

interface ProductFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  product?: Product;
  onSave?: (product: Product) => void;
  baseUrl?: string;
}

export default function ProductForm(
  { isOpen = false, onClose, product, onSave, baseUrl = "/api" }: ProductFormProps,
) {
  const { createProduct, updateProduct, error: productError } = useProducts();
  const { entities } = useEntities();

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    type: product?.type || "digital",
    status: product?.status || "draft",
    entity_id: product?.entity_id || "",
    metadata: product?.metadata || {},
  });

  const [loading, setLoading] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (product) {
        const updateData: UpdateProductRequest = {
          name: formData.name,
          description: formData.description,
          type: formData.type as "digital" | "physical" | "service",
          status: formData.status as "active" | "draft" | "archived",
          entity_id: formData.entity_id,
          metadata: formData.metadata,
        };
        result = await updateProduct(product.id, updateData);
      } else {
        const createData: CreateProductRequest = {
          name: formData.name,
          description: formData.description,
          type: formData.type as "digital" | "physical" | "service",
          status: formData.status as "active" | "draft" | "archived",
          entity_id: formData.entity_id,
          metadata: formData.metadata,
        };
        result = await createProduct(createData);
      }

      if (result) {
        onSave?.(result);
        onClose?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div class="space-y-6">
      {productError && (
        <div class="alert alert-error">
          <span>{productError}</span>
        </div>
      )}

      {/* Tabs for Basic Info and Pricing */}
      <Tabs
        tabs={[
          { id: "basic", label: "Basic Information" },
          { id: "pricing", label: "Pricing Configuration", disabled: !product?.id },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "basic"
        ? (
          // Basic Information Tab
          <div class="space-y-6">
            <div class="form-control">
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
                placeholder="Enter product name"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: (e.target as HTMLTextAreaElement).value,
                  }))}
                placeholder="Enter product description"
                rows={4}
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Type *</span>
              </label>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: (e.target as HTMLSelectElement).value,
                  }))}
                required
              >
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
                <option value="service">Service</option>
              </Select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Status</span>
              </label>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: (e.target as HTMLSelectElement).value,
                  }))}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Entity</span>
              </label>
              <Select
                value={formData.entity_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    entity_id: (e.target as HTMLSelectElement).value,
                  }))}
              >
                <option value="">No Entity</option>
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>{entity.name}</option>
                ))}
              </Select>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              {onClose && (
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || !formData.name.trim()}
              >
                {loading ? "Saving..." : (product ? "Update Product" : "Create Product")}
              </Button>
            </div>
          </div>
        )
        : (
          // Pricing Configuration Tab
          <div class="space-y-6">
            {product?.id
              ? (
                <SimpleVariableInputs
                  productId={product.id}
                  baseUrl={baseUrl}
                  onOpenTemplateSelector={() => setShowTemplateSelector(true)}
                />
              )
              : (
                <div class="text-center py-8 text-gray-500">
                  Save the product first to configure pricing
                </div>
              )}
          </div>
        )}

      {/* Pricing Template Selector Modal */}
      {product?.id && (
        <PricingTemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          productId={product.id}
          baseUrl={baseUrl}
          onTemplateApplied={() => {
            // Refresh the variables display
            setShowTemplateSelector(false);
          }}
        />
      )}
    </div>
  );

  if (!isOpen) {
    return null;
  }

  if (onClose) {
    return (
      <Modal
        open={isOpen}
        onClose={onClose}
        title={product ? "Edit Product" : "Create New Product"}
      >
        {content}
      </Modal>
    );
  }

  return (
    <div class="max-w-2xl mx-auto">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">{product ? "Edit Product" : "Create New Product"}</h2>
          {content}
        </div>
      </div>
    </div>
  );
}
