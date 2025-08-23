import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  COMMON_PRODUCT_VARIABLES,
  createPricingFormula,
  getApplyCondition,
  getValueCalculation,
  IPricingVariable,
  setApplyCondition,
  setValueCalculation,
  VariableType,
  VariableUtils,
} from "../payment/product/price/dynamic-pricing.ts";
import { PricingFormula } from "../payment/product/price/price.ts";
import { FormulaEvaluator } from "../payment/product/price/formula-evaluator.ts";
import { PricingEngine } from "../payment/product/price/pricing-engine.ts";
import {
  createPricingPrice,
  PriceInterval,
  PriceTarget,
  PricingType,
} from "../payment/product/price/price.ts";

Deno.test("Variable System - Basic Variable Creation", () => {
  const basePrice = VariableUtils.createVariable(
    "basePrice",
    "Base Price",
    VariableType.fixed,
    100,
    "The base price per participant",
  );

  assertEquals(basePrice.id, "basePrice");
  assertEquals(basePrice.name, "Base Price");
  assertEquals(basePrice.type, VariableType.fixed);
  assertEquals(basePrice.value, 100);
  assertEquals(basePrice.description, "The base price per participant");
});

Deno.test("Variable System - Negative Values for Discounts", () => {
  const discount = VariableUtils.createVariable(
    "earlyBirdDiscount",
    "Early Bird Discount",
    VariableType.percentage,
    -20, // Negative for discount
  );

  assertEquals(discount.value, -20);
  assertEquals(VariableUtils.validateVariable(discount), true);
});

Deno.test("Variable System - Variable Merging with Precedence", () => {
  const productVariables = {
    basePrice: { id: "basePrice", name: "Base Price", type: VariableType.fixed, value: 100 },
    discount: {
      id: "discount",
      name: "Standard Discount",
      type: VariableType.percentage,
      value: -10,
    },
  };

  const purchaseVariables = {
    discount: { id: "discount", name: "VIP Discount", type: VariableType.percentage, value: -25 }, // Override
  };

  const context = {
    participants: 3,
    dayOfWeek: 6, // Saturday
    customVariables: { specialOffer: 50 },
  };

  const merged = VariableUtils.mergeVariables(
    { purchaseVariables },
    context,
    productVariables,
  );

  // System variables should be populated
  assertEquals(merged.participants.value, 3);
  assertEquals(merged.dayOfWeek.value, 6);
  assertEquals(merged.isWeekend.value, 1); // Saturday is weekend

  // Product variables should be included
  assertEquals(merged.basePrice.value, 100);

  // Purchase variables should override product variables
  assertEquals(merged.discount.value, -25); // Overridden value
  assertEquals(merged.discount.name, "VIP Discount"); // Overridden name

  // Custom variables should be included
  assertEquals(merged.specialOffer.value, 50);
});

Deno.test("Formula Evaluator - Simple Arithmetic", () => {
  const formulaData = {
    name: "Simple Calculation",
    formula_name: "simpleCalc",
    pricing_product_id: "test-product",
    value_calculation: ["participants", "*", "basePrice"],
  };
  const formula = createPricingFormula(formulaData);

  const variables = {
    participants: { id: "participants", name: "Participants", type: VariableType.fixed, value: 3 },
    basePrice: { id: "basePrice", name: "Base Price", type: VariableType.fixed, value: 100 },
  };

  const result = FormulaEvaluator.evaluateFormula(formula, variables);

  assertEquals(result.value, 300); // 3 * 100
  assertEquals(result.applied, true);
  assertEquals(result.usedVariables.sort(), ["basePrice", "participants"]);
});

Deno.test("Formula Evaluator - Complex Expression", () => {
  const formulaData = {
    name: "Complex Calculation",
    formula_name: "complexCalc",
    pricing_product_id: "test-product",
    value_calculation: [
      "(",
      "participants",
      "*",
      "basePrice",
      ")",
      "+",
      "shippingCost",
      "-",
      "(",
      "basePrice",
      "*",
      "discount",
      "/",
      "100",
      ")",
    ],
  };
  const formula = createPricingFormula(formulaData);

  const variables = {
    participants: { id: "participants", name: "Participants", type: VariableType.fixed, value: 2 },
    basePrice: { id: "basePrice", name: "Base Price", type: VariableType.fixed, value: 100 },
    shippingCost: { id: "shippingCost", name: "Shipping", type: VariableType.fixed, value: 15 },
    discount: { id: "discount", name: "Discount %", type: VariableType.percentage, value: 10 },
  };

  const result = FormulaEvaluator.evaluateFormula(formula, variables);

  // (2 * 100) + 15 - (100 * 10 / 100) = 200 + 15 - 10 = 205
  assertEquals(result.value, 205);
});

