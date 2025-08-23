import { useState } from "preact/hooks";
import {
  CreatePricingProductRequest,
  PricingProduct,
  UpdatePricingProductRequest,
} from "@suppers/shared";
import { usePricing } from "../hooks/usePricing.ts";
import { Button, Input, Modal, Textarea } from "@suppers/ui-lib";

interface PricingProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: PricingProduct;
  onSave?: (product: PricingProduct) => void;
}

export default function PricingProductForm(
  { isOpen, onClose, product, onSave }: PricingProductFormProps,
) {
  const { createPricingProduct, updatePricingProduct, error: pricingError } = usePricing();

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (product) {
        const updateData: UpdatePricingProductRequest = {
          name: formData.name,
          description: formData.description || null,
        };
        result = await updatePricingProduct(product.id!, updateData);
      } else {
        const createData: CreatePricingProductRequest = {
          name: formData.name,
          description: formData.description || null,
        };
        result = await createPricingProduct(createData);
      }

      if (result) {
        onSave?.(result);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div class="space-y-6">
      {pricingError && (
        <div class="alert alert-error">
          <span>{pricingError}</span>
        </div>
      )}

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
          placeholder="Enter pricing product name"
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
          placeholder="Enter pricing product description"
          rows={4}
        />
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
        >
          {loading ? "Saving..." : (product ? "Update Pricing Product" : "Create Pricing Product")}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={product ? "Edit Pricing Product" : "Create New Pricing Product"}
    >
      {content}
    </Modal>
  );
}
