import { useEffect, useState } from "preact/hooks";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  NumberInput,
  TimeInput,
} from "@suppers/ui-lib";
import { PricingTemplatesApiClient } from "../lib/api-client/pricing-templates/pricing-templates-api.ts";
// Local type definitions to avoid circular imports
type VariableValueType = "number" | "percentage" | "boolean" | "string" | "time" | "date";
type VariableCategory = "pricing" | "capacity" | "features" | "time" | "restrictions";

interface ValidationRules {
  min?: number;
  max?: number;
  required?: boolean;
  step?: number;
  pattern?: string;
}

interface UserVariableInput {
  variable_id: string;
  name: string;
  description: string;
  category: VariableCategory;
  value_type: VariableValueType;
  current_value?: string;
  default_value?: string;
  validation_rules?: ValidationRules;
  display_order: number;
  required: boolean;
}

interface ProductVariablesResponse {
  product_id: string;
  variables: UserVariableInput[];
  applied_template?: {
    id: string;
    name: string;
    category: string;
  };
}
import PricingPreview from "./PricingPreview.tsx";

interface SimpleVariableInputsProps {
  productId: string;
  baseUrl: string;
  onOpenTemplateSelector: () => void;
}

export default function SimpleVariableInputs({
  productId,
  baseUrl,
  onOpenTemplateSelector,
}: SimpleVariableInputsProps) {
  const [apiClient, setApiClient] = useState<PricingTemplatesApiClient | null>(null);
  const [variables, setVariables] = useState<UserVariableInput[]>([]);
  const [appliedTemplate, setAppliedTemplate] = useState<
    { id: string; name: string; category: string } | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Initialize API client
  useEffect(() => {
    const client = new PricingTemplatesApiClient(baseUrl);
    setApiClient(client);
  }, [baseUrl]);

  // Load variables when component mounts
  useEffect(() => {
    if (apiClient && productId) {
      loadProductVariables();
    }
  }, [apiClient, productId]);

  const loadProductVariables = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      const response = await apiClient.getProductVariables(productId);

      if (response.success && response.data) {
        setVariables(response.data.variables);
        setAppliedTemplate(response.data.applied_template || null);
      } else {
        // If no variables configured yet, that's okay
        setVariables([]);
        setAppliedTemplate(null);
      }
    } catch (error) {
      console.error("Error loading product variables:", error);
      setVariables([]);
    } finally {
      setLoading(false);
    }
  };

  const updateVariable = async (variableId: string, value: string) => {
    if (!apiClient) return;

    try {
      setSaving((prev) => ({ ...prev, [variableId]: true }));

      const response = await apiClient.setProductVariable(productId, {
        variable_id: variableId,
        value,
      });

      if (response.success) {
        // Update local state
        setVariables((prev) =>
          prev.map((v) => v.variable_id === variableId ? { ...v, current_value: value } : v)
        );
      } else {
        setError(response.error || "Failed to update variable");
      }
    } catch (error) {
      setError("Error updating variable");
      console.error("Error updating variable:", error);
    } finally {
      setSaving((prev) => ({ ...prev, [variableId]: false }));
    }
  };

  const removeTemplate = async () => {
    if (!apiClient) return;

    if (
      !confirm(
        "Are you sure you want to remove the current pricing template? This will clear all configured variables.",
      )
    ) {
      return;
    }

    try {
      const response = await apiClient.removeProductTemplate(productId);
      if (response.success) {
        setVariables([]);
        setAppliedTemplate(null);
      } else {
        setError(response.error || "Failed to remove template");
      }
    } catch (error) {
      setError("Error removing template");
      console.error("Error removing template:", error);
    }
  };

  const handleTemplateApplied = (newVariables: UserVariableInput[]) => {
    setVariables(newVariables);
    loadProductVariables(); // Reload to get the applied template info
  };

  const getVariableInputType = (variable: UserVariableInput) => {
    switch (variable.value_type) {
      case "number":
      case "percentage":
        return "number";
      case "time":
        return "time";
      case "date":
        return "date";
      case "boolean":
        return "checkbox";
      default:
        return "text";
    }
  };

  const renderVariableInput = (variable: UserVariableInput) => {
    const value = variable.current_value || variable.default_value || "";
    const isLoading = saving[variable.variable_id];

    if (variable.value_type === "boolean") {
      return (
        <div class="flex items-center justify-between">
          <div>
            <span class="font-medium">{variable.name}</span>
            {variable.description && (
              <p class="text-sm text-gray-500 mt-1">{variable.description}</p>
            )}
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value === "true"}
              onChange={(e) =>
                updateVariable(
                  variable.variable_id,
                  (e.target as HTMLInputElement).checked.toString(),
                )}
              disabled={isLoading}
              class="checkbox"
            />
            <span class="text-sm">
              {isLoading && <span class="loading loading-spinner loading-xs ml-2"></span>}
            </span>
          </label>
        </div>
      );
    }

    return (
      <div>
        <label class="label">
          <span class="label-text font-medium">
            {variable.name}
            {variable.required && <span class="text-red-500 ml-1">*</span>}
          </span>
          {isLoading && <span class="loading loading-spinner loading-xs"></span>}
        </label>

        {variable.value_type === "time"
          ? (
            <TimeInput
              value={value}
              onChange={(newValue) => updateVariable(variable.variable_id, newValue)}
              disabled={isLoading}
              required={variable.required}
            />
          )
          : variable.value_type === "number" || variable.value_type === "percentage"
          ? (
            <NumberInput
              value={Number(value) || undefined}
              onChange={(newValue) =>
                updateVariable(variable.variable_id, newValue?.toString() || "")}
              disabled={isLoading}
              required={variable.required}
              min={variable.validation_rules?.min}
              max={variable.validation_rules?.max}
              step={variable.validation_rules?.step}
              placeholder={variable.default_value || `Enter ${variable.name.toLowerCase()}`}
            />
          )
          : (
            <Input
              type={getVariableInputType(variable)}
              value={value}
              onChange={(e) =>
                updateVariable(
                  variable.variable_id,
                  (e.target as HTMLInputElement).value,
                )}
              disabled={isLoading}
              placeholder={variable.default_value || `Enter ${variable.name.toLowerCase()}`}
              required={variable.required}
              min={variable.validation_rules?.min}
              max={variable.validation_rules?.max}
              step={variable.validation_rules?.step}
            />
          )}

        {variable.description && (
          <div class="label">
            <span class="label-text-alt text-gray-500">{variable.description}</span>
          </div>
        )}

        {/* Show units for percentage */}
        {variable.value_type === "percentage" && value && (
          <div class="label">
            <span class="label-text-alt text-primary">= {value}%</span>
          </div>
        )}
      </div>
    );
  };

  const getVariablesByCategory = () => {
    const categories = ["pricing", "capacity", "features", "time", "restrictions"];
    const result: Record<string, UserVariableInput[]> = {};

    categories.forEach((category) => {
      const categoryVariables = variables.filter((v) => v.category === category);
      if (categoryVariables.length > 0) {
        result[category] = categoryVariables.sort((a, b) => a.display_order - b.display_order);
      }
    });

    return result;
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center h-32">
        <div class="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Applied Template Info */}
      {appliedTemplate && (
        <Card class="p-4 bg-blue-50 border-blue-200">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-medium">Pricing Template Applied</h4>
                <Badge variant="primary" size="sm">{appliedTemplate.category}</Badge>
              </div>
              <p class="text-sm text-gray-600">{appliedTemplate.name}</p>
            </div>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTemplateSelector}
              >
                Change Template
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeTemplate}
              >
                Remove
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Variables or Empty State */}
      {variables.length === 0
        ? (
          <EmptyState
            title="No pricing configuration"
            description="Choose a pricing template to get started with configuring your product pricing"
            action={{
              label: "Choose Template",
              onClick: onOpenTemplateSelector,
            }}
          />
        )
        : (
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Variables Configuration */}
            <div class="lg:col-span-2 space-y-6">
              {/* Category Sections */}
              {Object.entries(getVariablesByCategory()).map(([category, categoryVariables]) => (
                <Card key={category} class="p-6">
                  <h3 class="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
                    {category}
                    <Badge variant="outline" size="sm">
                      {categoryVariables.length}
                    </Badge>
                  </h3>

                  <div class="space-y-4">
                    {categoryVariables.map((variable) => (
                      <div key={variable.variable_id} class="p-4 border rounded-lg">
                        {renderVariableInput(variable)}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}

              {/* Template Actions */}
              <div class="flex justify-center">
                <Button
                  variant="outline"
                  onClick={onOpenTemplateSelector}
                >
                  Change Template
                </Button>
              </div>
            </div>

            {/* Pricing Preview */}
            <div class="lg:col-span-1">
              <div class="sticky top-6">
                <PricingPreview
                  variables={variables}
                  productId={productId}
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
