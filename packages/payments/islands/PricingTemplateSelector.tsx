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
  Tabs,
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

interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_variables: UserVariableInput[];
  estimated_setup_time: number;
  complexity_level: "simple" | "moderate" | "advanced";
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

interface PricingTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  baseUrl: string;
  onTemplateApplied?: (variables: UserVariableInput[]) => void;
}

export default function PricingTemplateSelector({
  isOpen,
  onClose,
  productId,
  baseUrl,
  onTemplateApplied,
}: PricingTemplateSelectorProps) {
  const [apiClient, setApiClient] = useState<PricingTemplatesApiClient | null>(null);
  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PricingTemplate | null>(null);
  const [showVariables, setShowVariables] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  // Variable values for the selected template
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState(false);

  // Initialize API client
  useEffect(() => {
    const client = new PricingTemplatesApiClient(baseUrl);
    setApiClient(client);
  }, [baseUrl]);

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen && apiClient) {
      loadTemplates();
    }
  }, [isOpen, apiClient, activeCategory]);

  const loadTemplates = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      const params = activeCategory === "all" ? {} : { category: activeCategory };
      const response = await apiClient.getPricingTemplates(params);

      if (response.success && response.data) {
        setTemplates(response.data.templates);
        setCategories(response.data.categories);
      } else {
        setError(response.error || "Failed to load pricing templates");
      }
    } catch (error) {
      setError("Error loading pricing templates");
      console.error("Error loading pricing templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template: PricingTemplate) => {
    setSelectedTemplate(template);

    // Initialize variable values with defaults
    const defaultValues: Record<string, string> = {};
    template.preview_variables.forEach((variable) => {
      defaultValues[variable.variable_id] = variable.default_value || "";
    });
    setVariableValues(defaultValues);

    setShowVariables(true);
  };

  const updateVariableValue = (variableId: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [variableId]: value,
    }));
  };

  const applyTemplate = async () => {
    if (!apiClient || !selectedTemplate) return;

    try {
      setApplying(true);
      const response = await apiClient.applyPricingTemplate(productId, {
        template_id: selectedTemplate.id,
        variable_values: variableValues,
      });

      if (response.success && response.data) {
        onTemplateApplied?.(response.data.variables);
        handleClose();
      } else {
        setError(response.error || "Failed to apply pricing template");
      }
    } catch (error) {
      setError("Error applying pricing template");
      console.error("Error applying pricing template:", error);
    } finally {
      setApplying(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setShowVariables(false);
    setVariableValues({});
    setError(null);
    onClose();
  };

  const goBack = () => {
    setShowVariables(false);
    setSelectedTemplate(null);
    setVariableValues({});
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case "simple":
        return "success";
      case "moderate":
        return "warning";
      case "advanced":
        return "error";
      default:
        return "outline";
    }
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
    const value = variableValues[variable.variable_id] || "";

    if (variable.value_type === "boolean") {
      return (
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) =>
              updateVariableValue(
                variable.variable_id,
                (e.target as HTMLInputElement).checked.toString(),
              )}
            class="checkbox"
          />
          <span>{variable.name}</span>
        </label>
      );
    }

    return (
      <div>
        <label class="label">
          <span class="label-text">
            {variable.name}
            {variable.required && <span class="text-red-500 ml-1">*</span>}
          </span>
        </label>
        <Input
          type={getVariableInputType(variable)}
          value={value}
          onChange={(e) =>
            updateVariableValue(
              variable.variable_id,
              (e.target as HTMLInputElement).value,
            )}
          placeholder={variable.default_value || `Enter ${variable.name.toLowerCase()}`}
          required={variable.required}
          min={variable.validation_rules?.min}
          max={variable.validation_rules?.max}
          step={variable.validation_rules?.step}
        />
        {variable.description && (
          <div class="label">
            <span class="label-text-alt text-gray-500">{variable.description}</span>
          </div>
        )}
      </div>
    );
  };

  const categoryTabs = [
    { id: "all", label: "All Templates", count: templates.length },
    ...categories.map((cat) => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: templates.filter((t) => t.category === cat).length,
    })),
  ];

  const filteredTemplates = activeCategory === "all"
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={showVariables ? `Configure ${selectedTemplate?.name}` : "Choose Pricing Template"}
    >
      {error && (
        <Alert variant="error" onClose={() => setError(null)} class="mb-4">
          {error}
        </Alert>
      )}

      {!showVariables
        ? (
          // Template Selection View
          <div class="space-y-6">
            <div>
              <p class="text-gray-600 mb-4">
                Choose a pricing template that matches your business type. Each template comes with
                pre-configured variables to make setup quick and easy.
              </p>

              {/* Category Tabs */}
              {categories.length > 0 && (
                <Tabs
                  tabs={categoryTabs}
                  activeTab={activeCategory}
                  onChange={setActiveCategory}
                />
              )}
            </div>

            {loading
              ? (
                <div class="flex justify-center py-8">
                  <div class="loading loading-spinner loading-lg"></div>
                </div>
              )
              : filteredTemplates.length === 0
              ? (
                <EmptyState
                  title="No templates available"
                  description="No pricing templates found for the selected category"
                />
              )
              : (
                <div class="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      class="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary/20"
                      onClick={() => selectTemplate(template)}
                    >
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <div class="flex items-center gap-3 mb-2">
                            <h3 class="font-semibold">{template.name}</h3>
                            <Badge variant="outline" size="sm">
                              {template.category}
                            </Badge>
                            <Badge
                              variant={getComplexityColor(template.complexity_level)}
                              size="sm"
                            >
                              {template.complexity_level}
                            </Badge>
                          </div>
                          <p class="text-gray-600 text-sm mb-3">{template.description}</p>

                          <div class="flex items-center gap-4 text-xs text-gray-500">
                            <span>{template.preview_variables.length} variables</span>
                            <span>~{template.estimated_setup_time} min setup</span>
                          </div>

                          {/* Preview Variables */}
                          {template.preview_variables.length > 0 && (
                            <div class="mt-3">
                              <div class="text-xs text-gray-500 mb-1">
                                Variables you'll configure:
                              </div>
                              <div class="flex flex-wrap gap-1">
                                {template.preview_variables.slice(0, 4).map((variable) => (
                                  <Badge key={variable.variable_id} variant="ghost" size="sm">
                                    {variable.name}
                                  </Badge>
                                ))}
                                {template.preview_variables.length > 4 && (
                                  <Badge variant="ghost" size="sm">
                                    +{template.preview_variables.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectTemplate(template);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
          </div>
        )
        : (
          // Variable Configuration View
          <div class="space-y-6">
            <div class="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={goBack}>
                ← Back to Templates
              </Button>
            </div>

            <div>
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold">{selectedTemplate!.name}</h3>
                <Badge variant="outline" size="sm">
                  {selectedTemplate!.category}
                </Badge>
              </div>
              <p class="text-gray-600 text-sm mb-4">{selectedTemplate!.description}</p>
            </div>

            {selectedTemplate!.preview_variables.length === 0
              ? (
                <div class="text-center py-8">
                  <p class="text-gray-500">This template doesn't require any configuration.</p>
                </div>
              )
              : (
                <div class="space-y-4 max-h-96 overflow-y-auto">
                  {selectedTemplate!.preview_variables
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((variable) => (
                      <div key={variable.variable_id}>
                        {renderVariableInput(variable)}
                      </div>
                    ))}
                </div>
              )}

            <div class="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={goBack}>
                Back
              </Button>
              <LoadingButton
                variant="primary"
                onClick={applyTemplate}
                loading={applying}
                disabled={selectedTemplate!.preview_variables.some((v) =>
                  v.required && !variableValues[v.variable_id]?.trim()
                )}
              >
                Apply Template
              </LoadingButton>
            </div>
          </div>
        )}

      {!showVariables && (
        <div class="flex justify-end mt-6">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      )}
    </Modal>
  );
}
