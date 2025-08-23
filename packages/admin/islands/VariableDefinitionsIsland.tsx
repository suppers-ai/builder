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
  NumberInput,
  Select,
  Tabs,
  Textarea,
} from "@suppers/ui-lib";
import { OAuthAuthClient } from "@suppers/auth-client";
import { AdminPricingApiClient } from "../lib/api-client/pricing/pricing-api.ts";
import {
  CreateVariableDefinitionRequest,
  GlobalVariableDefinition,
  UpdateVariableDefinitionRequest,
  VariableCategory,
  VariableValueType,
} from "@suppers/shared";
import { getAuthClient } from "../lib/auth.ts";

interface VariableDefinitionsIslandProps {
  baseUrl: string;
}

export default function VariableDefinitionsIsland({ baseUrl }: VariableDefinitionsIslandProps) {
  const [apiClient, setApiClient] = useState<AdminPricingApiClient | null>(null);
  const [variables, setVariables] = useState<GlobalVariableDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVariable, setEditingVariable] = useState<GlobalVariableDefinition | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Form states
  const [formData, setFormData] = useState<CreateVariableDefinitionRequest>({
    variable_id: "",
    name: "",
    description: "",
    category: "pricing",
    value_type: "number",
    default_value: "",
    validation_rules: {},
    display_order: 0,
  });

  // Initialize API client
  useEffect(() => {
    const authClient = getAuthClient();
    const client = new AdminPricingApiClient(authClient, baseUrl);
    setApiClient(client);
  }, [baseUrl]);

  // Load data
  useEffect(() => {
    if (apiClient) {
      loadVariableDefinitions();
    }
  }, [apiClient, activeCategory]);

  const loadVariableDefinitions = async () => {
    if (!apiClient) return;

    try {
      setLoading(true);
      const params = activeCategory === "all" ? {} : { category: activeCategory };
      const response = await apiClient.getVariableDefinitions(params);

      console.log("Variable definitions response:", response);

      if (response.data) {
        // The response.data already contains the VariableDefinitionListResponse structure
        setVariables(response.data.variables || []);
        setError(null);
      } else if (response.error) {
        setError(response.error);
        setVariables([]);
      } else {
        setError("Failed to load variable definitions");
        setVariables([]);
      }
    } catch (error) {
      setError("Error loading variable definitions");
      console.error("Error loading variable definitions:", error);
      setVariables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVariable = async () => {
    if (!apiClient) return;

    try {
      // Clean up validation rules
      const cleanedFormData = {
        ...formData,
        validation_rules: cleanValidationRules(formData.validation_rules || {}),
      };

      const response = await apiClient.createVariableDefinition(cleanedFormData);
      if (response.data) {
        setShowCreateModal(false);
        resetForm();
        loadVariableDefinitions();
      } else {
        setError(response.error || "Failed to create variable definition");
      }
    } catch (error) {
      setError("Error creating variable definition");
      console.error("Error creating variable definition:", error);
    }
  };

  const handleUpdateVariable = async () => {
    if (!apiClient || !editingVariable) return;

    try {
      const updateData: UpdateVariableDefinitionRequest = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        value_type: formData.value_type,
        default_value: formData.default_value,
        validation_rules: cleanValidationRules(formData.validation_rules || {}),
        display_order: formData.display_order,
      };

      const response = await apiClient.updateVariableDefinition(editingVariable.id, updateData);
      if (response.data) {
        setShowEditModal(false);
        setEditingVariable(null);
        resetForm();
        loadVariableDefinitions();
      } else {
        setError(response.error || "Failed to update variable definition");
      }
    } catch (error) {
      setError("Error updating variable definition");
      console.error("Error updating variable definition:", error);
    }
  };

  const handleDeleteVariable = async (variable: GlobalVariableDefinition) => {
    if (!apiClient) return;

    if (variable.is_system) {
      setError("Cannot delete system variables");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${variable.name}"?`)) {
      return;
    }

    try {
      const response = await apiClient.deleteVariableDefinition(variable.id);
      if (response.data) {
        loadVariableDefinitions();
      } else {
        setError(response.error || "Failed to delete variable definition");
      }
    } catch (error) {
      setError("Error deleting variable definition");
      console.error("Error deleting variable definition:", error);
    }
  };

  const startEdit = (variable: GlobalVariableDefinition) => {
    setEditingVariable(variable);
    setFormData({
      variable_id: variable.variable_id,
      name: variable.name,
      description: variable.description,
      category: variable.category,
      value_type: variable.value_type,
      default_value: variable.default_value || "",
      validation_rules: variable.validation_rules || {},
      display_order: variable.display_order,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      variable_id: "",
      name: "",
      description: "",
      category: "pricing",
      value_type: "number",
      default_value: "",
      validation_rules: {},
      display_order: 0,
    });
  };

  const cleanValidationRules = (rules: any) => {
    const cleaned: any = {};
    if (rules.required !== undefined) cleaned.required = rules.required;
    if (rules.min !== undefined && rules.min !== "") cleaned.min = Number(rules.min);
    if (rules.max !== undefined && rules.max !== "") cleaned.max = Number(rules.max);
    if (rules.step !== undefined && rules.step !== "") cleaned.step = Number(rules.step);
    if (rules.pattern !== undefined && rules.pattern !== "") cleaned.pattern = rules.pattern;
    return cleaned;
  };

  const updateValidationRule = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      validation_rules: {
        ...prev.validation_rules,
        [key]: value,
      },
    }));
  };

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "pricing", label: "Pricing" },
    { id: "capacity", label: "Capacity" },
    { id: "features", label: "Features" },
    { id: "time", label: "Time" },
    { id: "restrictions", label: "Restrictions" },
  ];

  const valueTypes: { value: VariableValueType; label: string }[] = [
    { value: "number", label: "Number" },
    { value: "percentage", label: "Percentage" },
    { value: "boolean", label: "Boolean" },
    { value: "string", label: "String" },
    { value: "time", label: "Time" },
    { value: "date", label: "Date" },
  ];

  const getVariablesByCategory = () => {
    if (activeCategory === "all") return { "All": variables };

    return {
      [activeCategory]: variables.filter((v) => v.category === activeCategory),
    };
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
          <h1 class="text-2xl font-bold">Variable Definitions</h1>
          <p class="text-gray-600">Manage global variable definitions for pricing products</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create Variable
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Category Filter */}
      <Tabs
        tabs={categories.map((cat) => ({
          id: cat.id,
          label: cat.label,
          count: cat.id === "all"
            ? variables.length
            : variables.filter((v) => v.category === cat.id).length,
        }))}
        activeTab={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Variables List */}
      {variables.length === 0
        ? (
          <EmptyState
            title="No variable definitions"
            description="Create your first variable definition to get started"
            action={{
              label: "Create Variable",
              onClick: () => setShowCreateModal(true),
            }}
          />
        )
        : (
          <div class="grid gap-4">
            {Object.entries(getVariablesByCategory()).map(([categoryName, categoryVariables]) =>
              categoryVariables.map((variable) => (
                <Card key={variable.id} class="p-6">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-semibold">{variable.name}</h3>
                        <Badge variant="outline" size="sm">
                          {variable.variable_id}
                        </Badge>
                        <Badge
                          variant={variable.category === "pricing" ? "primary" : "outline"}
                          size="sm"
                        >
                          {variable.category}
                        </Badge>
                        <Badge variant="ghost" size="sm">
                          {variable.value_type}
                        </Badge>
                        {variable.is_system && (
                          <Badge variant="warning" size="sm">
                            System
                          </Badge>
                        )}
                      </div>
                      <p class="text-gray-600 mb-3">{variable.description}</p>

                      <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                        {variable.default_value && <span>Default: {variable.default_value}</span>}
                        {variable.validation_rules?.required && (
                          <span class="text-orange-600">Required</span>
                        )}
                        {variable.validation_rules?.min !== undefined && (
                          <span>Min: {variable.validation_rules.min}</span>
                        )}
                        {variable.validation_rules?.max !== undefined && (
                          <span>Max: {variable.validation_rules.max}</span>
                        )}
                        {variable.validation_rules?.pattern && (
                          <span>Pattern: {variable.validation_rules.pattern}</span>
                        )}
                        <span>Order: {variable.display_order}</span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(variable)}
                        disabled={variable.is_system}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => handleDeleteVariable(variable)}
                        disabled={variable.is_system}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Variable Definition"
      >
        <div class="space-y-4">
          <div>
            <label class="label">
              <span class="label-text">Variable ID *</span>
            </label>
            <Input
              type="text"
              value={formData.variable_id}
              onChange={(e) => {
                const value = (e.target as HTMLInputElement).value
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "");
                setFormData((prev) => ({ ...prev, variable_id: value }));
              }}
              placeholder="e.g., basePrice, weekendSurcharge"
              required
            />
            <div class="label">
              <span class="label-text-alt">Use camelCase, letters and numbers only</span>
            </div>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Display Name *</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: (e.target as HTMLInputElement).value,
                }))}
              placeholder="e.g., Base Price, Weekend Surcharge"
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
              placeholder="Describe what this variable represents"
              rows={3}
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text">Category *</span>
              </label>
              <Select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: (e.target as HTMLSelectElement).value as VariableCategory,
                  }))}
                required
              >
                <option value="pricing">Pricing</option>
                <option value="capacity">Capacity</option>
                <option value="features">Features</option>
                <option value="time">Time</option>
                <option value="restrictions">Restrictions</option>
              </Select>
            </div>

            <div>
              <label class="label">
                <span class="label-text">Value Type *</span>
              </label>
              <Select
                value={formData.value_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    value_type: (e.target as HTMLSelectElement).value as VariableValueType,
                  }))}
                required
              >
                {valueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text">Default Value</span>
              </label>
              <Input
                type={formData.value_type === "number" || formData.value_type === "percentage"
                  ? "number"
                  : formData.value_type === "time"
                  ? "time"
                  : formData.value_type === "date"
                  ? "date"
                  : "text"}
                value={formData.default_value}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    default_value: (e.target as HTMLInputElement).value,
                  }))}
                placeholder="Default value"
              />
            </div>

            <div>
              <label class="label">
                <span class="label-text">Display Order</span>
              </label>
              <NumberInput
                value={formData.display_order}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_order: value || 0,
                  }))}
                min={0}
                placeholder="0"
              />
            </div>
          </div>

          {/* Validation Rules */}
          <div>
            <label class="label">
              <span class="label-text">Validation Rules</span>
            </label>
            <div class="space-y-3 border rounded-lg p-4">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.validation_rules?.required || false}
                  onChange={(e) =>
                    updateValidationRule("required", (e.target as HTMLInputElement).checked)}
                  class="checkbox checkbox-sm"
                />
                <span class="text-sm">Required</span>
              </label>

              {(formData.value_type === "number" || formData.value_type === "percentage") && (
                <>
                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <label class="text-xs text-gray-600">Min Value</label>
                      <Input
                        type="number"
                        value={formData.validation_rules?.min || ""}
                        onChange={(e) =>
                          updateValidationRule("min", (e.target as HTMLInputElement).value)}
                        placeholder="Min"
                        size="sm"
                      />
                    </div>
                    <div>
                      <label class="text-xs text-gray-600">Max Value</label>
                      <Input
                        type="number"
                        value={formData.validation_rules?.max || ""}
                        onChange={(e) =>
                          updateValidationRule("max", (e.target as HTMLInputElement).value)}
                        placeholder="Max"
                        size="sm"
                      />
                    </div>
                    <div>
                      <label class="text-xs text-gray-600">Step</label>
                      <Input
                        type="number"
                        value={formData.validation_rules?.step || ""}
                        onChange={(e) =>
                          updateValidationRule("step", (e.target as HTMLInputElement).value)}
                        placeholder="Step"
                        size="sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.value_type === "string" && (
                <div>
                  <label class="text-xs text-gray-600">Pattern (RegEx)</label>
                  <Input
                    type="text"
                    value={formData.validation_rules?.pattern || ""}
                    onChange={(e) =>
                      updateValidationRule("pattern", (e.target as HTMLInputElement).value)}
                    placeholder="^[A-Za-z0-9]+$"
                    size="sm"
                  />
                </div>
              )}
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
            onClick={handleCreateVariable}
            disabled={!formData.variable_id.trim() || !formData.name.trim() ||
              !formData.description.trim()}
          >
            Create Variable
          </LoadingButton>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingVariable(null);
          resetForm();
        }}
        title="Edit Variable Definition"
      >
        <div class="space-y-4">
          <div>
            <label class="label">
              <span class="label-text">Variable ID</span>
            </label>
            <Input
              type="text"
              value={formData.variable_id}
              disabled
              class="bg-gray-100"
            />
            <div class="label">
              <span class="label-text-alt">Variable ID cannot be changed</span>
            </div>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Display Name *</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: (e.target as HTMLInputElement).value,
                }))}
              placeholder="e.g., Base Price, Weekend Surcharge"
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
              placeholder="Describe what this variable represents"
              rows={3}
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text">Category *</span>
              </label>
              <Select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: (e.target as HTMLSelectElement).value as VariableCategory,
                  }))}
                required
              >
                <option value="pricing">Pricing</option>
                <option value="capacity">Capacity</option>
                <option value="features">Features</option>
                <option value="time">Time</option>
                <option value="restrictions">Restrictions</option>
              </Select>
            </div>

            <div>
              <label class="label">
                <span class="label-text">Value Type *</span>
              </label>
              <Select
                value={formData.value_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    value_type: (e.target as HTMLSelectElement).value as VariableValueType,
                  }))}
                required
              >
                {valueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text">Default Value</span>
              </label>
              <Input
                type={formData.value_type === "number" || formData.value_type === "percentage"
                  ? "number"
                  : formData.value_type === "time"
                  ? "time"
                  : formData.value_type === "date"
                  ? "date"
                  : "text"}
                value={formData.default_value}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    default_value: (e.target as HTMLInputElement).value,
                  }))}
                placeholder="Default value"
              />
            </div>

            <div>
              <label class="label">
                <span class="label-text">Display Order</span>
              </label>
              <NumberInput
                value={formData.display_order}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_order: value || 0,
                  }))}
                min={0}
                placeholder="0"
              />
            </div>
          </div>

          {/* Validation Rules */}
          <div>
            <label class="label">
              <span class="label-text">Validation Rules</span>
            </label>
            <div class="space-y-3 border rounded-lg p-4">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.validation_rules?.required || false}
                  onChange={(e) =>
                    updateValidationRule("required", (e.target as HTMLInputElement).checked)}
                  class="checkbox checkbox-sm"
                />
                <span class="text-sm">Required</span>
              </label>

              {(formData.value_type === "number" || formData.value_type === "percentage") && (
                <>
                  <div class="grid grid-cols-3 gap-2">
                    <div>
                      <label class="text-xs text-gray-600">Min Value</label>
                      <Input
                        type="number"
                        value={formData.validation_rules?.min || ""}
                        onChange={(e) =>
                          updateValidationRule("min", (e.target as HTMLInputElement).value)}
                        placeholder="Min"
                        size="sm"
                      />
                    </div>
                    <div>
                      <label class="text-xs text-gray-600">Max Value</label>
                      <Input
                        type="number"
                        value={formData.validation_rules?.max || ""}
                        onChange={(e) =>
                          updateValidationRule("max", (e.target as HTMLInputElement).value)}
                        placeholder="Max"
                        size="sm"
                      />
                    </div>
                    <div>
                      <label class="text-xs text-gray-600">Step</label>
                      <Input
                        type="number"
                        value={formData.validation_rules?.step || ""}
                        onChange={(e) =>
                          updateValidationRule("step", (e.target as HTMLInputElement).value)}
                        placeholder="Step"
                        size="sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.value_type === "string" && (
                <div>
                  <label class="text-xs text-gray-600">Pattern (RegEx)</label>
                  <Input
                    type="text"
                    value={formData.validation_rules?.pattern || ""}
                    onChange={(e) =>
                      updateValidationRule("pattern", (e.target as HTMLInputElement).value)}
                    placeholder="^[A-Za-z0-9]+$"
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowEditModal(false);
              setEditingVariable(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="primary"
            onClick={handleUpdateVariable}
            disabled={!formData.name.trim() || !formData.description.trim()}
          >
            Update Variable
          </LoadingButton>
        </div>
      </Modal>
    </div>
  );
}
