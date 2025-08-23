import { Currency } from "./price.ts";
import { PricingFormula } from "@suppers/shared";

/**
 * Simplified variable types
 */
export enum VariableType {
  fixed = "fixed", // Fixed amount (can be negative for discounts)
  percentage = "percentage", // Percentage value (can be negative for discounts)
}

/**
 * A simple, dynamic pricing variable
 */
export interface IPricingVariable {
  id: string;
  name: string;
  description?: string;
  type: VariableType;

  // The value - can be negative for discounts
  value: number;
}

/**
 * Sources of variables for pricing calculations
 */
export interface IVariableSources {
  // Variables provided at purchase time (context)
  purchaseVariables?: Record<string, IPricingVariable>;

  // System variables (participants, dayOfWeek, etc.)
  systemVariables?: Record<string, IPricingVariable>;
}

// Helper functions to work with database PricingFormula type
export function createPricingFormula(formulaData: Partial<PricingFormula>): PricingFormula {
  const now = new Date().toISOString();

  return {
    id: formulaData.id || crypto.randomUUID(),
    formula_name: formulaData.formula_name || crypto.randomUUID(),
    name: formulaData.name || "",
    description: formulaData.description || null,
    pricing_product_id: formulaData.pricing_product_id || "",
    value_calculation: formulaData.value_calculation || [],
    apply_condition: formulaData.apply_condition || null,
    created_at: formulaData.created_at || now,
    updated_at: formulaData.updated_at || now,
  };
}

// Helper functions for working with JSON fields
export function getValueCalculation(formula: PricingFormula): (string | number)[] {
  if (!formula.value_calculation) return [];
  return formula.value_calculation as (string | number)[];
}

export function setValueCalculation(
  formula: PricingFormula,
  calculation: (string | number)[],
): PricingFormula {
  return { ...formula, value_calculation: calculation as any };
}

export function getApplyCondition(formula: PricingFormula): (string | number)[] | null {
  if (!formula.apply_condition) return null;
  return formula.apply_condition as (string | number)[];
}

export function setApplyCondition(
  formula: PricingFormula,
  condition: (string | number)[] | null,
): PricingFormula {
  return { ...formula, apply_condition: condition as any };
}

/**
 * Collection of formulas for a product
 */
export interface IFormulaCollection {
  formulas: Record<string, PricingFormula>;
}

/**
 * Context provided at purchase time
 */
export interface IPurchaseContext {
  // Number of participants
  participants?: number;

  // Day of week (0 = Sunday, 6 = Saturday)
  dayOfWeek?: number;

  // Current date/time information
  hour?: number;
  month?: number;

  // Location information
  country?: string;
  state?: string;
  city?: string;

  // Customer information
  loyaltyTier?: string;
  isFirstTime?: boolean;

  // Custom variables provided at purchase
  customVariables?: Record<string, number>;

  // Any other dynamic context
  [key: string]: any;
}

/**
 * Result of formula evaluation
 */
export interface IFormulaResult {
  formulaId: string;
  formulaName: string;
  value: number;
  applied: boolean;
  conditionResult?: boolean;
  calculation: string; // Human readable calculation
  usedVariables: string[];
}

/**
 * Final pricing result
 */
export interface IPricingResult {
  finalPrice: number;
  currency: Currency;
  appliedFormulas: IFormulaResult[];
  allVariables: Record<string, IPricingVariable>;
  calculation: string; // Overall calculation summary
}

/**
 * Common system variables that are always available
 */