Deno.test("Formula Evaluator - Conditional Application", () => {
  const weekendSurchargeData = {
    name: "Weekend Surcharge",
    formula_name: "weekendSurcharge",
    pricing_product_id: "test-product",
    value_calculation: ["weekendFee"],
    apply_condition: ["isWeekend", "==", 1], // Only apply on weekends
  };
  const weekendSurcharge = createPricingFormula(weekendSurchargeData);

  const variables = {
    weekendFee: { id: "weekendFee", name: "Weekend Fee", type: VariableType.fixed, value: 25 },
    isWeekend: { id: "isWeekend", name: "Is Weekend", type: VariableType.fixed, value: 1 },
  };

  const result = FormulaEvaluator.evaluateFormula(weekendSurcharge, variables);

  assertEquals(result.applied, true);
  assertEquals(result.value, 25);
  assertEquals(result.conditionResult, true);

  // Test with weekday
  variables.isWeekend.value = 0;
  const weekdayResult = FormulaEvaluator.evaluateFormula(weekendSurcharge, variables);

  assertEquals(weekdayResult.applied, false);
  assertEquals(weekdayResult.conditionResult, false);
});

Deno.test("Formula Evaluator - Complex Conditions", () => {
  const bulkDiscountData = {
    name: "Bulk Discount",
    formula_name: "bulkDiscount",
    pricing_product_id: "test-product",
    value_calculation: ["participants", "*", "bulkDiscountPerPerson"],
    apply_condition: ["participants", ">=", 5, "&&", "isWeekend", "==", 0],
  };
  const bulkDiscount = createPricingFormula(bulkDiscountData);

  const variables = {
    participants: { id: "participants", name: "Participants", type: VariableType.fixed, value: 6 },
    bulkDiscountPerPerson: {
      id: "bulkDiscountPerPerson",
      name: "Bulk Discount",
      type: VariableType.fixed,
      value: -5,
    },
    isWeekend: { id: "isWeekend", name: "Is Weekend", type: VariableType.fixed, value: 0 },
  };

  const result = FormulaEvaluator.evaluateFormula(bulkDiscount, variables);

  assertEquals(result.applied, true);
  assertEquals(result.value, -30); // 6 * -5 = -30 (discount)

  // Test with weekend (should not apply)
  variables.isWeekend.value = 1;
  const weekendResult = FormulaEvaluator.evaluateFormula(bulkDiscount, variables);

  assertEquals(weekendResult.applied, false);
});

Deno.test("Formula Evaluator - Complete Pricing Calculation", () => {
  const baseCalculationData = {
    name: "Base Price",
    formula_name: "baseCalculation",
    pricing_product_id: "test-product",
    value_calculation: ["participants", "*", "basePrice"],
  };
  const weekendSurchargeFormulaData = {
    name: "Weekend Surcharge",
    formula_name: "weekendSurcharge",
    pricing_product_id: "test-product",
    value_calculation: ["weekendFee"],
    apply_condition: ["isWeekend", "==", 1],
  };
  const firstTimeDiscountData = {
    name: "First Time Discount",
    formula_name: "firstTimeDiscount",
    pricing_product_id: "test-product",
    value_calculation: ["subtotal", "*", "firstTimeDiscountRate", "/", 100],
    apply_condition: ["isFirstTime", "==", 1],
  };
  const taxData = {
    name: "Tax",
    formula_name: "tax",
    pricing_product_id: "test-product",
    value_calculation: ["subtotal", "*", "taxRate", "/", 100],
  };

  const formulas = {
    baseCalculation: createPricingFormula(baseCalculationData),
    weekendSurcharge: createPricingFormula(weekendSurchargeFormulaData),
    firstTimeDiscount: createPricingFormula(firstTimeDiscountData),
    tax: createPricingFormula(taxData),
  };

  const variableSources = {
    productVariables: {
      basePrice: { id: "basePrice", name: "Base Price", type: VariableType.fixed, value: 100 },
      weekendFee: { id: "weekendFee", name: "Weekend Fee", type: VariableType.fixed, value: 30 },
      firstTimeDiscountRate: {
        id: "firstTimeDiscountRate",
        name: "First Time Discount",
        type: VariableType.percentage,
        value: -15,
      },
      taxRate: { id: "taxRate", name: "Tax Rate", type: VariableType.percentage, value: 8.5 },
    },
  };

  const context = {
    participants: 2,
    dayOfWeek: 0, // Sunday (weekend)
    isFirstTime: true,
  };

  const result = FormulaEvaluator.evaluatePricing(
    formulas,
    { purchaseVariables: {} },
    context,
    "USD",
    variableSources.productVariables,
  );

  // Expected calculation:
  // Base: 2 * 100 = 200
  // Weekend: +30 (applied because isWeekend = 1)
  // Subtotal: 230
  // First time discount: 230 * -15 / 100 = -34.5
  // Subtotal after discount: 195.5
  // Tax: 195.5 * 8.5 / 100 = 16.62 (rounded)
  // Final: 195.5 + 16.62 = 212.12

  assertEquals(result.finalPrice, 212.12);
  assertEquals(result.appliedFormulas.length, 4);
  assertEquals(result.appliedFormulas[0].formulaName, "Base Price");
  assertEquals(result.appliedFormulas[1].formulaName, "Weekend Surcharge");
  assertEquals(result.appliedFormulas[2].formulaName, "First Time Discount");
  assertEquals(result.appliedFormulas[3].formulaName, "Tax");
});

