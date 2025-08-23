// Pricing Engine - Evaluates JSONB pricing formulas with variable values
// Handles complex pricing calculations for the payments system

export interface PricingContext {
  variables: Record<string, string | number | boolean>;
  quantity?: number;
  participants?: number;
  bookingDate?: Date;
  eventDate?: Date;
  metadata?: Record<string, any>;
}

export interface FormulaElement {
  type: string;
  value?: any;
  left?: FormulaElement;
  right?: FormulaElement;
}

export interface ConditionElement {
  type: string;
  operator?: string;
  value?: any;
  left?: ConditionElement;
  right?: ConditionElement;
  start?: string;
  end?: string;
  variable_id?: string;
}

export interface PricingEngineFormula {
  formula_name: string;
  name: string;
  description: string;
  value_calculation: FormulaElement[];
  apply_condition?: ConditionElement[];
}

export interface PricingResult {
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

export class PricingEngine {
  /**
   * Calculate pricing based on formulas and context
   */
  static calculatePrice(
    formulas: PricingEngineFormula[],
    context: PricingContext,
  ): PricingResult {
    const result: PricingResult = {
      baseAmount: 0,
      adjustments: [],
      totalAmount: 0,
      breakdown: [],
    };

    // Sort formulas to ensure base calculation comes first
    const sortedFormulas = [...formulas].sort((a, b) => {
      if (a.formula_name === "baseCalculation") return -1;
      if (b.formula_name === "baseCalculation") return 1;
      return 0;
    });

    for (const formula of sortedFormulas) {
      // Check if formula conditions are met
      if (formula.apply_condition && !this.evaluateConditions(formula.apply_condition, context)) {
        continue;
      }

      // Calculate formula value
      const amount = this.evaluateFormula(formula.value_calculation, context);

      if (formula.formula_name === "baseCalculation") {
        result.baseAmount = amount;
        result.breakdown.push(`Base: $${amount.toFixed(2)}`);
      } else {
        result.adjustments.push({
          formula_name: formula.formula_name,
          name: formula.name,
          amount,
          description: formula.description,
        });
        result.breakdown.push(`${formula.name}: ${amount >= 0 ? "+" : ""}$${amount.toFixed(2)}`);
      }
    }

    // Calculate total
    result.totalAmount = result.baseAmount +
      result.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
    result.breakdown.push(`Total: $${result.totalAmount.toFixed(2)}`);

    return result;
  }

  /**
   * Evaluate a formula calculation array
   */
  private static evaluateFormula(calculation: FormulaElement[], context: PricingContext): number {
    if (!calculation || calculation.length === 0) return 0;

    // For now, handle simple single-element calculations
    // This can be expanded to handle more complex multi-step calculations
    const element = calculation[0];
    return this.evaluateFormulaElement(element, context);
  }

  /**
   * Evaluate a single formula element
   */
  private static evaluateFormulaElement(element: FormulaElement, context: PricingContext): number {
    switch (element.type) {
      case "literal":
        return Number(element.value) || 0;

      case "variable":
        const variableValue = context.variables[element.value];
        return Number(variableValue) || 0;

      case "add":
        return this.evaluateFormulaElement(element.left!, context) +
          this.evaluateFormulaElement(element.right!, context);

      case "subtract":
        return this.evaluateFormulaElement(element.left!, context) -
          this.evaluateFormulaElement(element.right!, context);

      case "multiply":
        return this.evaluateFormulaElement(element.left!, context) *
          this.evaluateFormulaElement(element.right!, context);

      case "divide":
        const divisor = this.evaluateFormulaElement(element.right!, context);
        if (divisor === 0) return 0;
        return this.evaluateFormulaElement(element.left!, context) / divisor;

      case "percentage":
        // Convert percentage to decimal (20% -> 0.2)
        return this.evaluateFormulaElement(element.left!, context) / 100;

      case "quantity":
        return context.quantity || 1;

      case "participants":
        return context.participants || context.quantity || 1;

      default:
        console.warn(`Unknown formula element type: ${element.type}`);
        return 0;
    }
  }

