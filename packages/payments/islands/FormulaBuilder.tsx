import { useState } from "preact/hooks";
import { Button, Input, Modal, Select } from "@suppers/ui-lib";

interface FormulaBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formula: string) => void;
  initialFormula?: string;
}

interface Variable {
  name: string;
  description: string;
  type: "number" | "text" | "boolean";
  source: "entity" | "product" | "user" | "system";
  example?: string;
}

const AVAILABLE_VARIABLES: Variable[] = [
  {
    name: "base_price",
    description: "Base price of the product",
    type: "number",
    source: "product",
    example: "19.99",
  },
  {
    name: "quantity",
    description: "Quantity being purchased",
    type: "number",
    source: "system",
    example: "3",
  },
  {
    name: "entity.rating",
    description: "Entity rating score",
    type: "number",
    source: "entity",
    example: "4.5",
  },
  {
    name: "entity.location_tier",
    description: "Location pricing tier",
    type: "number",
    source: "entity",
    example: "2",
  },
  {
    name: "user.loyalty_level",
    description: "User loyalty level",
    type: "number",
    source: "user",
    example: "3",
  },
  {
    name: "user.discount_rate",
    description: "User discount percentage",
    type: "number",
    source: "user",
    example: "0.1",
  },
  {
    name: "product.cost",
    description: "Product cost",
    type: "number",
    source: "product",
    example: "12.50",
  },
  {
    name: "product.markup",
    description: "Product markup multiplier",
    type: "number",
    source: "product",
    example: "1.5",
  },
];

const FORMULA_TEMPLATES = [
  {
    name: "Simple Markup",
    formula: "base_price * product.markup",
    description: "Base price multiplied by markup factor",
  },
  {
    name: "Quantity Discount",
    formula: "base_price * quantity * (quantity > 5 ? 0.9 : 1)",
    description: "10% discount for quantities over 5",
  },
  {
    name: "Loyalty Pricing",
    formula: "base_price * (1 - (user.loyalty_level * 0.05))",
    description: "5% discount per loyalty level",
  },
  {
    name: "Location-Based",
    formula: "base_price * (1 + (entity.location_tier * 0.1))",
    description: "10% premium per location tier",
  },
  {
    name: "Dynamic Pricing",
    formula: "base_price * (entity.rating / 5) * (1 + product.markup)",
    description: "Price based on entity rating and product markup",
  },
];

