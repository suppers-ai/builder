import { useEffect, useState } from "preact/hooks";
import { Button, Card, Input, Select, Badge, LoadingButton, Toggle } from "@suppers/ui-lib";
import { getAuthClient } from "../lib/auth.ts";
import toast from "../lib/toast-manager.ts";

interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  formulas: string[];
  variables: Array<{
    id: string;
    name: string;
    type: "number" | "percentage" | "boolean";
    default_value?: any;
  }>;
}

interface ProductPricing {
  product_id: string;
  pricing_template_id: string;
  variable_overrides: Record<string, any>;
  is_active: boolean;
}

interface Props {
  productId: string;
  productName: string;
}

export default function ProductPricingConfig({ productId, productName }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PricingTemplate | null>(null);
  const [pricing, setPricing] = useState<ProductPricing | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [previewPrice, setPreviewPrice] = useState<number | null>(null);

  useEffect(() => {
    loadPricingData();
  }, [productId]);

  useEffect(() => {
    if (selectedTemplate) {
      // Initialize variable values with defaults
      const defaults: Record<string, any> = {};
      selectedTemplate.variables.forEach(v => {
        defaults[v.id] = pricing?.variable_overrides?.[v.id] ?? v.default_value ?? 0;
      });
      setVariableValues(defaults);
      calculatePreview(defaults);
    }
  }, [selectedTemplate]);

  const loadPricingData = async () => {
    try {
      setLoading(true);
      const authClient = getAuthClient();
      const token = await authClient.getAccessToken();

      // Load available pricing templates
      const templatesRes = await fetch("/api/pricing/templates", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }

      // Load existing pricing for this product
      const pricingRes = await fetch(`/api/products/${productId}/pricing`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      if (pricingRes.ok) {
        const data = await pricingRes.json();
        setPricing(data);
        if (data.pricing_template_id) {
          const template = templates.find(t => t.id === data.pricing_template_id);
          setSelectedTemplate(template || null);
        }
      }
    } catch (error) {
      console.error("Error loading pricing data:", error);
      toast.error("Failed to load pricing information");
    } finally {
      setLoading(false);
    }
  };

  const calculatePreview = async (values: Record<string, any>) => {
    if (!selectedTemplate) return;

    try {
      const authClient = getAuthClient();
      const response = await fetch("/api/pricing/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await authClient.getAccessToken()}`,
        },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          variables: values,
          context: {
            participants: 1,
            nights: 1,
            quantity: 1,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewPrice(data.price);
      }
    } catch (error) {
      console.error("Error calculating preview:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      const authClient = getAuthClient();
      
      const response = await fetch(`/api/products/${productId}/pricing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await authClient.getAccessToken()}`,
        },
        body: JSON.stringify({
          pricing_template_id: selectedTemplate.id,
          variable_overrides: variableValues,
          is_active: true,
        }),
      });

      if (response.ok) {
        toast.success("Pricing configuration saved successfully!");
        await loadPricingData();
      } else {
        toast.error("Failed to save pricing configuration");
      }
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast.error("Failed to save pricing configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleVariableChange = (variableId: string, value: any) => {
    const newValues = { ...variableValues, [variableId]: value };
    setVariableValues(newValues);
    calculatePreview(newValues);
  };

  if (loading) {
    return (
      <Card>
        <div class="card-body">
          <div class="flex justify-center items-center py-8">
            <div class="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div class="space-y-6">
      {/* Pricing Template Selection */}
      <Card>
        <div class="card-body">
          <h3 class="card-title mb-4">Pricing Configuration for {productName}</h3>
          
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text">Select Pricing Template</span>
              <span class="label-text-alt">Templates are configured by administrators</span>
            </label>
            <Select
              value={selectedTemplate?.id || ""}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.currentTarget.value);
                setSelectedTemplate(template || null);
              }}
            >
              <option value="">Choose a pricing template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </option>
              ))}
            </Select>
          </div>

          {selectedTemplate && (
            <>
              <div class="divider"></div>
              
              {/* Template Information */}
              <div class="bg-base-200 rounded-lg p-4 mb-6">
                <h4 class="font-semibold mb-2">{selectedTemplate.name}</h4>
                <p class="text-sm text-base-content/70 mb-3">{selectedTemplate.description}</p>
                <div class="flex flex-wrap gap-2">
                  {selectedTemplate.formulas.map(formula => (
                    <Badge key={formula} variant="outline" size="sm">
                      {formula}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Variable Configuration */}
              <div class="space-y-4">
                <h4 class="font-semibold">Configure Pricing Variables</h4>
                
                {selectedTemplate.variables.map(variable => (
                  <div key={variable.id} class="form-control">
                    <label class="label">
                      <span class="label-text">{variable.name}</span>
                      <span class="label-text-alt">{variable.type}</span>
                    </label>
                    
                    {variable.type === "boolean" ? (
                      <Toggle
                        checked={variableValues[variable.id] || false}
                        onChange={(checked) => handleVariableChange(variable.id, checked)}
                      />
                    ) : variable.type === "percentage" ? (
                      <div class="input-group">
                        <Input
                          type="number"
                          value={variableValues[variable.id] || 0}
                          onChange={(e) => handleVariableChange(variable.id, parseFloat(e.currentTarget.value))}
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span class="bg-base-300 px-3 flex items-center">%</span>
                      </div>
                    ) : (
                      <Input
                        type="number"
                        value={variableValues[variable.id] || 0}
                        onChange={(e) => handleVariableChange(variable.id, parseFloat(e.currentTarget.value))}
                        min="0"
                        step="0.01"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Price Preview */}
              {previewPrice !== null && (
                <div class="bg-primary/10 rounded-lg p-6 mt-6 text-center">
                  <p class="text-sm text-base-content/70 mb-2">Estimated Base Price</p>
                  <p class="text-3xl font-bold text-primary">
                    ${previewPrice.toFixed(2)}
                  </p>
                  <p class="text-xs text-base-content/60 mt-2">
                    * Final price may vary based on quantity, dates, and other factors
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div class="card-actions justify-end mt-6">
                <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                  Cancel
                </Button>
                <LoadingButton
                  variant="primary"
                  onClick={handleSave}
                  loading={saving}
                >
                  Save Configuration
                </LoadingButton>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Help Section */}
      <Card>
        <div class="card-body">
          <h4 class="font-semibold mb-3">How Pricing Works</h4>
          <div class="space-y-2 text-sm text-base-content/70">
            <p>
              1. <strong>Select a Template:</strong> Choose from admin-configured pricing templates that match your product type.
            </p>
            <p>
              2. <strong>Configure Variables:</strong> Set your base prices, discounts, and other pricing factors.
            </p>
            <p>
              3. <strong>Automatic Calculations:</strong> Prices adjust automatically based on quantity, dates, and customer type.
            </p>
            <p>
              4. <strong>Dynamic Pricing:</strong> Your prices will update in real-time based on the formulas in the template.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}