Deno.test("Pricing Engine Integration", () => {
  const productVariables = {
    basePrice: { id: "basePrice", name: "Base Price", type: VariableType.fixed, value: 120 },
    weekendFee: { id: "weekendFee", name: "Weekend Fee", type: VariableType.fixed, value: 25 },
    taxRate: { id: "taxRate", name: "Tax Rate", type: VariableType.percentage, value: 7.5 },
  };

  const standardPackageData = {
    name: "Standard Package",
    pricing_type: "dynamic",
    formula_names: ["baseCalculation", "weekendSurcharge", "tax"],
    target: "per-participant",
    interval: "per-unit",
    pricing_product_id: "test-product",
  };
  const standardPackage = createPricingPrice(standardPackageData);

  const priceStructure = {
    prices: [standardPackage],
    formulas: {
      baseCalculation: createPricingFormula({
        formula_name: "baseCalculation",
        name: "Base Calculation",
        pricing_product_id: "test-product",
        value_calculation: ["participants", "*", "basePrice"],
      }),
      weekendSurcharge: createPricingFormula({
        formula_name: "weekendSurcharge",
        name: "Weekend Surcharge",
        pricing_product_id: "test-product",
        value_calculation: ["weekendFee"],
        apply_condition: ["isWeekend", "==", 1],
      }),
      tax: createPricingFormula({
        formula_name: "tax",
        name: "Tax",
        pricing_product_id: "test-product",
        value_calculation: ["subtotal", "*", "taxRate", "/", "100"],
      }),
    },
  };

  const context = {
    participants: 3,
    dayOfWeek: 6, // Saturday
  };

  const result = PricingEngine.calculatePrice(
    priceStructure.prices[0],
    Object.values(priceStructure.formulas),
    "USD",
    context,
    productVariables,
  );

  // Expected: (3 * 120) + 25 = 385, tax = 385 * 7.5 / 100 = 28.88, total = 413.88
  assertEquals(result.finalPrice, 413.88);
  assertEquals(result.breakdown.length, 3);
  assertEquals(result.usedVariables?.sort(), [
    "basePrice",
    "isWeekend",
    "participants",
    "taxRate",
    "weekendFee",
  ]);
});

Deno.test("Purchase-Time Variable Override", () => {
  const productVariables = {
    basePrice: { id: "basePrice", name: "Base Price", type: VariableType.fixed, value: 100 },
  };

  const vipPackageData = {
    name: "VIP Package",
    formula_names: ["baseCalculation"],
    target: "per-participant",
    interval: "per-unit",
    pricing_product_id: "test-product",
  };
  const vipPackage = createPricingPrice(vipPackageData);

  const priceStructure = {
    prices: [vipPackage],
    formulas: {
      baseCalculation: createPricingFormula({
        formula_name: "baseCalculation",
        name: "Base Calculation",
        pricing_product_id: "test-product",
        value_calculation: ["participants", "*", "basePrice"],
      }),
    },
  };

  // Override base price at purchase time
  const purchaseVariables = {
    basePrice: { id: "basePrice", name: "VIP Base Price", type: VariableType.fixed, value: 200 },
  };

  const context = { participants: 2 };

  const result = PricingEngine.calculatePrice(
    priceStructure.prices[0],
    Object.values(priceStructure.formulas),
    "USD",
    context,
    productVariables,
    purchaseVariables,
  );

  assertEquals(result.finalPrice, 400); // 2 * 200 (overridden price)
});

