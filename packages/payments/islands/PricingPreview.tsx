import { useEffect, useState } from "preact/hooks";
import { Badge, Button, Card, DateInput, NumberInput } from "@suppers/ui-lib";
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

interface PricingContext {
  variables: Record<string, string | number | boolean>;
  quantity?: number;
  participants?: number;
  bookingDate?: Date;
  eventDate?: Date;
  metadata?: Record<string, any>;
}

interface PricingResult {
  baseAmount: number;
  adjustments: Array<{
    formula_name: string;
    name: string;
    amount: number;
    description: string;
  }>;
  totalAmount: number;
  breakdown: string[];
}

interface FormulaElement {
  type: string;
  value?: any;
  left?: FormulaElement;
  right?: FormulaElement;
}

interface ConditionElement {
  type: string;
  operator?: string;
  value?: any;
  left?: ConditionElement;
  right?: ConditionElement;
  start?: string;
  end?: string;
  variable_id?: string;
}

interface PricingFormula {
  formula_name: string;
  name: string;
  description: string;
  value_calculation: FormulaElement[];
  apply_condition?: ConditionElement[];
}

// Simple pricing engine class for this component
class SimplePricingEngine {
  static calculatePrice(formulas: PricingFormula[], context: PricingContext): PricingResult {
    return {
      baseAmount: 0,
      adjustments: [],
      totalAmount: 0,
      breakdown: ["Preview not available - pricing engine simplified for component isolation"],
    };
  }
}

interface PricingPreviewProps {
  variables: UserVariableInput[];
  productId: string;
  className?: string;
}

