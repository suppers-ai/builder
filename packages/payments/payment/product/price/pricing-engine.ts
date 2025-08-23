import { Currency, getFormulaNames, getPriceAmount, PricingPrice } from "./price.ts";
import { IPricingVariable, IPurchaseContext, IVariableSources } from "./dynamic-pricing.ts";
import { PricingFormula } from "@suppers/shared";
import { FormulaEvaluator } from "./formula-evaluator.ts";

// Legacy pricing context - use IPurchaseContext for new dynamic pricing
export interface IPricingContext extends IPurchaseContext {}

// Result of pricing calculation
export interface IPricingResult {
  finalPrice: number;
  currency: string;
  breakdown: IPriceBreakdown[];
  appliedConditions: string[];
  formula?: string;
  usedVariables?: string[];
  calculationErrors?: string[];
}

export interface IPriceBreakdown {
  component: string;
  baseAmount: number;
  adjustmentType: "base" | "multiplier" | "surcharge" | "discount" | "tax";
  adjustmentValue: number;
  finalAmount: number;
  description?: string;
}

export class PricingEngine {
  /**
   * Calculate price using the new dynamic formula system
   */
  static calculatePrice(
    price: PricingPrice,
    formulas: PricingFormula[],
    currency: Currency,
    context: IPricingContext = {},
    productVariables?: Record<string, IPricingVariable>,
    purchaseVariables?: Record<string, IPricingVariable>,
  ): IPricingResult {
    // Use dynamic formula system if available
    const formulaNames = getFormulaNames(price);
    if (formulaNames.length > 0 && formulas.length > 0) {
      return this.calculateWithDynamicFormulas(
        price,
        formulas,
        currency,
        context,
        productVariables,
        purchaseVariables,
      );
    }

    // Fixed pricing fallback
    const priceAmount = getPriceAmount(price);
    const fixedPrice = priceAmount[currency] || 0;
    return this.createSimpleResult(fixedPrice, currency, "Fixed price");
  }

  /**
   * Calculate price using dynamic formulas
   */
  private static calculateWithDynamicFormulas(
    price: PricingPrice,
    formulas: PricingFormula[],
    currency: Currency,
    context: IPricingContext,
    productVariables?: Record<string, IPricingVariable>,
    purchaseVariables?: Record<string, IPricingVariable>,
  ): IPricingResult {
    // Get only the formulas specified for this price
    const formulaNames = getFormulaNames(price);
    const relevantFormulas: Record<string, PricingFormula> = {};

    for (const formulaName of formulaNames) {
      const formula = formulas.find((f) => f.formula_name === formulaName);
      if (formula) {
        relevantFormulas[formulaName] = formula;
      }
    }

    // Prepare variable sources (productVariables moved to separate parameter)
    const variableSources: IVariableSources = {
      purchaseVariables: purchaseVariables || {},
    };

    // Evaluate using the new formula evaluator with product variables as separate parameter
    const result = FormulaEvaluator.evaluatePricing(
      relevantFormulas,
      variableSources,
      context,
      currency,
      productVariables,
    );

    // Convert to legacy result format
    return {
      finalPrice: result.finalPrice,
      currency: result.currency,
      breakdown: result.appliedFormulas.map((formula) => ({
        component: formula.formulaName,
        baseAmount: formula.value,
        adjustmentType: "base" as const,
        adjustmentValue: formula.value,
        finalAmount: formula.value,
        description: formula.calculation,
      })),
      appliedConditions: result.appliedFormulas
        .filter((f) => f.conditionResult !== undefined)
        .map((f) => `${f.formulaName}: ${f.conditionResult ? "Applied" : "Skipped"}`),
      formula: result.calculation,
      usedVariables: [...new Set(result.appliedFormulas.flatMap((f) => f.usedVariables))],
    };
  }

  /**
   * Create a simple pricing result
   */
  private static createSimpleResult(
    price: number,
    currency: Currency,
    description: string,
  ): IPricingResult {
    return {
      finalPrice: Math.round(price * 100) / 100,
      currency,
      breakdown: [{
        component: description,
        baseAmount: price,
        adjustmentType: "base",
        adjustmentValue: price,
        finalAmount: price,
      }],
      appliedConditions: [],
      formula: description,
    };
  }
}
