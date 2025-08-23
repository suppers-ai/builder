import { useState } from "preact/hooks";
import { CreatePriceRequest, PricingPrice, UpdatePriceRequest } from "@suppers/shared";
import { usePricing } from "../hooks/usePricing.ts";
import { Button, Input, Modal, Select, Textarea } from "@suppers/ui-lib";
import FormulaBuilder from "./FormulaBuilder.tsx";

interface PriceFormProps {
  isOpen: boolean;
  onClose: () => void;
  price?: PricingPrice;
  onSave?: (price: PricingPrice) => void;
}

export default function PriceForm({ isOpen, onClose, price, onSave }: PriceFormProps) {
  const { createPrice, updatePrice, error: pricingError } = usePricing();

  const [formData, setFormData] = useState({
    name: price?.name || "",
    description: price?.description || "",
    type: price?.type || "fixed",
    base_price: price?.base_price || 0,
    currency: price?.currency || "USD",
    status: price?.status || "active",
    metadata: price?.metadata || {},
    formula: (price?.metadata as any)?.formula || "",
  });

  const [loading, setLoading] = useState(false);
  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (price) {
        const updateData: UpdatePriceRequest = {
          name: formData.name,
          description: formData.description,
          type: formData.type as "fixed" | "variable" | "formula",
          base_price: formData.base_price,
          currency: formData.currency,
          status: formData.status as "active" | "inactive" | "archived",
          metadata: { ...formData.metadata, formula: formData.formula },
        };
        result = await updatePrice(price.id, updateData);
      } else {
        const createData: CreatePriceRequest = {
          name: formData.name,
          description: formData.description,
          type: formData.type as "fixed" | "variable" | "formula",
          base_price: formData.base_price,
          currency: formData.currency,
          status: formData.status as "active" | "inactive" | "archived",
          metadata: { ...formData.metadata, formula: formData.formula },
        };
        result = await createPrice(createData);
      }

      if (result) {
        onSave?.(result);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={price ? "Edit Price" : "Create New Price"}
    >
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
            placeholder="Enter price name"
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
            placeholder="Enter price description"
            rows={3}
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
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
              <option value="fixed">Fixed</option>
              <option value="variable">Variable</option>
              <option value="formula">Formula</option>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Base Price *</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.base_price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  base_price: parseFloat((e.target as HTMLInputElement).value) || 0,
                }))}
              placeholder="0.00"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Currency</span>
            </label>
            <Select
              value={formData.currency}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currency: (e.target as HTMLSelectElement).value,
                }))}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </Select>
          </div>
        </div>

        {formData.type === "formula" && (
          <div class="form-control">
            <label class="label">
              <span class="label-text">Pricing Formula</span>
            </label>
            <div class="flex gap-2">
              <Textarea
                value={formData.formula}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    formula: (e.target as HTMLTextAreaElement).value,
                  }))}
                placeholder="Enter pricing formula (e.g., base_price * quantity)"
                rows={3}
                class="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setShowFormulaBuilder(true)}
                class="self-start"
              >
                Formula Builder
              </Button>
            </div>
            <div class="label">
              <span class="label-text-alt">
                Available variables: base_price, quantity, entity.*, user.*, product.*
              </span>
            </div>
          </div>
        )}
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
          disabled={loading || !formData.name.trim() || formData.base_price < 0}
        >
          {loading ? "Saving..." : (price ? "Update Price" : "Create Price")}
        </Button>
      </div>

      {/* Formula Builder Modal */}
      <FormulaBuilder
        isOpen={showFormulaBuilder}
        onClose={() => setShowFormulaBuilder(false)}
        onSave={(formula) => setFormData((prev) => ({ ...prev, formula }))}
        initialFormula={formData.formula}
      />
    </Modal>
  );
}