export const SYSTEM_VARIABLES: Record<string, Omit<IPricingVariable, "value">> = {
  participants: {
    id: "participants",
    name: "Number of Participants",
    description: "Total number of participants in the purchase",
    type: VariableType.fixed,
  },

  dayOfWeek: {
    id: "dayOfWeek",
    name: "Day of Week",
    description: "Day of the week (0=Sunday, 6=Saturday)",
    type: VariableType.fixed,
  },

  hour: {
    id: "hour",
    name: "Hour of Day",
    description: "Hour of the day (0-23)",
    type: VariableType.fixed,
  },

  month: {
    id: "month",
    name: "Month of Year",
    description: "Month of the year (1-12)",
    type: VariableType.fixed,
  },

  isWeekend: {
    id: "isWeekend",
    name: "Is Weekend",
    description: "Whether the day is Saturday or Sunday (1=true, 0=false)",
    type: VariableType.fixed,
  },

  isFirstTime: {
    id: "isFirstTime",
    name: "Is First Time Customer",
    description: "Whether this is a first-time customer (1=true, 0=false)",
    type: VariableType.fixed,
  },
};

/**
 * Common product variables examples
 */
export const COMMON_PRODUCT_VARIABLES: Record<string, IPricingVariable> = {
  basePrice: {
    id: "basePrice",
    name: "Base Price",
    description: "The base price per participant",
    type: VariableType.fixed,
    value: 100,
  },

  shippingCost: {
    id: "shippingCost",
    name: "Shipping Cost",
    description: "Fixed shipping cost",
    type: VariableType.fixed,
    value: 15,
  },

  taxRate: {
    id: "taxRate",
    name: "Tax Rate",
    description: "Tax rate percentage",
    type: VariableType.percentage,
    value: 8.5,
  },

  weekendSurcharge: {
    id: "weekendSurcharge",
    name: "Weekend Surcharge",
    description: "Additional charge for weekends",
    type: VariableType.fixed,
    value: 25,
  },

  firstTimeDiscount: {
    id: "firstTimeDiscount",
    name: "First Time Discount",
    description: "Discount for first-time customers",
    type: VariableType.percentage,
    value: -15, // Negative for discount
  },

  bulkDiscount: {
    id: "bulkDiscount",
    name: "Bulk Discount",
    description: "Discount per participant for large groups",
    type: VariableType.fixed,
    value: -5, // Negative for discount
  },
};

/**
 * Common formula examples
 */
// Common formula examples using database structure
export function createCommonFormulas(pricingProductId: string): Record<string, PricingFormula> {
  const now = new Date().toISOString();

  return {
    baseCalculation: {
      id: crypto.randomUUID(),
      formula_name: "baseCalculation",
      name: "Base Price Calculation",
      description: "Base price multiplied by number of participants",
      pricing_product_id: pricingProductId,
      value_calculation: ["participants", "*", "basePrice"],
      apply_condition: null,
      created_at: now,
      updated_at: now,
    },

    weekendSurchargeFormula: {
      id: crypto.randomUUID(),
      formula_name: "weekendSurchargeFormula",
      name: "Weekend Surcharge",
      description: "Add weekend surcharge if it's Saturday or Sunday",
      pricing_product_id: pricingProductId,
      value_calculation: ["weekendSurcharge"],
      apply_condition: ["isWeekend", "==", 1],
      created_at: now,
      updated_at: now,
    },

    firstTimeDiscountFormula: {
      id: crypto.randomUUID(),
      formula_name: "firstTimeDiscountFormula",
      name: "First Time Customer Discount",
      description: "Apply percentage discount for first-time customers",
      pricing_product_id: pricingProductId,
      value_calculation: ["basePrice", "*", "participants", "*", "firstTimeDiscount", "/", 100],
      apply_condition: ["isFirstTime", "==", 1],
      created_at: now,
      updated_at: now,
    },
  };
}

/**
 * Utility functions for working with variables
 */