export default function FormulaBuilder(
  { isOpen, onClose, onSave, initialFormula = "" }: FormulaBuilderProps,
) {
  const [formula, setFormula] = useState(initialFormula);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [testValues, setTestValues] = useState<Record<string, number>>({
    base_price: 20,
    quantity: 2,
    "entity.rating": 4.2,
    "entity.location_tier": 1,
    "user.loyalty_level": 2,
    "user.discount_rate": 0.1,
    "product.cost": 15,
    "product.markup": 1.3,
  });
  const [calculatedResult, setCalculatedResult] = useState<number | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const insertVariable = (variable: Variable) => {
    setFormula((prev) => prev + variable.name);
  };

  const insertOperator = (operator: string) => {
    setFormula((prev) => prev + operator);
  };

  const useTemplate = (template: typeof FORMULA_TEMPLATES[0]) => {
    setFormula(template.formula);
    setSelectedTemplate(template.name);
  };

  const testFormula = () => {
    try {
      setCalculationError(null);

      // Create a safe evaluation context
      const context = { ...testValues };

      // Simple formula evaluation (in a real app, use a proper expression parser)
      let evaluationFormula = formula;

      // Replace variables with values
      Object.entries(context).forEach(([key, value]) => {
        const regex = new RegExp(key.replace(".", "\\."), "g");
        evaluationFormula = evaluationFormula.replace(regex, value.toString());
      });

      // Basic validation - only allow numbers, operators, and parentheses
      if (!/^[0-9+\-*/().\s?:><&|!]+$/.test(evaluationFormula)) {
        throw new Error("Formula contains invalid characters");
      }

      // Evaluate using Function constructor (safer than eval)
      const result = new Function("return " + evaluationFormula)();

      if (typeof result !== "number" || isNaN(result)) {
        throw new Error("Formula does not evaluate to a valid number");
      }

      setCalculatedResult(result);
    } catch (error) {
      setCalculationError(error instanceof Error ? error.message : "Invalid formula");
      setCalculatedResult(null);
    }
  };

  const handleSave = () => {
    if (formula.trim()) {
      onSave(formula);
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Formula Builder"
    >
      <div class="space-y-6">
        {/* Template Selection */}
        <div class="form-control">
          <label class="label">
            <span class="label-text">Formula Templates</span>
          </label>
          <Select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate((e.target as HTMLSelectElement).value)}
            options={FORMULA_TEMPLATES.map((template) => ({
              value: template.name,
              label: template.name,
            }))}
          >
            <option value="">Select a template...</option>
            {FORMULA_TEMPLATES.map((template) => (
              <option key={template.name} value={template.name}>{template.name}</option>
            ))}
          </Select>
          {selectedTemplate && (
            <div class="mt-2">
              <p class="text-sm text-gray-600">
                {FORMULA_TEMPLATES.find((t) => t.name === selectedTemplate)?.description}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  useTemplate(FORMULA_TEMPLATES.find((t) => t.name === selectedTemplate)!)}
                class="mt-1"
              >
                Use Template
              </Button>
            </div>
          )}
        </div>

        {/* Formula Input */}
        <div class="form-control">
          <label class="label">
            <span class="label-text">Formula *</span>
          </label>
          <textarea
            class="textarea textarea-bordered h-24 font-mono text-sm"
            value={formula}
            onChange={(e) => setFormula((e.target as HTMLTextAreaElement).value)}
            placeholder="Enter your pricing formula (e.g., base_price * quantity)"
          />
          <div class="label">
            <span class="label-text-alt">
              Use variables, numbers, and operators (+, -, *, /, ?, :, &gt;, &lt;, etc.)
            </span>
          </div>
        </div>

        {/* Quick Insert Buttons */}
        <div class="grid grid-cols-2 gap-4">
          {/* Variables */}
          <div>
            <h4 class="font-semibold mb-2">Variables</h4>
            <div class="space-y-1 max-h-40 overflow-y-auto">
              {AVAILABLE_VARIABLES.map((variable) => (
                <button
                  key={variable.name}
                  class="btn btn-outline btn-xs w-full justify-start text-left"
                  onClick={() => insertVariable(variable)}
                  title={variable.description}
                >
                  <span class="font-mono text-xs">{variable.name}</span>
                  <span class="text-xs opacity-60 ml-1">({variable.source})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Operators */}
          <div>
            <h4 class="font-semibold mb-2">Operators</h4>
            <div class="grid grid-cols-4 gap-1">
              {["+", "-", "*", "/", "(", ")", ">", "<", "?", ":", "&&", "||"].map((op) => (
                <button
                  key={op}
                  class="btn btn-outline btn-xs"
                  onClick={() => insertOperator(op)}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test Values */}
        <div class="form-control">
          <label class="label">
            <span class="label-text">Test Values</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            {Object.entries(testValues).map(([key, value]) => (
              <div key={key} class="form-control">
                <label class="label py-1">
                  <span class="label-text-alt font-mono text-xs">{key}</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) =>
                    setTestValues((prev) => ({
                      ...prev,
                      [key]: parseFloat((e.target as HTMLInputElement).value) || 0,
                    }))}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Test Formula */}
        <div class="form-control">
          <Button
            variant="secondary"
            onClick={testFormula}
            disabled={!formula.trim()}
          >
            Test Formula
          </Button>

          {calculatedResult !== null && (
            <div class="alert alert-success mt-2">
              <span>
                Result: <strong>${calculatedResult.toFixed(2)}</strong>
              </span>
            </div>
          )}

          {calculationError && (
            <div class="alert alert-error mt-2">
              <span>Error: {calculationError}</span>
            </div>
          )}
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!formula.trim()}
        >
          Save Formula
        </Button>
      </div>
    </Modal>
  );
}
