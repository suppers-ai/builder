import { useState } from "preact/hooks";
import { Button } from "@suppers/ui-lib";
import { showSuccess, showError } from "../lib/toast-manager.ts";

interface PricingTemplate {
  id: string;
  name: string;
  description: string;
  formula: string;
  variables: Variable[];
  created_at?: string;
  updated_at?: string;
}

interface Variable {
  name: string;
  type: "number" | "percentage" | "boolean" | "string";
  label: string;
  description?: string;
  default_value?: any;
  required: boolean;
}

export default function PricingTemplateManager() {
  const [templates, setTemplates] = useState<PricingTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PricingTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state for new template
  const [newTemplate, setNewTemplate] = useState<Partial<PricingTemplate>>({
    name: "",
    description: "",
    formula: "",
    variables: []
  });

  const [newVariable, setNewVariable] = useState<Partial<Variable>>({
    name: "",
    type: "number",
    label: "",
    description: "",
    required: true
  });

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.formula) {
      showError("Name and formula are required");
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      const createdTemplate: PricingTemplate = {
        id: crypto.randomUUID(),
        name: newTemplate.name!,
        description: newTemplate.description || "",
        formula: newTemplate.formula!,
        variables: newTemplate.variables || [],
        created_at: new Date().toISOString()
      };

      setTemplates([...templates, createdTemplate]);
      setNewTemplate({ name: "", description: "", formula: "", variables: [] });
      setIsCreating(false);
      showSuccess("Template created successfully");
    } catch (error) {
      showError("Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariable = () => {
    if (!newVariable.name || !newVariable.label) {
      showError("Variable name and label are required");
      return;
    }

    const variable: Variable = {
      name: newVariable.name!,
      type: newVariable.type!,
      label: newVariable.label!,
      description: newVariable.description,
      required: newVariable.required !== false
    };

    setNewTemplate({
      ...newTemplate,
      variables: [...(newTemplate.variables || []), variable]
    });

    setNewVariable({
      name: "",
      type: "number",
      label: "",
      description: "",
      required: true
    });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      setTemplates(templates.filter(t => t.id !== id));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
      showSuccess("Template deleted successfully");
    } catch (error) {
      showError("Failed to delete template");
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateList = () => (
    <div class="space-y-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Pricing Templates</h2>
        <Button
          onClick={() => setIsCreating(true)}
          variant="primary"
        >
          Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div class="card bg-base-200">
          <div class="card-body text-center">
            <p class="text-base-content/60">No pricing templates yet</p>
            <p class="text-sm text-base-content/40">
              Create templates that users can select when configuring product pricing
            </p>
          </div>
        </div>
      ) : (
        <div class="grid gap-4">
          {templates.map((template) => (
            <div key={template.id} class="card bg-base-100 shadow-sm border border-base-300">
              <div class="card-body">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg">{template.name}</h3>
                    <p class="text-sm text-base-content/60 mt-1">
                      {template.description}
                    </p>
                    <div class="mt-3">
                      <span class="text-xs text-base-content/40">Formula: </span>
                      <code class="text-xs bg-base-200 px-2 py-1 rounded">
                        {template.formula}
                      </code>
                    </div>
                    {template.variables.length > 0 && (
                      <div class="mt-2">
                        <span class="text-xs text-base-content/40">
                          Variables: {template.variables.length}
                        </span>
                      </div>
                    )}
                  </div>
                  <div class="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTemplate(template.id)}
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
    </div>
  );

  const renderCreateForm = () => (
    <div class="space-y-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Create Pricing Template</h2>
        <Button
          variant="ghost"
          onClick={() => {
            setIsCreating(false);
            setNewTemplate({ name: "", description: "", formula: "", variables: [] });
          }}
        >
          Cancel
        </Button>
      </div>

      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Template Name</span>
            </label>
            <input
              type="text"
              class="input input-bordered"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.currentTarget.value })}
              placeholder="e.g., Standard Pricing"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea
              class="textarea textarea-bordered"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.currentTarget.value })}
              placeholder="Describe when this template should be used"
              rows={3}
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Pricing Formula</span>
            </label>
            <input
              type="text"
              class="input input-bordered font-mono"
              value={newTemplate.formula}
              onChange={(e) => setNewTemplate({ ...newTemplate, formula: e.currentTarget.value })}
              placeholder="e.g., base_price * (1 + tax_rate / 100)"
            />
            <label class="label">
              <span class="label-text-alt">
                Use variable names in your formula. They will be replaced with user values.
              </span>
            </label>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm border border-base-300">
        <div class="card-body">
          <h3 class="font-semibold mb-4">Variables</h3>
          
          {newTemplate.variables && newTemplate.variables.length > 0 && (
            <div class="space-y-2 mb-4">
              {newTemplate.variables.map((variable, index) => (
                <div key={index} class="flex items-center justify-between p-3 bg-base-200 rounded">
                  <div>
                    <span class="font-medium">{variable.label}</span>
                    <span class="text-sm text-base-content/60 ml-2">
                      ({variable.name}: {variable.type})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNewTemplate({
                        ...newTemplate,
                        variables: newTemplate.variables?.filter((_, i) => i !== index)
                      });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div class="divider">Add Variable</div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Variable Name</span>
              </label>
              <input
                type="text"
                class="input input-bordered input-sm"
                value={newVariable.name}
                onChange={(e) => setNewVariable({ ...newVariable, name: e.currentTarget.value })}
                placeholder="e.g., base_price"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Type</span>
              </label>
              <select
                class="select select-bordered select-sm"
                value={newVariable.type}
                onChange={(e) => setNewVariable({ ...newVariable, type: e.currentTarget.value as Variable["type"] })}
              >
                <option value="number">Number</option>
                <option value="percentage">Percentage</option>
                <option value="boolean">Boolean</option>
                <option value="string">String</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Display Label</span>
              </label>
              <input
                type="text"
                class="input input-bordered input-sm"
                value={newVariable.label}
                onChange={(e) => setNewVariable({ ...newVariable, label: e.currentTarget.value })}
                placeholder="e.g., Base Price"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <input
                type="text"
                class="input input-bordered input-sm"
                value={newVariable.description}
                onChange={(e) => setNewVariable({ ...newVariable, description: e.currentTarget.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div class="form-control mt-2">
            <label class="label cursor-pointer justify-start">
              <input
                type="checkbox"
                class="checkbox checkbox-sm mr-2"
                checked={newVariable.required}
                onChange={(e) => setNewVariable({ ...newVariable, required: e.currentTarget.checked })}
              />
              <span class="label-text">Required</span>
            </label>
          </div>

          <Button
            class="mt-4"
            variant="secondary"
            onClick={handleAddVariable}
            disabled={!newVariable.name || !newVariable.label}
          >
            Add Variable
          </Button>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setIsCreating(false);
            setNewTemplate({ name: "", description: "", formula: "", variables: [] });
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateTemplate}
          disabled={loading || !newTemplate.name || !newTemplate.formula}
        >
          {loading ? "Creating..." : "Create Template"}
        </Button>
      </div>
    </div>
  );

  const renderTemplateDetail = () => {
    if (!selectedTemplate) return null;

    return (
      <div class="space-y-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">{selectedTemplate.name}</h2>
          <Button
            variant="ghost"
            onClick={() => setSelectedTemplate(null)}
          >
            Back to List
          </Button>
        </div>

        <div class="card bg-base-100 shadow-sm border border-base-300">
          <div class="card-body">
            <p class="text-base-content/60">{selectedTemplate.description}</p>
            
            <div class="divider"></div>
            
            <div>
              <h3 class="font-semibold mb-2">Formula</h3>
              <code class="block bg-base-200 p-3 rounded font-mono text-sm">
                {selectedTemplate.formula}
              </code>
            </div>

            {selectedTemplate.variables.length > 0 && (
              <>
                <div class="divider"></div>
                <div>
                  <h3 class="font-semibold mb-3">Variables</h3>
                  <div class="space-y-2">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable.name} class="p-3 bg-base-200 rounded">
                        <div class="flex justify-between items-start">
                          <div>
                            <span class="font-medium">{variable.label}</span>
                            <span class="ml-2 text-sm text-base-content/60">
                              ({variable.name})
                            </span>
                          </div>
                          <span class="badge badge-sm">
                            {variable.type}
                          </span>
                        </div>
                        {variable.description && (
                          <p class="text-sm text-base-content/60 mt-1">
                            {variable.description}
                          </p>
                        )}
                        <div class="mt-2 text-xs text-base-content/40">
                          {variable.required ? "Required" : "Optional"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (selectedTemplate) {
    return renderTemplateDetail();
  }

  if (isCreating) {
    return renderCreateForm();
  }

  return renderTemplateList();
}