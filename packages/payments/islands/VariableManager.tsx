import { useState } from "preact/hooks";
import { Button, Input, Modal, Select, Textarea } from "@suppers/ui-lib";

interface Variable {
  id: string;
  name: string;
  type: "number" | "text" | "boolean";
  source: "entity" | "product" | "user";
  description: string;
  default_value?: string;
  validation_rules?: string;
}

interface VariableManagerProps {
  isOpen: boolean;
  onClose: () => void;
  entityId?: string;
  productId?: string;
  userId?: string;
}

export default function VariableManager(
  { isOpen, onClose, entityId, productId, userId }: VariableManagerProps,
) {
  const [variables, setVariables] = useState<Variable[]>([
    {
      id: "1",
      name: "rating",
      type: "number",
      source: "entity",
      description: "Entity rating from 1-5",
      default_value: "5",
      validation_rules: "min:1,max:5",
    },
    {
      id: "2",
      name: "location_tier",
      type: "number",
      source: "entity",
      description: "Location pricing tier",
      default_value: "1",
      validation_rules: "min:1,max:3",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "number" as const,
    source: "entity" as const,
    description: "",
    default_value: "",
    validation_rules: "",
  });

  const getSourceLabel = () => {
    if (entityId) return "Entity Variables";
    if (productId) return "Product Variables";
    if (userId) return "User Variables";
    return "Variables";
  };

  const getAvailableSource = () => {
    if (entityId) return "entity";
    if (productId) return "product";
    if (userId) return "user";
    return "entity";
  };

  const handleCreateVariable = () => {
    setEditingVariable(null);
    setFormData({
      name: "",
      type: "number",
      source: getAvailableSource(),
      description: "",
      default_value: "",
      validation_rules: "",
    });
    setShowForm(true);
  };

  const handleEditVariable = (variable: Variable) => {
    setEditingVariable(variable);
    setFormData({
      name: variable.name,
      type: variable.type,
      source: variable.source,
      description: variable.description,
      default_value: variable.default_value || "",
      validation_rules: variable.validation_rules || "",
    });
    setShowForm(true);
  };

  const handleSaveVariable = () => {
    const newVariable: Variable = {
      id: editingVariable?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      source: formData.source,
      description: formData.description,
      default_value: formData.default_value,
      validation_rules: formData.validation_rules,
    };

    if (editingVariable) {
      setVariables((prev) => prev.map((v) => v.id === editingVariable.id ? newVariable : v));
    } else {
      setVariables((prev) => [...prev, newVariable]);
    }

    setShowForm(false);
    setEditingVariable(null);
  };

  const handleDeleteVariable = (variable: Variable) => {
    if (confirm(`Are you sure you want to delete "${variable.name}"?`)) {
      setVariables((prev) => prev.filter((v) => v.id !== variable.id));
    }
  };

  const getValidationHint = (type: Variable["type"]) => {
    switch (type) {
      case "number":
        return "Examples: min:0, max:100, step:0.1";
      case "text":
        return "Examples: minLength:3, maxLength:50, pattern:^[A-Za-z]+$";
      case "boolean":
        return "No validation rules needed for boolean type";
      default:
        return "";
    }
  };

  const filteredVariables = variables.filter((v) => {
    if (entityId) return v.source === "entity";
    if (productId) return v.source === "product";
    if (userId) return v.source === "user";
    return true;
  });

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={getSourceLabel()}
    >
      <div class="space-y-6">
        {/* Header */}
        <div class="flex justify-between items-center">
          <p class="text-gray-600">
            Manage custom variables for use in pricing formulas and business logic.
          </p>
          <Button
            variant="primary"
            onClick={handleCreateVariable}
          >
            Add Variable
          </Button>
        </div>

        {/* Variables List */}
        {filteredVariables.length === 0
          ? (
            <div class="text-center py-8">
              <p class="text-gray-500">No variables defined yet.</p>
              <p class="text-sm text-gray-400 mt-1">
                Create variables to use in your pricing formulas.
              </p>
            </div>
          )
          : (
            <div class="space-y-3">
              {filteredVariables.map((variable) => (
                <div key={variable.id} class="card bg-base-100 border">
                  <div class="card-body p-4">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <h4 class="font-semibold font-mono text-sm">
                            {variable.source}.{variable.name}
                          </h4>
                          <div class="badge badge-outline badge-xs">
                            {variable.type}
                          </div>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">
                          {variable.description}
                        </p>
                        <div class="flex gap-4 mt-2 text-xs text-gray-500">
                          {variable.default_value && <span>Default: {variable.default_value}</span>}
                          {variable.validation_rules && (
                            <span>Rules: {variable.validation_rules}</span>
                          )}
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEditVariable(variable)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() =>
                            handleDeleteVariable(variable)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Variable Form */}
        {showForm && (
          <div class="border-t pt-6 mt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">
                {editingVariable ? "Edit Variable" : "Create Variable"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                ✕
              </Button>
            </div>

            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Variable Name *</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: (e.target as HTMLInputElement).value.toLowerCase().replace(
                        /[^a-z0-9_]/g,
                        "_",
                      ),
                    }))}
                  placeholder="rating, discount_rate, etc."
                  required
                />
                <div class="label">
                  <span class="label-text-alt">
                    Use lowercase letters, numbers, and underscores only
                  </span>
                </div>
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
                      type: (e.target as HTMLSelectElement).value as Variable["type"],
                    }))}
                  required
                >
                  <option value="number">Number</option>
                  <option value="text">Text</option>
                  <option value="boolean">Boolean</option>
                </Select>
              </div>

              <div class="form-control">
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
                  rows={2}
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Default Value</span>
                </label>
                <Input
                  type={formData.type === "number" ? "number" : "text"}
                  value={formData.default_value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      default_value: (e.target as HTMLInputElement).value,
                    }))}
                  placeholder={formData.type === "boolean" ? "true or false" : "Default value"}
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Validation Rules</span>
                </label>
                <Input
                  type="text"
                  value={formData.validation_rules}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validation_rules: (e.target as HTMLInputElement).value,
                    }))}
                  placeholder="min:0, max:100, required"
                />
                <div class="label">
                  <span class="label-text-alt">{getValidationHint(formData.type)}</span>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveVariable}
                  disabled={!formData.name.trim() || !formData.description.trim()}
                >
                  {editingVariable ? "Update Variable" : "Create Variable"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div class="flex justify-end mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}