export default function PricingPreview(
  { variables, productId, className = "" }: PricingPreviewProps,
) {
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [participants, setParticipants] = useState(1);
  const [eventDate, setEventDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock formulas for demonstration (in real implementation, these would come from the API)
  const mockFormulas: PricingFormula[] = [
    {
      formula_name: "baseCalculation",
      name: "Base Price",
      description: "Standard base price",
      value_calculation: [{ type: "variable", value: "basePrice" }],
    },
    {
      formula_name: "weekendSurcharge",
      name: "Weekend Premium",
      description: "Additional charge for weekends",
      value_calculation: [
        {
          type: "multiply",
          left: { type: "variable", value: "basePrice" },
          right: {
            type: "divide",
            left: { type: "variable", value: "weekendSurcharge" },
            right: { type: "literal", value: 100 },
          },
        },
      ],
      apply_condition: [
        {
          type: "weekday",
          operator: "in",
          value: ["saturday", "sunday"],
        },
      ],
    },
    {
      formula_name: "groupDiscount",
      name: "Group Discount",
      description: "Discount for large groups",
      value_calculation: [
        {
          type: "multiply",
          left: { type: "variable", value: "basePrice" },
          right: {
            type: "subtract",
            left: { type: "literal", value: 0 },
            right: {
              type: "divide",
              left: { type: "variable", value: "groupDiscount" },
              right: { type: "literal", value: 100 },
            },
          },
        },
      ],
      apply_condition: [
        {
          type: "participants",
          operator: "greater_than_equal",
          value: 5,
        },
      ],
    },
  ];

  // Recalculate pricing whenever variables or context changes
  useEffect(() => {
    calculatePricing();
  }, [variables, quantity, participants, eventDate]);

  const calculatePricing = () => {
    try {
      setLoading(true);
      setError(null);

      // Build variables context from user inputs
      const variablesContext: Record<string, string | number | boolean> = {};
      variables.forEach((variable) => {
        const value = variable.current_value || variable.default_value || "";

        switch (variable.value_type) {
          case "number":
          case "percentage":
            variablesContext[variable.variable_id] = Number(value) || 0;
            break;
          case "boolean":
            variablesContext[variable.variable_id] = value === "true";
            break;
          default:
            variablesContext[variable.variable_id] = value;
        }
      });

      // Build pricing context
      const context: PricingContext = {
        variables: variablesContext,
        quantity,
        participants,
        bookingDate: new Date(),
        eventDate: eventDate ? new Date(eventDate) : undefined,
      };

      // Calculate pricing using the engine
      const result = SimplePricingEngine.calculatePrice(mockFormulas, context);
      setPricingResult(result);
    } catch (error) {
      console.error("Error calculating pricing:", error);
      setError("Error calculating pricing");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getAdjustmentColor = (amount: number) => {
    if (amount > 0) return "text-red-600"; // Surcharge
    if (amount < 0) return "text-green-600"; // Discount
    return "text-gray-600"; // No change
  };

  if (variables.length === 0) {
    return (
      <Card class={`p-6 ${className}`}>
        <div class="text-center text-gray-500">
          <p class="text-sm">Configure pricing variables to see preview</p>
        </div>
      </Card>
    );
  }

  return (
    <Card class={`p-6 ${className}`}>
      <div class="space-y-6">
        {/* Header */}
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Pricing Preview</h3>
          {loading && <div class="loading loading-spinner loading-sm"></div>}
        </div>

        {/* Context Controls */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label class="label">
              <span class="label-text font-medium">Quantity</span>
            </label>
            <NumberInput
              value={quantity}
              onChange={(value) => setQuantity(value || 1)}
              min={1}
              max={100}
              placeholder="1"
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text font-medium">Participants</span>
            </label>
            <NumberInput
              value={participants}
              onChange={(value) => setParticipants(value || 1)}
              min={1}
              max={1000}
              placeholder="1"
            />
          </div>

          <div>
            <label class="label">
              <span class="label-text font-medium">Event Date</span>
            </label>
            <DateInput
              value={eventDate}
              onChange={(value) => setEventDate(value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div class="alert alert-error">
            <span class="text-sm">{error}</span>
          </div>
        )}

        {/* Pricing Breakdown */}
        {pricingResult && (
          <div class="space-y-4">
            {/* Base Price */}
            <div class="flex justify-between items-center py-2 border-b">
              <span class="font-medium">Base Price</span>
              <span class="text-lg font-semibold">{formatCurrency(pricingResult.baseAmount)}</span>
            </div>

            {/* Adjustments */}
            {pricingResult.adjustments.length > 0 && (
              <div class="space-y-2">
                <h4 class="font-medium text-gray-700">Adjustments</h4>
                {pricingResult.adjustments.map((adjustment, index) => (
                  <div key={index} class="flex justify-between items-center py-1 pl-4">
                    <div class="flex items-center gap-2">
                      <span class="text-sm">{adjustment.name}</span>
                      <Badge
                        variant={adjustment.amount >= 0 ? "error" : "success"}
                        size="sm"
                      >
                        {adjustment.amount >= 0 ? "Surcharge" : "Discount"}
                      </Badge>
                    </div>
                    <span class={`text-sm font-medium ${getAdjustmentColor(adjustment.amount)}`}>
                      {adjustment.amount >= 0 ? "+" : ""}
                      {formatCurrency(adjustment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div class="flex justify-between items-center py-3 border-t-2 border-gray-200">
              <span class="text-xl font-bold">Total Price</span>
              <span class="text-2xl font-bold text-primary">
                {formatCurrency(pricingResult.totalAmount)}
              </span>
            </div>

            {/* Per Unit Breakdown */}
            {quantity > 1 && (
              <div class="text-center text-sm text-gray-600 p-2 bg-gray-50 rounded">
                {formatCurrency(pricingResult.totalAmount / quantity)} per unit × {quantity} units
              </div>
            )}

            {/* Breakdown Summary */}
            <div class="text-xs text-gray-500 p-3 bg-gray-50 rounded">
              <div class="font-medium mb-1">Calculation Summary:</div>
              {pricingResult.breakdown.map((line, index) => <div key={index}>{line}</div>)}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div class="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={calculatePricing}
            disabled={loading}
          >
            Recalculate Pricing
          </Button>
        </div>
      </div>
    </Card>
  );
}