export class VariableUtils {
  /**
   * Merge variables from different sources with proper precedence
   * Purchase variables override product variables override system defaults
   */
  static mergeVariables(
    sources: IVariableSources,
    context: IPurchaseContext,
    productVariables?: Record<string, IPricingVariable>,
  ): Record<string, IPricingVariable> {
    const merged: Record<string, IPricingVariable> = {};

    // Add system variables with context values
    Object.entries(SYSTEM_VARIABLES).forEach(([key, varDef]) => {
      let value = 0;

      switch (key) {
        case "participants":
          value = context.participants || 1;
          break;
        case "dayOfWeek":
          value = context.dayOfWeek ?? new Date().getDay();
          break;
        case "hour":
          value = context.hour ?? new Date().getHours();
          break;
        case "month":
          value = context.month ?? (new Date().getMonth() + 1);
          break;
        case "isWeekend":
          const day = context.dayOfWeek ?? new Date().getDay();
          value = (day === 0 || day === 6) ? 1 : 0;
          break;
        case "isFirstTime":
          value = context.isFirstTime ? 1 : 0;
          break;
        default:
          value = context[key] as number || 0;
      }

      merged[key] = {
        ...varDef,
        value,
      };
    });

    // Add product variables
    if (productVariables) {
      Object.assign(merged, productVariables);
    }

    // Add purchase-time variables (highest precedence)
    if (sources.purchaseVariables) {
      Object.assign(merged, sources.purchaseVariables);
    }

    // Add custom variables from context
    if (context.customVariables) {
      Object.entries(context.customVariables).forEach(([key, value]) => {
        merged[key] = {
          id: key,
          name: key,
          type: VariableType.fixed,
          value,
        };
      });
    }

    return merged;
  }

  /**
   * Create a variable
   */
  static createVariable(
    id: string,
    name: string,
    type: VariableType,
    value: number,
    description?: string,
  ): IPricingVariable {
    return {
      id,
      name,
      type,
      value,
      description,
    };
  }

  /**
   * Validate variable value based on type
   */
  static validateVariable(variable: IPricingVariable): boolean {
    if (variable.type === VariableType.percentage) {
      // Percentage should be reasonable (between -100% and 500%)
      return variable.value >= -100 && variable.value <= 500;
    }

    // Fixed values can be any number (including negative for discounts)
    return true;
  }

  /**
   * Evaluate restriction formulas to determine if a product is available
   * Returns true if all restriction formulas pass, false otherwise
   */
  static evaluateRestrictions(
    formulaIds: string[],
    formulas: Record<string, PricingFormula>,
    variables: Record<string, IPricingVariable>,
  ): { available: boolean; failedRestrictions: string[] } {
    const failedRestrictions: string[] = [];

    for (const formulaId of formulaIds) {
      const formula = formulas[formulaId];
      if (!formula) {
        console.warn(`Formula ${formulaId} not found`);
        failedRestrictions.push(formulaId);
        continue;
      }

      // For restriction formulas, we only care about the applyCondition
      const applyCondition = getApplyCondition(formula);
      if (applyCondition) {
        const conditionResult = this.evaluateCondition(applyCondition, variables);
        if (!conditionResult) {
          failedRestrictions.push(formulaId);
        }
      }
    }

    return {
      available: failedRestrictions.length === 0,
      failedRestrictions,
    };
  }

  /**
   * Evaluate a condition expression
   * This is a simplified evaluator - in production you'd want a more robust expression parser
   */
  private static evaluateCondition(
    condition: (string | number)[],
    variables: Record<string, IPricingVariable>,
  ): boolean {
    // This is a simplified implementation
    // In production, you'd want to use a proper expression evaluator
    // For now, we'll just check basic comparisons

    if (condition.length < 3) return true;

    const left = this.getVariableValue(condition[0] as string, variables);
    const operator = condition[1] as string;
    const right = this.getVariableValue(condition[2] as string, variables);

    switch (operator) {
      case ">":
        return left > right;
      case "<":
        return left < right;
      case ">=":
        return left >= right;
      case "<=":
        return left <= right;
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      default:
        return true;
    }
  }

  /**
   * Get the numeric value of a variable or literal
   */
  private static getVariableValue(
    identifier: string | number,
    variables: Record<string, IPricingVariable>,
  ): number {
    if (typeof identifier === "number") {
      return identifier;
    }

    const variable = variables[identifier];
    return variable ? variable.value : 0;
  }
}