  /**
   * Evaluate condition array
   */
  private static evaluateConditions(
    conditions: ConditionElement[],
    context: PricingContext,
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    // For now, all conditions must be true (AND logic)
    return conditions.every((condition) => this.evaluateCondition(condition, context));
  }

  /**
   * Evaluate a single condition
   */
  private static evaluateCondition(condition: ConditionElement, context: PricingContext): boolean {
    switch (condition.type) {
      case "weekday":
        const date = context.eventDate || context.bookingDate || new Date();
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
          .substring(0, 3); // 'mon', 'tue', etc.

        if (condition.operator === "in" && Array.isArray(condition.value)) {
          return condition.value.some((day) => dayName.includes(day.toLowerCase().substring(0, 3)));
        }
        return false;

      case "date_range":
        const checkDate = context.eventDate || context.bookingDate || new Date();
        if (!condition.start || !condition.end) return false;
        const startDate = new Date(condition.start);
        const endDate = new Date(condition.end);
        return checkDate >= startDate && checkDate <= endDate;

      case "quantity":
        const qty = context.quantity || 1;
        return this.evaluateNumericCondition(qty, condition.operator!, condition.value);

      case "participants":
        const participants = context.participants || context.quantity || 1;
        return this.evaluateNumericCondition(participants, condition.operator!, condition.value);

      case "guest_count":
        const guests = context.participants || context.quantity || 1;
        return this.evaluateNumericCondition(guests, condition.operator!, condition.value);

      case "days_before_event":
        if (!context.eventDate) return false;
        const now = new Date();
        const diffTime = context.eventDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return this.evaluateNumericCondition(diffDays, condition.operator!, condition.value);

      case "variable":
        const varValue = context.variables[condition.variable_id!];
        if (condition.operator === "equals") {
          return varValue == condition.value;
        }
        if (typeof varValue === "number") {
          return this.evaluateNumericCondition(varValue, condition.operator!, condition.value);
        }
        return false;

      default:
        console.warn(`Unknown condition type: ${condition.type}`);
        return true;
    }
  }

  /**
   * Evaluate numeric conditions (greater_than, less_than, etc.)
   */
  private static evaluateNumericCondition(
    value: number,
    operator: string,
    target: number,
  ): boolean {
    switch (operator) {
      case "greater_than":
        return value > target;
      case "greater_than_equal":
        return value >= target;
      case "less_than":
        return value < target;
      case "less_than_equal":
        return value <= target;
      case "equals":
        return value === target;
      case "not_equals":
        return value !== target;
      default:
        return true;
    }
  }

  /**
   * Validate formula syntax (for admin interface)
   */
  static validateFormula(calculation: FormulaElement[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      for (const element of calculation) {
        this.validateFormulaElement(element, errors);
      }
    } catch (error) {
      errors.push(`Formula validation error: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static validateFormulaElement(element: FormulaElement, errors: string[]) {
    if (!element.type) {
      errors.push("Formula element missing type");
      return;
    }

    switch (element.type) {
      case "literal":
        if (element.value === undefined || isNaN(Number(element.value))) {
          errors.push("Literal element must have a numeric value");
        }
        break;

      case "variable":
        if (!element.value || typeof element.value !== "string") {
          errors.push("Variable element must have a string variable name");
        }
        break;

      case "add":
      case "subtract":
      case "multiply":
      case "divide":
        if (!element.left || !element.right) {
          errors.push(`${element.type} operation requires both left and right operands`);
        } else {
          this.validateFormulaElement(element.left, errors);
          this.validateFormulaElement(element.right, errors);
        }
        break;

      case "percentage":
        if (!element.left) {
          errors.push("Percentage operation requires a left operand");
        } else {
          this.validateFormulaElement(element.left, errors);
        }
        break;
    }
  }

  /**
   * Preview pricing calculation with sample data
   */
  static previewPricing(
    formulas: PricingEngineFormula[],
    sampleVariables: Record<string, string | number | boolean>,
  ): PricingResult {
    const sampleContext: PricingContext = {
      variables: sampleVariables,
      quantity: 2,
      participants: 2,
      bookingDate: new Date(),
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    return this.calculatePrice(formulas, sampleContext);
  }
}