Deno.test("Expression Validation", () => {
  // Valid expressions
  assertEquals(FormulaEvaluator.validateExpression(["a", "+", "b"]), []);
  assertEquals(FormulaEvaluator.validateExpression(["(", "a", "+", "b", ")", "*", "c"]), []);

  // Invalid expressions
  const errors1 = FormulaEvaluator.validateExpression(["a", "+", "+", "b"]);
  assertEquals(errors1.length > 0, true);

  const errors2 = FormulaEvaluator.validateExpression(["(", "a", "+", "b"]);
  assertEquals(errors2.some((e) => e.includes("parentheses")), true);

  const errors3 = FormulaEvaluator.validateExpression([]);
  assertEquals(errors3.some((e) => e.includes("empty")), true);
});

Deno.test("Real-World Example - Hotel Booking", () => {
  // A hotel with dynamic pricing based on occupancy, season, and group size
  const baseRateData = {
    name: "Base Room Rate",
    formula_name: "baseRate",
    pricing_product_id: "test-product",
    value_calculation: ["participants", "*", "baseRoomPrice"],
  };
  const seasonalAdjustmentData = {
    name: "Seasonal Adjustment",
    formula_name: "seasonalAdjustment",
    pricing_product_id: "test-product",
    value_calculation: ["subtotal", "*", "seasonMultiplier"],
    apply_condition: ["month", ">=", 6, "&&", "month", "<=", 8], // Summer months
  };
  const groupDiscountData = {
    name: "Group Discount",
    formula_name: "groupDiscount",
    pricing_product_id: "test-product",
    value_calculation: ["subtotal", "*", "groupDiscountRate", "/", 100],
    apply_condition: ["participants", ">=", 4],
  };
  const resortFeeData = {
    name: "Resort Fee",
    formula_name: "resortFee",
    pricing_product_id: "test-product",
    value_calculation: ["resortFeeAmount"],
  };
  const taxData = {
    name: "Hotel Tax",
    formula_name: "tax",
    pricing_product_id: "test-product",
    value_calculation: ["subtotal", "*", "hotelTaxRate", "/", 100],
  };

  const formulas = {
    baseRate: createPricingFormula(baseRateData),
    seasonalAdjustment: createPricingFormula(seasonalAdjustmentData),
    groupDiscount: createPricingFormula(groupDiscountData),
    resortFee: createPricingFormula(resortFeeData),
    tax: createPricingFormula(taxData),
  };

  const variableSources = {
    productVariables: {
      baseRoomPrice: {
        id: "baseRoomPrice",
        name: "Base Room Price",
        type: VariableType.fixed,
        value: 150,
      },
      seasonMultiplier: {
        id: "seasonMultiplier",
        name: "Season Multiplier",
        type: VariableType.fixed,
        value: 0.25,
      },
      groupDiscountRate: {
        id: "groupDiscountRate",
        name: "Group Discount",
        type: VariableType.percentage,
        value: -10,
      },
      resortFeeAmount: {
        id: "resortFeeAmount",
        name: "Resort Fee",
        type: VariableType.fixed,
        value: 35,
      },
      hotelTaxRate: {
        id: "hotelTaxRate",
        name: "Hotel Tax",
        type: VariableType.percentage,
        value: 12.5,
      },
    },
  };

  const summerContext = {
    participants: 4,
    month: 7, // July (summer)
  };

  const result = FormulaEvaluator.evaluatePricing(
    formulas,
    { purchaseVariables: {} },
    summerContext,
    "USD",
    variableSources.productVariables,
  );

  // Expected:
  // Base: 4 * 150 = 600
  // Seasonal: 600 * 0.25 = 150 (summer surcharge)
  // Subtotal: 750
  // Group discount: 750 * -10 / 100 = -75
  // Subtotal: 675
  // Resort fee: +35
  // Subtotal: 710
  // Tax: 710 * 12.5 / 100 = 88.75
  // Final: 798.75

  assertEquals(result.finalPrice, 798.75);
  assertEquals(result.appliedFormulas.filter((f) => f.applied).length, 5);
});
